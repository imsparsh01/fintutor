import unittest
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from unittest.mock import MagicMock

from app.models import DiscretionaryCategory, Holding
from app.services.budget import _RECURRING_FREQUENCIES, _to_monthly
from app.services.scenario_candidates import enumerate_scenario_candidates


LOADED_AT = datetime(2026, 8, 29, 12, 30, tzinfo=timezone.utc)


def _holding(label: str, product_type: str, *, version: int = 1, **characteristics) -> Holding:
    return Holding(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        product_type=product_type,
        alias=label,
        display_name=None,
        characteristics=characteristics,
        version=version,
    )


def _category(label: str, amount, *, version: int = 1) -> DiscretionaryCategory:
    return DiscretionaryCategory(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        label=label,
        planned_amount=amount,
        version=version,
    )


def _db(holdings=(), categories=()) -> MagicMock:
    rows = {Holding: list(holdings), DiscretionaryCategory: list(categories)}

    def query(model):
        q = MagicMock()
        q.filter.return_value.all.return_value = rows[model]
        return q

    db = MagicMock()
    db.query.side_effect = query
    return db


def _group(result: dict, name: str) -> list[dict]:
    return result[name]["candidates"]


class ScenarioCandidateComponentTests(unittest.TestCase):
    def test_enumerates_each_approved_component_without_anonymous_totals(self) -> None:
        loan = _holding(
            "Loan",
            "home_loan",
            version=2,
            emi_amount=12_000,
            emi_frequency="monthly",
        )
        sip = _holding(
            "Fund SIP",
            "equity_mutual_fund",
            version=3,
            investment_mode="SIP",
            invested_amount=12_000,
            sip_frequency="annual",
            current_value=80_000,
        )
        premium = _holding(
            "Policy",
            "term_insurance",
            premium=3_000,
            premium_frequency="quarterly",
        )
        stock = _holding("Stock", "stocks", current_value=0)
        retirement = _holding("PPF", "ppf_epf", current_balance=30_000)
        fixed_deposit = _holding(
            "Fixed deposit",
            "fd_rd",
            version=4,
            deposit_mode="FD",
            principal_or_monthly_amount=40_000,
        )
        recurring_deposit = _holding(
            "Recurring deposit",
            "fd_rd",
            deposit_mode="RD",
            principal_or_monthly_amount=5_000,
        )
        unconfirmed_deposit = _holding(
            "Unconfirmed deposit", "fd_rd", principal_or_monthly_amount=9_000
        )
        lump_sum_fund = _holding(
            "Lump sum fund",
            "debt_mutual_fund",
            investment_mode="Lumpsum",
            invested_amount=2_000,
            sip_frequency="monthly",
            current_value=50_000,
        )
        category = _category("Groceries", Decimal("7500.00"), version=5)
        db = _db(
            [
                loan,
                sip,
                premium,
                stock,
                retirement,
                fixed_deposit,
                recurring_deposit,
                unconfirmed_deposit,
                lump_sum_fund,
            ],
            [category],
        )

        result = enumerate_scenario_candidates(
            db, uuid.uuid4(), retrieved_at=LOADED_AT
        )

        outgoings = _group(result, "monthly_outgoings")
        self.assertEqual(
            {row["source_label"]: row["original_value"] for row in outgoings},
            {"Fund SIP": 1_000.0, "Groceries": 7_500.0, "Loan": 12_000.0, "Policy": 1_000.0},
        )
        self.assertEqual(
            [(row["source_label"], row["original_value"]) for row in _group(result, "monthly_sips")],
            [("Fund SIP", 1_000.0)],
        )
        self.assertEqual(
            {row["source_label"]: row["original_value"] for row in _group(result, "invested_corpus")},
            {
                "Fixed deposit": 40_000.0,
                "Fund SIP": 80_000.0,
                "Lump sum fund": 50_000.0,
                "PPF": 30_000.0,
                "Stock": 0.0,
            },
        )
        self.assertEqual(
            [(row["source_label"], row["original_value"]) for row in _group(result, "fd_principal")],
            [("Fixed deposit", 40_000.0)],
        )
        all_labels = {
            row["source_label"]
            for group_name in ("monthly_outgoings", "monthly_sips", "invested_corpus", "fd_principal")
            for row in _group(result, group_name)
        }
        self.assertNotIn("Recurring deposit", all_labels)
        self.assertNotIn("Unconfirmed deposit", all_labels)

    def test_shared_sip_and_fd_components_keep_the_same_authoritative_identity(self) -> None:
        sip = _holding(
            "SIP",
            "equity_mutual_fund",
            version=7,
            investment_mode="SIP",
            invested_amount=500,
            sip_frequency="monthly",
            current_value=10_000,
        )
        fd = _holding(
            "FD", "fd_rd", version=8, deposit_mode="fd", principal_or_monthly_amount=20_000
        )
        result = enumerate_scenario_candidates(
            _db([sip, fd]), uuid.uuid4(), retrieved_at=LOADED_AT
        )
        sip_outflow = next(row for row in _group(result, "monthly_outgoings") if row["source_label"] == "SIP")
        sip_only = _group(result, "monthly_sips")[0]
        self.assertEqual(sip_outflow["source_record_id"], sip_only["source_record_id"])
        self.assertEqual(sip_outflow["source_version"], 7)
        self.assertEqual(
            sip_only["source_fields"],
            ["investment_mode", "invested_amount", "sip_frequency"],
        )

        fd_only = _group(result, "fd_principal")[0]
        fd_corpus = next(row for row in _group(result, "invested_corpus") if row["source_label"] == "FD")
        self.assertEqual(fd_only, fd_corpus)
        self.assertEqual(fd_only["source_version"], 8)
        self.assertEqual(
            fd_only["source_fields"],
            ["deposit_mode", "principal_or_monthly_amount"],
        )

    def test_all_supported_cadences_use_the_existing_budget_normalization(self) -> None:
        fixtures = {
            frequency: _to_monthly(1200, frequency)
            for frequency in _RECURRING_FREQUENCIES
        }
        holdings = [
            _holding(
                frequency,
                "home_loan",
                emi_amount=1200,
                emi_frequency=frequency,
            )
            for frequency in fixtures
        ]
        result = enumerate_scenario_candidates(
            _db(holdings), uuid.uuid4(), retrieved_at=LOADED_AT
        )
        self.assertEqual(
            {row["source_label"]: row["original_value"] for row in _group(result, "monthly_outgoings")},
            fixtures,
        )


