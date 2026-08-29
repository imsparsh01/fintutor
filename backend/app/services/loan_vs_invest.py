import math
import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import Holding

# BRIEF-014's scope: Home Loan / Personal Loan only, matching D-013's own framing of
# these two as the prepay-vs-invest scenario-modeling case. Credit Card Debt is
# revolving, not a fixed-EMI amortizing loan, and doesn't fit this math.
_LOAN_TYPES = {"home_loan", "personal_loan"}
_MAX_AMOUNT = 1_000_000_000_000.0
_MAX_RATE_PERCENT = 100.0
_MAX_TENURE_MONTHS = 600.0
_MAX_MONEY_OUTPUT = 1_000_000_000_000_000.0

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
    if not all(math.isfinite(value) and value > 0 for value in (outstanding_balance, emi_amount, monthly_rate)):
        raise ValueError("Loan values must be finite and greater than 0")
    ratio = monthly_rate * outstanding_balance / emi_amount
    if ratio >= 1:
        raise ValueError(
            "This loan's EMI doesn't cover its own interest at the stored rate — the "
            "stored principal/rate/EMI combination isn't a valid amortizing loan."
        )
    months = -math.log(1 - ratio) / math.log(1 + monthly_rate)
    if not math.isfinite(months) or months <= 0:
        raise ValueError("Loan values do not produce a finite positive remaining tenure")
    return months


def _stored_number(characteristics: dict, field: str) -> float:
    raw = characteristics.get(field)
    if raw is None or isinstance(raw, bool):
        raise ValueError(f"Loan is missing {field} or it is invalid")
    try:
        value = float(raw)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Loan is missing {field} or it is invalid") from exc
    if not math.isfinite(value) or value <= 0 or value > _MAX_AMOUNT:
        raise ValueError(f"Loan is missing {field} or it is invalid")
    return value


def _guard_money(*values: float) -> None:
    if not all(math.isfinite(value) and abs(value) <= _MAX_MONEY_OUTPUT for value in values):
        raise ValueError("The calculation exceeds the supported output domain")


def compute_loan_vs_invest(
    db: Session,
    user_id: uuid.UUID,
    holding_id: uuid.UUID,
    prepay_amount: float,
    *,
    retrieved_at: datetime | None = None,
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
    outstanding_balance = _stored_number(c, "outstanding_balance")
    interest_rate = _stored_number(c, "interest_rate")
    emi_amount = _stored_number(c, "emi_amount")
    if interest_rate > _MAX_RATE_PERCENT:
        raise ValueError("interest_rate must be greater than 0 and at most 100")
    if (
        isinstance(prepay_amount, bool)
        or not isinstance(prepay_amount, (int, float))
        or not math.isfinite(prepay_amount)
        or not (0 < prepay_amount <= _MAX_AMOUNT)
        or not prepay_amount < outstanding_balance
    ):
        raise ValueError(
            "prepay_amount must be finite, greater than 0, at most ₹1 trillion, and less than outstanding_balance"
        )

    monthly_rate = interest_rate / 12 / 100
    P = outstanding_balance
    E = emi_amount
    X = prepay_amount
    P_new = P - X

    n = _implied_remaining_months(P, E, monthly_rate)
    if n > _MAX_TENURE_MONTHS:
        raise ValueError("The implied original tenure exceeds 600 months")
    interest_unprepaid = E * n - P
    _guard_money(interest_unprepaid)

    # Tenure reduction: EMI stays the same, loan ends sooner.
    n_new = _implied_remaining_months(P_new, E, monthly_rate)
    if n_new > _MAX_TENURE_MONTHS:
        raise ValueError("The implied post-prepayment tenure exceeds 600 months")
    interest_tenure_reduction = (X + E * n_new) - P
    tenure_reduction_saved = interest_unprepaid - interest_tenure_reduction

    # EMI reduction: tenure stays the same, EMI drops.
    factor = (1 + monthly_rate) ** n
    emi_new = P_new * monthly_rate * factor / (factor - 1)
    interest_emi_reduction = (X + emi_new * n) - P
    emi_reduction_saved = interest_unprepaid - interest_emi_reduction
    _guard_money(
        P_new,
        interest_tenure_reduction,
        tenure_reduction_saved,
        emi_new,
        interest_emi_reduction,
        emi_reduction_saved,
    )

    loaded_at = retrieved_at or datetime.now(timezone.utc)
    if loaded_at.tzinfo is None:
        loaded_at = loaded_at.replace(tzinfo=timezone.utc)
    loaded_at = loaded_at.astimezone(timezone.utc)

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
        "source_evidence": {
            "source_kind": "holding",
            "source_record_id": str(holding.id),
            "source_label": holding.display_name or holding.alias,
            "source_fields": ["outstanding_balance", "interest_rate", "emi_amount"],
            "source_version": holding.version or 1,
            "record_updated_at": None,
            "retrieved_at": loaded_at.isoformat(),
            "freshness": "unavailable",
            "freshness_note": "Freshness unavailable",
        },
    }
