import logging
import uuid
from datetime import date
from typing import Literal
from urllib.parse import parse_qsl, urlencode

import anthropic
from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, StrictBool, field_validator
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import engine, get_db
from app.auth import verify_supabase_access_token
from app.services.baseline import assemble_baseline
from app.services.account_deletion import (
    delete_active_user_data,
    delete_supabase_auth_user,
    reauthenticate_password,
)
from app.services.data_export import build_data_export
from app.services.budget import compute_budget
from app.services.consolidated import compute_consolidated
from app.services.deepen_classifier import classify_deepen
from app.services.discretionary_categories import (
    create_discretionary_category,
    delete_discretionary_category,
    discretionary_deletion_impact,
    list_discretionary_categories,
    update_discretionary_category,
)
from app.services.baseline_lifecycle import StaleBaselineWriteError
from app.services.goals import (
    GoalFundingValidationError,
    create_goal,
    delete_goal,
    goal_deletion_impact,
    list_goals,
    update_goal,
    update_goal_funding,
)
from app.services.financial_context import (
    clear_financial_context,
    get_financial_context,
    patch_financial_context,
    set_financial_context,
)
from app.services.holding_capture_classifier import classify_holding_capture
from app.services.holding_reconciliation import (
    ReconciliationStaleError,
    ReconciliationValidationError,
    apply_reconciliation,
    build_reconciliation_proposal,
    resolve_reconciliation,
)
from app.services.holdings import (
    create_holding,
    delete_holding,
    get_holding,
    holding_deletion_impact,
    list_holdings,
    update_holding,
)
from app.services.esop_exercise_cost import compute_esop_exercise_cost
from app.services.income import (
    create_income,
    delete_income_source,
    income_source_deletion_impact,
    list_income,
    replace_income_source,
    update_income,
)
from app.services.loan_vs_invest import compute_loan_vs_invest
from app.services.onboarding import (
    build_onboarding_instruction,
    has_legacy_onboarding_state,
    record_turn,
    start_or_resume,
)
from app.services.progression import (
    ProgressionValidationError,
    delete_progression,
    get_progression,
    list_history,
    record_arya_exchange,
    record_context_prompt,
    record_event,
    record_onboarding_handled,
    to_api_summary,
)
from app.services.privacy_masking import PrivacyEnvelope, UnsafeUserTextError
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
from app.services.teaching import TeachingEngineNotConfigured, ask_teaching_engine

logger = logging.getLogger("fintutor.health")

app = FastAPI(title="FinTutor API")

PUBLIC_PATHS = {"/health", "/health/db", "/docs", "/docs/oauth2-redirect", "/openapi.json"}
app.state.token_verifier = verify_supabase_access_token


@app.middleware("http")
async def authenticated_ownership(request: Request, call_next):
    """Verify Supabase identity and make it authoritative for every protected route."""
    if request.method == "OPTIONS" or request.url.path in PUBLIC_PATHS:
        return await call_next(request)

    authorization = request.headers.get("authorization", "")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return JSONResponse(status_code=401, content={"detail": "Authentication required"})
    try:
        user_id = await request.app.state.token_verifier(token)
    except HTTPException as exc:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    # Existing route/service signatures remain stable, but any caller-selected user_id
    # is discarded and replaced before FastAPI parses parameters.
    query = [(key, value) for key, value in parse_qsl(request.scope["query_string"].decode()) if key != "user_id"]
    query.append(("user_id", str(user_id)))
    request.scope["query_string"] = urlencode(query).encode()
    return await call_next(request)

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
    expected_version: int = Field(ge=1)


class LoanVsInvestRequest(BaseModel):
    holding_id: uuid.UUID
    prepay_amount: float = Field(gt=0, le=1_000_000_000_000, allow_inf_nan=False)

    @field_validator("prepay_amount", mode="before")
    @classmethod
    def reject_boolean_amount(cls, value):
        if isinstance(value, bool):
            raise ValueError("prepay_amount must be a number, not a boolean")
        return value


