import unittest
import uuid
from unittest.mock import MagicMock

from app.models import DiscretionaryCategory, Holding, Income
from app.services.budget import (
    _RECURRING_FREQUENCIES,
    _SIX_MONTH_FREQUENCIES,
    _to_monthly,
    compute_budget,
)

# Every cadence compute_budget recognises, and the factor it normalises to per month.
# 1200 is chosen as the sample amount because every factor divides it exactly.
_MONTHLY_FACTORS: dict[str, float] = {
    "monthly": 1.0,
    "month": 1.0,
    "annual": 1 / 12,
    "annually": 1 / 12,
    "yearly": 1 / 12,
    "year": 1 / 12,
    "quarterly": 1 / 3,
    "quarter": 1 / 3,
    "weekly": 52 / 12,
    "week": 52 / 12,
    **{freq: 1 / 6 for freq in _SIX_MONTH_FREQUENCIES},
}

# Values that are not a recognised cadence at all.
_UNRECOGNISED_FREQUENCIES = ("", "   ", "fortnightly", "bi-weekly", "daily", "one-off", "per year")


def _db(incomes=(), holdings=(), categories=()) -> MagicMock:
    """A MagicMock Session that answers query(Model).filter(...).all() per model."""
    rows = {
        Income: list(incomes),
        Holding: list(holdings),
        DiscretionaryCategory: list(categories),
    }

    def query(model):
        q = MagicMock()
        q.filter.return_value.all.return_value = rows[model]
        return q

    db = MagicMock()
    db.query.side_effect = query
    return db


def _income(*sources: dict) -> Income:
    return Income(id=uuid.uuid4(), user_id=uuid.uuid4(), sources=list(sources))


def _holding(product_type: str, characteristics: dict | None) -> Holding:
    return Holding(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        product_type=product_type,
        alias=f"{product_type}-1",
        characteristics=characteristics,
    )


def _category(label: str, planned_amount: float) -> DiscretionaryCategory:
    return DiscretionaryCategory(
        id=uuid.uuid4(), user_id=uuid.uuid4(), label=label, planned_amount=planned_amount
    )


class FrequencyNormalisationTests(unittest.TestCase):
    """_to_monthly's cadence table (D-038/BQ-010, six-month variants per D-112)."""

    def test_table_covers_every_recognised_cadence(self) -> None:
        # Guard: if a cadence is added to the service, this test file must grow with it.
        self.assertEqual(set(_MONTHLY_FACTORS), _RECURRING_FREQUENCIES)

    def test_every_recognised_cadence_normalises_to_monthly(self) -> None:
        for freq, factor in _MONTHLY_FACTORS.items():
            with self.subTest(frequency=freq):
                self.assertAlmostEqual(_to_monthly(1200, freq), 1200 * factor, places=6)

    def test_six_month_variants_all_divide_by_six(self) -> None:
        for freq in _SIX_MONTH_FREQUENCIES:
            with self.subTest(frequency=freq):
                self.assertAlmostEqual(_to_monthly(1200, freq), 200.0, places=6)

    def test_cadence_matching_ignores_case_and_surrounding_whitespace(self) -> None:
        for freq in ("  YEARLY ", "Yearly", "\tyEaRlY\n"):
            with self.subTest(frequency=freq):
                self.assertAlmostEqual(_to_monthly(1200, freq), 100.0, places=6)

    def test_none_and_unrecognised_cadences_are_treated_as_already_monthly(self) -> None:
        # Documented fallback in _to_monthly itself. compute_budget's recurring-outflow
        # path never reaches this branch (it filters unrecognised cadences out first),
        # but the income path does.
        for freq in (None, *_UNRECOGNISED_FREQUENCIES):
            with self.subTest(frequency=freq):
                self.assertEqual(_to_monthly(1200, freq), 1200.0)

    def test_zero_and_negative_amounts_are_scaled_not_clamped(self) -> None:
        self.assertEqual(_to_monthly(0, "yearly"), 0.0)
        self.assertAlmostEqual(_to_monthly(-1200, "yearly"), -100.0, places=6)


