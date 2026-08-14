import math
import uuid

from sqlalchemy.orm import Session

from app.models import Holding

# D-013/D-055 product_type slugs, by family — matches app/lib/taxonomy.ts and budget.py's
# existing type sets.
_INVESTMENT_VALUE_TYPES = {"equity_mutual_fund", "debt_mutual_fund", "stocks"}
_LOAN_TYPES = {"home_loan", "personal_loan", "credit_card_debt"}
_INVESTMENT_TYPES = _INVESTMENT_VALUE_TYPES | {"fd_rd", "ppf_epf", "esop"}
_INSURANCE_TYPES = {"term_insurance", "endowment_ulip"}

_VALUATION_FIELDS = {
    "equity_mutual_fund": ("investments", "current_value"),
    "debt_mutual_fund": ("investments", "current_value"),
    "stocks": ("investments", "current_value"),
    "fd_rd": ("investments", "principal_or_monthly_amount"),
    "ppf_epf": ("investments", "current_balance"),
    "home_loan": ("loans", "outstanding_balance"),
    "personal_loan": ("loans", "outstanding_balance"),
    "credit_card_debt": ("loans", "outstanding_balance"),
    "endowment_ulip": ("insurance", "current_fund_value"),
}


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


def _finite_value(characteristics: object, field: str) -> tuple[str, float | None]:
    """Classify one stored valuation without letting malformed JSONB escape.

    Missing/null is an ordinary unvalued record. A present but non-numeric, boolean or
    non-finite value is invalid. Numeric strings remain supported for compatibility.
    """
    if characteristics is None:
        return "missing", None
    if not isinstance(characteristics, dict):
        return "invalid", None
    if field not in characteristics or characteristics[field] is None:
        return "missing", None
    raw_value = characteristics[field]
    if isinstance(raw_value, bool):
        return "invalid", None
    try:
        value = float(raw_value)
    except (TypeError, ValueError, OverflowError):
        return "invalid", None
    if not math.isfinite(value):
        return "invalid", None
    return "valued", value


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
    unclassified_holding_count = 0
    family_counts = {
        family: {
            "holding_count": 0,
            "valued_holding_count": 0,
            "excluded_holding_count": 0,
            "invalid_value_count": 0,
        }
        for family in ("investments", "loans", "insurance")
    }

    for holding in db.query(Holding).filter(Holding.user_id == user_id).all():
        product_type = holding.product_type
        family = (
            "investments" if product_type in _INVESTMENT_TYPES
            else "loans" if product_type in _LOAN_TYPES
            else "insurance" if product_type in _INSURANCE_TYPES
            else None
        )
        if family is None:
            unclassified_holding_count += 1
            continue

        counts = family_counts[family]
        counts["holding_count"] += 1
        if product_type in {"term_insurance", "esop"}:
            counts["excluded_holding_count"] += 1
            continue

        valuation_family, field = _VALUATION_FIELDS[product_type]
        value_status, value = _finite_value(holding.characteristics, field)
        if value_status == "invalid":
            counts["invalid_value_count"] += 1
            continue
        if value_status == "missing":
            continue

        if valuation_family == "investments":
            candidate_total = investments_total + value
            if not math.isfinite(candidate_total):
                counts["invalid_value_count"] += 1
                continue
            investments_total = candidate_total
        elif valuation_family == "loans":
            candidate_total = loans_total + value
            if not math.isfinite(candidate_total):
                counts["invalid_value_count"] += 1
                continue
            loans_total = candidate_total
        else:
            candidate_total = insurance_total + value
            if not math.isfinite(candidate_total):
                counts["invalid_value_count"] += 1
                continue
            insurance_total = candidate_total
        counts["valued_holding_count"] += 1
        # term_insurance: no fund value, contributes 0.
        # esop: no decided net-worth valuation formula (see module docstring) — excluded, not guessed.

    result = {
        "investments_total": round(investments_total, 2),
        "loans_total": round(loans_total, 2),
        "insurance_total": round(insurance_total, 2),
        "unclassified_holding_count": unclassified_holding_count,
    }
    for family, counts in family_counts.items():
        result[f"{family}_status"] = _family_status(
            counts["holding_count"], counts["valued_holding_count"], counts["excluded_holding_count"]
        )
        result[f"{family}_holding_count"] = counts["holding_count"]
        result[f"{family}_valued_holding_count"] = counts["valued_holding_count"]
        result[f"{family}_excluded_holding_count"] = counts["excluded_holding_count"]
        result[f"{family}_invalid_value_count"] = counts["invalid_value_count"]
    return result
