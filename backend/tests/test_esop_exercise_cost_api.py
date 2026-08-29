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


class EsopExerciseCostApiTests(unittest.TestCase):
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
            product_type="esop",
            alias="ESOP-1",
            display_name="Workplace options",
            characteristics={
                "grant_type": "options",
                "grant_date": "2024-01-31",
                "total_units_granted": 4_800,
                "vesting_cliff_months": 12,
                "vesting_period_months": 48,
                "strike_price": 10,
                "current_fmv": 60,
                "exercise_window_months": 90,
            },
            version=5,
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

    def test_authenticated_response_serializes_recorded_basis_and_provenance(self) -> None:
        response = self.client.get(
            "/esop-exercise-cost", params={"holding_id": str(self.holding.id)}
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["fmv_basis_label"], "Recorded FMV")
        self.assertEqual(body["calculation_timezone"], "Asia/Kolkata")
        self.assertEqual(body["source_evidence"]["source_record_id"], str(self.holding.id))
        self.assertEqual(body["source_evidence"]["source_version"], 5)
        self.assertEqual(body["source_evidence"]["freshness"], "unavailable")
        self.assertIn("not a countdown", body["exercise_window_note"])

    def test_token_subject_overrides_spoofed_user_id(self) -> None:
        other_client = authenticated_client(app, self.other_user_id)
        response = other_client.get(
            f"/esop-exercise-cost?holding_id={self.holding.id}&user_id={self.user_id}"
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"detail": "Holding not found"})

    def test_foreign_and_missing_records_share_the_neutral_404(self) -> None:
        foreign = authenticated_client(app, self.other_user_id).get(
            "/esop-exercise-cost", params={"holding_id": str(self.holding.id)}
        )
        missing = self.client.get(
            "/esop-exercise-cost", params={"holding_id": str(uuid.uuid4())}
        )
        self.assertEqual(foreign.status_code, 404)
        self.assertEqual(missing.status_code, 404)
        self.assertEqual(foreign.json(), missing.json())

    def test_ineligible_and_invalid_owned_records_return_400_without_result(self) -> None:
        self.holding.characteristics = {
            **self.holding.characteristics,
            "grant_type": "rsu",
        }
        self.db.commit()
        rsu = self.client.get(
            "/esop-exercise-cost", params={"holding_id": str(self.holding.id)}
        )
        self.assertEqual(rsu.status_code, 400)
        self.assertNotIn("exercise_cost", rsu.json())

        self.holding.characteristics = {
            **self.holding.characteristics,
            "grant_type": "options",
            "current_fmv": "Infinity",
        }
        self.db.commit()
        invalid = self.client.get(
            "/esop-exercise-cost", params={"holding_id": str(self.holding.id)}
        )
        self.assertEqual(invalid.status_code, 400)
        self.assertNotIn("exercise_cost", invalid.json())


if __name__ == "__main__":
    unittest.main()