class BudgetIncomeTests(unittest.TestCase):
    """income_total: Income.sources normalised to monthly, floor `amount` only (D-073)."""

    def test_each_recognised_cadence_feeds_income_total(self) -> None:
        for freq, factor in _MONTHLY_FACTORS.items():
            with self.subTest(frequency=freq):
                db = _db(incomes=[_income({"label": "Salary", "amount": 1200, "frequency": freq})])
                self.assertAlmostEqual(
                    compute_budget(db, uuid.uuid4())["income_total"], round(1200 * factor, 2), places=2
                )

    def test_missing_or_unrecognised_income_cadence_is_excluded_and_flagged(self) -> None:
        for source in (
            {"label": "Salary", "amount": 50000},
            {"label": "Salary", "amount": 50000, "frequency": None},
            {"label": "Salary", "amount": 50000, "frequency": ""},
            {"label": "Salary", "amount": 50000, "frequency": "fortnightly"},
        ):
            with self.subTest(source=source):
                db = _db(incomes=[_income(source)])
                result = compute_budget(db, uuid.uuid4())
                self.assertEqual(result["income_total"], 0.0)
                self.assertEqual(len(result["invalid_income_sources"]), 1)
                self.assertEqual(result["invalid_income_sources"][0]["label"], "Salary")

    def test_multiple_rows_and_multiple_sources_are_summed(self) -> None:
        db = _db(incomes=[
            _income(
                {"label": "Salary", "amount": 90000, "frequency": "monthly"},
                {"label": "Bonus", "amount": 120000, "frequency": "annual"},
            ),
            _income({"label": "Rent", "amount": 30000, "frequency": "quarterly"}),
        ])
        self.assertEqual(compute_budget(db, uuid.uuid4())["income_total"], 110000.0)

    def test_amount_high_companion_figure_is_never_read(self) -> None:
        # D-073: `amount` is the floor figure and the only one this calculation uses.
        db = _db(incomes=[
            _income({"label": "Freelance", "amount": 20000, "amount_high": 80000, "frequency": "monthly"})
        ])
        self.assertEqual(compute_budget(db, uuid.uuid4())["income_total"], 20000.0)

    def test_no_income_rows_and_empty_sources_give_zero(self) -> None:
        self.assertEqual(compute_budget(_db(), uuid.uuid4())["income_total"], 0.0)
        self.assertEqual(compute_budget(_db(incomes=[_income()]), uuid.uuid4())["income_total"], 0.0)


