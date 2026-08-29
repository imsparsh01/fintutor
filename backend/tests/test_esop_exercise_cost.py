import unittest
import uuid
from datetime import date, datetime, timezone
from unittest.mock import MagicMock

from app.models import Holding
from app.services.esop_exercise_cost import (
    _EXERCISED_ASSUMPTION_NOTE,
    _NO_FMV_NOTE,
    _NOTHING_VESTED_NOTE,
    _SPREAD_NOTE,
    _UNDERWATER_NOTE,
    _elapsed_months,
    compute_esop_exercise_cost,
)


def _months_before_today(months: int) -> str:
    """A grant date exactly `months` whole months ago, as an ISO string.

    The day is clamped to 28 so it can never exceed today's day-of-month, which keeps
    `_elapsed_months` from applying its partial-month decrement and makes the elapsed
    count exactly `months` on any calendar day the suite runs.
    """
    today = date(2026, 8, 29)
    absolute = today.year * 12 + (today.month - 1) - months
    year, month = divmod(absolute, 12)
    return date(year, month + 1, min(today.day, 28)).isoformat()


def _grant(product_type: str = "esop", **characteristics) -> Holding:
    base = {
        "grant_type": "options",
        "grant_date": _months_before_today(24),
        "total_units_granted": 4800,
        "vesting_cliff_months": 12,
        "vesting_period_months": 48,
        "strike_price": 10,
    }
    base.update(characteristics)
    return Holding(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        product_type=product_type,
        alias="ESOP-1",
        characteristics=base,
        version=1,
    )


def _db_returning(holding: Holding | None) -> MagicMock:
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = holding
    return db


def _compute(holding: Holding) -> dict:
    return compute_esop_exercise_cost(
        _db_returning(holding),
        holding.user_id,
        holding.id,
        now=datetime(2026, 8, 29, 12, tzinfo=timezone.utc),
    )


class ElapsedMonthsTests(unittest.TestCase):
    """The whole-months-since-grant helper, including its partial-month rule."""

    def test_counts_whole_months_across_a_year_boundary(self) -> None:
        self.assertEqual(_elapsed_months(date(2024, 11, 10), date(2026, 2, 10)), 15)

    def test_a_day_short_of_the_anniversary_does_not_count(self) -> None:
        self.assertEqual(_elapsed_months(date(2025, 1, 15), date(2026, 1, 14)), 11)
        self.assertEqual(_elapsed_months(date(2025, 1, 15), date(2026, 1, 15)), 12)

    def test_same_day_is_zero(self) -> None:
        self.assertEqual(_elapsed_months(date(2026, 3, 9), date(2026, 3, 9)), 0)

    def test_a_future_grant_date_is_visible_to_the_caller(self) -> None:
        self.assertLess(_elapsed_months(date(2027, 1, 1), date(2026, 1, 1)), 0)

    def test_a_month_end_grant_clamps_to_a_shorter_month_end(self) -> None:
        self.assertEqual(_elapsed_months(date(2026, 1, 31), date(2026, 2, 28)), 1)
        self.assertEqual(_elapsed_months(date(2024, 1, 31), date(2024, 2, 29)), 1)
        self.assertEqual(_elapsed_months(date(2026, 1, 31), date(2026, 3, 30)), 1)
        self.assertEqual(_elapsed_months(date(2026, 1, 31), date(2026, 3, 31)), 2)


class EsopVestingTests(unittest.TestCase):
    """Cliff-gated linear vesting: below cliff, mid-schedule, and fully vested."""

    def test_below_the_cliff_nothing_is_vested(self) -> None:
        result = _compute(_grant(grant_date=_months_before_today(11)))
        self.assertEqual(result["vested_units"], 0.0)
        self.assertEqual(result["exercise_cost"], 0.0)

    def test_the_cliff_month_itself_vests(self) -> None:
        # 12 months elapsed against a 12-month cliff is on the vested side of the boundary.
        result = _compute(_grant(grant_date=_months_before_today(12)))
        self.assertEqual(result["vested_units"], 1200.0)

    def test_mid_schedule_vests_linearly(self) -> None:
        result = _compute(_grant(grant_date=_months_before_today(24)))
        self.assertEqual(result["vested_units"], 2400.0)
        self.assertEqual(result["exercise_cost"], 24_000.0)

    def test_partial_units_are_floored_not_rounded(self) -> None:
        # 1000 * 13 / 48 = 270.83 -> 270 whole options.
        result = _compute(
            _grant(total_units_granted=1000, grant_date=_months_before_today(13))
        )
        self.assertEqual(result["vested_units"], 270.0)

    def test_full_vesting_at_the_end_of_the_period(self) -> None:
        result = _compute(_grant(grant_date=_months_before_today(48)))
        self.assertEqual(result["vested_units"], 4800.0)
        self.assertEqual(result["total_units_granted"], 4800.0)

    def test_past_the_vesting_period_does_not_over_vest(self) -> None:
        result = _compute(_grant(grant_date=_months_before_today(96)))
        self.assertEqual(result["vested_units"], 4800.0)

    def test_a_grant_with_no_cliff_vests_from_month_one(self) -> None:
        result = _compute(
            _grant(vesting_cliff_months=0, grant_date=_months_before_today(1))
        )
        self.assertEqual(result["vested_units"], 100.0)

    def test_a_null_cliff_is_treated_as_no_cliff(self) -> None:
        result = _compute(
            _grant(vesting_cliff_months=None, grant_date=_months_before_today(6))
        )
        self.assertEqual(result["vested_units"], 600.0)

    def test_a_future_grant_date_is_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "grant_date cannot be in the future"):
            _compute(_grant(grant_date=_months_before_today(-6)))


