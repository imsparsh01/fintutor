import uuid

from sqlalchemy.orm import Session

from app.models import DiscretionaryCategory, Holding, Income

# D-013 product_type slugs whose recurring outflow is a loan EMI.
_EMI_TYPES = {"home_loan", "personal_loan"}
# D-013 product_type slugs that can carry a SIP (recurring) contribution.
_SIP_CAPABLE_TYPES = {"equity_mutual_fund", "debt_mutual_fund"}
# D-013 product_type slugs whose recurring outflow is an insurance premium.
_PREMIUM_TYPES = {"term_insurance", "endowment_ulip"}
_RECURRING_FREQUENCIES = {"monthly", "month", "quarterly", "quarter", "annual", "annually", "yearly", "year", "weekly", "week"}


def _to_monthly(amount: float, frequency: str | None) -> float:
    """Normalize an amount + frequency (Income.sources / premium_frequency) to a monthly figure."""
    freq = (frequency or "monthly").strip().lower()
    if freq in ("annual", "annually", "yearly", "year"):
        return float(amount) / 12
    if freq in ("quarterly", "quarter"):
        return float(amount) / 3
    if freq in ("weekly", "week"):
        return float(amount) * 52 / 12
    # "monthly"/"month" and any unrecognized value are treated as already-monthly.
    return float(amount)


def compute_budget(db: Session, user_id: uuid.UUID) -> dict:
    """Live budget view per D-038/BQ-010 — nothing here is stored, only read and summed.

    income_total: Income.sources, frequency-normalized to monthly. Each source's `amount` is
      the floor/conservative figure (D-073) — an optional `amount_high` may also be stored
      per source as a purely informational "typical" companion figure, but it is never read
      here; only `amount` feeds this calculation.
    recurring_outflows_total: EMI / SIP investment amount / insurance premium, read live
      off Holding.characteristics (D-013 fields) — the three items D-038 names explicitly.
    discretionary_total: DiscretionaryCategory.planned_amount, summed as-is.
    """
    income_total = sum(
        _to_monthly(source["amount"], source.get("frequency"))
        for income in db.query(Income).filter(Income.user_id == user_id).all()
        for source in income.sources
    )

    recurring_outflows_total = 0.0
    recurring_outflows: list[dict] = []
    for holding in db.query(Holding).filter(Holding.user_id == user_id).all():
        c = holding.characteristics or {}
        amount = None
        frequency = None
        source_field = None
        if holding.product_type in _EMI_TYPES:
            amount, frequency, source_field = c.get("emi_amount"), c.get("emi_frequency"), "emi_amount"
        elif holding.product_type in _SIP_CAPABLE_TYPES and c.get("investment_mode") == "SIP":
            amount, frequency, source_field = c.get("invested_amount"), c.get("sip_frequency"), "invested_amount"
        elif holding.product_type in _PREMIUM_TYPES:
            amount, frequency, source_field = c.get("premium"), c.get("premium_frequency"), "premium"

        # Option C: a recurring amount without an explicit cadence is not silently treated
        # as monthly. It remains visible in the holding, but does not enter this monthly view.
        if amount is None or frequency is None or str(frequency).strip().lower() not in _RECURRING_FREQUENCIES:
            continue
        monthly_amount = _to_monthly(float(amount), str(frequency))
        recurring_outflows_total += monthly_amount
        recurring_outflows.append({
            "product_type": holding.product_type,
            "source_field": source_field,
            "amount": round(float(amount), 2),
            "frequency": str(frequency),
            "monthly_amount": round(monthly_amount, 2),
        })

    discretionary_categories = (
        db.query(DiscretionaryCategory).filter(DiscretionaryCategory.user_id == user_id).all()
    )
    discretionary_total = sum(float(row.planned_amount) for row in discretionary_categories)

    return {
        "income_total": round(income_total, 2),
        "recurring_outflows_total": round(recurring_outflows_total, 2),
        "recurring_outflows": recurring_outflows,
        "discretionary_total": round(discretionary_total, 2),
        "net": round(income_total - recurring_outflows_total - discretionary_total, 2),
        "discretionary_categories": [
            {"label": row.label, "planned_amount": float(row.planned_amount)}
            for row in discretionary_categories
        ],
    }
