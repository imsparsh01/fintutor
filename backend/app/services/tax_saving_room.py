import uuid

from sqlalchemy.orm import Session

from app.models import Holding
from app.services.budget import _to_monthly

# The Section 80C statutory cap. A single figure, not a slab table — this could still go
# stale in a future budget, but the maintenance burden is far smaller than a full
# progressive slab structure would be (see BRIEF-016's own reasoning for why the slab
# table itself is avoided entirely, not just this constant).
_ANNUAL_80C_CAP = 150000.0

_NOT_RELEVANT_NOTE = (
    "Under the new tax regime, most Section 80C deductions don't apply, so this isn't "
    "relevant for you."
)
_ROOM_NOTE = (
    "This is the deduction space left under the ₹1,50,000 Section 80C cap, based on what's "
    "already recorded — it doesn't count any tax-saving equity funds you may already hold, "
    "since we can't tell those apart from regular ones."
)


def compute_tax_saving_room(db: Session, user_id: uuid.UUID, tax_regime: str) -> dict:
    """BRIEF-016/D-070: stops at unused 80C room, never a rupee tax-savings figure (would
    need a maintained income tax slab table — deliberately not attempted). Tax regime is a
    one-off input, never stored — same shape as loan_vs_invest's prepay_amount, resolving
    Gap A (regime) without new profile data.
    """
    if tax_regime not in ("old", "new"):
        raise ValueError("tax_regime must be 'old' or 'new'")

    if tax_regime == "new":
        return {"applicable": False, "note": _NOT_RELEVANT_NOTE, "unused_room": None}

    known_contributions = 0.0
    for holding in db.query(Holding).filter(Holding.user_id == user_id).all():
        c = holding.characteristics or {}
        if holding.product_type == "ppf_epf":
            known_contributions += float(c.get("annual_contribution") or 0)
        elif holding.product_type in ("term_insurance", "endowment_ulip"):
            known_contributions += _to_monthly(c.get("premium") or 0, c.get("premium_frequency")) * 12

    unused_room = max(0.0, _ANNUAL_80C_CAP - known_contributions)

    return {
        "applicable": True,
        "note": _ROOM_NOTE,
        "known_contributions": round(known_contributions, 2),
        "unused_room": round(unused_room, 2),
        "cap": _ANNUAL_80C_CAP,
    }
