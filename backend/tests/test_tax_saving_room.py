import unittest
import uuid
from unittest.mock import MagicMock

from app.models import Holding
from app.services.budget import _SIX_MONTH_FREQUENCIES
from app.services.tax_saving_room import (
    _ANNUAL_80C_CAP,
    _NOT_RELEVANT_NOTE,
    _ROOM_NOTE,
    compute_tax_saving_room,
)

# Every cadence the service recognises, and the number of payments a year it annualises to
# (D-112: six-month variants count twice a year; nothing else may be guessed).
_ANNUAL_MULTIPLIERS: dict[str, float] = {
    "monthly": 12.0,
    "month": 12.0,
    "annual": 1.0,
    "annually": 1.0,
    "yearly": 1.0,
    "year": 1.0,
    "quarterly": 4.0,
    "quarter": 4.0,
    "weekly": 52.0,
    "week": 52.0,
    **{freq: 2.0 for freq in _SIX_MONTH_FREQUENCIES},
}

_UNRECOGNISED_FREQUENCIES = ("", "   ", "fortnightly", "bi-weekly", "daily", "one-off", "on renewal")


def _db(holdings=()) -> MagicMock:
    """A MagicMock Session answering query(Holding).filter(...).all()."""
    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = list(holdings)
    return db


def _holding(product_type: str, characteristics: dict | None) -> Holding:
    return Holding(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        product_type=product_type,
        alias=f"{product_type}-1",
        characteristics=characteristics,
    )


def _room(*holdings: Holding) -> dict:
    return compute_tax_saving_room(_db(holdings), uuid.uuid4(), "old")


class TaxRegimeBranchTests(unittest.TestCase):
    """BRIEF-016/D-070: the regime guard, and the new-regime short circuit."""

    def test_unrecognised_regime_raises_before_any_work(self) -> None:
        for regime in ("", "OLD", "New", "hybrid", "both", None, "Old "):
            with self.subTest(tax_regime=regime):
                db = _db()
                with self.assertRaisesRegex(ValueError, "tax_regime must be 'old' or 'new'"):
                    compute_tax_saving_room(db, uuid.uuid4(), regime)
                db.query.assert_not_called()

    def test_new_regime_answers_not_relevant_and_never_reads_holdings(self) -> None:
        db = _db([_holding("ppf_epf", {"annual_contribution": 150000})])
        result = compute_tax_saving_room(db, uuid.uuid4(), "new")

        self.assertEqual(result, {
            "applicable": False,
            "note": _NOT_RELEVANT_NOTE,
            "unused_room": None,
        })
        # D-070: new regime stops before any number is shown at all.
        db.query.assert_not_called()

    def test_old_regime_with_no_holdings_leaves_the_whole_cap_unused(self) -> None:
        self.assertEqual(_room(), {
            "applicable": True,
            "note": _ROOM_NOTE,
            "known_contributions": 0.0,
            "unused_room": 150000.0,
            "cap": 150000.0,
        })

    def test_cap_is_the_statutory_one_and_a_half_lakh_figure(self) -> None:
        self.assertEqual(_ANNUAL_80C_CAP, 150000.0)
        self.assertEqual(_room()["cap"], 150000.0)


