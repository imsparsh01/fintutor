import unittest
import uuid
from datetime import date
from decimal import Decimal
from unittest.mock import MagicMock

from app.models import Goal, GoalFunding, Holding
from app.services.goal_progress import compute_goal_progress

USER_ID = uuid.uuid4()


def _holding(product_type: str, characteristics, *, holding_id=None) -> Holding:
    return Holding(
        id=holding_id or uuid.uuid4(), user_id=USER_ID, product_type=product_type,
        alias=f"{product_type}-1", display_name=None, characteristics=characteristics,
    )


def _goal(goal_id: uuid.UUID, links: list[tuple[uuid.UUID, str]]) -> Goal:
    return Goal(
        id=goal_id, user_id=USER_ID, target_amount=1000000,
        target_date=date(2030, 1, 1), category="Goal",
        funded_by=[GoalFunding(holding_id=holding_id, earmarked_amount=Decimal(amount))
                   for holding_id, amount in links],
    )


def _compute(goals: list[Goal], holdings: list[Holding]) -> dict:
    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = holdings
    return compute_goal_progress(db, USER_ID, goals)


class GoalProgressAllocationTests(unittest.TestCase):
    def test_approved_fixture_scales_once_across_goals(self) -> None:
        holding = _holding("stocks", {"current_value": 200000})
        first = _goal(uuid.UUID(int=1), [(holding.id, "150000")])
        second = _goal(uuid.UUID(int=2), [(holding.id, "100000")])

        result = _compute([second, first], [holding])

        self.assertEqual(result[first.id]["progress"], 120000)
        self.assertEqual(result[second.id]["progress"], 80000)
        self.assertEqual(sum(item["progress"] for item in result.values()), 200000)
        self.assertTrue(result[first.id]["progress_provenance"][0]["was_proportionally_adjusted"])

    def test_under_and_exact_allocation_keep_full_earmarks(self) -> None:
        holding = _holding("ppf_epf", {"current_balance": 80})
        first = _goal(uuid.UUID(int=1), [(holding.id, "30")])
        second = _goal(uuid.UUID(int=2), [(holding.id, "50")])
        result = _compute([first, second], [holding])
        self.assertEqual([result[first.id]["progress"], result[second.id]["progress"]], [30, 50])
        self.assertFalse(result[first.id]["progress_provenance"][0]["was_proportionally_adjusted"])

    def test_round_half_up_precedes_allocation(self) -> None:
        holding = _holding("stocks", {"current_value": "100.005"})
        goal = _goal(uuid.UUID(int=1), [(holding.id, "200")])
        result = _compute([goal], [holding])[goal.id]
        self.assertEqual(result["progress"], 100.01)
        self.assertEqual(result["progress_provenance"][0]["recorded_value"], "100.01")

    def test_huge_finite_value_does_not_overflow_decimal_currency_conversion(self) -> None:
        holding = _holding("stocks", {"current_value": "1e308"})
        goal = _goal(uuid.UUID(int=1), [(holding.id, "20")])
        result = _compute([goal], [holding])[goal.id]
        self.assertEqual(result["progress"], 20)
        self.assertTrue(result["progress_provenance"][0]["recorded_value"].endswith(".00"))

    def test_largest_remainder_tie_uses_stable_goal_id(self) -> None:
        holding = _holding("stocks", {"current_value": "0.01"})
        lower = _goal(uuid.UUID(int=1), [(holding.id, "1")])
        higher = _goal(uuid.UUID(int=2), [(holding.id, "1")])
        result = _compute([higher, lower], [holding])
        self.assertEqual(result[lower.id]["progress"], 0.01)
        self.assertEqual(result[higher.id]["progress"], 0.0)

    def test_multiple_holdings_allocate_independently_then_sum(self) -> None:
        first_holding = _holding("stocks", {"current_value": 100})
        second_holding = _holding("fd_rd", {"principal_or_monthly_amount": 50})
        goal = _goal(uuid.UUID(int=1), [(first_holding.id, "80"), (second_holding.id, "50")])
        result = _compute([goal], [second_holding, first_holding])[goal.id]
        self.assertEqual(result["progress"], 130)
        self.assertEqual(len(result["progress_provenance"]), 2)

    def test_value_decline_recomputes_without_persisting(self) -> None:
        holding = _holding("stocks", {"current_value": 100})
        first = _goal(uuid.UUID(int=1), [(holding.id, "60")])
        second = _goal(uuid.UUID(int=2), [(holding.id, "40")])
        self.assertEqual(_compute([first, second], [holding])[first.id]["progress"], 60)
        holding.characteristics["current_value"] = 40
        declined = _compute([first, second], [holding])
        self.assertEqual([declined[first.id]["progress"], declined[second.id]["progress"]], [24, 16])


class GoalProgressUnknownTests(unittest.TestCase):
    def test_missing_invalid_negative_and_excluded_are_partial_not_zero(self) -> None:
        cases = [
            ("stocks", {}, "valuation_missing"),
            ("stocks", {"current_value": "NaN"}, "valuation_invalid"),
            ("stocks", {"current_value": -1}, "valuation_negative"),
            ("home_loan", {"outstanding_balance": 100}, "product_type_excluded"),
            ("mystery", {"current_value": 100}, "product_type_unclassified"),
        ]
        for index, (product_type, characteristics, reason) in enumerate(cases, start=1):
            with self.subTest(reason=reason):
                holding = _holding(product_type, characteristics)
                goal = _goal(uuid.UUID(int=index), [(holding.id, "20")])
                result = _compute([goal], [holding])[goal.id]
                self.assertEqual(result["progress"], 0)
                self.assertTrue(result["progress_is_partial"])
                self.assertEqual(result["progress_status"], "partial")
                self.assertIsNone(result["progress_provenance"][0]["applied_amount"])
                self.assertEqual(result["progress_provenance"][0]["reason"], reason)
                if reason != "valuation_missing" and reason != "product_type_excluded" and reason != "product_type_unclassified":
                    self.assertIsNotNone(result["progress_provenance"][0]["recorded_value"])

    def test_real_zero_is_measured_and_not_partial(self) -> None:
        holding = _holding("stocks", {"current_value": 0})
        goal = _goal(uuid.UUID(int=1), [(holding.id, "20")])
        result = _compute([goal], [holding])[goal.id]
        self.assertEqual(result["progress"], 0)
        self.assertFalse(result["progress_is_partial"])
        self.assertEqual(result["progress_provenance"][0]["applied_amount"], 0)

    def test_known_and_unknown_sources_keep_known_total_but_mark_partial(self) -> None:
        known = _holding("stocks", {"current_value": 100})
        unknown = _holding("endowment_ulip", {})
        goal = _goal(uuid.UUID(int=1), [(known.id, "50"), (unknown.id, "20")])
        result = _compute([goal], [known, unknown])[goal.id]
        self.assertEqual(result["progress"], 50)
        self.assertTrue(result["progress_is_partial"])

    def test_no_links_is_measured_zero(self) -> None:
        goal = _goal(uuid.UUID(int=1), [])
        result = _compute([goal], [])[goal.id]
        self.assertEqual(result["progress"], 0)
        self.assertFalse(result["progress_is_partial"])

    def test_caller_supplied_cross_account_goal_is_not_projected(self) -> None:
        goal = _goal(uuid.UUID(int=1), [])
        goal.user_id = uuid.uuid4()
        self.assertEqual(_compute([goal], []), {})


if __name__ == "__main__":
    unittest.main()
