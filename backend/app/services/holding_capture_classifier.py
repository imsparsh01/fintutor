import json
import logging

import anthropic

from app.core.config import settings

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
_CHARACTERISTIC_FIELDS: dict[str, list[str]] = {
    "equity_mutual_fund": [
        "expense_ratio", "lock_in_period", "investment_mode", "invested_amount", "sip_frequency",
        "current_value", "start_date", "risk_bucket",
    ],
    "debt_mutual_fund": [
        "expense_ratio", "lock_in_period", "investment_mode", "invested_amount", "sip_frequency",
        "current_value", "start_date", "risk_bucket",
    ],
    "stocks": ["sector", "invested_amount", "current_value", "purchase_date", "risk_bucket"],
    "fd_rd": [
        "deposit_mode", "principal_or_monthly_amount", "interest_rate", "tenure", "maturity_date",
    ],
    "ppf_epf": ["retirement_fund_type", "current_balance", "annual_contribution", "interest_rate"],
    "home_loan": [
        "principal", "interest_rate", "tenure_months", "emi_amount", "emi_frequency", "emi_due_day", "start_date",
        "outstanding_balance",
    ],
    "personal_loan": [
        "principal", "interest_rate", "tenure_months", "emi_amount", "emi_frequency", "emi_due_day", "start_date",
        "outstanding_balance",
    ],
    "credit_card_debt": [
        "credit_limit", "outstanding_balance", "interest_rate", "minimum_due",
        "payment_due_date", "billing_cycle_date",
    ],
    "term_insurance": ["sum_assured", "premium", "premium_frequency", "policy_term", "start_date"],
    "endowment_ulip": [
        "sum_assured", "premium", "premium_frequency", "policy_term", "current_fund_value",
        "maturity_value_estimate", "start_date",
    ],
    "esop": [
        "grant_type", "grant_date", "total_units_granted", "vesting_cliff_months",
        "vesting_period_months", "strike_price", "current_fmv", "exercise_window_months",
    ],
}

_TAXONOMY_TEXT = "\n".join(
    f"- {product_type}: {', '.join(fields)}"
    for product_type, fields in _CHARACTERISTIC_FIELDS.items()
)

_SYSTEM_PROMPT = (
    "You read a user's message in a personal finance app and decide whether it describes a "
    "financial holding (a loan, investment, or insurance policy) that is not already in their "
    "tracked list, with enough detail to extract at least one characteristic field. You are given "
    "their existing holdings as alias + product type only (never a real product or institution "
    "name) so you know what is already tracked.\n\n"
    "The only valid product types, each with its known characteristic fields, are:\n"
    f"{_TAXONOMY_TEXT}\n\n"
    "If the message describes a new, not-yet-tracked holding with extractable detail, reply with "
    "ONLY a single-line JSON object: "
    '{"product_type": "<one of the types above>", "characteristics": {"<field>": <value>, ...}} '
    "using only field names from that type's list above, and only fields you can confidently "
    "support from the message. If the message does not describe a capturable new holding — it is "
    "general, ambiguous, about an already-tracked holding, or has no extractable detail — reply "
    f'with exactly the word "{_NONE_TOKEN}". Reply with nothing else: no explanation, no markdown, '
    "no extra text before or after."
)


def classify_holding_capture(message: str, holdings: list[dict]) -> dict | None:
    """D-078: narrow, non-teaching Haiku call. Returns {"product_type", "characteristics"} when the
    message confidently describes a new, not-yet-tracked holding, else None — never raises. Any
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
    user_text = f"Existing holdings:\n{holdings_text}\n\nMessage: {message}"

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
        logger.exception("Holding capture classifier call failed")
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
    known_fields = _CHARACTERISTIC_FIELDS.get(product_type)
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

    return {"product_type": product_type, "characteristics": characteristics}
