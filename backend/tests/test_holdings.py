import unittest
import uuid
from unittest.mock import MagicMock

from app.models import Holding
from app.services.holdings import create_holding, update_holding


class HoldingReconciliationStatusTests(unittest.TestCase):
    """BQ-073: CRUD responses name the operation that actually occurred."""

    def test_create_reports_new(self) -> None:
        db = MagicMock()
        result = create_holding(
            db,
            uuid.uuid4(),
            "home_loan",
            "Home Loan-1",
            None,
            {"interest_rate": 8.5},
        )

        self.assertEqual(result["reconciliation"]["status"], "new")
        db.add.assert_called_once()
        db.commit.assert_called_once()

    def test_update_reports_updated(self) -> None:
        holding = Holding(
            id=uuid.uuid4(),
            user_id=uuid.uuid4(),
            product_type="home_loan",
            alias="Home Loan-1",
            characteristics={"interest_rate": 8.5},
        )
        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = holding

        result = update_holding(
            db,
            holding.user_id,
            holding.id,
            None,
            None,
            None,
            {"interest_rate": 8.25},
        )

        self.assertEqual(result["reconciliation"]["status"], "updated")
        db.commit.assert_called_once()


if __name__ == "__main__":
    unittest.main()
