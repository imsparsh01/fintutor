import logging
import uuid
from datetime import date
from typing import Literal

import anthropic
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, StrictBool
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import engine, get_db
from app.services.baseline import assemble_baseline
from app.services.budget import compute_budget
from app.services.consolidated import compute_consolidated
from app.services.deepen_classifier import classify_deepen
from app.services.discretionary_categories import (
    create_discretionary_category,
    list_discretionary_categories,
)
from app.services.goals import create_goal, list_goals
from app.services.holding_capture_classifier import classify_holding_capture
from app.services.holdings import (
    create_holding,
    delete_holding,
    get_holding,
    list_holdings,
    update_holding,
)
from app.services.esop_exercise_cost import compute_esop_exercise_cost
from app.services.income import create_income, list_income, update_income
from app.services.loan_vs_invest import compute_loan_vs_invest
from app.services.onboarding import (
    build_onboarding_instruction,
    has_legacy_onboarding_state,
    record_turn,
    start_or_resume,
)
from app.services.onboarding_assessment import (
    AssessmentConflictError,
    AssessmentValidationError,
    answer_current_question,
    build_learning_context,
    clear_assessment,
    get_assessment,
    handle_assessment,
    skip_current_question,
    start_assessment,
    to_api_state,
    update_context,
)
from app.services.rewards import evaluate_reward
from app.services.streaks import get_streak, record_app_open
from app.services.surfacing import compute_surfacing_candidates
from app.services.tax_saving_room import compute_tax_saving_room
from app.services.teaching import TeachingEngineNotConfigured, ask_teaching_engine

logger = logging.getLogger("fintutor.health")

app = FastAPI(title="FinTutor API")

# D-095: CORS for local web-preview dev only. The app was built for native RN (no CORS),
# but the mockup-match rebuild is being verified in a browser (localhost:8081 -> :8000),
# which is cross-origin. Scoped to localhost dev origins; owner-approved. Not a product/
# schema change — remove or tighten before any non-dev deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HoldingCreate(BaseModel):
    product_type: str
    # D-074: optional — when omitted, create_holding generates one. The manual add-holding
    # UI never sends this field at all.
    alias: str | None = None
    display_name: str | None = None
    characteristics: dict = {}


class HoldingUpdate(BaseModel):
    product_type: str | None = None
    alias: str | None = None
    display_name: str | None = None
    characteristics: dict | None = None


class IncomeSource(BaseModel):
    label: str
    # D-073: the floor/conservative figure — this is what compute_budget()'s math uses,
    # unchanged. For a steady income this is just "the amount"; for variable income it's
    # the number the user can count on.
    amount: float
    frequency: str = "monthly"
    # D-073: optional, purely informational "typical" companion figure alongside the
    # floor above. Never fed into budget math — shown, not computed with.
    amount_high: float | None = None


class IncomeCreate(BaseModel):
    sources: list[IncomeSource]


class IncomeUpdate(BaseModel):
    sources: list[IncomeSource]


class DiscretionaryCategoryCreate(BaseModel):
    label: str
    planned_amount: float


class GoalFundingIn(BaseModel):
    holding_id: uuid.UUID
    earmarked_amount: float


class GoalCreate(BaseModel):
    target_amount: float
    target_date: date
    category: str
    funded_by: list[GoalFundingIn] = []


class ChatRequest(BaseModel):
    question: str
    # D-071: set only by HoldingDetailScreen's "Ask about this" flow, which knows its
    # holding's alias with certainty. assemble_baseline ignores anything that doesn't
    # resolve to one of this user's own holdings.
    deepen_alias: str | None = None
    # BQ-042/D-084: set only by OnboardingScreen's ChatThread — every other /chat caller
    # (general Chat tab included) leaves this False and the onboarding machinery is
    # untouched, per the PRD's confirmed "onboarding only" scope.
    onboarding: bool = False
    # BQ-042: deterministic chip-tap signal (same "trust an app-known UI signal" pattern
    # as deepen_alias) — only used to resolve an unset track on this user's first turn;
    # ignored once a track is already set, and ignored entirely for free-typed messages.
    onboarding_track_hint: str | None = None
    # D-085: the one narrow exception to D-022 — the AI's own last message in this
    # onboarding conversation, forwarded from the frontend's local display state, never
    # persisted server-side. Ignored (and never sent by the client) outside onboarding.
    onboarding_last_ai_message: str | None = None
    # D-119/BQ-066: optional caller-provided generic presentation hint. It can expose one
    # matching prior-exposure boolean to Arya, but the runtime prompt forbids using it for
    # conclusions, suitability, or advice. The backend never derives it from free text.
    learning_topic: Literal[
        "spending",
        "saving",
        "investing",
        "borrowing",
        "insurance",
        "goals",
        "workplace_and_tax",
    ] | None = None


