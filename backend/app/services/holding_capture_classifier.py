import json
import logging

import anthropic

from app.core.config import settings
from app.services.holding_fields import CHARACTERISTIC_FIELDS, validate_reconciliation_fields
from app.services.holding_reconciliation import redact_display_names

logger = logging.getLogger("fintutor.holding_capture_classifier")

# D-078 Fork 1: the first real use of D-002's "Haiku for reconciliation" half. Same narrow,
# non-teaching Haiku-call shape as deepen_classifier.py (D-072) — reads the user's own message
# and decides, structurally, whether it describes a capturable holding.
_MODEL = "claude-haiku-4-5-20251001"
_MAX_TOKENS = 300
_NONE_TOKEN = "NONE"

# D-013 + D-066 taxonomy, mirrored here (no shared schema file with app/lib/characteristicsSchema.ts
# — same convention already used by budget.py/surfacing.py/taxonomy.ts, each independently mirroring
# the same product-type literals with a comment rather than importing a shared source).
_TAXONOMY_TEXT = "\n".join(
    f"- {product_type}: {', '.join(fields)}"
    for product_type, fields in CHARACTERISTIC_FIELDS.items()
)

_SYSTEM_PROMPT = (
    "You read a user's message in a personal finance app and decide whether it describes a "
    "financial holding (a loan, investment, or insurance policy), with enough detail to extract "
    "at least one characteristic field. Existing holdings are context only: never decide which "
    "record to update and never suppress extraction because a matching type already exists. "
    "Backend code and the user resolve record identity. You are given aliases only, never a real "
    "product or institution name.\n\n"
    "The only valid product types, each with its known characteristic fields, are:\n"
    f"{_TAXONOMY_TEXT}\n\n"
    "If the message describes a holding with extractable detail, reply with "
    "ONLY a single-line JSON object: "
    '{"product_type": "<one of the types above>", "characteristics": {"<field>": <value>, ...}} '
    "using only field names from that type's list above, and only fields you can confidently "
    "support from the message. If the message is general, ambiguous, or has no extractable detail, reply "
    f'with exactly the word "{_NONE_TOKEN}". Reply with nothing else: no explanation, no markdown, '
    "no extra text before or after."
)


def classify_holding_capture(message: str, holdings: list[dict]) -> dict | None:
    """D-078/D-127: narrow, non-teaching Haiku call. Returns type + supplied fields when the
    message confidently describes a holding, else None — never raises. Record identity is resolved
    deterministically after this call; exact local display names are redacted before this call. Any
    failure (unconfigured key, API error, malformed JSON, unrecognized product_type) degrades to
    "nothing proposed", same discipline as classify_deepen (D-072). Never writes to the database —
    the caller (POST /chat) only ever surfaces this as a proposal; D-078 Fork 2 requires an explicit
    user confirm before any holding is actually created.
    """
    if not settings.anthropic_api_key:
        return None

    holdings_text = (
        "\n".join(f"- {h['alias']} ({h['product_type']})" for h in holdings)
        if holdings
        else "(none yet)"
    )
    safe_message = redact_display_names(message, holdings)
    user_text = f"Existing holdings:\n{holdings_text}\n\nMessage: {safe_message}"

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
        logger.error("Holding capture classifier provider failure", extra={"model": _MODEL})
        return None

    if reply == _NONE_TOKEN or not reply:
        return None

    try:
        parsed = json.loads(reply)
    except json.JSONDecodeError:
        logger.warning("Holding capture classifier returned non-JSON, non-NONE reply")
        return None

    if not isinstance(parsed, dict):
        return None

    product_type = parsed.get("product_type")
    known_fields = CHARACTERISTIC_FIELDS.get(product_type)
    if known_fields is None:
        return None

    raw_characteristics = parsed.get("characteristics")
    if not isinstance(raw_characteristics, dict):
        return None

    # A hallucinated extra field shouldn't sink an otherwise-good partial extraction — drop
    # unrecognized keys rather than reject the whole proposal.
    characteristics = {k: v for k, v in raw_characteristics.items() if k in known_fields}
    if not characteristics:
        return None
    try:
        validate_reconciliation_fields(product_type, characteristics)
    except ValueError:
        return None

    return {"product_type": product_type, "characteristics": characteristics}
