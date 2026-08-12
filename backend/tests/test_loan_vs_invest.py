import unittest
import uuid
from unittest.mock import MagicMock

from app.models import Holding
from app.services.loan_vs_invest import (
    _HURDLE_RATE_NOTE,
    _PREPAYMENT_CHARGE_NOTE,
    _implied_remaining_months,
    compute_loan_vs_invest,
)


def _loan(product_type: str = "home_loan", **characteristics) -> Holding:
    base = {"outstanding_balance": 5_000_000, "interest_rate": 8.5, "emi_amount": 45_000}
    base.update(characteristics)
    return Holding(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        product_type=product_type,
        alias="Loan-1",
        characteristics=base,
    )


def _db_returning(holding: Holding | None) -> MagicMock:
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = holding
    return db


class ImpliedRemainingMonthsTests(unittest.TestCase):
    """BRIEF-014: remaining tenure derived from balance/EMI/rate via the amortization identity."""

    def test_recovers_the_tenure_an_emi_was_built_from(self) -> None:
        # A 20,00,000 loan at 9% over exactly 120 months has an EMI of 25,335.16.
        monthly_rate = 9 / 12 / 100
        self.assertAlmostEqual(
            _implied_remaining_months(2_000_000, 25_335.16, monthly_rate), 120, places=3
        )

    def test_emi_that_only_just_covers_interest_is_rejected(self) -> None:
        monthly_rate = 12 / 12 / 100  # 1% a month
        with self.assertRaisesRegex(ValueError, "doesn't cover its own interest"):
            _implied_remaining_months(1_000_000, 10_000, monthly_rate)

    def test_emi_below_the_monthly_interest_is_rejected(self) -> None:
        monthly_rate = 12 / 12 / 100
        with self.assertRaisesRegex(ValueError, "isn't a valid amortizing loan"):
            _implied_remaining_months(1_000_000, 5_000, monthly_rate)


class LoanVsInvestArithmeticTests(unittest.TestCase):
    """BRIEF-014/D-068: hurdle rate plus both prepayment modes on a golden loan."""

    def setUp(self) -> None:
        self.holding = _loan()
        self.db = _db_returning(self.holding)
        self.result = compute_loan_vs_invest(
            self.db, self.holding.user_id, self.holding.id, 500_000
        )

    def test_echoes_holding_and_prepay_amount(self) -> None:
        self.assertEqual(self.result["holding_id"], str(self.holding.id))
        self.assertEqual(self.result["prepay_amount"], 500_000.0)

    def test_hurdle_rate_is_the_loans_own_rate_untouched(self) -> None:
        self.assertEqual(self.result["hurdle_rate_percent"], 8.5)

    def test_tenure_reduction_figures(self) -> None:
        self.assertEqual(self.result["tenure_reduction"]["new_remaining_months"], 174.6)
        self.assertEqual(self.result["tenure_reduction"]["interest_saved"], 1_505_025.4)

    def test_emi_reduction_figures(self) -> None:
        self.assertEqual(self.result["emi_reduction"]["new_emi_amount"], 40_500.0)
        self.assertEqual(self.result["emi_reduction"]["interest_saved"], 486_045.23)

    def test_both_modes_are_always_returned_never_a_picked_default(self) -> None:
        # BRIEF-014 Fork 1: the caller chooses, the service never chooses for them.
        self.assertIn("tenure_reduction", self.result)
        self.assertIn("emi_reduction", self.result)

    def test_tenure_reduction_saves_more_than_emi_reduction(self) -> None:
        self.assertGreater(
            self.result["tenure_reduction"]["interest_saved"],
            self.result["emi_reduction"]["interest_saved"],
        )

    def test_no_projected_investment_outcome_is_returned(self) -> None:
        # System prompt §3 rule 4 — never predict markets. Only a hurdle rate is offered.
        forbidden = {"projected_return", "investment_value", "expected_return", "recommendation"}
        self.assertEqual(forbidden & set(self.result), set())


