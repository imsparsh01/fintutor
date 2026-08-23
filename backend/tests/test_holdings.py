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
        db.query.return_value.filter.return_value.with_for_update.return_value.first.return_value = holding

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


class TaxInputValidationTests(unittest.TestCase):
    def test_create_rejects_negative_annual_contribution(self) -> None:
        db = MagicMock()
        with self.assertRaisesRegex(ValueError, "annual_contribution"):
            create_holding(
                db, uuid.uuid4(), "ppf_epf", "PPF-1", None,
                {"annual_contribution": -1},
            )
        db.add.assert_not_called()

    def test_create_rejects_non_finite_premium(self) -> None:
        db = MagicMock()
        with self.assertRaisesRegex(ValueError, "premium"):
            create_holding(
                db, uuid.uuid4(), "term_insurance", "Term Insurance-1", None,
                {"premium": float("nan")},
            )
        db.add.assert_not_called()

    def test_update_rejects_negative_premium(self) -> None:
        holding = Holding(
            id=uuid.uuid4(), user_id=uuid.uuid4(), product_type="term_insurance",
            alias="Term Insurance-1", characteristics={"premium": 1000},
        )
        db = MagicMock()
        db.query.return_value.filter.return_value.with_for_update.return_value.first.return_value = holding
        with self.assertRaisesRegex(ValueError, "premium"):
            update_holding(
                db, holding.user_id, holding.id, None, None, None, {"premium": -1}
            )
        db.commit.assert_not_called()

    def test_recategorizing_revalidates_existing_characteristics(self) -> None:
        holding = Holding(
            id=uuid.uuid4(), user_id=uuid.uuid4(), product_type="stocks",
            alias="Holding-1", characteristics={"annual_contribution": -1},
        )
        db = MagicMock()
        db.query.return_value.filter.return_value.with_for_update.return_value.first.return_value = holding
        with self.assertRaisesRegex(ValueError, "annual_contribution"):
            update_holding(
                db, holding.user_id, holding.id, "ppf_epf", None, None, None
            )
        self.assertEqual(holding.product_type, "stocks")
        db.commit.assert_not_called()

    def test_unrelated_edit_does_not_block_on_a_legacy_invalid_value(self) -> None:
        holding = Holding(
            id=uuid.uuid4(), user_id=uuid.uuid4(), product_type="ppf_epf",
            alias="PPF-1", characteristics={"annual_contribution": -1},
        )
        db = MagicMock()
        db.query.return_value.filter.return_value.with_for_update.return_value.first.return_value = holding
        result = update_holding(
            db, holding.user_id, holding.id, None, "PPF renamed", None, None
        )
        self.assertEqual(result["alias"], "PPF renamed")
        db.commit.assert_called_once()


if __name__ == "__main__":
    unittest.main()
