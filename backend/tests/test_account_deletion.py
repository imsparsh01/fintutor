import unittest
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

from app.db.session import Base, get_db
from app.main import app
from app.models import (
    DiscretionaryCategory, Goal, Holding, Income, OnboardingAssessment, OnboardingState,
    ProgressionDailyRollup, ProgressionEvent, ProgressionSummary, StreakState,
)
from app.services.account_deletion import ACCOUNT_DATA_MODELS, delete_active_user_data
from tests.auth_helpers import authenticated_client


class AccountDeletionServiceTests(unittest.TestCase):
    def test_active_deletion_registry_covers_every_owned_model(self) -> None:
        db = MagicMock()
        user_id = uuid.uuid4()
        delete_active_user_data(db, user_id)
        queried = {entry.args[0] for entry in db.query.call_args_list}
        for model in (
            Goal, Holding, Income, DiscretionaryCategory, StreakState, OnboardingState,
            OnboardingAssessment, ProgressionEvent, ProgressionDailyRollup, ProgressionSummary,
        ):
            self.assertIn(model, queried)
        db.commit.assert_called_once()

    def test_registry_fails_when_a_new_user_owned_model_is_not_added(self) -> None:
        all_owned_models = {
            mapper.class_ for mapper in Base.registry.mappers if hasattr(mapper.class_, "user_id")
        }
        self.assertEqual(set(ACCOUNT_DATA_MODELS), all_owned_models)


class AccountDeletionApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.user_id = uuid.uuid4()
        self.other_user_id = uuid.uuid4()
        self.db = MagicMock()
        app.dependency_overrides[get_db] = lambda: self.db
        self.client = authenticated_client(app, self.user_id)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    @patch("app.main.delete_supabase_auth_user", new_callable=AsyncMock)
    @patch("app.main.delete_active_user_data")
    @patch("app.main.reauthenticate_password", new_callable=AsyncMock)
    def test_verified_subject_controls_both_deletion_stages(self, reauth, delete_data, delete_auth) -> None:
        response = self.client.post(
            f"/account/delete?user_id={self.other_user_id}",
            json={"email": "test@example.com", "password": "secret", "confirmation": "DELETE MY ACCOUNT"},
        )
        self.assertEqual(response.status_code, 200)
        reauth.assert_awaited_once_with("test@example.com", "secret", self.user_id)
        delete_data.assert_called_once_with(self.db, self.user_id)
        delete_auth.assert_awaited_once_with(self.user_id)

    @patch("app.main.delete_supabase_auth_user", new_callable=AsyncMock)
    @patch("app.main.delete_active_user_data")
    @patch("app.main.reauthenticate_password", new_callable=AsyncMock)
    def test_failed_reauthentication_deletes_nothing(self, reauth, delete_data, delete_auth) -> None:
        from fastapi import HTTPException
        reauth.side_effect = HTTPException(status_code=401, detail="Reauthentication failed")
        response = self.client.post(
            "/account/delete",
            json={"email": "test@example.com", "password": "wrong", "confirmation": "DELETE MY ACCOUNT"},
        )
        self.assertEqual(response.status_code, 401)
        delete_data.assert_not_called()
        delete_auth.assert_not_awaited()

    def test_exact_final_confirmation_is_required(self) -> None:
        response = self.client.post(
            "/account/delete",
            json={"email": "test@example.com", "password": "secret", "confirmation": "delete"},
        )
        self.assertEqual(response.status_code, 422)

    @patch("app.main.delete_supabase_auth_user", new_callable=AsyncMock)
    @patch("app.main.delete_active_user_data")
    @patch("app.main.reauthenticate_password", new_callable=AsyncMock)
    def test_data_failure_preserves_auth_account(self, reauth, delete_data, delete_auth) -> None:
        delete_data.side_effect = RuntimeError("database failure")
        with self.assertRaises(RuntimeError):
            self.client.post(
                "/account/delete",
                json={"email": "test@example.com", "password": "secret", "confirmation": "DELETE MY ACCOUNT"},
            )
        delete_auth.assert_not_awaited()

    @patch("app.main.delete_supabase_auth_user", new_callable=AsyncMock)
    @patch("app.main.delete_active_user_data")
    @patch("app.main.reauthenticate_password", new_callable=AsyncMock)
    def test_auth_failure_leaves_deleted_data_retryable(self, reauth, delete_data, delete_auth) -> None:
        from fastapi import HTTPException
        delete_auth.side_effect = HTTPException(status_code=503, detail="Account deletion could not be completed")
        response = self.client.post(
            "/account/delete",
            json={"email": "test@example.com", "password": "secret", "confirmation": "DELETE MY ACCOUNT"},
        )
        self.assertEqual(response.status_code, 503)
        delete_data.assert_called_once()

    @patch("app.main.delete_supabase_auth_user", new_callable=AsyncMock)
    @patch("app.main.delete_active_user_data")
    @patch("app.main.reauthenticate_password", new_callable=AsyncMock)
    def test_repeated_requests_converge(self, reauth, delete_data, delete_auth) -> None:
        body = {"email": "test@example.com", "password": "secret", "confirmation": "DELETE MY ACCOUNT"}
        self.assertEqual(self.client.post("/account/delete", json=body).status_code, 200)
        self.assertEqual(self.client.post("/account/delete", json=body).status_code, 200)
        self.assertEqual(delete_data.call_count, 2)
        self.assertEqual(delete_auth.await_count, 2)


if __name__ == "__main__":
    unittest.main()