class LoanVsInvestScalingTests(unittest.TestCase):
    """Structural invariants of the two prepayment modes, independent of one golden case."""

    def test_new_emi_scales_with_the_remaining_principal(self) -> None:
        holding = _loan()
        result = compute_loan_vs_invest(
            _db_returning(holding), holding.user_id, holding.id, 1_000_000
        )
        # Tenure is held fixed, so the EMI falls in proportion to the principal.
        self.assertEqual(result["emi_reduction"]["new_emi_amount"], 36_000.0)

    def test_emi_mode_saving_is_proportional_to_the_prepaid_share(self) -> None:
        holding = _loan()
        half = compute_loan_vs_invest(
            _db_returning(holding), holding.user_id, holding.id, 250_000
        )
        full = compute_loan_vs_invest(
            _db_returning(holding), holding.user_id, holding.id, 500_000
        )
        self.assertAlmostEqual(
            full["emi_reduction"]["interest_saved"],
            2 * half["emi_reduction"]["interest_saved"],
            delta=0.02,  # both sides are already rounded to paise before comparison
        )

    def test_a_larger_prepayment_shortens_the_remaining_tenure_further(self) -> None:
        holding = _loan()
        small = compute_loan_vs_invest(
            _db_returning(holding), holding.user_id, holding.id, 100_000
        )
        large = compute_loan_vs_invest(
            _db_returning(holding), holding.user_id, holding.id, 1_000_000
        )
        self.assertLess(
            large["tenure_reduction"]["new_remaining_months"],
            small["tenure_reduction"]["new_remaining_months"],
        )
        self.assertGreater(
            large["tenure_reduction"]["interest_saved"],
            small["tenure_reduction"]["interest_saved"],
        )


class LoanVsInvestEligibilityTests(unittest.TestCase):
    """Which holdings the comparison applies to, and the not-found path."""

    def test_missing_holding_raises_lookup_error(self) -> None:
        db = _db_returning(None)
        with self.assertRaisesRegex(LookupError, "Holding not found"):
            compute_loan_vs_invest(db, uuid.uuid4(), uuid.uuid4(), 100_000)

    def test_personal_loan_is_in_scope(self) -> None:
        holding = _loan(product_type="personal_loan")
        result = compute_loan_vs_invest(
            _db_returning(holding), holding.user_id, holding.id, 100_000
        )
        self.assertEqual(result["hurdle_rate_percent"], 8.5)

    def test_credit_card_debt_is_out_of_scope(self) -> None:
        holding = _loan(product_type="credit_card_debt")
        with self.assertRaisesRegex(ValueError, "credit_card_debt"):
            compute_loan_vs_invest(
                _db_returning(holding), holding.user_id, holding.id, 10_000
            )

    def test_non_loan_product_is_out_of_scope(self) -> None:
        holding = _loan(product_type="mutual_fund")
        with self.assertRaisesRegex(ValueError, "only applies to"):
            compute_loan_vs_invest(
                _db_returning(holding), holding.user_id, holding.id, 10_000
            )


