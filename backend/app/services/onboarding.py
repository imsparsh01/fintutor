import logging
import uuid

import anthropic
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import OnboardingState

logger = logging.getLogger("fintutor.onboarding")

# Same narrow, non-teaching Haiku-call shape as deepen_classifier.py (D-072) /
# holding_capture_classifier.py (D-078).
_MODEL = "claude-haiku-4-5-20251001"
_MAX_TOKENS = 20

# Stage/path map — BQ-042, per docs/features/onboarding/PRD.md, confirmed D-084. Each track ends
# in "complete".
_TRACKS: dict[str, list[str]] = {
    "fresh_starter": ["intro", "sequencing", "complete"],
    "reactive_dabbler": ["intro", "mechanism", "reflect", "complete"],
    "habit_former": ["intro", "gapscan", "complete"],
    "unclassified": ["intro", "complete"],
}

_REAL_TRACKS = [t for t in _TRACKS if t != "unclassified"]

# PRD's fail-safe: 4 AI turns before forcing a resolution, except unclassified's "intro" — that
# stage is the routing turn itself, and the PRD calls for resolving ambiguity after one turn
# rather than sitting in classification limbo.
_TURN_BUDGET = 4
_UNCLASSIFIED_INTRO_BUDGET = 1

# Guidance text handed to the teaching engine (via build_onboarding_instruction) so it knows what
# this stage is trying to accomplish — paraphrased directly from the PRD's stage/path map, nothing
# invented here.
_STAGE_GUIDANCE: dict[tuple[str, str], str] = {
    ("fresh_starter", "intro"): "Ask about the user's income, conversationally — never as a form field.",
    ("fresh_starter", "sequencing"): (
        "Once you know enough, walk the buffer, protection, and growth relationship using the "
        "user's own numbers. Present this as how these needs typically relate to each other in "
        "general — never as a fixed order to follow, and never as a recommendation of what to do "
        "first. A fixed presentation order can read as advice even when framed generically — stay "
        "deliberate about that."
    ),
    ("reactive_dabbler", "intro"): "Ask what the loan or product actually is.",
    ("reactive_dabbler", "mechanism"): (
        "Explain what it mechanically does — cost, exit terms, purpose. Never state whether it fits "
        "the user's situation."
    ),
    ("reactive_dabbler", "reflect"): (
        "Ask a reflective question — e.g. what the user was hoping this product would do for them — "
        "and let the user self-assess. Never answer it for them."
    ),
    ("habit_former", "intro"): "Ask what the user is already tracking.",
    ("habit_former", "gapscan"): (
        "Pattern-match across the buffer, protection, and growth holding families and name the "
        "category of any gap generically — never the specific product to fill it."
    ),
    ("unclassified", "intro"): (
        "Ask one light clarifying question to figure out which fits: someone just starting to earn, "
        "someone with a specific loan or product they want to understand, or someone who already "
        "tracks their money and wants to go deeper."
    ),
}

_CLOSING_INSTRUCTION = (
    "This stage has run long enough that your reply must explicitly close it out: say plainly, in "
    "your own words, that they can continue on to the rest of the app now — do not rely only on the "
    "header button, and do not skip this."
)

_TRACK_CLASSIFIER_SYSTEM_PROMPT = (
    "You classify the opening message of a personal finance app's onboarding chat into exactly one "
    "of four tracks:\n"
    "- fresh_starter: just started earning, doesn't know where to begin\n"
    "- reactive_dabbler: has a specific loan, EMI, or investment product already and wants to "
    "understand it\n"
    "- habit_former: already tracks their budget or money and wants to go deeper\n"
    "- unclassified: none of the above confidently fits yet\n"
    "Reply with only the exact track name, nothing else: no punctuation, no explanation."
)


def _to_dict(state: OnboardingState) -> dict:
    return {
        "user_id": str(state.user_id),
        "track": state.track,
        "stage": state.stage,
        "turns_in_stage": state.turns_in_stage,
    }


def get_onboarding_state(db: Session, user_id: uuid.UUID) -> dict:
    state = db.query(OnboardingState).filter(OnboardingState.user_id == user_id).first()
    if state is None:
        return {"user_id": str(user_id), "track": None, "stage": None, "turns_in_stage": 0}
    return _to_dict(state)


def _classify_track(message: str) -> str:
    """Degrades to 'unclassified' — the PRD's own safe fallback — on any failure or unconfident
    reply. Never raises."""
    if not settings.anthropic_api_key:
        return "unclassified"
    try:
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        response = client.messages.create(
            model=_MODEL,
            max_tokens=_MAX_TOKENS,
            system=_TRACK_CLASSIFIER_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": message}],
        )
        reply = "".join(b.text for b in response.content if b.type == "text").strip()
    except anthropic.APIError:
        logger.exception("Onboarding track classifier call failed")
        return "unclassified"
    return reply if reply in _TRACKS else "unclassified"


