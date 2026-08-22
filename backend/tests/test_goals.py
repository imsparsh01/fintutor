import unittest
import uuid
from datetime import date
from unittest.mock import MagicMock

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles

from app.db.session import Base, get_db
from app.main import app
from app.models import Goal, GoalFunding, Holding
from app.services.goals import GoalFundingValidationError, _validate_funding, update_goal_funding
from tests.auth_helpers import authenticated_client


@compiles(JSONB, "sqlite")
def _compile_jsonb_as_json(_type, _compiler, **_kwargs):
    return "JSON"


class GoalFundingTests(unittest.TestCase):
    def test_empty_funding_is_valid(self) -> None:
        db = MagicMock()
        db.query.return_value.filter.return_value.all.return_value = []
        _validate_funding(db, uuid.uuid4(), [])

    def test_cross_user_holding_is_rejected(self) -> None:
        db = MagicMock()
        db.query.return_value.filter.return_value.all.return_value = []
        with self.assertRaisesRegex(GoalFundingValidationError, "belong"):
            _validate_funding(db, uuid.uuid4(), [{"holding_id": uuid.uuid4(), "earmarked_amount": 1000}])

    def test_duplicate_holding_is_rejected(self) -> None:
        holding_id = uuid.uuid4()
        with self.assertRaisesRegex(GoalFundingValidationError, "only once"):
            _validate_funding(MagicMock(), uuid.uuid4(), [
                {"holding_id": holding_id, "earmarked_amount": 1000},
                {"holding_id": holding_id, "earmarked_amount": 500},
            ])

    def test_selected_holding_requires_a_positive_amount(self) -> None:
        with self.assertRaisesRegex(GoalFundingValidationError, "above zero"):
            _validate_funding(MagicMock(), uuid.uuid4(), [
                {"holding_id": uuid.uuid4(), "earmarked_amount": 0},
            ])

    def test_update_replaces_links_and_recomputes_progress(self) -> None:
        user_id = uuid.uuid4()
        first_id, second_id = uuid.uuid4(), uuid.uuid4()
        goal = Goal(id=uuid.uuid4(), user_id=user_id, target_amount=10000,
                    target_date=date(2030, 1, 1), category="Education", funded_by=[])
        goal_query = MagicMock()
        goal_query.filter.return_value.with_for_update.return_value.first.return_value = goal
        holding_query = MagicMock()
        holding_query.filter.return_value.all.return_value = [(first_id,), (second_id,)]
        db = MagicMock()
        db.query.side_effect = [goal_query, holding_query]

        result = update_goal_funding(db, user_id, goal.id, [
            {"holding_id": first_id, "earmarked_amount": 1200},
            {"holding_id": second_id, "earmarked_amount": 800},
        ])

        self.assertEqual(result["progress"], 2000)
        self.assertEqual(len(result["funded_by"]), 2)
        db.commit.assert_called_once()


if __name__ == "__main__":
    unittest.main()


class GoalFundingApiTests(unittest.TestCase):
    def setUp(self) -> None:
        engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        Base.metadata.create_all(engine, tables=[Holding.__table__, Goal.__table__, GoalFunding.__table__])
        self.db = sessionmaker(bind=engine)()
        self.user_id = uuid.uuid4()
        self.other_user_id = uuid.uuid4()
        self.owned = Holding(user_id=self.user_id, product_type="fd_rd", alias="FD-1", characteristics={})
        self.other = Holding(user_id=self.other_user_id, product_type="fd_rd", alias="FD-2", characteristics={})
        self.db.add_all([self.owned, self.other])
        self.db.commit()

        def override_db():
            yield self.db

        app.dependency_overrides[get_db] = override_db
        self.client = authenticated_client(app, self.user_id)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        self.db.close()

    def create(self, funded_by: list[dict]) -> object:
        return self.client.post(f"/goals?user_id={self.user_id}", json={
            "target_amount": 10000,
            "target_date": "2030-01-01",
            "category": "Education",
            "funded_by": funded_by,
        })

    def test_create_persists_owned_funding_and_progress(self) -> None:
        response = self.create([{"holding_id": str(self.owned.id), "earmarked_amount": 1250.50}])
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["progress"], 1250.5)
        self.db.expire_all()
        saved = self.db.query(Goal).one()
        self.assertEqual(float(saved.funded_by[0].earmarked_amount), 1250.5)

    def test_update_and_clear_persist(self) -> None:
        goal_id = self.create([]).json()["id"]
        updated = self.client.put(f"/goals/{goal_id}/funding?user_id={self.user_id}", json={
            "funded_by": [{"holding_id": str(self.owned.id), "earmarked_amount": 800}],
        })
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["progress"], 800)
        cleared = self.client.put(f"/goals/{goal_id}/funding?user_id={self.user_id}", json={"funded_by": []})
        self.assertEqual(cleared.status_code, 200)
        self.assertEqual(cleared.json()["funded_by"], [])
        self.db.expire_all()
        self.assertEqual(self.db.query(Goal).one().funded_by, [])

    def test_cross_user_and_duplicate_links_return_422_without_persisting(self) -> None:
        cross = self.create([{"holding_id": str(self.other.id), "earmarked_amount": 100}])
        self.assertEqual(cross.status_code, 422)
        duplicate = self.create([
            {"holding_id": str(self.owned.id), "earmarked_amount": 100},
            {"holding_id": str(self.owned.id), "earmarked_amount": 200},
        ])
        self.assertEqual(duplicate.status_code, 422)
        self.assertEqual(self.db.query(Goal).count(), 0)

    def test_invalid_numeric_shapes_return_controlled_422(self) -> None:
        for amount in (0, -1, 1000000000000, 1.001):
            with self.subTest(amount=amount):
                response = self.create([{"holding_id": str(self.owned.id), "earmarked_amount": amount}])
                self.assertEqual(response.status_code, 422)
        self.assertEqual(self.db.query(Goal).count(), 0)
