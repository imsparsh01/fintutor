import unittest
import uuid

from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app
from app.models import Holding
from tests.auth_helpers import authenticated_client, verify_test_token


@compiles(JSONB, "sqlite")
def _compile_jsonb_as_json(_type, _compiler, **_kwargs):
    return "JSON"


class AuthenticatedOwnershipTests(unittest.TestCase):
    def setUp(self) -> None:
        engine = create_engine(
            "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
        )
        Base.metadata.create_all(engine, tables=[Holding.__table__])
        self.db = sessionmaker(bind=engine)()
        self.user_a = uuid.uuid4()
        self.user_b = uuid.uuid4()
        self.holding_a = Holding(
            user_id=self.user_a,
            product_type="fd_rd",
            alias="FD-A",
            characteristics={},
        )
        self.db.add(self.holding_a)
        self.db.commit()

        def override_db():
            yield self.db

        app.dependency_overrides[get_db] = override_db
        app.state.token_verifier = verify_test_token

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        self.db.close()

    def test_public_health_does_not_require_a_token(self) -> None:
        self.assertEqual(TestClient(app).get("/health").status_code, 200)

    def test_missing_and_invalid_tokens_fail_closed(self) -> None:
        self.assertEqual(TestClient(app).get("/holdings").status_code, 401)

        async def reject(_token: str) -> uuid.UUID:
            raise HTTPException(status_code=401, detail="Invalid or expired access token")

        app.state.token_verifier = reject
        response = TestClient(app).get(
            "/holdings", headers={"Authorization": "Bearer expired"}
        )
        self.assertEqual(response.status_code, 401)

    def test_token_subject_overrides_a_spoofed_user_id(self) -> None:
        client_b = authenticated_client(app, self.user_b)
        response = client_b.get(
            f"/holdings/{self.holding_a.id}?user_id={self.user_a}"
        )
        self.assertEqual(response.status_code, 404)

    def test_cross_account_write_and_delete_are_denied(self) -> None:
        client_b = authenticated_client(app, self.user_b)
        update = client_b.patch(
            f"/holdings/{self.holding_a.id}?user_id={self.user_a}",
            json={"display_name": "Changed"},
        )
        delete = client_b.delete(
            f"/holdings/{self.holding_a.id}?user_id={self.user_a}"
        )
        self.assertEqual(update.status_code, 404)
        self.assertEqual(delete.status_code, 404)
        self.db.refresh(self.holding_a)
        self.assertIsNone(self.holding_a.display_name)

    def test_new_records_use_the_token_subject(self) -> None:
        client_b = authenticated_client(app, self.user_b)
        response = client_b.post(
            f"/holdings?user_id={self.user_a}",
            json={"product_type": "fd_rd", "characteristics": {}},
        )
        self.assertEqual(response.status_code, 201)
        created = self.db.query(Holding).filter(Holding.id == uuid.UUID(response.json()["id"])).one()
        self.assertEqual(created.user_id, self.user_b)


if __name__ == "__main__":
    unittest.main()