class HoldingReconciliationResolve(BaseModel):
    product_type: str
    characteristics: dict
    target_id: uuid.UUID | None = None
    add_as_new: bool = False


class HoldingReconciliationApply(BaseModel):
    product_type: str
    characteristics: dict
    target_id: uuid.UUID | None = None
    expected_diff: list[dict] = []


class IncomeSource(BaseModel):
    id: uuid.UUID | None = None
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
    expected_version: int = Field(ge=1)


class IncomeSourceMutation(BaseModel):
    expected_version: int = Field(ge=1)
    source: IncomeSource


class DiscretionaryCategoryCreate(BaseModel):
    label: str
    planned_amount: float = Field(ge=0)


class DiscretionaryCategoryUpdate(BaseModel):
    label: str
    planned_amount: float = Field(ge=0)
    expected_version: int = Field(ge=1)


class GoalFundingIn(BaseModel):
    holding_id: uuid.UUID
    earmarked_amount: float


class GoalCreate(BaseModel):
    target_amount: float = Field(gt=0)
    target_date: date
    category: str
    funded_by: list[GoalFundingIn] = []


class GoalFundingUpdate(BaseModel):
    funded_by: list[GoalFundingIn]
    expected_version: int = Field(ge=1)


class GoalUpdate(BaseModel):
    target_amount: float = Field(gt=0)
    target_date: date
    category: str
    funded_by: list[GoalFundingIn] = []
    expected_version: int = Field(ge=1)


class FinancialContextUpdate(BaseModel):
    dependant_count: int | None = Field(default=None, ge=0, le=100)
    emergency_fund_months: float | None = Field(default=None, ge=0, le=1200)


class ProgressionEventIn(BaseModel):
    event_type: str
    # The repeat-limit discriminator — teaching subject, calculator type, capability
    # family, prompt/version. Required for event types with a per-subject rule.
    subject_key: str | None = None
    # Required for repeatable events, so retries and refreshes collapse onto the same
    # row. Derived automatically for once-per-subject events.
    idempotency_key: str | None = None
    capability_family: Literal["calculator", "scenario"] | None = None
    # `occurred_at` is deliberately not accepted from the client: the server clock sets
    # it. A client-supplied instant would let a caller backdate events across the
    # Asia/Kolkata boundary and mint a fresh 60-point daily cap on demand.


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


class AccountDeletionRequest(BaseModel):
    email: str
    password: str
    confirmation: Literal["DELETE MY ACCOUNT"]


class AccountExportRequest(BaseModel):
    email: str
    password: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/account/delete")
