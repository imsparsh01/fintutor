import uuid
import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, patch


from app.db.session import get_db
from app.main import app
from tests.auth_helpers import authenticated_client
from app.models import Holding
from app.services.holding_capture_classifier import classify_holding_capture
from app.services.holding_reconciliation import (
    ReconciliationStaleError,
    ReconciliationValidationError,
    apply_reconciliation,
    build_reconciliation_proposal,
    redact_display_names,
    resolve_reconciliation,
)


def holding_dict(product_type="home_loan", display_name="Local Bank Loan", **characteristics):
    return {
        "id": str(uuid.uuid4()),
        "product_type": product_type,
        "alias": "Home Loan-1",
        "display_name": display_name,
        "characteristics": characteristics,
    }


class HoldingReconciliationServiceTests(unittest.TestCase):
    def test_exact_display_name_is_redacted_case_insensitively(self):
        holding = holding_dict()
        redacted = redact_display_names("My LOCAL BANK LOAN is now 8.2%", [holding])
        self.assertNotIn("LOCAL BANK LOAN", redacted)
        self.assertIn("Home Loan-1", redacted)

    @patch("app.services.holding_capture_classifier.anthropic.Anthropic")
    @patch("app.services.holding_capture_classifier.settings.anthropic_api_key", "test-key")
    def test_classifier_never_sends_display_name(self, anthropic_client):
        messages = anthropic_client.return_value.messages
        messages.create.return_value = SimpleNamespace(content=[SimpleNamespace(
            type="text",
            text='{"product_type":"home_loan","characteristics":{"interest_rate":8.2}}',
        )])
        result = classify_holding_capture("Local Bank Loan is now 8.2%", [holding_dict()])
        self.assertEqual(result["characteristics"], {"interest_rate": 8.2})
        sent = messages.create.call_args.kwargs["messages"][0]["content"]
        self.assertNotIn("Local Bank Loan", sent)
        self.assertIn("Home Loan-1", sent)

    def test_zero_one_many_and_exact_named_candidate(self):
        extracted = {"interest_rate": 8.2}
        self.assertEqual(build_reconciliation_proposal("loan", [], "home_loan", extracted)["kind"], "new")
        first = holding_dict(interest_rate=8.5)
        one = build_reconciliation_proposal("another loan", [first], "home_loan", extracted)
        self.assertEqual(one["kind"], "select")
        self.assertEqual(len(one["candidates"]), 1)
        second = holding_dict(display_name="Other Loan", interest_rate=8.0)
        many = build_reconciliation_proposal("my loan", [first, second], "home_loan", extracted)
        self.assertEqual(many["kind"], "select")
        self.assertEqual(len(many["candidates"]), 2)
        named = build_reconciliation_proposal("Other Loan is 8.2", [first, second], "home_loan", extracted)
        self.assertEqual(named["target"]["id"], second["id"])
        aliased = build_reconciliation_proposal("Home Loan-1 is 8.2", [first], "home_loan", extracted)
        self.assertEqual(aliased["kind"], "update")

    def test_diff_marks_added_unchanged_and_conflicting(self):
        proposal = build_reconciliation_proposal(
            "Local Bank Loan", [holding_dict(interest_rate=8.5, emi_amount=20000)], "home_loan",
            {"interest_rate": 8.5, "emi_amount": 21000, "outstanding_balance": 1000000},
        )
        self.assertEqual(
            {row["field"]: row["status"] for row in proposal["diff"]},
            {"interest_rate": "unchanged", "emi_amount": "conflicting", "outstanding_balance": "added"},
        )

    def test_resolve_rejects_unowned_target(self):
        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = None
        with self.assertRaises(ReconciliationValidationError):
            resolve_reconciliation(db, uuid.uuid4(), "home_loan", {"interest_rate": 8}, uuid.uuid4(), False)

    def test_apply_rejects_unowned_target_without_write(self):
        db = MagicMock()
        db.query.return_value.filter.return_value.with_for_update.return_value.first.return_value = None
        with self.assertRaises(ReconciliationValidationError):
            apply_reconciliation(
                db, uuid.uuid4(), "home_loan", {"interest_rate": 8}, uuid.uuid4(),
                [{"field": "interest_rate", "stored_value": 9, "proposed_value": 8, "status": "conflicting"}],
            )
        db.commit.assert_not_called()

    @patch("app.services.holding_reconciliation.create_holding")
    def test_new_apply_requires_the_shown_diff(self, create):
        with self.assertRaises(ReconciliationValidationError):
            apply_reconciliation(MagicMock(), uuid.uuid4(), "home_loan", {"interest_rate": 8}, None, [])
        create.assert_not_called()

    def test_apply_locks_merges_only_supplied_fields_and_reports_conflict(self):
        user_id = uuid.uuid4()
        holding = Holding(
            id=uuid.uuid4(), user_id=user_id, product_type="home_loan", alias="Home Loan-1",
            display_name="Local Bank Loan", characteristics={"interest_rate": 8.5, "emi_amount": 20000},
        )
        db = MagicMock()
        locked = db.query.return_value.filter.return_value.with_for_update.return_value
        locked.first.return_value = holding
        result = apply_reconciliation(
            db, user_id, "home_loan", {"interest_rate": 8.2}, holding.id,
            [{"field": "interest_rate", "stored_value": 8.5, "proposed_value": 8.2, "status": "conflicting"}],
        )
        self.assertEqual(holding.characteristics, {"interest_rate": 8.2, "emi_amount": 20000})
        self.assertEqual(result["reconciliation"]["status"], "contradiction")
        db.query.return_value.filter.return_value.with_for_update.assert_called_once_with()
        db.commit.assert_called_once()

    def test_stale_same_field_requires_reconfirmation_without_write(self):
        user_id = uuid.uuid4()
        holding = Holding(
            id=uuid.uuid4(), user_id=user_id, product_type="home_loan", alias="Home Loan-1",
            characteristics={"interest_rate": 8.1},
        )
        db = MagicMock()
        db.query.return_value.filter.return_value.with_for_update.return_value.first.return_value = holding
        with self.assertRaises(ReconciliationStaleError) as caught:
            apply_reconciliation(
                db, user_id, "home_loan", {"interest_rate": 8.2}, holding.id,
                [{"field": "interest_rate", "stored_value": 8.5, "proposed_value": 8.2, "status": "conflicting"}],
            )
        self.assertEqual(caught.exception.proposal["diff"][0]["stored_value"], 8.1)
        db.commit.assert_not_called()

    def test_confirmed_update_still_rejects_a_negative_80c_input(self):
        user_id = uuid.uuid4()
        holding = Holding(
            id=uuid.uuid4(), user_id=user_id, product_type="term_insurance",
            alias="Term Insurance-1", characteristics={"premium": 1000},
        )
        db = MagicMock()
        db.query.return_value.filter.return_value.with_for_update.return_value.first.return_value = holding
        with self.assertRaisesRegex(ReconciliationValidationError, "premium"):
            apply_reconciliation(
                db, user_id, "term_insurance", {"premium": -1}, holding.id,
                [{"field": "premium", "stored_value": 1000, "proposed_value": -1, "status": "conflicting"}],
            )
        self.assertEqual(holding.characteristics, {"premium": 1000})
        db.commit.assert_not_called()

    def test_allowlist_values_and_malformed_or_duplicate_diff_write_nothing(self):
        invalid_cases = [
            ("unknown_type", {"interest_rate": 8}, []),
            ("home_loan", {}, []),
            ("home_loan", {"made_up": 8}, [{"field": "made_up", "status": "added", "stored_value": None, "proposed_value": 8}]),
            ("home_loan", {"interest_rate": float("nan")}, [{"field": "interest_rate", "status": "added", "stored_value": None, "proposed_value": float("nan")}]),
            ("home_loan", {"interest_rate": 8}, [{"field": "interest_rate", "status": "added", "stored_value": None, "proposed_value": 8}, {"field": "interest_rate", "status": "added", "stored_value": None, "proposed_value": 8}]),
        ]
        for product_type, characteristics, diff in invalid_cases:
            db = MagicMock()
            with self.subTest(product_type=product_type, characteristics=characteristics):
                with self.assertRaises(ReconciliationValidationError):
                    apply_reconciliation(db, uuid.uuid4(), product_type, characteristics, None, diff)
                db.commit.assert_not_called()