class EsopExerciseCostTests(unittest.TestCase):
    """Exercise cost is vested units times strike, rounded to paise."""

    def test_cost_is_units_times_strike(self) -> None:
        result = _compute(_grant(strike_price=125.5))
        self.assertEqual(result["exercise_cost"], 301_200.0)

    def test_cost_is_rounded_to_two_places(self) -> None:
        result = _compute(_grant(total_units_granted=100, strike_price=33.333))
        # 100 * 24 / 48 = 50 units; 50 * 33.333 = 1666.65
        self.assertEqual(result["exercise_cost"], 1_666.65)

    def test_a_zero_strike_grant_costs_nothing_to_exercise(self) -> None:
        result = _compute(_grant(strike_price=0))
        self.assertEqual(result["exercise_cost"], 0.0)
        self.assertEqual(result["vested_units"], 2400.0)

    def test_echoes_the_holding_id(self) -> None:
        holding = _grant()
        self.assertEqual(_compute(holding)["holding_id"], str(holding.id))


class EsopSpreadTests(unittest.TestCase):
    """Spread and its note: gain, underwater, no valuation, nothing vested."""

    def test_a_gain_carries_the_perquisite_tax_note(self) -> None:
        result = _compute(_grant(current_fmv=60))
        self.assertEqual(result["spread"], 120_000.0)
        self.assertEqual(result["spread_note"], _SPREAD_NOTE)

    def test_an_fmv_below_strike_is_reported_as_underwater(self) -> None:
        result = _compute(_grant(strike_price=100, current_fmv=60))
        self.assertEqual(result["spread"], -96_000.0)
        self.assertEqual(result["spread_note"], _UNDERWATER_NOTE)

    def test_an_fmv_equal_to_strike_reports_zero_paper_gain(self) -> None:
        result = _compute(_grant(strike_price=10, current_fmv=10))
        self.assertEqual(result["spread"], 0.0)
        self.assertIn("equals the strike price", result["spread_note"])

    def test_a_zero_unit_grant_is_not_described_as_unvested(self) -> None:
        result = _compute(_grant(total_units_granted=0, current_fmv=60))
        self.assertEqual(result["spread"], 0.0)
        self.assertIn("records no units", result["spread_note"])

    def test_no_recorded_valuation_leaves_the_spread_unknown(self) -> None:
        result = _compute(_grant())
        self.assertIsNone(result["spread"])
        self.assertEqual(result["spread_note"], _NO_FMV_NOTE)

    def test_a_zero_valuation_is_a_valuation_not_a_missing_one(self) -> None:
        result = _compute(_grant(current_fmv=0))
        self.assertEqual(result["spread"], -24_000.0)
        self.assertEqual(result["spread_note"], _UNDERWATER_NOTE)

    def test_nothing_vested_outranks_both_other_messages(self) -> None:
        result = _compute(
            _grant(grant_date=_months_before_today(3), current_fmv=60)
        )
        self.assertEqual(result["spread"], 0.0)
        self.assertEqual(result["spread_note"], _NOTHING_VESTED_NOTE)

    def test_nothing_vested_outranks_a_missing_valuation(self) -> None:
        result = _compute(_grant(grant_date=_months_before_today(3)))
        self.assertEqual(result["spread"], 0.0)
        self.assertEqual(result["spread_note"], _NOTHING_VESTED_NOTE)

    def test_spread_is_rounded_to_two_places(self) -> None:
        result = _compute(
            _grant(total_units_granted=100, strike_price=10, current_fmv=13.333)
        )
        # 50 vested * (13.333 - 10) = 166.65
        self.assertEqual(result["spread"], 166.65)

    def test_no_future_valuation_is_projected(self) -> None:
        # D-068/D-069: today's cost only, never a prediction of what the shares become.
        forbidden = {"projected_value", "expected_fmv", "future_value", "recommendation"}
        self.assertEqual(forbidden & set(_compute(_grant(current_fmv=60))), set())