async def delete_account(
    body: AccountDeletionRequest,
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> dict:
    await reauthenticate_password(body.email, body.password, user_id)
    delete_active_user_data(db, user_id)
    await delete_supabase_auth_user(user_id)
    return {"deleted": True}


@app.post("/account/export")
async def export_account_data(
    body: AccountExportRequest,
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> dict:
    await reauthenticate_password(body.email, body.password, user_id)
    return build_data_export(db, user_id, account_email=body.email)


@app.get("/budget")
def get_budget(user_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    return compute_budget(db, user_id)


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
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
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
            body.expected_version,
        )
    except StaleBaselineWriteError as exc:
        raise HTTPException(status_code=409, detail={
            "message": "This holding changed. Review the refreshed record.",
            "current": exc.current, "proposed": exc.proposed,
        }) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"A holding with alias '{body.alias}' already exists for this user",
        )
    if updated is None:
        raise HTTPException(status_code=404, detail="Holding not found")
    return updated


@app.get("/holdings/{holding_id}/deletion-impact")
def get_holding_deletion_impact(
    holding_id: uuid.UUID, user_id: uuid.UUID, db: Session = Depends(get_db)
) -> dict:
    impact = holding_deletion_impact(db, user_id, holding_id)
    if impact is None:
        raise HTTPException(status_code=404, detail="Holding not found")
    return impact


@app.delete("/holdings/{holding_id}")
def remove_holding(
    holding_id: uuid.UUID, user_id: uuid.UUID, expected_version: int = Query(ge=1),
    db: Session = Depends(get_db),
) -> dict:
    try:
        deleted = delete_holding(db, user_id, holding_id, expected_version)
    except StaleBaselineWriteError as exc:
        raise HTTPException(status_code=409, detail={
            "message": "This holding changed. Review the refreshed record.",
            "current": exc.current, "proposed": exc.proposed,
        }) from exc
    if deleted is None:
        raise HTTPException(status_code=404, detail="Holding not found")
    return deleted


@app.post("/holding-reconciliation/resolve")
def post_holding_reconciliation_resolve(
    user_id: uuid.UUID,
    body: HoldingReconciliationResolve,
    db: Session = Depends(get_db),
) -> dict:
    try:
        return resolve_reconciliation(
            db, user_id, body.product_type, body.characteristics, body.target_id, body.add_as_new
        )
    except ReconciliationValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/holding-reconciliation/apply")
def post_holding_reconciliation_apply(
    user_id: uuid.UUID,
    body: HoldingReconciliationApply,
    db: Session = Depends(get_db),
) -> dict:
    try:
        return apply_reconciliation(
            db, user_id, body.product_type, body.characteristics, body.target_id, body.expected_diff
        )
    except ReconciliationStaleError as exc:
        raise HTTPException(
            status_code=409,
            detail={"message": "This holding changed. Review the refreshed comparison.", "proposal": exc.proposal},
        ) from exc
    except ReconciliationValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="The holding could not be created due to a conflict")


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
    try:
        updated = update_income(
            db, user_id, income_id,
            [s.model_dump(exclude_none=True) for s in body.sources], body.expected_version,
        )
    except StaleBaselineWriteError as exc:
        raise HTTPException(status_code=409, detail={
            "message": "This income record changed. Review the refreshed record.",
            "current": exc.current, "proposed": exc.proposed,
        }) from exc
    if updated is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return updated