class KnownContributionTests(unittest.TestCase):
    """D-070's formula: ppf_epf annual_contribution + annualised insurance premiums."""

    def test_ppf_epf_annual_contribution_counts_at_face_value(self) -> None:
        result = _room(_holding("ppf_epf", {"annual_contribution": 75000}))
        self.assertEqual(result["known_contributions"], 75000.0)
        self.assertEqual(result["unused_room"], 75000.0)

    def test_ppf_epf_without_a_recorded_contribution_counts_nothing(self) -> None:
        for characteristics in ({}, {"annual_contribution": None}, {"annual_contribution": 0}, None):
            with self.subTest(characteristics=characteristics):
                result = _room(_holding("ppf_epf", characteristics))
                self.assertEqual(result["known_contributions"], 0.0)
                self.assertEqual(result["unused_room"], 150000.0)

    def test_every_recognised_premium_cadence_annualises_per_d112(self) -> None:
        for product_type in ("term_insurance", "endowment_ulip"):
            for freq, multiplier in _ANNUAL_MULTIPLIERS.items():
                with self.subTest(product_type=product_type, frequency=freq):
                    result = _room(_holding(
                        product_type, {"premium": 1200, "premium_frequency": freq}
                    ))
                    self.assertAlmostEqual(
                        result["known_contributions"], 1200 * multiplier, places=2
                    )

    def test_six_month_premium_variants_all_count_twice_a_year(self) -> None:
        for freq in _SIX_MONTH_FREQUENCIES:
            with self.subTest(frequency=freq):
                result = _room(_holding(
                    "term_insurance", {"premium": 30000, "premium_frequency": freq}
                ))
                self.assertEqual(result["known_contributions"], 60000.0)
                self.assertEqual(result["unused_room"], 90000.0)

    def test_blank_or_unknown_premium_cadence_is_excluded_not_guessed(self) -> None:
        # D-112: a premium whose cadence is missing or unrecognised is dropped entirely
        # rather than assumed monthly — the safer failure mode for this figure.
        for characteristics in (
            {"premium": 30000},
            {"premium": 30000, "premium_frequency": None},
            *({"premium": 30000, "premium_frequency": f} for f in _UNRECOGNISED_FREQUENCIES),
        ):
            with self.subTest(characteristics=characteristics):
                result = _room(_holding("term_insurance", characteristics))
                self.assertEqual(result["known_contributions"], 0.0)
                self.assertEqual(result["unused_room"], 150000.0)

    def test_premium_cadence_matching_ignores_case_and_whitespace(self) -> None:
        for freq in ("  YEARLY ", "Half-Yearly", "\tMonthly\n"):
            with self.subTest(frequency=freq):
                result = _room(_holding(
                    "term_insurance", {"premium": 1200, "premium_frequency": freq}
                ))
                self.assertGreater(result["known_contributions"], 0.0)

    def test_recognised_cadence_without_a_premium_amount_contributes_zero(self) -> None:
        for characteristics in (
            {"premium_frequency": "monthly"},
            {"premium": None, "premium_frequency": "monthly"},
            {"premium": 0, "premium_frequency": "monthly"},
        ):
            with self.subTest(characteristics=characteristics):
                self.assertEqual(_room(_holding("term_insurance", characteristics))["known_contributions"], 0.0)

    def test_contributions_sum_across_every_counted_holding(self) -> None:
        result = _room(
            _holding("ppf_epf", {"annual_contribution": 60000}),
            _holding("ppf_epf", {"annual_contribution": 12000}),
            _holding("term_insurance", {"premium": 1500, "premium_frequency": "monthly"}),
            _holding("endowment_ulip", {"premium": 5000, "premium_frequency": "half-yearly"}),
            _holding("endowment_ulip", {"premium": 9999, "premium_frequency": "whenever"}),
        )
        # 60000 + 12000 + 18000 + 10000, with the unknown-cadence premium excluded.
        self.assertEqual(result["known_contributions"], 100000.0)
        self.assertEqual(result["unused_room"], 50000.0)

    def test_absent_characteristics_blob_is_safe(self) -> None:
        for product_type in ("ppf_epf", "term_insurance", "endowment_ulip"):
            with self.subTest(product_type=product_type):
                self.assertEqual(_room(_holding(product_type, None))["known_contributions"], 0.0)

    def test_room_floors_at_zero_when_contributions_exceed_the_cap(self) -> None:
        result = _room(_holding("ppf_epf", {"annual_contribution": 240000}))
        self.assertEqual(result["known_contributions"], 240000.0)
        self.assertEqual(result["unused_room"], 0.0)

    def test_contributions_exactly_at_the_cap_leave_no_room(self) -> None:
        result = _room(_holding("ppf_epf", {"annual_contribution": 150000}))
        self.assertEqual(result["unused_room"], 0.0)

    def test_one_rupee_under_the_cap_leaves_one_rupee(self) -> None:
        self.assertEqual(
            _room(_holding("ppf_epf", {"annual_contribution": 149999}))["unused_room"], 1.0
        )

    def test_negative_recorded_contribution_pushes_room_above_the_cap(self) -> None:
        # Current behaviour, pinned deliberately: max() only floors at zero, it does not
        # ceiling at the cap, so a negative recorded figure inflates the room.
        result = _room(_holding("ppf_epf", {"annual_contribution": -50000}))
        self.assertEqual(result["known_contributions"], -50000.0)
        self.assertEqual(result["unused_room"], 200000.0)

    def test_figures_are_rounded_to_two_decimals(self) -> None:
        result = _room(_holding("ppf_epf", {"annual_contribution": 1234.567}))
        self.assertEqual(result["known_contributions"], 1234.57)
        self.assertEqual(result["unused_room"], 148765.43)

    def test_nothing_is_written_back(self) -> None:
        db = _db([_holding("ppf_epf", {"annual_contribution": 75000})])
        compute_tax_saving_room(db, uuid.uuid4(), "old")
        db.add.assert_not_called()
        db.commit.assert_not_called()


class DisclosedEligibilityLimitationTests(unittest.TestCase):
    """docs/KNOWN_LIMITATIONS.md + D-070(4): only the two counted categories exist.

    Anything else 80C-eligible in real life — most notably an ELSS fund, which no field
    distinguishes from a regular equity fund (no `is_80c_eligible` flag, per D-009's
    product-naming ban) — is invisible here, so unused_room knowingly overstates itself.
    These tests pin that as intended, so a future change to it has to be deliberate.
    """

    def test_equity_fund_holdings_never_reduce_the_room(self) -> None:
        result = _room(_holding("equity_mutual_fund", {
            "investment_mode": "SIP",
            "invested_amount": 12500,
            "sip_frequency": "monthly",
            "lock_in_period": "3 years",
        }))
        self.assertEqual(result["known_contributions"], 0.0)
        self.assertEqual(result["unused_room"], 150000.0)

    def test_no_other_product_type_is_counted_either(self) -> None:
        for product_type in ("debt_mutual_fund", "fd_rd", "savings_balance", "esop", "home_loan"):
            with self.subTest(product_type=product_type):
                result = _room(_holding(product_type, {
                    "invested_amount": 50000,
                    "annual_contribution": 50000,
                    "premium": 50000,
                    "premium_frequency": "monthly",
                    "emi_amount": 50000,
                    "emi_frequency": "monthly",
                }))
                self.assertEqual(result["known_contributions"], 0.0)

    def test_room_note_discloses_the_blind_spot_in_user_facing_copy(self) -> None:
        note = _room()["note"]
        self.assertIn("₹1,50,000", note)
        self.assertIn("can't tell those apart", note)
        # D-009: product-generic language only, never a product name.
        for banned in ("ELSS", "PPF", "EPF", "NPS", "ULIP"):
            with self.subTest(banned=banned):
                self.assertNotIn(banned, note)
                self.assertNotIn(banned, _NOT_RELEVANT_NOTE)

    def test_new_regime_note_stays_generic_too(self) -> None:
        self.assertIn("new tax regime", _NOT_RELEVANT_NOTE)
        self.assertIn("isn't relevant for you", _NOT_RELEVANT_NOTE)


if __name__ == "__main__":
    unittest.main()
