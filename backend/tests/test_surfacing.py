import unittest
import uuid
from unittest.mock import MagicMock

from app.models import Holding
from app.services.surfacing import compute_surfacing_candidates

USER_ID = uuid.uuid4()


def _holding(product_type: str) -> Holding:
    return Holding(
        id=uuid.uuid4(),
        user_id=USER_ID,
        product_type=product_type,
        alias=f"{product_type}-1",
        characteristics={},
    )


def _db(product_types: list[str]) -> MagicMock:
    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = [
        _holding(product_type) for product_type in product_types
    ]
    return db


class SurfacingPairingTests(unittest.TestCase):
    """D-145/BQ-093: bounded, deterministic educational pairing table."""

    def assert_candidate(self, held: str, expected: str) -> None:
        result = compute_surfacing_candidates(_db([held]), USER_ID)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["product_type"], expected)
        self.assertTrue(result[0]["reason"])
        self.assertTrue(result[0]["mechanism_difference"])

    def test_every_approved_direction(self) -> None:
        cases = (
            ("home_loan", "term_insurance"),
            ("personal_loan", "term_insurance"),
            ("endowment_ulip", "term_insurance"),
            ("term_insurance", "endowment_ulip"),
            ("esop", "stocks"),
            ("stocks", "equity_mutual_fund"),
            ("equity_mutual_fund", "debt_mutual_fund"),
            ("debt_mutual_fund", "fd_rd"),
            ("fd_rd", "ppf_epf"),
            ("ppf_epf", "fd_rd"),
        )
        for held, expected in cases:
            with self.subTest(held=held):
                self.assert_candidate(held, expected)

    def test_no_holdings_unknown_type_and_credit_card_surface_nothing(self) -> None:
        for held in ([], ["savings_balance"], ["credit_card_debt"]):
            with self.subTest(held=held):
                self.assertEqual(compute_surfacing_candidates(_db(held), USER_ID), [])

    def test_candidate_must_be_absent(self) -> None:
        held = ["home_loan", "term_insurance"]
        result = compute_surfacing_candidates(_db(held), USER_ID)
        self.assertNotIn(result[0]["product_type"], held)

    def test_endowment_does_not_suppress_loan_to_term_pair(self) -> None:
        result = compute_surfacing_candidates(
            _db(["home_loan", "endowment_ulip"]), USER_ID
        )
        self.assertEqual(result[0]["product_type"], "term_insurance")

    def test_fixed_precedence_returns_at_most_one_candidate(self) -> None:
        result = compute_surfacing_candidates(
            _db(["home_loan", "esop", "stocks", "debt_mutual_fund"]), USER_ID
        )
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["product_type"], "term_insurance")

    def test_no_pair_invents_borrowing_or_refinancing(self) -> None:
        for held in ("stocks", "equity_mutual_fund", "fd_rd", "ppf_epf"):
            result = compute_surfacing_candidates(_db([held]), USER_ID)
            self.assertNotIn(
                result[0]["product_type"],
                {"home_loan", "personal_loan", "credit_card_debt"},
            )

    def test_output_is_mechanism_only_not_advice(self) -> None:
        forbidden = {"need", "needed", "missing", "better", "safer", "suitable", "should", "buy"}
        for held in (
            "home_loan", "endowment_ulip", "term_insurance", "esop", "stocks",
            "equity_mutual_fund", "debt_mutual_fund", "fd_rd", "ppf_epf",
        ):
            candidate = compute_surfacing_candidates(_db([held]), USER_ID)[0]
            words = set(candidate["mechanism_difference"].lower().replace("-", " ").split())
            self.assertTrue(words.isdisjoint(forbidden), candidate)

    def test_service_is_read_only_and_scoped_to_user(self) -> None:
        db = _db(["home_loan"])
        compute_surfacing_candidates(db, USER_ID)

        db.query.assert_called_once_with(Holding)
        db.query.return_value.filter.assert_called_once()
        db.add.assert_not_called()
        db.commit.assert_not_called()


if __name__ == "__main__":
    unittest.main()
