import uuid

from app.models import DiscretionaryCategory, Holding, Income
from app.services.budget import _to_monthly, compute_budget

from tests.conftest import FakeSession, make_discretionary_category, make_holding, make_income

USER_ID = uuid.uuid4()


class TestToMonthly:
    def test_monthly_passthrough(self):
        assert _to_monthly(1000, "monthly") == 1000

    def test_annual(self):
        assert _to_monthly(12000, "annual") == 1000

    def test_annually_alias(self):
        assert _to_monthly(12000, "annually") == 1000

    def test_quarterly(self):
        assert _to_monthly(3000, "quarterly") == 1000

    def test_weekly(self):
        assert round(_to_monthly(1000, "weekly"), 2) == round(1000 * 52 / 12, 2)

    def test_none_defaults_to_monthly(self):
        assert _to_monthly(500, None) == 500

    def test_unrecognized_frequency_silently_falls_back_to_monthly(self):
        # Documents current behavior, not necessarily desired behavior — flagged
        # separately as a product question (should an unrecognized frequency like a
        # typo raise instead of silently passing through?).
        assert _to_monthly(500, "biannual") == 500

    def test_case_insensitive(self):
        assert _to_monthly(12000, "ANNUAL") == 1000


class TestComputeBudgetIncome:
    def test_single_monthly_income(self):
        db = FakeSession({
            Income: [make_income(USER_ID, sources=[{"label": "salary", "amount": 145000, "frequency": "monthly"}])]
        })
        result = compute_budget(db, USER_ID)
        assert result["income_total"] == 145000

    def test_multiple_sources_mixed_frequency(self):
        db = FakeSession({
            Income: [make_income(USER_ID, sources=[
                {"label": "salary", "amount": 100000, "frequency": "monthly"},
                {"label": "bonus", "amount": 120000, "frequency": "annual"},
            ])]
        })
        result = compute_budget(db, USER_ID)
        assert result["income_total"] == 110000

    def test_no_income_rows(self):
        db = FakeSession({})
        result = compute_budget(db, USER_ID)
        assert result["income_total"] == 0


class TestComputeBudgetOutflows:
    def test_home_loan_emi_counted(self):
        db = FakeSession({Holding: [
            make_holding(USER_ID, product_type="home_loan", characteristics={"emi_amount": 38000})
        ]})
        result = compute_budget(db, USER_ID)
        assert result["recurring_outflows_total"] == 38000

    def test_personal_loan_emi_counted(self):
        db = FakeSession({Holding: [
            make_holding(USER_ID, product_type="personal_loan", characteristics={"emi_amount": 12000})
        ]})
        result = compute_budget(db, USER_ID)
        assert result["recurring_outflows_total"] == 12000

    def test_sip_equity_fund_counts_monthly_sip_amount_not_cumulative_invested(self):
        """Regression test for the SIP field semantics already established by D-013 /
        DECISION_LOG.md and used consistently across all three fixtures:
        `monthly_sip_amount` is the recurring monthly contribution; `invested_amount`
        is the cumulative total invested to date and must NOT be treated as a monthly
        figure. Per FIXTURE_user_01.json's Fund-A: monthly_sip_amount=8000,
        invested_amount=288000 — the correct monthly outflow is 8000, not 288000.

        Regression test for the bug fixed in D-054 (owner-confirmed): budget.py
        previously read `invested_amount` for the SIP outflow instead of
        `monthly_sip_amount`.
        """
        db = FakeSession({Holding: [
            make_holding(
                USER_ID,
                product_type="equity_mutual_fund",
                characteristics={
                    "investment_mode": "SIP",
                    "monthly_sip_amount": 8000,
                    "invested_amount": 288000,
                },
            )
        ]})
        result = compute_budget(db, USER_ID)
        assert result["recurring_outflows_total"] == 8000

    def test_lumpsum_fund_excluded_from_recurring_outflows(self):
        db = FakeSession({Holding: [
            make_holding(
                USER_ID,
                product_type="equity_mutual_fund",
                characteristics={"investment_mode": "lumpsum", "invested_amount": 500000},
            )
        ]})
        result = compute_budget(db, USER_ID)
        assert result["recurring_outflows_total"] == 0

    def test_term_insurance_premium_annual_normalized_to_monthly(self):
        db = FakeSession({Holding: [
            make_holding(
                USER_ID,
                product_type="term_insurance",
                characteristics={"premium": 12000, "premium_frequency": "annual"},
            )
        ]})
        result = compute_budget(db, USER_ID)
        assert result["recurring_outflows_total"] == 1000

    def test_endowment_ulip_premium_counted(self):
        db = FakeSession({Holding: [
            make_holding(
                USER_ID,
                product_type="endowment_ulip",
                characteristics={"premium": 5000, "premium_frequency": "monthly"},
            )
        ]})
        result = compute_budget(db, USER_ID)
        assert result["recurring_outflows_total"] == 5000

    def test_unrelated_holding_type_contributes_nothing(self):
        db = FakeSession({Holding: [
            make_holding(USER_ID, product_type="savings_balance", characteristics={"current_balance": 200000})
        ]})
        result = compute_budget(db, USER_ID)
        assert result["recurring_outflows_total"] == 0

    def test_credit_card_debt_not_treated_as_recurring_outflow(self):
        # Matches current behavior: credit_card_debt isn't in any of the three
        # outflow buckets, so it contributes 0 to recurring_outflows_total today.
        db = FakeSession({Holding: [
            make_holding(
                USER_ID,
                product_type="credit_card_debt",
                characteristics={"outstanding_balance": 86000, "minimum_due": 4300},
            )
        ]})
        result = compute_budget(db, USER_ID)
        assert result["recurring_outflows_total"] == 0


class TestComputeBudgetDiscretionaryAndNet:
    def test_discretionary_categories_summed_and_listed(self):
        db = FakeSession({DiscretionaryCategory: [
            make_discretionary_category(USER_ID, label="Groceries", planned_amount=15000),
            make_discretionary_category(USER_ID, label="Dining out", planned_amount=5000),
        ]})
        result = compute_budget(db, USER_ID)
        assert result["discretionary_total"] == 20000
        assert result["discretionary_categories"] == [
            {"label": "Groceries", "planned_amount": 15000.0},
            {"label": "Dining out", "planned_amount": 5000.0},
        ]

    def test_net_is_income_minus_outflows_minus_discretionary(self):
        db = FakeSession({
            Income: [make_income(USER_ID, sources=[{"label": "salary", "amount": 145000, "frequency": "monthly"}])],
            Holding: [make_holding(USER_ID, product_type="home_loan", characteristics={"emi_amount": 38000})],
            DiscretionaryCategory: [make_discretionary_category(USER_ID, label="Groceries", planned_amount=15000)],
        })
        result = compute_budget(db, USER_ID)
        assert result["net"] == 145000 - 38000 - 15000

    def test_empty_profile_yields_all_zero(self):
        db = FakeSession({})
        result = compute_budget(db, USER_ID)
        assert result == {
            "income_total": 0,
            "recurring_outflows_total": 0,
            "discretionary_total": 0,
            "net": 0,
            "discretionary_categories": [],
        }
