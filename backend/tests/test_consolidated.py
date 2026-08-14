import unittest
import uuid
from unittest.mock import MagicMock

from app.models import Holding
from app.services.consolidated import compute_consolidated

USER_ID = uuid.uuid4()


def _holding(product_type: str, characteristics: dict | None = None) -> Holding:
    return Holding(
        id=uuid.uuid4(),
        user_id=USER_ID,
        product_type=product_type,
        alias=f"{product_type}-1",
        characteristics=characteristics,
    )


def _db(holdings: list[Holding]) -> MagicMock:
    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = holdings
    return db


class ConsolidatedTotalsTests(unittest.TestCase):
    """D-065: per-family totals sum only the one decided value field per product type."""

    def test_empty_portfolio_returns_zero_totals(self) -> None:
        result = compute_consolidated(_db([]), USER_ID)

        self.assertEqual(result["investments_total"], 0.0)
        self.assertEqual(result["loans_total"], 0.0)
        self.assertEqual(result["insurance_total"], 0.0)

    def test_investment_value_types_sum_current_value(self) -> None:
        result = compute_consolidated(_db([
            _holding("equity_mutual_fund", {"current_value": 100000}),
            _holding("debt_mutual_fund", {"current_value": 50000}),
            _holding("stocks", {"current_value": 25000}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 175000.0)
        self.assertEqual(result["investments_valued_holding_count"], 3)

    def test_fd_rd_sums_principal_as_is_without_accrual(self) -> None:
        result = compute_consolidated(_db([
            _holding("fd_rd", {"principal_or_monthly_amount": 200000, "interest_rate": 7.1}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 200000.0)

    def test_ppf_epf_sums_current_balance(self) -> None:
        result = compute_consolidated(_db([
            _holding("ppf_epf", {"current_balance": 340000}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 340000.0)

    def test_investment_family_mixes_all_three_value_fields(self) -> None:
        result = compute_consolidated(_db([
            _holding("stocks", {"current_value": 1000}),
            _holding("fd_rd", {"principal_or_monthly_amount": 2000}),
            _holding("ppf_epf", {"current_balance": 3000}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 6000.0)
        self.assertEqual(result["investments_status"], "valued")

    def test_every_loan_type_sums_outstanding_balance(self) -> None:
        result = compute_consolidated(_db([
            _holding("home_loan", {"outstanding_balance": 4200000}),
            _holding("personal_loan", {"outstanding_balance": 150000}),
            _holding("credit_card_debt", {"outstanding_balance": 32000}),
        ]), USER_ID)

        self.assertEqual(result["loans_total"], 4382000.0)
        self.assertEqual(result["loans_status"], "valued")
        self.assertEqual(result["loans_holding_count"], 3)

    def test_loans_total_stays_positive_and_is_not_netted_against_investments(self) -> None:
        result = compute_consolidated(_db([
            _holding("stocks", {"current_value": 100000}),
            _holding("home_loan", {"outstanding_balance": 4200000}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 100000.0)
        self.assertEqual(result["loans_total"], 4200000.0)
        self.assertNotIn("net_worth", result)

    def test_endowment_ulip_sums_current_fund_value(self) -> None:
        result = compute_consolidated(_db([
            _holding("endowment_ulip", {"current_fund_value": 88000}),
        ]), USER_ID)

        self.assertEqual(result["insurance_total"], 88000.0)
        self.assertEqual(result["insurance_status"], "valued")

    def test_string_numerics_are_coerced_to_float(self) -> None:
        result = compute_consolidated(_db([
            _holding("stocks", {"current_value": "1500.50"}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 1500.5)

    def test_totals_are_rounded_to_two_decimals(self) -> None:
        result = compute_consolidated(_db([
            _holding("stocks", {"current_value": 0.1}),
            _holding("equity_mutual_fund", {"current_value": 0.2}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 0.3)

    def test_negative_values_are_summed_as_stored(self) -> None:
        result = compute_consolidated(_db([
            _holding("stocks", {"current_value": -500}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], -500.0)
        self.assertEqual(result["investments_valued_holding_count"], 1)


class ConsolidatedExclusionTests(unittest.TestCase):
    """D-065/D-066: Term Insurance and ESOP are counted but deliberately never valued."""

    def test_term_insurance_contributes_nothing_and_is_marked_excluded(self) -> None:
        result = compute_consolidated(_db([
            _holding("term_insurance", {"sum_assured": 10000000}),
        ]), USER_ID)

        self.assertEqual(result["insurance_total"], 0.0)
        self.assertEqual(result["insurance_holding_count"], 1)
        self.assertEqual(result["insurance_valued_holding_count"], 0)
        self.assertEqual(result["insurance_excluded_holding_count"], 1)
        self.assertEqual(result["insurance_status"], "excluded")

    def test_esop_contributes_nothing_and_is_marked_excluded(self) -> None:
        result = compute_consolidated(_db([
            _holding("esop", {"vested_units": 500, "strike_price": 40}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 0.0)
        self.assertEqual(result["investments_holding_count"], 1)
        self.assertEqual(result["investments_valued_holding_count"], 0)
        self.assertEqual(result["investments_excluded_holding_count"], 1)
        self.assertEqual(result["investments_status"], "excluded")

    def test_esop_carrying_a_current_value_is_still_not_summed(self) -> None:
        result = compute_consolidated(_db([
            _holding("esop", {"current_value": 999999}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 0.0)
        self.assertEqual(result["investments_valued_holding_count"], 0)

    def test_excluded_holding_alongside_a_valued_one_still_reads_valued(self) -> None:
        result = compute_consolidated(_db([
            _holding("esop", {}),
            _holding("stocks", {"current_value": 1000}),
        ]), USER_ID)

        self.assertEqual(result["investments_status"], "valued")
        self.assertEqual(result["investments_holding_count"], 2)
        self.assertEqual(result["investments_excluded_holding_count"], 1)
        self.assertEqual(result["investments_valued_holding_count"], 1)

    def test_excluded_holding_alongside_an_unvalued_one_reads_unvalued(self) -> None:
        result = compute_consolidated(_db([
            _holding("term_insurance", {}),
            _holding("endowment_ulip", {}),
        ]), USER_ID)

        self.assertEqual(result["insurance_status"], "unvalued")
        self.assertEqual(result["insurance_holding_count"], 2)
        self.assertEqual(result["insurance_excluded_holding_count"], 1)

    def test_unknown_product_type_is_counted_as_unclassified(self) -> None:
        result = compute_consolidated(_db([
            _holding("savings_balance", {"current_value": 75000}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 0.0)
        self.assertEqual(result["unclassified_holding_count"], 1)
        for family in ("investments", "loans", "insurance"):
            self.assertEqual(result[f"{family}_holding_count"], 0)
            self.assertEqual(result[f"{family}_status"], "empty")


class ConsolidatedValuationStatusTests(unittest.TestCase):
    """D-065: status + counts let the client tell a real zero from nothing-valued."""

    def test_empty_family_is_empty_with_zero_counts(self) -> None:
        result = compute_consolidated(_db([]), USER_ID)

        for family in ("investments", "loans", "insurance"):
            self.assertEqual(result[f"{family}_status"], "empty")
            self.assertEqual(result[f"{family}_holding_count"], 0)
            self.assertEqual(result[f"{family}_valued_holding_count"], 0)
            self.assertEqual(result[f"{family}_excluded_holding_count"], 0)
            self.assertEqual(result[f"{family}_invalid_value_count"], 0)
        self.assertEqual(result["unclassified_holding_count"], 0)

    def test_a_real_zero_counts_as_valued_not_as_missing(self) -> None:
        result = compute_consolidated(_db([
            _holding("stocks", {"current_value": 0}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 0.0)
        self.assertEqual(result["investments_status"], "valued")
        self.assertEqual(result["investments_valued_holding_count"], 1)

    def test_missing_value_field_is_unvalued_not_a_zero_holding(self) -> None:
        result = compute_consolidated(_db([
            _holding("stocks", {"ticker_alias": "Stock-A"}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 0.0)
        self.assertEqual(result["investments_status"], "unvalued")
        self.assertEqual(result["investments_holding_count"], 1)
        self.assertEqual(result["investments_valued_holding_count"], 0)

    def test_explicit_null_value_is_unvalued(self) -> None:
        result = compute_consolidated(_db([
            _holding("ppf_epf", {"current_balance": None}),
        ]), USER_ID)

        self.assertEqual(result["investments_status"], "unvalued")
        self.assertEqual(result["investments_valued_holding_count"], 0)

    def test_null_characteristics_is_treated_as_an_empty_dict(self) -> None:
        result = compute_consolidated(_db([
            _holding("home_loan", None),
        ]), USER_ID)

        self.assertEqual(result["loans_total"], 0.0)
        self.assertEqual(result["loans_status"], "unvalued")
        self.assertEqual(result["loans_holding_count"], 1)

    def test_partially_valued_family_is_mixed(self) -> None:
        result = compute_consolidated(_db([
            _holding("stocks", {"current_value": 1000}),
            _holding("equity_mutual_fund", {}),
        ]), USER_ID)

        self.assertEqual(result["investments_status"], "mixed")
        self.assertEqual(result["investments_holding_count"], 2)
        self.assertEqual(result["investments_valued_holding_count"], 1)
        self.assertEqual(result["investments_total"], 1000.0)

    def test_excluded_type_makes_a_partial_family_mixed_against_active_count(self) -> None:
        result = compute_consolidated(_db([
            _holding("esop", {}),
            _holding("stocks", {"current_value": 1000}),
            _holding("fd_rd", {}),
        ]), USER_ID)

        self.assertEqual(result["investments_status"], "mixed")
        self.assertEqual(result["investments_holding_count"], 3)
        self.assertEqual(result["investments_excluded_holding_count"], 1)
        self.assertEqual(result["investments_valued_holding_count"], 1)

    def test_each_family_reports_its_own_independent_status(self) -> None:
        result = compute_consolidated(_db([
            _holding("stocks", {"current_value": 1000}),
            _holding("home_loan", {}),
        ]), USER_ID)

        self.assertEqual(result["investments_status"], "valued")
        self.assertEqual(result["loans_status"], "unvalued")
        self.assertEqual(result["insurance_status"], "empty")

    def test_result_always_carries_the_full_metadata_key_set(self) -> None:
        result = compute_consolidated(_db([]), USER_ID)

        expected = {"investments_total", "loans_total", "insurance_total"}
        for family in ("investments", "loans", "insurance"):
            expected.update({
                f"{family}_status",
                f"{family}_holding_count",
                f"{family}_valued_holding_count",
                f"{family}_excluded_holding_count",
                f"{family}_invalid_value_count",
            })
        expected.add("unclassified_holding_count")
        self.assertEqual(set(result), expected)


class ConsolidatedInvalidValueTests(unittest.TestCase):
    """D-145: malformed/non-finite stored values fail soft and stay visible."""

    def test_malformed_value_is_counted_and_never_coerced_to_zero(self) -> None:
        result = compute_consolidated(_db([
            _holding("stocks", {"current_value": "not-a-number"}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 0.0)
        self.assertEqual(result["investments_holding_count"], 1)
        self.assertEqual(result["investments_valued_holding_count"], 0)
        self.assertEqual(result["investments_invalid_value_count"], 1)
        self.assertEqual(result["investments_status"], "unvalued")

    def test_non_finite_values_fail_soft_in_every_family(self) -> None:
        result = compute_consolidated(_db([
            _holding("stocks", {"current_value": "NaN"}),
            _holding("home_loan", {"outstanding_balance": "Infinity"}),
            _holding("endowment_ulip", {"current_fund_value": float("-inf")}),
        ]), USER_ID)

        for family in ("investments", "loans", "insurance"):
            self.assertEqual(result[f"{family}_total"], 0.0)
            self.assertEqual(result[f"{family}_invalid_value_count"], 1)
            self.assertEqual(result[f"{family}_status"], "unvalued")

    def test_boolean_and_structured_values_are_invalid_not_numeric(self) -> None:
        result = compute_consolidated(_db([
            _holding("stocks", {"current_value": True}),
            _holding("fd_rd", {"principal_or_monthly_amount": {"amount": 50}}),
        ]), USER_ID)

        self.assertEqual(result["investments_invalid_value_count"], 2)
        self.assertEqual(result["investments_valued_holding_count"], 0)

    def test_malformed_characteristics_container_fails_soft(self) -> None:
        holding = _holding("home_loan", {})
        holding.characteristics = ["bad-json-shape"]

        result = compute_consolidated(_db([holding]), USER_ID)

        self.assertEqual(result["loans_invalid_value_count"], 1)
        self.assertEqual(result["loans_status"], "unvalued")

    def test_valid_and_invalid_values_produce_mixed_status_and_valid_total(self) -> None:
        result = compute_consolidated(_db([
            _holding("stocks", {"current_value": 1250}),
            _holding("equity_mutual_fund", {"current_value": "broken"}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 1250.0)
        self.assertEqual(result["investments_invalid_value_count"], 1)
        self.assertEqual(result["investments_status"], "mixed")

    def test_finite_values_that_overflow_the_aggregate_are_excluded(self) -> None:
        result = compute_consolidated(_db([
            _holding("stocks", {"current_value": 1e308}),
            _holding("equity_mutual_fund", {"current_value": 1e308}),
        ]), USER_ID)

        self.assertEqual(result["investments_total"], 1e308)
        self.assertEqual(result["investments_valued_holding_count"], 1)
        self.assertEqual(result["investments_invalid_value_count"], 1)
        self.assertEqual(result["investments_status"], "mixed")


class ConsolidatedQueryScopeTests(unittest.TestCase):
    """Totals are read from the caller's own holdings only."""

    def test_holdings_are_queried_and_filtered_once(self) -> None:
        db = _db([])
        compute_consolidated(db, USER_ID)

        db.query.assert_called_once_with(Holding)
        db.query.return_value.filter.assert_called_once()

    def test_computing_totals_never_writes(self) -> None:
        db = _db([_holding("stocks", {"current_value": 10})])
        compute_consolidated(db, USER_ID)

        db.add.assert_not_called()
        db.commit.assert_not_called()


if __name__ == "__main__":
    unittest.main()
