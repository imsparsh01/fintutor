import unittest
import uuid

from sqlalchemy import create_engine
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app
from app.models import Holding
from tests.auth_helpers import authenticated_client


@compiles(JSONB, "sqlite")
def _compile_jsonb_as_json(_type, _compiler, **_kwargs):
    return "JSON"


class LoanVsInvestApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine(
            "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
        )
        Base.metadata.create_all(self.engine, tables=[Holding.__table__])
        self.db = sessionmaker(bind=self.engine)()
        self.user_id = uuid.uuid4()
        self.other_user_id = uuid.uuid4()
        self.holding = Holding(
            user_id=self.user_id,
            product_type="home_loan",
            alias="Loan-A",
            display_name="My home loan",
            characteristics={
                "outstanding_balance": 5_000_000,
                "interest_rate": 8.5,
                "emi_amount": 50_000,
            },
            version=4,
        )
        self.db.add(self.holding)
        self.db.commit()

        def override_db():
            yield self.db

        app.dependency_overrides[get_db] = override_db
        self.client = authenticated_client(app, self.user_id)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        self.db.close()
        self.engine.dispose()

    def _body(self, **overrides) -> dict:
        return {
            "holding_id": str(self.holding.id),
            "prepay_amount": 500_000,
            **overrides,
        }

    def test_post_uses_body_and_returns_authoritative_provenance(self) -> None:
        response = self.client.post("/loan-vs-invest", json=self._body())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.request.method, "POST")
        self.assertNotIn("holding_id", str(response.request.url))
        self.assertNotIn("prepay_amount", str(response.request.url))
        evidence = response.json()["source_evidence"]
        self.assertEqual(evidence["source_record_id"], str(self.holding.id))
        self.assertEqual(evidence["source_label"], "My home loan")
        self.assertEqual(evidence["source_version"], 4)
        self.assertEqual(evidence["freshness"], "unavailable")

    def test_get_contract_is_removed(self) -> None:
        response = self.client.get(
            f"/loan-vs-invest?holding_id={self.holding.id}&prepay_amount=500000"
        )
        self.assertEqual(response.status_code, 405)

    def test_token_subject_overrides_spoofed_user_id(self) -> None:
        other_client = authenticated_client(app, self.other_user_id)
        response = other_client.post(
            f"/loan-vs-invest?user_id={self.user_id}", json=self._body()
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"detail": "Holding not found"})

    def test_missing_and_foreign_holdings_have_same_neutral_response(self) -> None:
        other_client = authenticated_client(app, self.other_user_id)
        foreign = other_client.post("/loan-vs-invest", json=self._body())
        missing = self.client.post(
            "/loan-vs-invest", json=self._body(holding_id=str(uuid.uuid4()))
        )
        self.assertEqual(foreign.status_code, 404)
        self.assertEqual(missing.status_code, 404)
        self.assertEqual(foreign.json(), missing.json())

    def test_request_domain_is_rejected_before_service_execution(self) -> None:
        for amount in (False, True, 0, -1, 1_000_000_000_001):
            with self.subTest(amount=amount):
                response = self.client.post(
                    "/loan-vs-invest", json=self._body(prepay_amount=amount)
                )
                self.assertEqual(response.status_code, 422)

    def test_ineligible_owned_record_is_rejected_without_calculation(self) -> None:
        self.holding.product_type = "mutual_fund"
        self.db.commit()
        response = self.client.post("/loan-vs-invest", json=self._body())
        self.assertEqual(response.status_code, 400)
        self.assertNotIn("tenure_reduction", response.json())

    def test_authoritative_stored_value_and_relationship_errors_are_400(self) -> None:
        self.holding.characteristics = {
            **self.holding.characteristics,
            "interest_rate": 101,
        }
        self.db.commit()
        invalid_stored = self.client.post("/loan-vs-invest", json=self._body())
        self.assertEqual(invalid_stored.status_code, 400)

        self.holding.characteristics = {
            **self.holding.characteristics,
            "interest_rate": 8.5,
        }
        self.db.commit()
        too_large_for_balance = self.client.post(
            "/loan-vs-invest", json=self._body(prepay_amount=5_000_000)
        )
        self.assertEqual(too_large_for_balance.status_code, 400)


if __name__ == "__main__":
    unittest.main()
