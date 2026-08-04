import math
import uuid

from sqlalchemy.orm import Session

from app.models import Holding

# BRIEF-014's scope: Home Loan / Personal Loan only, matching D-013's own framing of
# these two as the prepay-vs-invest scenario-modeling case. Credit Card Debt is
# revolving, not a fixed-EMI amortizing loan, and doesn't fit this math.
_LOAN_TYPES = {"home_loan", "personal_loan"}

_HURDLE_RATE_NOTE = (
    "This is the loan's own rate. A real investment return is usually taxed while "
    "avoided loan interest isn't, so the true bar to beat is typically somewhat higher "
    "than this number, depending on what you invest in and how it's taxed."
)
_PREPAYMENT_CHARGE_NOTE = (
    "This doesn't account for any prepayment or foreclosure charges your lender may apply."
)


def _implied_remaining_months(outstanding_balance: float, emi_amount: float, monthly_rate: float) -> float:
    """Derives the current remaining tenure purely from outstanding_balance/emi_amount/
    interest_rate (the amortization identity) rather than tenure_months/start_date —
    self-consistent with today's stored balance regardless of any prior payment
    irregularities D-013's fields don't track."""
    ratio = monthly_rate * outstanding_balance / emi_amount
    if ratio >= 1:
        raise ValueError(
            "This loan's EMI doesn't cover its own interest at the stored rate — the "
            "stored principal/rate/EMI combination isn't a valid amortizing loan."
        )
    return -math.log(1 - ratio) / math.log(1 + monthly_rate)


def compute_loan_vs_invest(
    db: Session, user_id: uuid.UUID, holding_id: uuid.UUID, prepay_amount: float
) -> dict:
    """BRIEF-014: hurdle-rate-only comparison — never a projected investment outcome
    (system prompt §3 rule 4, never predict markets). Both prepayment modes are always
    returned, never a silently-picked default (BRIEF-014 Fork 1). No prepayment/
    foreclosure charge is modeled (Fork 2) — disclosed via `prepayment_charge_note`,
    not a new schema field, per BRIEF-014's proposed resolution.
    """
    holding = (
        db.query(Holding)
        .filter(Holding.user_id == user_id, Holding.id == holding_id)
        .first()
    )
    if holding is None:
        raise LookupError("Holding not found")
    if holding.product_type not in _LOAN_TYPES:
        raise ValueError(
            f"Loan-vs-invest only applies to {sorted(_LOAN_TYPES)}, not '{holding.product_type}'"
        )

    c = holding.characteristics or {}
    outstanding_balance = float(c.get("outstanding_balance") or 0)
    interest_rate = float(c.get("interest_rate") or 0)
    emi_amount = float(c.get("emi_amount") or 0)

    if outstanding_balance <= 0 or interest_rate <= 0 or emi_amount <= 0:
        raise ValueError("Loan is missing outstanding_balance, interest_rate, or emi_amount")
    if not (0 < prepay_amount < outstanding_balance):
        raise ValueError("prepay_amount must be greater than 0 and less than outstanding_balance")

    monthly_rate = interest_rate / 12 / 100
    P = outstanding_balance
    E = emi_amount
    X = prepay_amount
    P_new = P - X

    n = _implied_remaining_months(P, E, monthly_rate)
    interest_unprepaid = E * n - P

    # Tenure reduction: EMI stays the same, loan ends sooner.
    n_new = _implied_remaining_months(P_new, E, monthly_rate)
    interest_tenure_reduction = (X + E * n_new) - P
    tenure_reduction_saved = interest_unprepaid - interest_tenure_reduction

    # EMI reduction: tenure stays the same, EMI drops.
    factor = (1 + monthly_rate) ** n
    emi_new = P_new * monthly_rate * factor / (factor - 1)
    interest_emi_reduction = (X + emi_new * n) - P
    emi_reduction_saved = interest_unprepaid - interest_emi_reduction

    return {
        "holding_id": str(holding.id),
        "prepay_amount": round(X, 2),
        "hurdle_rate_percent": interest_rate,
        "hurdle_rate_note": _HURDLE_RATE_NOTE,
        "tenure_reduction": {
            "new_remaining_months": round(n_new, 1),
            "interest_saved": round(tenure_reduction_saved, 2),
        },
        "emi_reduction": {
            "new_emi_amount": round(emi_new, 2),
            "interest_saved": round(emi_reduction_saved, 2),
        },
        "prepayment_charge_note": _PREPAYMENT_CHARGE_NOTE,
    }
