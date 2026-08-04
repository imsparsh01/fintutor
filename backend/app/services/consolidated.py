import uuid

from sqlalchemy.orm import Session

from app.models import Holding

# D-013/D-055 product_type slugs, by family — matches app/lib/taxonomy.ts and budget.py's
# existing type sets.
_INVESTMENT_VALUE_TYPES = {"equity_mutual_fund", "debt_mutual_fund", "stocks"}
_LOAN_TYPES = {"home_loan", "personal_loan", "credit_card_debt"}


def compute_consolidated(db: Session, user_id: uuid.UUID) -> dict:
    """Live per-family totals per D-065 — no single net-worth figure, no field invented
    beyond what D-013 already stores per type.

    investments_total: current_value (Equity/Debt MF, Stocks) + principal_or_monthly_amount
      (FD/RD, read as-is, no accrual computed — D-065) + current_balance (PPF/EPF).
    loans_total: outstanding_balance (Home/Personal Loan, Credit Card Debt).
    insurance_total: current_fund_value (Endowment/ULIP only — Term Insurance has no fund
      value and contributes nothing).
    ESOP holdings are deliberately excluded — D-055 left the characteristics schema
    undesigned, so there is no decided value field to sum.
    """
    investments_total = 0.0
    loans_total = 0.0
    insurance_total = 0.0

    for holding in db.query(Holding).filter(Holding.user_id == user_id).all():
        c = holding.characteristics or {}
        product_type = holding.product_type
        if product_type in _INVESTMENT_VALUE_TYPES:
            investments_total += float(c.get("current_value") or 0)
        elif product_type == "fd_rd":
            investments_total += float(c.get("principal_or_monthly_amount") or 0)
        elif product_type == "ppf_epf":
            investments_total += float(c.get("current_balance") or 0)
        elif product_type in _LOAN_TYPES:
            loans_total += float(c.get("outstanding_balance") or 0)
        elif product_type == "endowment_ulip":
            insurance_total += float(c.get("current_fund_value") or 0)
        # term_insurance: no fund value, contributes 0.
        # esop: characteristics schema undesigned (D-055) — excluded, not guessed.

    return {
        "investments_total": round(investments_total, 2),
        "loans_total": round(loans_total, 2),
        "insurance_total": round(insurance_total, 2),
    }
