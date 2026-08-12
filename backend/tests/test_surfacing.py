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
        _holding(p) for p in product_types
    ]
    return db


class SurfacingTriggerTests(unittest.TestCase):
    """D-051/BQ-013: which product-type gaps become eligible candidates."""

    def test_no_holdings_surfaces_nothing(self) -> None:
        self.assertEqual(compute_surfacing_candidates(_db([]), USER_ID), [])

    def test_home_loan_without_term_insurance_surfaces_term_insurance(self) -> None:
        self.assertEqual(
            compute_surfacing_candidates(_db(["home_loan"]), USER_ID),
            [{"product_type": "term_insurance", "reason": "loan_without_life_cover"}],
        )

    def test_personal_loan_without_term_insurance_surfaces_term_insurance(self) -> None:
        self.assertEqual(
            compute_surfacing_candidates(_db(["personal_loan"]), USER_ID),
            [{"product_type": "term_insurance", "reason": "loan_without_life_cover"}],
        )

    def test_credit_card_debt_alone_is_not_a_trigger(self) -> None:
        self.assertEqual(compute_surfacing_candidates(_db(["credit_card_debt"]), USER_ID), [])

    def test_non_loan_holdings_do_not_trigger_anything(self) -> None:
        holdings = ["equity_mutual_fund", "debt_mutual_fund", "stocks", "fd_rd", "ppf_epf", "esop"]
        self.assertEqual(compute_surfacing_candidates(_db(holdings), USER_ID), [])

    def test_unknown_product_type_does_not_trigger_anything(self) -> None:
        self.assertEqual(compute_surfacing_candidates(_db(["savings_balance"]), USER_ID), [])


class SurfacingSuppressionTests(unittest.TestCase):
    """D-051: only the exact required-absent type suppresses a candidate."""

    def test_term_insurance_already_held_suppresses_the_candidate(self) -> None:
        self.assertEqual(
            compute_surfacing_candidates(_db(["home_loan", "term_insurance"]), USER_ID), []
        )

    def test_endowment_ulip_does_not_suppress_the_term_insurance_candidate(self) -> None:
        self.assertEqual(
            compute_surfacing_candidates(_db(["home_loan", "endowment_ulip"]), USER_ID),
            [{"product_type": "term_insurance", "reason": "loan_without_life_cover"}],
        )

    def test_unrelated_holdings_do_not_suppress_the_candidate(self) -> None:
        holdings = ["personal_loan", "stocks", "fd_rd", "credit_card_debt", "ppf_epf"]
        self.assertEqual(
            compute_surfacing_candidates(_db(holdings), USER_ID),
            [{"product_type": "term_insurance", "reason": "loan_without_life_cover"}],
        )


class SurfacingOutputShapeTests(unittest.TestCase):
    """The candidate list is deduplicated and carries no user-identifying detail."""

    def test_both_trigger_types_together_surface_the_candidate_only_once(self) -> None:
        result = compute_surfacing_candidates(_db(["home_loan", "personal_loan"]), USER_ID)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["product_type"], "term_insurance")

    def test_duplicate_holdings_of_a_trigger_type_surface_the_candidate_once(self) -> None:
        result = compute_surfacing_candidates(_db(["home_loan", "home_loan", "home_loan"]), USER_ID)

        self.assertEqual(len(result), 1)

    def test_candidate_carries_only_product_type_and_reason(self) -> None:
        result = compute_surfacing_candidates(_db(["home_loan"]), USER_ID)

        self.assertEqual(set(result[0]), {"product_type", "reason"})

    def test_computing_candidates_never_writes(self) -> None:
        db = _db(["home_loan"])
        compute_surfacing_candidates(db, USER_ID)

        db.add.assert_not_called()
        db.commit.assert_not_called()

    def test_holdings_are_queried_and_filtered_once(self) -> None:
        db = _db([])
        compute_surfacing_candidates(db, USER_ID)

        db.query.assert_called_once_with(Holding)
        db.query.return_value.filter.assert_called_once()


if __name__ == "__main__":
    unittest.main()
