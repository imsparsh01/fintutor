import json

import anthropic

from app.core.config import REPO_ROOT, settings

# D-002: Sonnet for user-facing teaching. Matches scripts/run_phase1_test.py's model
# string and max_tokens (the latter raised from 1024 in that script's own BQ-008 fix —
# a thinking-enabled model can exhaust a smaller budget on reasoning alone).
_MODEL = "claude-sonnet-5"
_MAX_TOKENS = 4096
_SYSTEM_PROMPT_PATH = REPO_ROOT / "docs" / "prompts" / "SYSTEM_PROMPT_v0_8_runnable.md"


class TeachingEngineNotConfigured(Exception):
    pass


def _load_system_prompt() -> str:
    return _SYSTEM_PROMPT_PATH.read_text()


def ask_teaching_engine(baseline: dict, question: str) -> str:
    """Calls the Anthropic API with the assembled baseline (app/services/baseline.py) and
    the user's question, per the exact message shape scripts/run_phase1_test.py already
    established and validated across Phase 1 runs. D-028: `deepen` is omitted — this
    endpoint has no selection rule (BQ-004, still blocked), so every path gets equal
    shallow treatment per the system prompt's own documented default.

    Raises TeachingEngineNotConfigured if ANTHROPIC_API_KEY isn't set — caller's job to
    turn that into a 503, same responsibility split as db/session.py's engine=None case.
    """
    if not settings.anthropic_api_key:
        raise TeachingEngineNotConfigured("ANTHROPIC_API_KEY is not set")

    system_text = _load_system_prompt()
    user_text = f"Here is the user's profile slice:\n\n{json.dumps(baseline)}\n\n{question}"

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    response = client.messages.create(
        model=_MODEL,
        max_tokens=_MAX_TOKENS,
        system=system_text,
        messages=[{"role": "user", "content": user_text}],
    )
    return "".join(block.text for block in response.content if block.type == "text")