@app.get("/income/{income_id}/sources/{source_id}/deletion-impact")
def get_income_source_deletion_impact(
    income_id: uuid.UUID, source_id: uuid.UUID, user_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> dict:
    impact = income_source_deletion_impact(db, user_id, income_id, source_id)
    if impact is None:
        raise HTTPException(status_code=404, detail="Income source not found")
    return impact


@app.patch("/income/{income_id}/sources/{source_id}")
def patch_income_source(
    income_id: uuid.UUID, source_id: uuid.UUID, user_id: uuid.UUID,
    body: IncomeSourceMutation, db: Session = Depends(get_db),
) -> dict:
    try:
        updated = replace_income_source(
            db, user_id, income_id, source_id,
            body.source.model_dump(exclude_none=True), body.expected_version,
        )
    except StaleBaselineWriteError as exc:
        raise HTTPException(status_code=409, detail={
            "message": "This income record changed. Review the refreshed record.",
            "current": exc.current, "proposed": exc.proposed,
        }) from exc
    if updated is None:
        raise HTTPException(status_code=404, detail="Income source not found")
    return updated


@app.delete("/income/{income_id}/sources/{source_id}")
def remove_income_source(
    income_id: uuid.UUID, source_id: uuid.UUID, expected_version: int,
    user_id: uuid.UUID, db: Session = Depends(get_db),
) -> dict:
    try:
        deleted = delete_income_source(
            db, user_id, income_id, source_id, expected_version
        )
    except StaleBaselineWriteError as exc:
        raise HTTPException(status_code=409, detail={
            "message": "This income record changed. Review the refreshed record.",
            "current": exc.current, "proposed": exc.proposed,
        }) from exc
    if deleted is None:
        raise HTTPException(status_code=404, detail="Income source not found")
    return deleted


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


@app.get("/discretionary-categories/{category_id}/deletion-impact")
def get_discretionary_category_deletion_impact(
    category_id: uuid.UUID, user_id: uuid.UUID, db: Session = Depends(get_db)
) -> dict:
    impact = discretionary_deletion_impact(db, user_id, category_id)
    if impact is None:
        raise HTTPException(status_code=404, detail="Discretionary category not found")
    return impact


@app.patch("/discretionary-categories/{category_id}")
def patch_discretionary_category(
    category_id: uuid.UUID, user_id: uuid.UUID, body: DiscretionaryCategoryUpdate,
    db: Session = Depends(get_db),
) -> dict:
    try:
        updated = update_discretionary_category(
            db, user_id, category_id, body.label, body.planned_amount, body.expected_version
        )
    except StaleBaselineWriteError as exc:
        raise HTTPException(status_code=409, detail={
            "message": "This category changed. Review the refreshed record.",
            "current": exc.current, "proposed": exc.proposed,
        }) from exc
    if updated is None:
        raise HTTPException(status_code=404, detail="Discretionary category not found")
    return updated


@app.delete("/discretionary-categories/{category_id}")
def remove_discretionary_category(
    category_id: uuid.UUID, expected_version: int, user_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> dict:
    try:
        deleted = delete_discretionary_category(
            db, user_id, category_id, expected_version
        )
    except StaleBaselineWriteError as exc:
        raise HTTPException(status_code=409, detail={
            "message": "This category changed. Review the refreshed record.",
            "current": exc.current, "proposed": exc.proposed,
        }) from exc
    if deleted is None:
        raise HTTPException(status_code=404, detail="Discretionary category not found")
    return deleted


@app.get("/consolidated")
def get_consolidated(user_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    return compute_consolidated(db, user_id)


@app.get("/financial-context")
def read_financial_context(user_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    return get_financial_context(db, user_id)


@app.put("/financial-context")
def write_financial_context(
    user_id: uuid.UUID, body: FinancialContextUpdate, db: Session = Depends(get_db)
) -> dict:
    return set_financial_context(
        db, user_id, body.dependant_count, body.emergency_fund_months
    )


@app.patch("/financial-context")
def patch_financial_context_fields(
    user_id: uuid.UUID, body: FinancialContextUpdate, db: Session = Depends(get_db)
) -> dict:
    return patch_financial_context(db, user_id, body.model_dump(exclude_unset=True))


@app.delete("/financial-context")
def delete_financial_context(user_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    return clear_financial_context(db, user_id)


@app.post("/loan-vs-invest")
def post_loan_vs_invest(
    body: LoanVsInvestRequest,
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> dict:
    try:
        return compute_loan_vs_invest(db, user_id, body.holding_id, body.prepay_amount)
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
    except GoalFundingValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="One or more funded_by.holding_id values don't exist",
        )


@app.put("/goals/{goal_id}/funding")
def put_goal_funding(
    goal_id: uuid.UUID,
    user_id: uuid.UUID,
    body: GoalFundingUpdate,
    db: Session = Depends(get_db),
) -> dict:
    try:
        updated = update_goal_funding(
            db, user_id, goal_id, [item.model_dump() for item in body.funded_by],
            body.expected_version,
        )
    except GoalFundingValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except StaleBaselineWriteError as exc:
        raise HTTPException(status_code=409, detail={
            "message": "This goal changed. Review the refreshed record.",
            "current": exc.current, "proposed": exc.proposed,
        }) from exc
    if updated is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return updated


@app.get("/goals/{goal_id}/deletion-impact")
def get_goal_deletion_impact(
    goal_id: uuid.UUID, user_id: uuid.UUID, db: Session = Depends(get_db)
) -> dict:
    impact = goal_deletion_impact(db, user_id, goal_id)
    if impact is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return impact


@app.patch("/goals/{goal_id}")
def patch_goal(
    goal_id: uuid.UUID, user_id: uuid.UUID, body: GoalUpdate,
    db: Session = Depends(get_db),
) -> dict:
    try:
        updated = update_goal(
            db, user_id, goal_id, target_amount=body.target_amount,
            target_date=body.target_date, category=body.category,
            funded_by=[item.model_dump() for item in body.funded_by],
            expected_version=body.expected_version,
        )
    except GoalFundingValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except StaleBaselineWriteError as exc:
        raise HTTPException(status_code=409, detail={
            "message": "This goal changed. Review the refreshed record.",
            "current": exc.current, "proposed": exc.proposed,
        }) from exc
    if updated is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return updated


@app.delete("/goals/{goal_id}")
def remove_goal(
    goal_id: uuid.UUID, expected_version: int, user_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> dict:
    try:
        deleted = delete_goal(db, user_id, goal_id, expected_version)
    except StaleBaselineWriteError as exc:
        raise HTTPException(status_code=409, detail={
            "message": "This goal changed. Review the refreshed record.",
            "current": exc.current, "proposed": exc.proposed,
        }) from exc
    if deleted is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return deleted


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


def _assessment_progress(
    db: Session, user_id: uuid.UUID, state: dict, prompt_key: str | None = None
) -> dict:
    """Emit BQ-071 progression for an assessment step, then project the state.

    `state` is already a plain dict by the time it reaches here, so an emitter rollback
    cannot take the caller's response down with it. Answer and skip earn identically —
    D-117 requires that disclosure never earn more than declining to disclose.
    """
    version = state.get("flow_version", 2)
    if prompt_key:
        record_context_prompt(db, user_id, f"assessment_v{version}:{prompt_key}")
    if state.get("status") == "handled":
        # Fires however onboarding got here — completing the last question, or a global
        # exit. Once-ever per flow version, so the repeats absorb into the constraint.
        record_onboarding_handled(db, user_id, version)
    return to_api_state(state)


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
        state = answer_current_question(db, user_id, body.question, body.value)
    except (LookupError, AssessmentConflictError, AssessmentValidationError) as exc:
        raise _assessment_error(exc) from exc
    return _assessment_progress(db, user_id, state, prompt_key=body.question)


@app.post("/onboarding-assessment/skip")
def post_onboarding_assessment_skip(
    user_id: uuid.UUID, body: AssessmentSkip, db: Session = Depends(get_db)
) -> dict:
    try:
        state = skip_current_question(db, user_id, body.question)
    except (LookupError, AssessmentConflictError, AssessmentValidationError) as exc:
        raise _assessment_error(exc) from exc
    return _assessment_progress(db, user_id, state, prompt_key=body.question)


@app.post("/onboarding-assessment/handle")
def post_onboarding_assessment_handle(
    user_id: uuid.UUID, db: Session = Depends(get_db)
) -> dict:
    try:
        state = handle_assessment(db, user_id)
    except LookupError as exc:
        raise _assessment_error(exc) from exc
    return _assessment_progress(db, user_id, state)


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


@app.get("/progression")
def get_progression_summary(user_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    return to_api_summary(get_progression(db, user_id))


@app.get("/progression/history")
def get_progression_history(
    user_id: uuid.UUID,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
) -> dict:
    # D-121: the user gets visibility into their own records. There is deliberately no
    # selective delete beside it — progress is intentionally sticky.
    return {"events": list_history(db, user_id, limit=limit, offset=offset)}


@app.post("/progression/event")
def post_progression_event(
    user_id: uuid.UUID, body: ProgressionEventIn, db: Session = Depends(get_db)
) -> dict:
    try:
        expected_family = {
            "calculator_completed": "calculator",
            "scenario_completed": "scenario",
        }.get(body.event_type)
        if (
            body.capability_family is not None
            and body.capability_family != expected_family
        ):
            raise ProgressionValidationError(
                "capability_family does not match the qualifying event"
            )
        result = record_event(
            db,
            user_id,
            body.event_type,
            subject_key=body.subject_key,
            idempotency_key=body.idempotency_key,
        )
        if body.capability_family is not None:
            # Keep capability credit behind an accepted qualifying completion. If the
            # milestone write fails, retrying this same request safely retries it because
            # the completion key is idempotent and the capability is once-ever.
            capability_result = record_event(
                db,
                user_id,
                "capability_first_used",
                subject_key=body.capability_family,
            )
            result["summary"] = capability_result["summary"]
        return result
    except ProgressionValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.delete("/progression")
def delete_progression_data(user_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    # The account-deletion path D-119 committed to: hard delete across all three tiers.
    delete_progression(db, user_id)
    return {"deleted": True}


@app.post("/chat")
def post_chat(user_id: uuid.UUID, body: ChatRequest, db: Session = Depends(get_db)) -> dict:
    local_holdings = list_holdings(db, user_id)
    try:
        envelope_inputs = [body.question, body.onboarding_last_ai_message or ""]
        for holding in local_holdings:
            envelope_inputs.extend(str(value) for value in holding.values() if isinstance(value, (str, uuid.UUID)))
        envelope = PrivacyEnvelope.create(envelope_inputs)
        display_counts = {
            name: sum(1 for h in local_holdings if h.get("display_name") == name)
            for name in {h.get("display_name") for h in local_holdings if h.get("display_name")}
        }
        for holding in local_holdings:
            identifiers = [
                str(value) for value in (holding.get("alias"), holding.get("id")) if value
            ]
            if holding.get("display_name") and display_counts.get(holding["display_name"]) == 1:
                identifiers.append(holding["display_name"])
            envelope.register_entity(
                identifiers,
                str(holding.get("display_name") or holding.get("alias") or holding.get("id")),
                "Holding",
            )
        identities = [
            (str(value), kind)
            for holding in local_holdings
            for value, kind in (
                (holding.get("alias"), "Holding"),
                (holding.get("display_name"), "HoldingName"),
                (holding.get("id"), "HoldingId"),
            )
            if value
        ]
        masked_question = envelope.mask_text(body.question, identities)
        safe_last_ai_message = (
            envelope.mask_text(body.onboarding_last_ai_message, identities)
            if body.onboarding_last_ai_message
            else None
        )
        baseline = assemble_baseline(db, user_id, body.deepen_alias)
        baseline = envelope.mask_baseline(baseline, local_holdings)
    except UnsafeUserTextError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
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
        classified = classify_deepen(masked_question, baseline["holdings"])
        if classified is not None:
            baseline["deepen"] = classified
    onboarding_state = None
    if body.onboarding:
        onboarding_state = start_or_resume(db, user_id, body.onboarding_track_hint, masked_question)
        baseline["onboarding"] = build_onboarding_instruction(
            onboarding_state, safe_last_ai_message
        )
    try:
        masked_answer = ask_teaching_engine(baseline, masked_question)
    except TeachingEngineNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except anthropic.APIError as exc:
        # Never echo the raw exception back to the caller — same posture as
        # /health/db's DB-error handling (it can embed request/response detail).
        logger.error("Teaching engine provider failure", extra={"model": "claude-sonnet-5"})
        raise HTTPException(
            status_code=502,
            detail=f"Teaching engine call failed: {type(exc).__name__} (see server logs for detail)",
        ) from exc
    # D-078: a proposal is never written here — Fork 2 requires an explicit user confirm via a
    # separate POST /holdings call (existing create_holding path) before anything is saved.
    try:
        answer = envelope.rehumanize(masked_answer)
    except UnsafeUserTextError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    model_holdings = baseline["holdings"]
    extracted = classify_holding_capture(masked_question, model_holdings)
    holding_proposal = (
        build_reconciliation_proposal(
            body.question,
            local_holdings,
            extracted["product_type"],
            extracted["characteristics"],
        )
        if extracted is not None
        else None
    )
    result: dict = {"response": answer, "holding_proposal": holding_proposal}
    if onboarding_state is not None:
        updated = record_turn(db, onboarding_state, masked_question, masked_answer)
        result["onboarding_state"] = {"track": updated["track"], "stage": updated["stage"]}
    # BQ-071: last, after every write above has committed, and non-fatal by construction.
    # Legacy onboarding turns are not Arya exchanges — onboarding earns its own one-time
    # milestone instead, and counting its turns here would double-reward the same flow.
    if onboarding_state is None:
        record_arya_exchange(db, user_id, masked_question)
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
