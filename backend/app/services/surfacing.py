import uuid

from sqlalchemy.orm import Session

from app.models import Holding

# D-051/BQ-013 — WHICH half of D-012's trigger logic only. Purely mechanical: no model
# judgment anywhere here. WHEN (deciding a live turn is the right moment to raise a
# candidate) is a separate, still-gated question — see D-051 — this never decides to
# surface anything, it only computes what's eligible.
#
# Rule order is the fixed precedence order for a future WHEN-stage tie-break (D-051):
# first rule in this list is highest precedence. v1 has one rule, so precedence isn't
# exercised yet, but the shape is here for when the table grows.
_PAIRING_RULES = [
    {
        "trigger_types": {"home_loan", "personal_loan"},
        "requires_absent": "term_insurance",
        "candidate": "term_insurance",
        "reason": "loan_without_life_cover",
    },
]


def compute_surfacing_candidates(db: Session, user_id: uuid.UUID) -> list[dict]:
    """Ordered list of {product_type, reason} candidates worth surfacing to the user.

    Endowment/ULIP presence does NOT suppress the term_insurance candidate (owner-
    confirmed, D-051/BQ-013 scoping) — D-013 split Term from Endowment/ULIP because the
    teaching moment genuinely differs, so the gap stands regardless of what else is held.
    """
    product_types = {
        h.product_type for h in db.query(Holding).filter(Holding.user_id == user_id).all()
    }

    candidates = []
    seen = set()
    for rule in _PAIRING_RULES:
        if product_types & rule["trigger_types"] and rule["requires_absent"] not in product_types:
            if rule["candidate"] not in seen:
                candidates.append({"product_type": rule["candidate"], "reason": rule["reason"]})
                seen.add(rule["candidate"])

    return candidates
