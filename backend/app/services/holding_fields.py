import math


CHARACTERISTIC_FIELDS: dict[str, list[str]] = {
    "equity_mutual_fund": ["expense_ratio", "lock_in_period", "investment_mode", "invested_amount", "sip_frequency", "current_value", "start_date", "risk_bucket"],
    "debt_mutual_fund": ["expense_ratio", "lock_in_period", "investment_mode", "invested_amount", "sip_frequency", "current_value", "start_date", "risk_bucket"],
    "stocks": ["sector", "invested_amount", "current_value", "purchase_date", "risk_bucket"],
    "fd_rd": ["deposit_mode", "principal_or_monthly_amount", "interest_rate", "tenure", "maturity_date"],
    "ppf_epf": ["retirement_fund_type", "current_balance", "annual_contribution", "interest_rate"],
    "home_loan": ["principal", "interest_rate", "tenure_months", "emi_amount", "emi_frequency", "emi_due_day", "start_date", "outstanding_balance"],
    "personal_loan": ["principal", "interest_rate", "tenure_months", "emi_amount", "emi_frequency", "emi_due_day", "start_date", "outstanding_balance"],
    "credit_card_debt": ["credit_limit", "outstanding_balance", "interest_rate", "minimum_due", "payment_due_date", "billing_cycle_date"],
    "term_insurance": ["sum_assured", "premium", "premium_frequency", "policy_term", "start_date"],
    "endowment_ulip": ["sum_assured", "premium", "premium_frequency", "policy_term", "current_fund_value", "maturity_value_estimate", "start_date"],
    "esop": ["grant_type", "grant_date", "total_units_granted", "vesting_cliff_months", "vesting_period_months", "strike_price", "current_fmv", "exercise_window_months"],
}


def validate_reconciliation_fields(product_type: str, characteristics: dict) -> None:
    allowed = CHARACTERISTIC_FIELDS.get(product_type)
    if allowed is None:
        raise ValueError("Unsupported holding type")
    if not isinstance(characteristics, dict) or not characteristics:
        raise ValueError("At least one approved holding field is required")
    unknown = set(characteristics) - set(allowed)
    if unknown:
        raise ValueError(f"Unsupported holding field: {sorted(unknown)[0]}")
    for field, value in characteristics.items():
        if isinstance(value, bool) or value is None or isinstance(value, (dict, list)):
            raise ValueError(f"Invalid value for holding field: {field}")
        if isinstance(value, float) and not math.isfinite(value):
            raise ValueError(f"Invalid value for holding field: {field}")
        if not isinstance(value, (str, int, float)) or (isinstance(value, str) and not value.strip()):
            raise ValueError(f"Invalid value for holding field: {field}")