class EsopExerciseWindowNoteTests(unittest.TestCase):
    """The optional post-exit exercise-window note."""

    def test_window_months_produce_a_formatted_note(self) -> None:
        result = _compute(_grant(exercise_window_months=90))
        self.assertIn("records a post-termination exercise window of 90 months", result["exercise_window_note"])
        self.assertIn("not a countdown", result["exercise_window_note"])

    def test_a_fractional_window_is_rejected_not_truncated(self) -> None:
        with self.assertRaisesRegex(ValueError, "whole number"):
            _compute(_grant(exercise_window_months=12.9))

    def test_no_window_recorded_means_no_note(self) -> None:
        self.assertIsNone(_compute(_grant())["exercise_window_note"])

    def test_a_recorded_zero_window_is_not_treated_as_missing(self) -> None:
        note = _compute(_grant(exercise_window_months=0))["exercise_window_note"]
        self.assertIn("records a post-termination exercise window of 0 months", note)
        self.assertIn("not a countdown", note)


class EsopEligibilityAndGuardTests(unittest.TestCase):
    """Not-found, wrong product type, RSUs, missing fields, malformed fields."""

    def test_missing_holding_raises_lookup_error(self) -> None:
        with self.assertRaisesRegex(LookupError, "Holding not found"):
            compute_esop_exercise_cost(_db_returning(None), uuid.uuid4(), uuid.uuid4())

    def test_non_esop_holding_is_rejected(self) -> None:
        holding = _grant(product_type="mutual_fund")
        with self.assertRaisesRegex(ValueError, "not 'mutual_fund'"):
            _compute(holding)

    def test_rsus_are_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "not RSUs"):
            _compute(_grant(grant_type="rsu"))

    def test_a_missing_grant_type_is_rejected(self) -> None:
        holding = _grant()
        del holding.characteristics["grant_type"]
        with self.assertRaisesRegex(ValueError, "grant_type 'options'"):
            _compute(holding)

    def test_null_characteristics_are_treated_as_empty(self) -> None:
        holding = _grant()
        holding.characteristics = None
        with self.assertRaisesRegex(ValueError, "grant_type 'options'"):
            _compute(holding)

    def test_each_required_field_is_checked(self) -> None:
        for field in ("grant_date", "total_units_granted", "vesting_period_months", "strike_price"):
            with self.subTest(field=field):
                holding = _grant(**{field: None})
                with self.assertRaisesRegex(ValueError, "Grant is missing one of"):
                    _compute(holding)

    def test_a_malformed_grant_date_is_reported_as_a_shape_problem(self) -> None:
        with self.assertRaisesRegex(ValueError, "valid ISO calendar date"):
            _compute(_grant(grant_date="last April"))

    def test_a_non_numeric_strike_is_reported_as_a_shape_problem(self) -> None:
        with self.assertRaisesRegex(ValueError, "finite number"):
            _compute(_grant(strike_price="ten rupees"))

    def test_zero_and_negative_vesting_periods_are_rejected(self) -> None:
        for period in (0, -48):
            with self.subTest(period=period):
                with self.assertRaisesRegex(ValueError, "vesting_period_months must be"):
                    _compute(_grant(vesting_period_months=period))

    def test_invalid_numeric_terms_are_rejected_before_math(self) -> None:
        cases = [
            ("total_units_granted", -1),
            ("total_units_granted", 1.5),
            ("total_units_granted", True),
            ("vesting_cliff_months", -1),
            ("vesting_cliff_months", 1.5),
            ("vesting_period_months", float("inf")),
            ("strike_price", -0.01),
            ("strike_price", float("nan")),
            ("current_fmv", -0.01),
            ("current_fmv", float("inf")),
            ("exercise_window_months", -1),
            ("exercise_window_months", float("nan")),
        ]
        for field, value in cases:
            with self.subTest(field=field, value=value):
                with self.assertRaises(ValueError):
                    _compute(_grant(**{field: value}))

    def test_cliff_cannot_extend_beyond_the_vesting_period(self) -> None:
        with self.assertRaisesRegex(ValueError, "cannot exceed"):
            _compute(_grant(vesting_cliff_months=49, vesting_period_months=48))

    def test_unsafe_monetary_outputs_are_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "₹1 quadrillion"):
            _compute(_grant(total_units_granted=1_000_000_000, strike_price=3_000_000))

        with self.assertRaisesRegex(ValueError, "₹1 quadrillion"):
            _compute(
                _grant(
                    total_units_granted=1_000_000_000,
                    strike_price=0,
                    current_fmv=3_000_000,
                )
            )

    def test_non_finite_vesting_intermediate_is_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "finite outputs"):
            _compute(
                _grant(
                    total_units_granted=1e308,
                    vesting_period_months=48,
                    grant_date=_months_before_today(24),
                )
            )

    def test_zero_units_granted_reads_as_no_units(self) -> None:
        result = _compute(_grant(total_units_granted=0))
        self.assertEqual(result["vested_units"], 0.0)
        self.assertEqual(result["exercise_cost"], 0.0)
        self.assertIn("records no units", result["spread_note"])