class HoldingReconciliationApiTests(unittest.TestCase):
    def setUp(self):
        self.db = MagicMock()
        app.dependency_overrides[get_db] = lambda: self.db
        self.user_id = uuid.uuid4()
        self.client = authenticated_client(app, self.user_id)

    def tearDown(self):
        app.dependency_overrides.clear()

    @patch("app.main.resolve_reconciliation", side_effect=ReconciliationValidationError("not available"))
    def test_resolve_returns_controlled_422(self, _resolve):
        response = self.client.post(
            f"/holding-reconciliation/resolve?user_id={self.user_id}",
            json={"product_type": "home_loan", "characteristics": {"interest_rate": 8}, "target_id": str(uuid.uuid4())},
        )
        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.json()["detail"], "not available")

    @patch("app.main.apply_reconciliation")
    def test_apply_returns_refreshed_proposal_on_stale(self, apply):
        refreshed = {"kind": "update", "product_type": "home_loan", "characteristics": {"interest_rate": 8}, "candidates": [], "target": None, "diff": []}
        apply.side_effect = ReconciliationStaleError(refreshed)
        response = self.client.post(
            f"/holding-reconciliation/apply?user_id={self.user_id}",
            json={"product_type": "home_loan", "characteristics": {"interest_rate": 8}, "expected_diff": []},
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()["detail"]["proposal"], refreshed)


if __name__ == "__main__":
    unittest.main()
