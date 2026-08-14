import uuid

from sqlalchemy.orm import Session

from app.models import Holding

# D-145/BQ-093 — the deterministic WHICH stage. Rule order is precedence: the
# first eligible rule is the only candidate returned. The service never decides
# WHEN to mention it; candidates are available only inside /chat, where D-080's
# verified on-topic prompt rule governs the whole answer.
_PAIRING_RULES = (
    {
        "trigger_types": {"home_loan", "personal_loan"},
        "candidate": "term_insurance",
        "reason": "loan_and_term_cover_mechanisms",
        "mechanism_difference": (
            "Loan repayment and term life cover are separate mechanisms: one repays borrowing, "
            "while the other transfers a defined death-risk during a selected cover period."
        ),
    },
    {
        "trigger_types": {"endowment_ulip"},
        "candidate": "term_insurance",
        "reason": "bundled_and_pure_cover_mechanisms",
        "mechanism_difference": (
            "Endowment or ULIP contracts combine cover with a savings or investment component; "
            "term insurance provides cover without that bundled component."
        ),
    },
    {
        "trigger_types": {"term_insurance"},
        "candidate": "endowment_ulip",
        "reason": "pure_and_bundled_cover_mechanisms",
        "mechanism_difference": (
            "Term insurance provides cover without a savings component; endowment or ULIP "
            "contracts combine cover with a savings or investment component."
        ),
    },
    {
        "trigger_types": {"esop"},
        "candidate": "stocks",
        "reason": "employee_option_and_share_mechanisms",
        "mechanism_difference": (
            "An ESOP grant is a contractual route to employer shares under vesting and exercise "
            "terms; a stock holding is direct ownership of shares already acquired."
        ),
    },
    {
        "trigger_types": {"stocks"},
        "candidate": "equity_mutual_fund",
        "reason": "direct_and_pooled_equity_mechanisms",
        "mechanism_difference": (
            "A stock holding is ownership in an individual company; an equity mutual fund pools "
            "money across a managed portfolio of equity holdings."
        ),
    },
    {
        "trigger_types": {"equity_mutual_fund"},
        "candidate": "debt_mutual_fund",
        "reason": "equity_and_debt_fund_mechanisms",
        "mechanism_difference": (
            "Equity mutual funds primarily hold company ownership interests; debt mutual funds "
            "primarily hold interest-bearing debt instruments."
        ),
    },
    {
        "trigger_types": {"debt_mutual_fund"},
        "candidate": "fd_rd",
        "reason": "debt_fund_and_deposit_mechanisms",
        "mechanism_difference": (
            "A debt mutual fund owns a changing portfolio of market-priced debt instruments; "
            "an FD or RD is a deposit governed by an agreed rate and term."
        ),
    },
    {
        "trigger_types": {"fd_rd"},
        "candidate": "ppf_epf",
        "reason": "deposit_and_provident_fund_mechanisms",
        "mechanism_difference": (
            "An FD or RD follows its deposit contract; PPF or EPF follows a provident-fund "
            "framework with its own contribution, access, and interest rules."
        ),
    },
    {
        "trigger_types": {"ppf_epf"},
        "candidate": "fd_rd",
        "reason": "provident_fund_and_deposit_mechanisms",
        "mechanism_difference": (
            "PPF or EPF follows a provident-fund framework with its own contribution, access, "
            "and interest rules; an FD or RD follows an agreed deposit rate and term."
        ),
    },
)


def compute_surfacing_candidates(db: Session, user_id: uuid.UUID) -> list[dict]:
    """Return zero or one absent-type, mechanism-only educational candidate.

    This function is read-only and deliberately has no natural-language call to
    action, suitability claim, or capture behavior.
    """
    product_types = {
        h.product_type for h in db.query(Holding).filter(Holding.user_id == user_id).all()
    }

    for rule in _PAIRING_RULES:
        if product_types & rule["trigger_types"] and rule["candidate"] not in product_types:
            return [
                {
                    "product_type": rule["candidate"],
                    "reason": rule["reason"],
                    "mechanism_difference": rule["mechanism_difference"],
                }
            ]
    return []
