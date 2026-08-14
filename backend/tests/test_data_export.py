import unittest
import uuid
from datetime import date, datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import HTTPException

from app.db.session import Base, get_db
from app.main import app
from app.models import Holding, ProgressionEvent
from app.services.data_export import EXPORT_DATA_MODELS, build_data_export
from tests.auth_helpers import authenticated_client


class DataExportApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.user_id = uuid.uuid4()
        self.other_user_id = uuid.uuid4()
        self.db = MagicMock()
        app.dependency_overrides[get_db] = lambda: self.db
        self.client = authenticated_client(app, self.user_id)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    @patch("app.main.build_data_export")
    @patch("app.main.reauthenticate_password", new_callable=AsyncMock)
    def test_verified_subject_controls_reauthentication_and_export(self, reauth, build_export) -> None:
        build_export.return_value = {"format": "fintutor-data-export"}
        response = self.client.post(
            f"/account/export?user_id={self.other_user_id}",
            json={"email": "test@example.com", "password": "secret"},
        )
        self.assertEqual(response.status_code, 200)
        reauth.assert_awaited_once_with("test@example.com", "secret", self.user_id)
        build_export.assert_called_once_with(
            self.db, self.user_id, account_email="test@example.com"
        )

    @patch("app.main.build_data_export")
    @patch("app.main.reauthenticate_password", new_callable=AsyncMock)
    def test_failed_reauthentication_exports_nothing(self, reauth, build_export) -> None:
        reauth.side_effect = HTTPException(status_code=401, detail="Reauthentication failed")
        response = self.client.post(
            "/account/export",
            json={"email": "test@example.com", "password": "wrong"},
        )
        self.assertEqual(response.status_code, 401)
        build_export.assert_not_called()


class DataExportServiceTests(unittest.TestCase):
    def test_export_registry_covers_every_user_owned_model(self) -> None:
        all_owned_models = {
            mapper.class_ for mapper in Base.registry.mappers if hasattr(mapper.class_, "user_id")
        }
        self.assertEqual(set(EXPORT_DATA_MODELS), all_owned_models)

    @patch("app.services.data_export._rows")
    def test_export_is_user_readable_and_excludes_internal_fields(self, rows) -> None:
        user_id = uuid.uuid4()
        holding_id = uuid.uuid4()
        now = datetime(2026, 8, 14, 12, 0, tzinfo=timezone.utc)

        def records(_db, model, requested_user_id):
            self.assertEqual(requested_user_id, user_id)
            if model is Holding:
                return [SimpleNamespace(
                    id=holding_id, product_type="equity_mf", alias="Fund-A",
                    display_name="My real fund", characteristics={"current_value": 12500},
                )]
            if model is ProgressionEvent:
                return [SimpleNamespace(
                    event_type="arya_exchange_completed", subject_key=None,
                    occurred_at=now, local_date=date(2026, 8, 14),
                    idempotency_key="internal-retry-key",
                )]
            return []

        rows.side_effect = records
        result = build_data_export(
            MagicMock(), user_id, account_email="test@example.com", generated_at=now
        )

        self.assertEqual(result["account"]["user_id"], str(user_id))
        self.assertEqual(result["account"]["email"], "test@example.com")
        self.assertEqual(result["generated_at"], now.isoformat())
        self.assertEqual(result["data"]["holdings"][0]["display_name"], "My real fund")
        serialized = str(result)
        self.assertNotIn("Fund-A", serialized)
        self.assertNotIn("internal-retry-key", serialized)
        self.assertIn("sections", result["schema"])

    @patch("app.services.data_export._rows")
    def test_every_owned_query_uses_verified_user_id(self, rows) -> None:
        user_id = uuid.uuid4()
        rows.return_value = []
        build_data_export(MagicMock(), user_id)
        self.assertGreater(rows.call_count, 0)
        self.assertTrue(all(call.args[2] == user_id for call in rows.call_args_list))


if __name__ == "__main__":
    unittest.main()