class EsopDisclosureTests(unittest.TestCase):
    """The assumption note that stands in for tracking prior exercises."""

    def test_the_assumption_note_is_always_returned(self) -> None:
        for holding in (_grant(), _grant(grant_date=_months_before_today(3))):
            with self.subTest(grant_date=holding.characteristics["grant_date"]):
                result = _compute(holding)
                self.assertEqual(
                    result["exercised_units_assumption_note"], _EXERCISED_ASSUMPTION_NOTE
                )
                self.assertIn(
                    "none of this grant has been exercised",
                    result["exercised_units_assumption_note"],
                )
                self.assertIn("actual grant schedule controls", result["vesting_timing_note"])

    def test_prior_exercises_are_disclosed_not_tracked(self) -> None:
        # KNOWN_LIMITATIONS: "vested units" is cumulative-since-grant, not net of
        # exercises already done. Any units-exercised value on the holding is ignored.
        # If this test starts failing, the disclosed limitation was resolved.
        plain = _grant()
        partly_exercised = _grant(units_already_exercised=1000, exercised_units=1000)
        self.assertEqual(
            _compute(plain)["vested_units"], _compute(partly_exercised)["vested_units"]
        )
        self.assertEqual(
            _compute(plain)["exercise_cost"], _compute(partly_exercised)["exercise_cost"]
        )
        self.assertNotIn("units_already_exercised", _compute(partly_exercised))


class EsopDateAndProvenanceTests(unittest.TestCase):
    def test_india_date_boundary_controls_today(self) -> None:
        holding = _grant(grant_date="2026-08-30")
        with self.assertRaisesRegex(ValueError, "future"):
            compute_esop_exercise_cost(
                _db_returning(holding),
                holding.user_id,
                holding.id,
                now=datetime(2026, 8, 29, 18, 29, 59, tzinfo=timezone.utc),
            )

        result = compute_esop_exercise_cost(
            _db_returning(holding),
            holding.user_id,
            holding.id,
            now=datetime(2026, 8, 29, 18, 30, tzinfo=timezone.utc),
        )
        self.assertEqual(result["calculation_date"], "2026-08-30")
        self.assertEqual(result["calculation_timezone"], "Asia/Kolkata")

    def test_recorded_fmv_language_and_authoritative_evidence(self) -> None:
        holding = _grant(current_fmv=60)
        holding.display_name = "Workplace options"
        holding.version = 6
        result = compute_esop_exercise_cost(
            _db_returning(holding),
            holding.user_id,
            holding.id,
            now=datetime(2026, 8, 29, 12, tzinfo=timezone.utc),
        )
        self.assertEqual(result["fmv_basis_label"], "Recorded FMV")
        self.assertIn("recorded FMV", result["spread_note"])
        self.assertEqual(result["source_evidence"], {
            "source_kind": "holding",
            "source_record_id": str(holding.id),
            "source_label": "Workplace options",
            "source_fields": [
                "grant_type",
                "grant_date",
                "total_units_granted",
                "vesting_cliff_months",
                "vesting_period_months",
                "strike_price",
                "current_fmv",
                "exercise_window_months",
            ],
            "source_version": 6,
            "record_updated_at": None,
            "retrieved_at": "2026-08-29T12:00:00+00:00",
            "freshness": "unavailable",
            "freshness_note": "Freshness unavailable",
        })

    def test_naive_clock_is_treated_as_utc_for_deterministic_evidence(self) -> None:
        holding = _grant()
        result = compute_esop_exercise_cost(
            _db_returning(holding), holding.user_id, holding.id,
            now=datetime(2026, 8, 29, 12),
        )
        self.assertEqual(result["source_evidence"]["retrieved_at"], "2026-08-29T12:00:00+00:00")


if __name__ == "__main__":
    unittest.main()
