import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from sqlalchemy.exc import IntegrityError

from app.db.session import get_db
from app.main import app
from app.models import FinancialContext
from app.models import Goal, Holding
from app.services.baseline import assemble_baseline
from app.services.financial_context import (
    clear_financial_context,
    get_financial_context,
    patch_financial_context,
    set_financial_context,
)
from tests.auth_helpers import authenticated_client


class FinancialContextServiceTests(unittest.TestCase):
    def test_missing_context_is_explicitly_unknown(self) -> None:
        db = MagicMock()
        db.query.return_value.filter.return_value.one_or_none.return_value = None
        self.assertEqual(get_financial_context(db, uuid.uuid4()), {
            "dependant_count": None, "emergency_fund_months": None, "updated_at": None,
        })

    def test_upsert_is_owned_and_accepts_confirmed_zeroes(self) -> None:
        db = MagicMock()
        db.query.return_value.filter.return_value.one_or_none.return_value = None
        user_id = uuid.uuid4()

        result = set_financial_context(db, user_id, 0, 0.0)

        row = db.add.call_args.args[0]
        self.assertIsInstance(row, FinancialContext)
        self.assertEqual(row.user_id, user_id)
        self.assertEqual(result["dependant_count"], 0)
        self.assertEqual(result["emergency_fund_months"], 0.0)
        db.commit.assert_called_once()

    @patch("app.services.baseline.compute_surfacing_candidates", return_value=[])
    @patch("app.services.baseline.compute_budget", return_value={
        "income_total": 1000, "recurring_outflows_total": 500,
    })
    def test_confirmed_context_is_authoritative_for_arya(self, _budget, _surfacing) -> None:
        db = MagicMock()

        def query(model):
            result = MagicMock()
            if model is Holding or model is Goal:
                result.filter.return_value.all.return_value = []
            elif model is FinancialContext:
                result.filter.return_value.one_or_none.return_value = SimpleNamespace(
                    dependant_count=2, emergency_fund_months=6.5
                )
            return result

        db.query.side_effect = query
        baseline = assemble_baseline(db, uuid.uuid4())
        self.assertEqual(baseline["baseline"]["dependents"], 2)
        self.assertEqual(baseline["baseline"]["emergency_fund_months"], 6.5)

    def test_partial_update_preserves_the_other_field_and_allows_explicit_null(self) -> None:
        row = SimpleNamespace(
            dependant_count=3, emergency_fund_months=8.0, updated_at=None
        )
        db = MagicMock()
        db.query.return_value.filter.return_value.with_for_update.return_value.one_or_none.return_value = row

        result = patch_financial_context(db, uuid.uuid4(), {"emergency_fund_months": None})

        self.assertEqual(result["dependant_count"], 3)
        self.assertIsNone(result["emergency_fund_months"])
        db.commit.assert_called_once()

    def test_concurrent_first_write_retries_the_unique_constraint_winner(self) -> None:
        winner = SimpleNamespace(
            dependant_count=1, emergency_fund_months=2.0, updated_at=None
        )
        db = MagicMock()
        db.query.return_value.filter.return_value.one_or_none.return_value = None
        db.query.return_value.filter.return_value.with_for_update.return_value.one.return_value = winner
        db.commit.side_effect = [IntegrityError("insert", {}, Exception("race")), None]

        result = set_financial_context(db, uuid.uuid4(), 4, 6.0)

        self.assertEqual(result["dependant_count"], 4)
        self.assertEqual(result["emergency_fund_months"], 6.0)
        db.rollback.assert_called_once()

    def test_clear_is_scoped_and_idempotent(self) -> None:
        db = MagicMock()
        result = clear_financial_context(db, uuid.uuid4())
        db.query.return_value.filter.return_value.delete.assert_called_once_with(synchronize_session=False)
        self.assertIsNone(result["dependant_count"])
        db.commit.assert_called_once()


class FinancialContextApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.user_id = uuid.uuid4()
        self.other_user_id = uuid.uuid4()
        self.db = MagicMock()
        app.dependency_overrides[get_db] = lambda: self.db
        self.client = authenticated_client(app, self.user_id)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    def test_verified_subject_controls_read(self) -> None:
        row = SimpleNamespace(dependant_count=2, emergency_fund_months=4.5, updated_at=None)
        self.db.query.return_value.filter.return_value.one_or_none.return_value = row
        response = self.client.get(f"/financial-context?user_id={self.other_user_id}")
        self.assertEqual(response.status_code, 200)
        filter_expression = self.db.query.return_value.filter.call_args.args[0]
        self.assertIn(str(self.user_id), str(filter_expression.right.value))

    def test_validation_rejects_out_of_range_context(self) -> None:
        response = self.client.put("/financial-context", json={
            "dependant_count": -1, "emergency_fund_months": 4,
        })
        self.assertEqual(response.status_code, 422)

    def test_patch_uses_only_explicit_fields_under_verified_ownership(self) -> None:
        row = SimpleNamespace(dependant_count=2, emergency_fund_months=4.5, updated_at=None)
        locked = self.db.query.return_value.filter.return_value.with_for_update.return_value
        locked.one_or_none.return_value = row
        response = self.client.patch(
            f"/financial-context?user_id={self.other_user_id}",
            json={"emergency_fund_months": None},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["dependant_count"], 2)
        self.assertIsNone(response.json()["emergency_fund_months"])
        filter_expression = self.db.query.return_value.filter.call_args.args[0]
        self.assertIn(str(self.user_id), str(filter_expression.right.value))


if __name__ == "__main__":
    unittest.main()