class ScenarioCandidateStateTests(unittest.TestCase):
    def test_zero_is_available_while_missing_and_malformed_values_remain_null(self) -> None:
        rows = [
            _holding("Zero", "stocks", current_value=0),
            _holding("Missing", "stocks"),
            _holding("Junk", "stocks", current_value="not money"),
            _holding("Negative", "ppf_epf", current_balance=-1),
            _holding("Infinite", "ppf_epf", current_balance="Infinity"),
            _holding(
                "Missing cadence", "home_loan", emi_amount=1000
            ),
            _holding(
                "Bad cadence", "personal_loan", emi_amount=1000, emi_frequency="fortnightly"
            ),
            _holding(
                "Boolean", "home_loan", emi_amount=True, emi_frequency="monthly"
            ),
            _holding(
                "Overflow", "home_loan", emi_amount=1e308, emi_frequency="weekly"
            ),
        ]
        result = enumerate_scenario_candidates(
            _db(rows), uuid.uuid4(), retrieved_at=LOADED_AT
        )
        candidates = {
            row["source_label"]: row
            for group_name in ("invested_corpus", "monthly_outgoings")
            for row in _group(result, group_name)
        }
        self.assertEqual(candidates["Zero"]["original_value"], 0.0)
        self.assertEqual(candidates["Zero"]["value_status"], "available")
        for label in (
            "Missing", "Junk", "Negative", "Infinite", "Missing cadence", "Bad cadence", "Boolean", "Overflow"
        ):
            with self.subTest(label=label):
                self.assertIsNone(candidates[label]["original_value"])
                self.assertIn(candidates[label]["value_status"], {"unavailable", "malformed"})
        self.assertEqual(candidates["Missing"]["value_status"], "unavailable")
        self.assertEqual(candidates["Junk"]["status"], "malformed")
        self.assertEqual(candidates["Missing cadence"]["status"], "unavailable")
        self.assertEqual(candidates["Bad cadence"]["status"], "malformed")
        self.assertEqual(candidates["Overflow"]["status"], "malformed")

    def test_evidence_is_deterministic_and_never_claims_record_freshness(self) -> None:
        beta = _holding("beta", "stocks", current_value=2, version=2)
        alpha = _holding("Alpha", "stocks", current_value=1, version=3)
        result = enumerate_scenario_candidates(
            _db([beta, alpha]), uuid.uuid4(), retrieved_at=datetime(2026, 8, 29, 12, 30)
        )
        candidates = _group(result, "invested_corpus")
        self.assertEqual([row["source_label"] for row in candidates], ["Alpha", "beta"])
        self.assertEqual(result["retrieved_at"], "2026-08-29T12:30:00+00:00")
        for row in candidates:
            self.assertEqual(row["retrieved_at"], result["retrieved_at"])
            self.assertEqual(row["freshness"], "unavailable")
            self.assertEqual(row["freshness_note"], "Freshness unavailable")
            self.assertIsNone(row["record_updated_at"])
            self.assertFalse(row["included"])
            self.assertTrue(row["editable"])

    def test_empty_sources_are_represented_as_absence(self) -> None:
        result = enumerate_scenario_candidates(
            _db(), uuid.uuid4(), retrieved_at=LOADED_AT
        )
        for name in ("monthly_outgoings", "monthly_sips", "invested_corpus", "fd_principal"):
            self.assertEqual(result[name], {"absent": True, "candidates": []})

    def test_enumeration_is_read_only(self) -> None:
        db = _db(
            [_holding("Fund", "stocks", current_value=1)],
            [_category("Food", 1)],
        )
        enumerate_scenario_candidates(db, uuid.uuid4(), retrieved_at=LOADED_AT)
        db.add.assert_not_called()
        db.commit.assert_not_called()
        db.flush.assert_not_called()
        db.delete.assert_not_called()


if __name__ == "__main__":
    unittest.main()