class LoanVsInvestGuardTests(unittest.TestCase):
    """Zero, negative, missing and out-of-range inputs are rejected before any math runs."""

    def _expect_missing_fields(self, **characteristics) -> None:
        holding = _loan(**characteristics)
        with self.assertRaisesRegex(ValueError, "missing outstanding_balance"):
            compute_loan_vs_invest(
                _db_returning(holding), holding.user_id, holding.id, 1_000
            )

    def test_null_characteristics_are_treated_as_empty(self) -> None:
        holding = _loan()
        holding.characteristics = None
        with self.assertRaisesRegex(ValueError, "missing outstanding_balance"):
            compute_loan_vs_invest(
                _db_returning(holding), holding.user_id, holding.id, 1_000
            )

    def test_zero_and_negative_balance_are_rejected(self) -> None:
        self._expect_missing_fields(outstanding_balance=0)
        self._expect_missing_fields(outstanding_balance=-1)

    def test_zero_and_negative_rate_are_rejected(self) -> None:
        self._expect_missing_fields(interest_rate=0)
        self._expect_missing_fields(interest_rate=-8.5)

    def test_zero_and_negative_emi_are_rejected(self) -> None:
        self._expect_missing_fields(emi_amount=0)
        self._expect_missing_fields(emi_amount=-45_000)

    def test_absent_fields_are_rejected(self) -> None:
        holding = _loan()
        holding.characteristics = {"interest_rate": 8.5}
        with self.assertRaisesRegex(ValueError, "missing outstanding_balance"):
            compute_loan_vs_invest(
                _db_returning(holding), holding.user_id, holding.id, 1_000
            )

    def test_zero_and_negative_prepay_amount_are_rejected(self) -> None:
        for amount in (0, -1, -500_000):
            with self.subTest(amount=amount):
                holding = _loan()
                with self.assertRaisesRegex(ValueError, "prepay_amount must be"):
                    compute_loan_vs_invest(
                        _db_returning(holding), holding.user_id, holding.id, amount
                    )

    def test_prepaying_the_whole_balance_or_more_is_rejected(self) -> None:
        for amount in (5_000_000, 5_000_001):
            with self.subTest(amount=amount):
                holding = _loan()
                with self.assertRaisesRegex(ValueError, "less than outstanding_balance"):
                    compute_loan_vs_invest(
                        _db_returning(holding), holding.user_id, holding.id, amount
                    )

    def test_emi_that_cannot_cover_the_interest_is_surfaced(self) -> None:
        holding = _loan(outstanding_balance=1_000_000, interest_rate=12, emi_amount=9_000)
        with self.assertRaisesRegex(ValueError, "isn't a valid amortizing loan"):
            compute_loan_vs_invest(
                _db_returning(holding), holding.user_id, holding.id, 100_000
            )

    def test_a_barely_amortizing_loan_still_computes(self) -> None:
        # Just above the interest-only threshold: the guard is strict, not defensive.
        holding = _loan(outstanding_balance=1_000_000, interest_rate=12, emi_amount=10_001)
        result = compute_loan_vs_invest(
            _db_returning(holding), holding.user_id, holding.id, 100_000
        )
        self.assertGreater(result["tenure_reduction"]["new_remaining_months"], 0)


class LoanVsInvestDisclosureTests(unittest.TestCase):
    """The two notes the feature ships instead of extra modeling (BRIEF-014 Forks 1 and 2)."""

    def setUp(self) -> None:
        holding = _loan()
        self.result = compute_loan_vs_invest(
            _db_returning(holding), holding.user_id, holding.id, 500_000
        )

    def test_hurdle_rate_note_flags_the_tax_asymmetry(self) -> None:
        self.assertEqual(self.result["hurdle_rate_note"], _HURDLE_RATE_NOTE)
        self.assertIn("taxed", self.result["hurdle_rate_note"])

    def test_prepayment_charge_note_is_always_returned(self) -> None:
        self.assertEqual(self.result["prepayment_charge_note"], _PREPAYMENT_CHARGE_NOTE)
        self.assertIn("prepayment or foreclosure charges", self.result["prepayment_charge_note"])

    def test_prepayment_charge_is_disclosed_not_modeled(self) -> None:
        # KNOWN_LIMITATIONS: no prepayment/foreclosure charge is modeled, deliberately.
        # A charge stored on the holding is ignored by every figure returned. If this
        # test starts failing, the disclosed limitation was resolved — update the doc.
        plain = _loan()
        charged = _loan(prepayment_charge_percent=2)
        without = compute_loan_vs_invest(
            _db_returning(plain), plain.user_id, plain.id, 500_000
        )
        with_charge = compute_loan_vs_invest(
            _db_returning(charged), charged.user_id, charged.id, 500_000
        )
        self.assertEqual(
            without["tenure_reduction"]["interest_saved"],
            with_charge["tenure_reduction"]["interest_saved"],
        )
        self.assertEqual(
            without["emi_reduction"]["interest_saved"],
            with_charge["emi_reduction"]["interest_saved"],
        )
        self.assertNotIn("prepayment_charge_percent", with_charge)


if __name__ == "__main__":
    unittest.main()
