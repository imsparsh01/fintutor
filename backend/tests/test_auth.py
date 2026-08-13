import unittest
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import HTTPException

from app.auth import verify_supabase_access_token


class SupabaseTokenVerificationTests(unittest.IsolatedAsyncioTestCase):
    @patch("app.auth.httpx.AsyncClient")
    @patch("app.auth.settings")
    async def test_verified_user_id_comes_from_supabase(self, settings, async_client) -> None:
        user_id = uuid.uuid4()
        settings.supabase_url = "https://project.supabase.co"
        settings.supabase_anon_key = "anon"
        response = MagicMock(status_code=200)
        response.json.return_value = {"id": str(user_id)}
        client = AsyncMock()
        client.get.return_value = response
        async_client.return_value.__aenter__.return_value = client

        self.assertEqual(await verify_supabase_access_token("signed-token"), user_id)
        client.get.assert_awaited_once_with(
            "https://project.supabase.co/auth/v1/user",
            headers={"Authorization": "Bearer signed-token", "apikey": "anon"},
        )

    @patch("app.auth.httpx.AsyncClient")
    @patch("app.auth.settings")
    async def test_expired_or_rejected_token_is_unauthorized(self, settings, async_client) -> None:
        settings.supabase_url = "https://project.supabase.co"
        settings.supabase_anon_key = "anon"
        client = AsyncMock()
        client.get.return_value = MagicMock(status_code=401)
        async_client.return_value.__aenter__.return_value = client

        with self.assertRaises(HTTPException) as raised:
            await verify_supabase_access_token("expired")
        self.assertEqual(raised.exception.status_code, 401)


if __name__ == "__main__":
    unittest.main()
