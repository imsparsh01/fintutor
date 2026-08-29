import unittest
import uuid
from decimal import Decimal

from sqlalchemy import create_engine
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app
from app.models import DiscretionaryCategory, Holding
from tests.auth_helpers import authenticated_client


@compiles(JSONB, "sqlite")
def _compile_jsonb_as_json(_type, _compiler, **_kwargs):
    return "JSON"


class ScenarioCandidatesApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine(
            "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
        )
        Base.metadata.create_all(
            self.engine,
            tables=[Holding.__table__, DiscretionaryCategory.__table__],
        )
        self.db = sessionmaker(bind=self.engine)()
        self.user_id = uuid.uuid4()
        self.other_user_id = uuid.uuid4()
        self.owned = Holding(
            user_id=self.user_id,
            product_type="equity_mutual_fund",
            alias="Fund-A",
            display_name="My recorded fund",
            characteristics={
                "investment_mode": "SIP",
                "invested_amount": 1_200,
                "sip_frequency": "monthly",
                "current_value": 25_000,
            },
            version=4,
        )
        self.foreign = Holding(
            user_id=self.other_user_id,
            product_type="stocks",
            alias="Foreign holding",
            characteristics={"current_value": 999_999},
            version=9,
        )
        self.owned_category = DiscretionaryCategory(
            user_id=self.user_id,
            label="Food",
            planned_amount=Decimal("5000.00"),
            version=2,
        )
        self.foreign_category = DiscretionaryCategory(
            user_id=self.other_user_id,
            label="Foreign category",
            planned_amount=Decimal("8888.00"),
            version=7,
        )
        self.db.add_all(
            [self.owned, self.foreign, self.owned_category, self.foreign_category]
        )
        self.db.commit()

        def override_db():
            yield self.db

        app.dependency_overrides[get_db] = override_db
        self.client = authenticated_client(app, self.user_id)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        self.db.close()
        self.engine.dispose()

    def test_response_serializes_owned_components_and_evidence_only(self) -> None:
        response = self.client.get("/scenario-candidates")
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["freshness"], "unavailable")
        self.assertEqual(body["freshness_note"], "Freshness unavailable")

        outgoings = body["monthly_outgoings"]["candidates"]
        self.assertEqual(
            {row["source_label"] for row in outgoings},
            {"Food", "My recorded fund"},
        )
        sip = body["monthly_sips"]["candidates"][0]
        self.assertEqual(sip["source_record_id"], str(self.owned.id))
        self.assertEqual(sip["source_version"], 4)
        self.assertEqual(
            sip["source_fields"],
            ["investment_mode", "invested_amount", "sip_frequency"],
        )
        self.assertEqual(sip["original_value"], 1200.0)
        self.assertFalse(sip["included"])
        self.assertNotIn("Foreign holding", str(body))
        self.assertNotIn("Foreign category", str(body))
        self.assertNotIn("999999", str(body))
        self.assertNotIn("8888", str(body))

    def test_spoofed_user_id_cannot_select_another_accounts_sources(self) -> None:
        response = self.client.get(
            f"/scenario-candidates?user_id={self.other_user_id}"
        )
        self.assertEqual(response.status_code, 200)
        payload = str(response.json())
        self.assertIn("My recorded fund", payload)
        self.assertNotIn("Foreign holding", payload)

    def test_missing_token_is_rejected(self) -> None:
        from fastapi.testclient import TestClient

        self.assertEqual(TestClient(app).get("/scenario-candidates").status_code, 401)

    def test_empty_owned_account_returns_four_explicit_absent_groups(self) -> None:
        empty = authenticated_client(app, uuid.uuid4()).get("/scenario-candidates")
        self.assertEqual(empty.status_code, 200)
        for name in ("monthly_outgoings", "monthly_sips", "invested_corpus", "fd_principal"):
            self.assertEqual(empty.json()[name], {"absent": True, "candidates": []})


if __name__ == "__main__":
    unittest.main()
