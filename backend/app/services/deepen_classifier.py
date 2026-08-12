import logging

import anthropic

from app.core.config import settings

logger = logging.getLogger("fintutor.deepen_classifier")

# D-072/BRIEF-006 Path A: first real use of D-002's Haiku half of the two-model split.
_MODEL = "claude-haiku-4-5-20251001"
_MAX_TOKENS = 20
_NONE_TOKEN = "NONE"

_SYSTEM_PROMPT = (
    "You classify whether a user's question, in a personal finance app, concerns exactly one of "
    "their listed holdings. You are given the holdings as alias + product type only (never a real "
    "product or institution name). If the question is clearly and specifically about exactly one "
    f"listed holding, reply with only that holding's exact alias. Otherwise — if the question is "
    f"general, ambiguous, or concerns multiple or no holdings — reply with exactly the word "
    f'"{_NONE_TOKEN}". Reply with nothing else: no punctuation, no explanation.'
)

# D-071's fixed, backend-authored reason for the UI-signal case; this is the classifier's own
# equivalent — the model must use the reason it's given, never invent one (system prompt §2 rule 2),
# so this string is what the teaching model will see when a classifier match fires.
_CLASSIFIER_REASON = "the user's question appears to be specifically about this holding"


def classify_deepen(question: str, holdings: list[dict]) -> dict | None:
    """D-072: narrow, non-teaching Haiku call. Returns a `deepen` dict ({"alias", "reason"}) when the
    question confidently and unambiguously concerns exactly one holding, else None — never raises;
    any failure (unconfigured key, API error, or a reply that isn't a recognized alias) is treated as
    "no confident match" and degrades to D-028's existing safe default, same as an absent `deepen_alias`
    already does. Only ever called when D-071's deterministic UI-signal path didn't already set `deepen`.
    """
    if not settings.anthropic_api_key or not holdings:
        return None

    known_aliases = {h["alias"] for h in holdings}
    holdings_text = "\n".join(f"- {h['alias']} ({h['product_type']})" for h in holdings)
    user_text = f"Holdings:\n{holdings_text}\n\nQuestion: {question}"

    try:
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        response = client.messages.create(
            model=_MODEL,
            max_tokens=_MAX_TOKENS,
            system=_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_text}],
        )
        reply = "".join(block.text for block in response.content if block.type == "text").strip()
    except anthropic.APIError:
        logger.error("Deepen classifier provider failure", extra={"model": _MODEL})
        return None

    if reply not in known_aliases:
        return None

    return {"alias": reply, "reason": _CLASSIFIER_REASON}