class BudgetRecurringOutflowTests(unittest.TestCase):
    """recurring_outflows: which holdings feed the monthly outflow, per D-038/D-048."""

    def _total(self, product_type: str, characteristics: dict | None) -> float:
        db = _db(holdings=[_holding(product_type, characteristics)])
        return compute_budget(db, uuid.uuid4())["recurring_outflows_total"]

    def test_loan_types_read_emi_amount_and_emi_frequency(self) -> None:
        for product_type in ("home_loan", "personal_loan"):
            with self.subTest(product_type=product_type):
                total = self._total(
                    product_type, {"emi_amount": 24000, "emi_frequency": "quarterly"}
                )
                self.assertEqual(total, 8000.0)

    def test_fund_types_count_only_when_investment_mode_is_sip(self) -> None:
        for product_type in ("equity_mutual_fund", "debt_mutual_fund"):
            with self.subTest(product_type=product_type):
                counted = self._total(
                    product_type,
                    {"investment_mode": "SIP", "invested_amount": 5000, "sip_frequency": "monthly"},
                )
                self.assertEqual(counted, 5000.0)

    def test_lumpsum_and_missing_or_miscased_investment_mode_are_excluded(self) -> None:
        # `investment_mode` is the D-013 enum, matched exactly ("SIP" / "lumpsum").
        for mode in ("lumpsum", None, "sip", "Sip", ""):
            with self.subTest(investment_mode=mode):
                characteristics = {"invested_amount": 5000, "sip_frequency": "monthly"}
                if mode is not None:
                    characteristics["investment_mode"] = mode
                self.assertEqual(self._total("equity_mutual_fund", characteristics), 0.0)

    def test_insurance_types_read_premium_and_premium_frequency(self) -> None:
        for product_type in ("term_insurance", "endowment_ulip"):
            with self.subTest(product_type=product_type):
                total = self._total(
                    product_type, {"premium": 24000, "premium_frequency": "annual"}
                )
                self.assertEqual(total, 2000.0)

    def test_product_types_with_no_recurring_outflow_are_ignored(self) -> None:
        for product_type in ("ppf_epf", "fd_rd", "savings_balance", "esop", "unknown_type"):
            with self.subTest(product_type=product_type):
                total = self._total(
                    product_type,
                    {"emi_amount": 9999, "premium": 9999, "invested_amount": 9999,
                     "emi_frequency": "monthly", "premium_frequency": "monthly"},
                )
                self.assertEqual(total, 0.0)

    def test_every_recognised_cadence_normalises_the_outflow(self) -> None:
        for freq, factor in _MONTHLY_FACTORS.items():
            with self.subTest(frequency=freq):
                db = _db(holdings=[
                    _holding("home_loan", {"emi_amount": 1200, "emi_frequency": freq})
                ])
                result = compute_budget(db, uuid.uuid4())
                self.assertAlmostEqual(
                    result["recurring_outflows_total"], round(1200 * factor, 2), places=2
                )
                self.assertAlmostEqual(
                    result["recurring_outflows"][0]["monthly_amount"], round(1200 * factor, 2), places=2
                )

    def test_six_month_premium_variants_count_at_a_sixth_per_month(self) -> None:
        for freq in _SIX_MONTH_FREQUENCIES:
            with self.subTest(frequency=freq):
                total = self._total(
                    "term_insurance", {"premium": 12000, "premium_frequency": freq}
                )
                self.assertEqual(total, 2000.0)

    def test_missing_or_unrecognised_cadence_is_excluded_not_guessed_monthly(self) -> None:
        # Option C / D-112: an amount without an explicit recognised cadence stays visible
        # on the holding but never enters the monthly view.
        for freq in (None, *_UNRECOGNISED_FREQUENCIES):
            with self.subTest(frequency=freq):
                characteristics = {"emi_amount": 25000}
                if freq is not None:
                    characteristics["emi_frequency"] = freq
                db = _db(holdings=[_holding("home_loan", characteristics)])
                result = compute_budget(db, uuid.uuid4())
                self.assertEqual(result["recurring_outflows_total"], 0.0)
                self.assertEqual(result["recurring_outflows"], [])

    def test_missing_amount_with_a_valid_cadence_is_excluded(self) -> None:
        db = _db(holdings=[_holding("home_loan", {"emi_frequency": "monthly"})])
        result = compute_budget(db, uuid.uuid4())
        self.assertEqual(result["recurring_outflows_total"], 0.0)
        self.assertEqual(result["recurring_outflows"], [])

    def test_zero_amount_still_produces_a_provenance_row(self) -> None:
        # 0 is a recorded figure, not a missing one — only None is treated as absent.
        db = _db(holdings=[_holding("home_loan", {"emi_amount": 0, "emi_frequency": "monthly"})])
        result = compute_budget(db, uuid.uuid4())
        self.assertEqual(result["recurring_outflows_total"], 0.0)
        self.assertEqual(len(result["recurring_outflows"]), 1)

    def test_negative_amount_is_carried_through_unclamped(self) -> None:
        db = _db(holdings=[_holding("home_loan", {"emi_amount": -5000, "emi_frequency": "monthly"})])
        result = compute_budget(db, uuid.uuid4())
        self.assertEqual(result["recurring_outflows_total"], -5000.0)
        self.assertEqual(result["recurring_outflows"][0]["monthly_amount"], -5000.0)

    def test_absent_characteristics_blob_is_safe(self) -> None:
        for characteristics in (None, {}):
            with self.subTest(characteristics=characteristics):
                self.assertEqual(self._total("home_loan", characteristics), 0.0)

    def test_provenance_row_names_its_source_field(self) -> None:
        db = _db(holdings=[
            _holding("home_loan", {"emi_amount": 24000.456, "emi_frequency": "quarterly"}),
            _holding("equity_mutual_fund", {
                "investment_mode": "SIP", "invested_amount": 5000, "sip_frequency": "monthly",
            }),
            _holding("term_insurance", {"premium": 12000, "premium_frequency": "half-yearly"}),
        ])
        rows = compute_budget(db, uuid.uuid4())["recurring_outflows"]
        self.assertEqual(rows[0], {
            "product_type": "home_loan",
            "source_field": "emi_amount",
            "amount": 24000.46,
            "frequency": "quarterly",
            "monthly_amount": 8000.15,
        })
        self.assertEqual(
            [(r["product_type"], r["source_field"]) for r in rows[1:]],
            [("equity_mutual_fund", "invested_amount"), ("term_insurance", "premium")],
        )

    def test_excluded_holdings_leave_no_provenance_row(self) -> None:
        db = _db(holdings=[
            _holding("home_loan", {"emi_amount": 25000, "emi_frequency": "monthly"}),
            _holding("home_loan", {"emi_amount": 9999}),
            _holding("fd_rd", {"emi_amount": 9999, "emi_frequency": "monthly"}),
        ])
        result = compute_budget(db, uuid.uuid4())
        self.assertEqual(len(result["recurring_outflows"]), 1)
        self.assertEqual(result["recurring_outflows_total"], 25000.0)