def _classify_stage_advance(track: str, stage: str, question: str, answer: str) -> bool:
    """Degrades to False (stay in the current stage) on any failure — the turn-budget backstop in
    record_turn guarantees forward progress regardless of what this returns."""
    if not settings.anthropic_api_key:
        return False
    guidance = _STAGE_GUIDANCE.get((track, stage), "")
    system_prompt = (
        "You judge a single turn of a personal finance app's structured onboarding chat. This "
        f"stage's goal is: {guidance}\n"
        "Given the user's message and the AI's reply, has this stage's goal been reasonably met, "
        "such that the conversation should move on to the next stage? Reply with only YES or NO, "
        "nothing else."
    )
    user_text = f"User: {question}\n\nAI: {answer}"
    try:
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        response = client.messages.create(
            model=_MODEL,
            max_tokens=_MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": user_text}],
        )
        reply = "".join(b.text for b in response.content if b.type == "text").strip().upper()
    except anthropic.APIError:
        logger.exception("Onboarding stage-transition classifier call failed")
        return False
    return reply == "YES"


def _stage_budget(track: str | None, stage: str | None) -> int:
    if (track, stage) == ("unclassified", "intro"):
        return _UNCLASSIFIED_INTRO_BUDGET
    return _TURN_BUDGET


def start_or_resume(
    db: Session, user_id: uuid.UUID, track_hint: str | None, question: str
) -> OnboardingState:
    """Reads (or creates) this user's OnboardingState and resolves an unset track — via the
    deterministic chip-tap hint when given (same "trust an app-known UI signal" pattern as D-071's
    deepen_alias), else the Haiku classifier on the free-typed message (mirrors D-072). A returning
    user with an already-set track/stage just continues where they left off — the PRD's "resuming a
    skipped conversation" question resolves for free this way, nothing extra needed. Never advances
    a stage here — that's record_turn's job, after the teaching engine has actually replied."""
    state = db.query(OnboardingState).filter(OnboardingState.user_id == user_id).first()
    if state is None:
        state = OnboardingState(user_id=user_id, track=None, stage=None, turns_in_stage=0)
        db.add(state)

    if state.track is None:
        track = track_hint if track_hint in _TRACKS else _classify_track(question)
        state.track = track
        state.stage = _TRACKS[track][0]
        state.turns_in_stage = 0
        db.commit()
        db.refresh(state)

    return state


def is_forced_resolution_turn(state: OnboardingState) -> bool:
    """True when this turn's reply must be the one that explicitly closes the stage out — i.e. the
    upcoming turn will spend the last of this stage's turn budget."""
    if state.stage == "complete":
        return False
    return state.turns_in_stage + 1 >= _stage_budget(state.track, state.stage)


def build_onboarding_instruction(state: OnboardingState, last_ai_message: str | None = None) -> dict:
    """The `onboarding` field added to the teaching engine's baseline — same instruction-field
    pattern as `deepen` (main.py's ChatRequest / baseline.py §4). Tells the model where the user is
    in the fixed onboarding structure and what this stage is trying to accomplish; never sent as
    conversation history (D-083 — this is structural state, not dialogue recall).

    `last_ai_message` (D-085): the one narrow exception — the AI's own immediately preceding
    message in this conversation, forwarded per-request from the frontend's local display state,
    never persisted here or anywhere server-side. Without it, a short/referential reply ("no,
    that's the only one") arrives with nothing to anchor it, since every other prior-turn detail
    genuinely stays unsent (live-verified failure mode, not a hypothetical)."""
    guidance = _STAGE_GUIDANCE.get(
        (state.track, state.stage), "Help the user find their footing in the app."
    )
    instruction: dict = {"track": state.track, "stage": state.stage, "guidance": guidance}
    if last_ai_message:
        instruction["last_ai_message"] = last_ai_message
    if is_forced_resolution_turn(state):
        instruction["closing_instruction"] = _CLOSING_INSTRUCTION
    return instruction


def record_turn(db: Session, state: OnboardingState, question: str, answer: str) -> dict:
    """Called after the teaching engine has answered this turn. Advances the stage when the
    classifier judges its goal met, or forces a resolution once the turn budget is spent — the
    fail-safe backstop that guarantees no track can loop forever regardless of classifier output.
    unclassified's "intro" stage is a special case: its "advance" is re-running track
    classification on the clarifying exchange, per the PRD's one-turn-then-resolve-anyway rule."""
    if state.stage == "complete":
        return _to_dict(state)

    state.turns_in_stage += 1

    if state.track == "unclassified" and state.stage == "intro":
        resolved = _classify_track(question)
        if resolved in _REAL_TRACKS:
            state.track = resolved
            state.stage = _TRACKS[resolved][0]
            state.turns_in_stage = 0
            db.commit()
            db.refresh(state)
            return _to_dict(state)

    if state.turns_in_stage >= _stage_budget(state.track, state.stage):
        state.stage = "complete"
        state.turns_in_stage = 0
    elif _classify_stage_advance(state.track, state.stage, question, answer):
        stages = _TRACKS[state.track]
        state.stage = stages[stages.index(state.stage) + 1]
        state.turns_in_stage = 0

    db.commit()
    db.refresh(state)
    return _to_dict(state)
