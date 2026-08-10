import uuid

from sqlalchemy.orm import Session

from app.models import Holding

# D-013/D-055 product_type slugs, by family — matches app/lib/taxonomy.ts and budget.py's
# existing type sets.
_INVESTMENT_VALUE_TYPES = {"equity_mutual_fund", "debt_mutual_fund", "stocks"}
_LOAN_TYPES = {"home_loan", "personal_loan", "credit_card_debt"}
_INVESTMENT_TYPES = _INVESTMENT_VALUE_TYPES | {"fd_rd", "ppf_epf", "esop"}
_INSURANCE_TYPES = {"term_insurance", "endowment_ulip"}


def _family_status(holding_count: int, valued_count: int, excluded_count: int) -> str:
    active_count = holding_count - excluded_count
    if holding_count == 0:
        return "empty"
    if active_count == 0:
        return "excluded"
    if valued_count == 0:
        return "unvalued"
    if valued_count < active_count:
        return "mixed"
    return "valued"


def compute_consolidated(db: Session, user_id: uuid.UUID) -> dict:
    """Live per-family totals per D-065 — no single net-worth figure, no field invented
    beyond what D-013 already stores per type.

    investments_total: current_value (Equity/Debt MF, Stocks) + principal_or_monthly_amount
      (FD/RD, read as-is, no accrual computed — D-065) + current_balance (PPF/EPF).
    loans_total: outstanding_balance (Home/Personal Loan, Credit Card Debt).
    insurance_total: current_fund_value (Endowment/ULIP only — Term Insurance has no fund
      value and contributes nothing).
    ESOP holdings are deliberately excluded — the characteristics schema is resolved (D-066),
    but there is still no decided formula for what an ESOP grant's "value" means for net worth
    (vested units only? net of strike price?), so there is no field to sum yet.
    """
    investments_total = 0.0
    loans_total = 0.0
    insurance_total = 0.0
    family_counts = {
        "investments": {"holding_count": 0, "valued_holding_count": 0, "excluded_holding_count": 0},
        "loans": {"holding_count": 0, "valued_holding_count": 0, "excluded_holding_count": 0},
        "insurance": {"holding_count": 0, "valued_holding_count": 0, "excluded_holding_count": 0},
    }

    for holding in db.query(Holding).filter(Holding.user_id == user_id).all():
        c = holding.characteristics or {}
        product_type = holding.product_type
        family = (
            "investments" if product_type in _INVESTMENT_TYPES
            else "loans" if product_type in _LOAN_TYPES
            else "insurance" if product_type in _INSURANCE_TYPES
            else None
        )
        if family:
            counts = family_counts[family]
            counts["holding_count"] += 1
            if product_type in {"term_insurance", "esop"}:
                counts["excluded_holding_count"] += 1
        if product_type in _INVESTMENT_VALUE_TYPES:
            if c.get("current_value") is not None:
                family_counts["investments"]["valued_holding_count"] += 1
                investments_total += float(c.get("current_value") or 0)
        elif product_type == "fd_rd":
            if c.get("principal_or_monthly_amount") is not None:
                family_counts["investments"]["valued_holding_count"] += 1
                investments_total += float(c.get("principal_or_monthly_amount") or 0)
        elif product_type == "ppf_epf":
            if c.get("current_balance") is not None:
                family_counts["investments"]["valued_holding_count"] += 1
                investments_total += float(c.get("current_balance") or 0)
        elif product_type in _LOAN_TYPES:
            if c.get("outstanding_balance") is not None:
                family_counts["loans"]["valued_holding_count"] += 1
                loans_total += float(c.get("outstanding_balance") or 0)
        elif product_type == "endowment_ulip":
            if c.get("current_fund_value") is not None:
                family_counts["insurance"]["valued_holding_count"] += 1
                insurance_total += float(c.get("current_fund_value") or 0)
        # term_insurance: no fund value, contributes 0.
        # esop: no decided net-worth valuation formula (see module docstring) — excluded, not guessed.

    result = {
        "investments_total": round(investments_total, 2),
        "loans_total": round(loans_total, 2),
        "insurance_total": round(insurance_total, 2),
    }
    for family, counts in family_counts.items():
        result[f"{family}_status"] = _family_status(
            counts["holding_count"], counts["valued_holding_count"], counts["excluded_holding_count"]
        )
        result[f"{family}_holding_count"] = counts["holding_count"]
        result[f"{family}_valued_holding_count"] = counts["valued_holding_count"]
        result[f"{family}_excluded_holding_count"] = counts["excluded_holding_count"]
    return result