class BudgetTotalsTests(unittest.TestCase):
    """The assembled live view: discretionary sum, net, rounding (nothing is stored)."""

    def test_discretionary_categories_are_summed_and_echoed(self) -> None:
        db = _db(categories=[_category("Eating out", 8000), _category("Travel", 4500.25)])
        result = compute_budget(db, uuid.uuid4())
        self.assertEqual(result["discretionary_total"], 12500.25)
        self.assertEqual(result["discretionary_categories"], [
            {"label": "Eating out", "planned_amount": 8000.0},
            {"label": "Travel", "planned_amount": 4500.25},
        ])

    def test_net_is_income_minus_outflows_minus_discretionary(self) -> None:
        db = _db(
            incomes=[_income(
                {"label": "Salary", "amount": 90000, "frequency": "monthly"},
                {"label": "Bonus", "amount": 120000, "frequency": "annual"},
            )],
            holdings=[
                _holding("home_loan", {"emi_amount": 25000, "emi_frequency": "monthly"}),
                _holding("equity_mutual_fund", {
                    "investment_mode": "SIP", "invested_amount": 15000, "sip_frequency": "quarterly",
                }),
                _holding("term_insurance", {"premium": 12000, "premium_frequency": "semi-annual"}),
            ],
            categories=[_category("Eating out", 8000), _category("Travel", 4500)],
        )
        result = compute_budget(db, uuid.uuid4())
        self.assertEqual(result["income_total"], 100000.0)
        self.assertEqual(result["recurring_outflows_total"], 32000.0)
        self.assertEqual(result["discretionary_total"], 12500.0)
        self.assertEqual(result["net"], 55500.0)
        self.assertEqual(len(result["recurring_outflows"]), 3)

    def test_net_goes_negative_when_commitments_exceed_income(self) -> None:
        db = _db(
            incomes=[_income({"label": "Salary", "amount": 30000, "frequency": "monthly"})],
            holdings=[_holding("home_loan", {"emi_amount": 28000, "emi_frequency": "monthly"})],
            categories=[_category("Eating out", 9000)],
        )
        self.assertEqual(compute_budget(db, uuid.uuid4())["net"], -7000.0)

    def test_empty_user_gets_an_all_zero_view(self) -> None:
        self.assertEqual(compute_budget(_db(), uuid.uuid4()), {
            "income_total": 0.0,
            "invalid_income_sources": [],
            "recurring_outflows_total": 0.0,
            "recurring_outflows": [],
            "discretionary_total": 0.0,
            "net": 0.0,
            "discretionary_categories": [],
        })

    def test_totals_round_to_two_decimals_but_net_is_computed_before_rounding(self) -> None:
        db = _db(
            incomes=[_income({"label": "Gig", "amount": 200, "frequency": "weekly"})],
            holdings=[_holding("home_loan", {"emi_amount": 100, "emi_frequency": "weekly"})],
        )
        result = compute_budget(db, uuid.uuid4())
        self.assertEqual(result["income_total"], 866.67)
        self.assertEqual(result["recurring_outflows_total"], 433.33)
        # 866.67 - 433.33 would be 433.34; net comes off the unrounded figures instead.
        self.assertEqual(result["net"], 433.33)

    def test_nothing_is_written_back(self) -> None:
        db = _db(incomes=[_income({"label": "Salary", "amount": 50000, "frequency": "monthly"})])
        compute_budget(db, uuid.uuid4())
        db.add.assert_not_called()
        db.commit.assert_not_called()


if __name__ == "__main__":
    unittest.main()
