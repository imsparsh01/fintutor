import uuid

from fastapi.testclient import TestClient


async def verify_test_token(token: str) -> uuid.UUID:
    return uuid.UUID(token)


def authenticated_client(app, user_id: uuid.UUID) -> TestClient:
    app.state.token_verifier = verify_test_token
    return TestClient(app, headers={"Authorization": f"Bearer {user_id}"})