class AssessmentStart(BaseModel):
    eligibility_confirmed: StrictBool


class AssessmentAnswer(BaseModel):
    question: str
    value: str | list[str]


class AssessmentSkip(BaseModel):
    question: str


class AssessmentContextUpdate(BaseModel):
    value: str | list[str]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/budget")
def get_budget(user_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    return compute_budget(db, user_id)


@app.get("/surfacing-candidates")
def get_surfacing_candidates(user_id: uuid.UUID, db: Session = Depends(get_db)) -> list[dict]:
    return compute_surfacing_candidates(db, user_id)


@app.get("/holdings")
def get_holdings(user_id: uuid.UUID, db: Session = Depends(get_db)) -> list[dict]:
    return list_holdings(db, user_id)


@app.get("/holdings/{holding_id}")
def get_holding_by_id(
    holding_id: uuid.UUID, user_id: uuid.UUID, db: Session = Depends(get_db)
) -> dict:
    holding = get_holding(db, user_id, holding_id)
    if holding is None:
        raise HTTPException(status_code=404, detail="Holding not found")
    return holding


@app.post("/holdings", status_code=201)
def post_holding(
    user_id: uuid.UUID, body: HoldingCreate, db: Session = Depends(get_db)
) -> dict:
    try:
        return create_holding(
            db, user_id, body.product_type, body.alias, body.display_name, body.characteristics
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"A holding with alias '{body.alias}' already exists for this user",
        )


@app.patch("/holdings/{holding_id}")
def patch_holding(
    holding_id: uuid.UUID, user_id: uuid.UUID, body: HoldingUpdate, db: Session = Depends(get_db)
) -> dict:
    try:
        updated = update_holding(
            db,
            user_id,
            holding_id,
            body.product_type,
            body.alias,
            body.display_name,
            body.characteristics,
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"A holding with alias '{body.alias}' already exists for this user",
        )
    if updated is None:
        raise HTTPException(status_code=404, detail="Holding not found")
    return updated


@app.delete("/holdings/{holding_id}", status_code=204)
def remove_holding(holding_id: uuid.UUID, user_id: uuid.UUID, db: Session = Depends(get_db)) -> None:
    if not delete_holding(db, user_id, holding_id):
        raise HTTPException(status_code=404, detail="Holding not found")


@app.get("/income")
def get_income(user_id: uuid.UUID, db: Session = Depends(get_db)) -> list[dict]:
    return list_income(db, user_id)


@app.post("/income", status_code=201)
def post_income(user_id: uuid.UUID, body: IncomeCreate, db: Session = Depends(get_db)) -> dict:
    return create_income(db, user_id, [s.model_dump() for s in body.sources])


@app.put("/income/{income_id}")
def put_income(
    income_id: uuid.UUID, user_id: uuid.UUID, body: IncomeUpdate, db: Session = Depends(get_db)
) -> dict:
    updated = update_income(db, user_id, income_id, [s.model_dump() for s in body.sources])
    if updated is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return updated


@app.get("/discretionary-categories")
def get_discretionary_categories(
    user_id: uuid.UUID, db: Session = Depends(get_db)
) -> list[dict]:
    return list_discretionary_categories(db, user_id)


@app.post("/discretionary-categories", status_code=201)
def post_discretionary_category(
    user_id: uuid.UUID, body: DiscretionaryCategoryCreate, db: Session = Depends(get_db)
) -> dict:
    return create_discretionary_category(db, user_id, body.label, body.planned_amount)


@app.get("/consolidated")
def get_consolidated(user_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    return compute_consolidated(db, user_id)


@app.get("/loan-vs-invest")
def get_loan_vs_invest(
    user_id: uuid.UUID,
    holding_id: uuid.UUID,
    prepay_amount: float,
    db: Session = Depends(get_db),
) -> dict:
    try:
        return compute_loan_vs_invest(db, user_id, holding_id, prepay_amount)
    except LookupError:
        raise HTTPException(status_code=404, detail="Holding not found")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.get("/esop-exercise-cost")
def get_esop_exercise_cost(
    user_id: uuid.UUID, holding_id: uuid.UUID, db: Session = Depends(get_db)
) -> dict:
    try:
        return compute_esop_exercise_cost(db, user_id, holding_id)
    except LookupError:
        raise HTTPException(status_code=404, detail="Holding not found")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.get("/tax-saving-room")
def get_tax_saving_room(
    user_id: uuid.UUID, tax_regime: str, db: Session = Depends(get_db)
) -> dict:
    try:
        return compute_tax_saving_room(db, user_id, tax_regime)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.get("/goals")
def get_goals(user_id: uuid.UUID, db: Session = Depends(get_db)) -> list[dict]:
    return list_goals(db, user_id)


@app.post("/goals", status_code=201)
def post_goal(user_id: uuid.UUID, body: GoalCreate, db: Session = Depends(get_db)) -> dict:
    try:
        return create_goal(
            db,
            user_id,
            body.target_amount,
            body.target_date,
            body.category,
            [f.model_dump() for f in body.funded_by],
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="One or more funded_by.holding_id values don't exist",
        )


@app.get("/streak")
def get_streak_state(user_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    return get_streak(db, user_id)


@app.post("/streak/open")
def post_streak_open(user_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    previous = get_streak(db, user_id)
    is_new_day = previous["last_active_date"] != date.today().isoformat()
    streak = record_app_open(db, user_id)
    reward = evaluate_reward(is_new_day)
    return {**streak, **reward}


def _assessment_error(exc: Exception) -> HTTPException:
    if isinstance(exc, LookupError):
        return HTTPException(status_code=404, detail="Onboarding assessment not found")
    if isinstance(exc, AssessmentConflictError):
        return HTTPException(status_code=409, detail="Assessment state changed; refresh and try again")
    return HTTPException(status_code=422, detail="Unsupported onboarding assessment action")


@app.get("/onboarding-assessment")
def get_onboarding_assessment(
    user_id: uuid.UUID, db: Session = Depends(get_db)
) -> dict:
    assessment = get_assessment(db, user_id)
    if assessment is None:
        raise HTTPException(status_code=404, detail="Onboarding assessment not found")
    return to_api_state(assessment)


@app.get("/onboarding-assessment/compatibility")
def get_onboarding_assessment_compatibility(
    user_id: uuid.UUID, db: Session = Depends(get_db)
) -> dict:
    # BQ-068: presence only. Never expose or infer a v2 axis from legacy track data.
    return {"legacy_user": has_legacy_onboarding_state(db, user_id)}


@app.post("/onboarding-assessment/start")
def post_onboarding_assessment_start(
    user_id: uuid.UUID, body: AssessmentStart, db: Session = Depends(get_db)
) -> dict:
    try:
        return to_api_state(
            start_assessment(
                db, user_id, eligibility_confirmed=body.eligibility_confirmed
            )
        )
    except AssessmentValidationError as exc:
        raise _assessment_error(exc) from exc


@app.post("/onboarding-assessment/answer")
def post_onboarding_assessment_answer(
    user_id: uuid.UUID, body: AssessmentAnswer, db: Session = Depends(get_db)
) -> dict:
    try:
        return to_api_state(
            answer_current_question(db, user_id, body.question, body.value)
        )
    except (LookupError, AssessmentConflictError, AssessmentValidationError) as exc:
        raise _assessment_error(exc) from exc


@app.post("/onboarding-assessment/skip")
def post_onboarding_assessment_skip(
    user_id: uuid.UUID, body: AssessmentSkip, db: Session = Depends(get_db)
) -> dict:
    try:
        return to_api_state(skip_current_question(db, user_id, body.question))
    except (LookupError, AssessmentConflictError, AssessmentValidationError) as exc:
        raise _assessment_error(exc) from exc


@app.post("/onboarding-assessment/handle")
def post_onboarding_assessment_handle(
    user_id: uuid.UUID, db: Session = Depends(get_db)
) -> dict:
    try:
        return to_api_state(handle_assessment(db, user_id))
    except LookupError as exc:
        raise _assessment_error(exc) from exc


@app.put("/onboarding-assessment/context/{question}")
def put_onboarding_assessment_context(
    question: str,
    user_id: uuid.UUID,
    body: AssessmentContextUpdate,
    db: Session = Depends(get_db),
) -> dict:
    try:
        return to_api_state(update_context(db, user_id, question, body.value))
    except (LookupError, AssessmentConflictError, AssessmentValidationError) as exc:
        raise _assessment_error(exc) from exc


@app.post("/onboarding-assessment/clear")
def post_onboarding_assessment_clear(
    user_id: uuid.UUID, db: Session = Depends(get_db)
) -> dict:
    try:
        return to_api_state(clear_assessment(db, user_id))
    except LookupError as exc:
        raise _assessment_error(exc) from exc


@app.post("/chat")
def post_chat(user_id: uuid.UUID, body: ChatRequest, db: Session = Depends(get_db)) -> dict:
    baseline = assemble_baseline(db, user_id, body.deepen_alias)
    # Legacy onboarding keeps its one existing context contract. V2 assessment itself is
    # non-LLM; only ordinary chat may receive the new presentation abstraction.
    if not body.onboarding:
        learning_context = build_learning_context(
            get_assessment(db, user_id), body.learning_topic
        )
        if learning_context is not None:
            baseline["learning_context"] = learning_context
    # D-072: only when D-071's deterministic UI-signal path didn't already set deepen.
    if "deepen" not in baseline:
        classified = classify_deepen(body.question, baseline["holdings"])
        if classified is not None:
            baseline["deepen"] = classified
    onboarding_state = None
    if body.onboarding:
        onboarding_state = start_or_resume(db, user_id, body.onboarding_track_hint, body.question)
        baseline["onboarding"] = build_onboarding_instruction(
            onboarding_state, body.onboarding_last_ai_message
        )
    try:
        answer = ask_teaching_engine(baseline, body.question)
    except TeachingEngineNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except anthropic.APIError as exc:
        # Never echo the raw exception back to the caller — same posture as
        # /health/db's DB-error handling (it can embed request/response detail).
        logger.exception("Teaching engine call failed")
        raise HTTPException(
            status_code=502,
            detail=f"Teaching engine call failed: {type(exc).__name__} (see server logs for detail)",
        ) from exc
    # D-078: a proposal is never written here — Fork 2 requires an explicit user confirm via a
    # separate POST /holdings call (existing create_holding path) before anything is saved.
    holding_proposal = classify_holding_capture(body.question, baseline["holdings"])
    result: dict = {"response": answer, "holding_proposal": holding_proposal}
    if onboarding_state is not None:
        updated = record_turn(db, onboarding_state, body.question, answer)
        result["onboarding_state"] = {"track": updated["track"], "stage": updated["stage"]}
    return result


@app.get("/health/db")
def health_db() -> dict[str, str]:
    if engine is None:
        raise HTTPException(
            status_code=503,
            detail="DATABASE_URL is not set in .env — add the Supabase Postgres connection string.",
        )
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:
        # Never echo the raw exception back to the caller — it can embed the DSN
        # (host/user, sometimes more) which must not leave the server process.
        logger.exception("Database health check failed")
        raise HTTPException(
            status_code=503,
            detail=f"Database connection failed: {type(exc).__name__} (see server logs for detail)",
        ) from exc
    return {"status": "ok"}
