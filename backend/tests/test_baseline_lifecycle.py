import unittest
import uuid

from sqlalchemy import create_engine
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app
from app.models import DiscretionaryCategory, Goal, GoalFunding, Holding, Income
from tests.auth_helpers import authenticated_client


@compiles(JSONB, "sqlite")
def _compile_jsonb_as_json(_type, _compiler, **_kwargs):
    return "JSON"


class BaselineLifecycleApiTests(unittest.TestCase):
    def setUp(self) -> None:
        engine = create_engine(
            "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
        )
        Base.metadata.create_all(engine, tables=[
            Holding.__table__, Income.__table__, DiscretionaryCategory.__table__,
            Goal.__table__, GoalFunding.__table__,
        ])
        self.db = sessionmaker(bind=engine)()
        self.user_id = uuid.uuid4()
        self.other_user_id = uuid.uuid4()

        def override_db():
            yield self.db

        app.dependency_overrides[get_db] = override_db
        self.client = authenticated_client(app, self.user_id)
        self.other_client = authenticated_client(app, self.other_user_id)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        self.db.close()

    def test_income_source_edit_conflict_impact_and_delete(self) -> None:
        created = self.client.post("/income", json={"sources": [{
            "label": "Salary", "amount": 90000, "frequency": "monthly"
        }]}).json()
        source_id = created["sources"][0]["id"]
        self.assertEqual(created["version"], 1)

        impact = self.client.get(
            f"/income/{created['id']}/sources/{source_id}/deletion-impact"
        )
        self.assertEqual(impact.status_code, 200)
        self.assertEqual(impact.json()["affects"], ["computed_budget"])

        updated = self.client.patch(
            f"/income/{created['id']}/sources/{source_id}", json={
                "expected_version": 1,
                "source": {"label": "Salary", "amount": 95000, "frequency": "monthly"},
            }
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["version"], 2)
        self.assertEqual(updated.json()["sources"][0]["id"], source_id)

        stale = self.client.patch(
            f"/income/{created['id']}/sources/{source_id}", json={
                "expected_version": 1,
                "source": {"label": "Salary", "amount": 100000, "frequency": "monthly"},
            }
        )
        self.assertEqual(stale.status_code, 409)
        self.assertEqual(stale.json()["detail"]["current"]["version"], 2)
        self.assertEqual(stale.json()["detail"]["proposed"]["source"]["amount"], 100000)

        deleted = self.client.delete(
            f"/income/{created['id']}/sources/{source_id}?expected_version=2"
        )
        self.assertEqual(deleted.status_code, 200)
        self.assertEqual(deleted.json()["current"]["sources"], [])
        self.assertEqual(deleted.json()["current"]["version"], 3)

    def test_discretionary_edit_delete_and_cross_account_ownership(self) -> None:
        created = self.client.post("/discretionary-categories", json={
            "label": "Dining", "planned_amount": 5000
        }).json()
        cross = self.other_client.patch(
            f"/discretionary-categories/{created['id']}", json={
                "label": "Changed", "planned_amount": 1, "expected_version": 1,
            }
        )
        self.assertEqual(cross.status_code, 404)

        updated = self.client.patch(
            f"/discretionary-categories/{created['id']}", json={
                "label": "Meals", "planned_amount": 4500, "expected_version": 1,
            }
        )
        self.assertEqual(updated.json()["version"], 2)
        stale_delete = self.client.delete(
            f"/discretionary-categories/{created['id']}?expected_version=1"
        )
        self.assertEqual(stale_delete.status_code, 409)
        deleted = self.client.delete(
            f"/discretionary-categories/{created['id']}?expected_version=2"
        )
        self.assertEqual(deleted.status_code, 200)
        self.assertEqual(deleted.json()["impact"]["affects"], ["computed_budget"])

    def test_goal_edit_delete_funding_impact_and_stale_reconfirmation(self) -> None:
        holding = Holding(
            user_id=self.user_id, product_type="fd_rd", alias="FD-1",
            characteristics={"principal_or_monthly_amount": 100000}
        )
        self.db.add(holding)
        self.db.commit()
        created = self.client.post("/goals", json={
            "target_amount": 500000, "target_date": "2030-01-01", "category": "Education",
            "funded_by": [{"holding_id": str(holding.id), "earmarked_amount": 50000}],
        }).json()
        impact = self.client.get(f"/goals/{created['id']}/deletion-impact").json()
        self.assertEqual(impact["funding_links_removed"], 1)

        updated = self.client.patch(f"/goals/{created['id']}", json={
            "target_amount": 600000, "target_date": "2031-01-01", "category": "Education",
            "funded_by": [{"holding_id": str(holding.id), "earmarked_amount": 60000}],
            "expected_version": 1,
        })
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["version"], 2)
        self.assertEqual(updated.json()["target_amount"], 600000)

        stale = self.client.patch(f"/goals/{created['id']}", json={
            "target_amount": 700000, "target_date": "2032-01-01", "category": "Education",
            "funded_by": [], "expected_version": 1,
        })
        self.assertEqual(stale.status_code, 409)
        self.assertEqual(stale.json()["detail"]["current"]["target_amount"], 600000)
        self.assertEqual(stale.json()["detail"]["current"]["progress"], 60000)
        self.assertEqual(
            stale.json()["detail"]["current"]["progress_provenance"][0]["status"], "applied"
        )

        deleted = self.client.delete(f"/goals/{created['id']}?expected_version=2")
        self.assertEqual(deleted.status_code, 200)
        self.assertEqual(deleted.json()["impact"]["funding_links_removed"], 1)
        self.assertEqual(self.db.query(GoalFunding).count(), 0)


if __name__ == "__main__":
    unittest.main()
