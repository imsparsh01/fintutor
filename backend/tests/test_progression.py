import unittest
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base
from app.models import ProgressionDailyRollup, ProgressionEvent, ProgressionSummary
from app.services.progression import (
    ProgressionValidationError,
    delete_progression,
    get_progression,
    grant_onboarding_credit,
    list_history,
    local_date_for,
    prune_raw_events,
    rebuild,
    record_event,
    to_api_summary,
)
from app.services.progression_ruleset import (
    DAILY_REPEATABLE_CAP,
    EVENT_RULES,
    RULESET_VERSION,
    expanding_milestones,
    resolve_stage,
    unmet_conditions,
)

# 12:00 IST — comfortably inside one Asia/Kolkata day, so a test that adds hours does
# not silently cross the boundary.
NOON_IST = datetime(2026, 8, 12, 6, 30, tzinfo=timezone.utc)


class ProgressionTestBase(unittest.TestCase):
    def setUp(self) -> None:
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(
            engine,
            tables=[
                ProgressionEvent.__table__,
                ProgressionDailyRollup.__table__,
                ProgressionSummary.__table__,
            ],
        )
        self.Session = sessionmaker(bind=engine)
        self.db = self.Session()
        self.user_id = uuid.uuid4()

    def tearDown(self) -> None:
        self.db.close()

    def emit(
        self,
        event_type: str,
        *,
        subject_key: str | None = None,
        at: datetime | None = None,
        key: str | None = None,
    ) -> dict:
        rule = EVENT_RULES[event_type]
        if key is None and not rule.once_per_subject:
            key = f"{event_type}:{subject_key}:{(at or NOON_IST).isoformat()}"
        return record_event(
            self.db,
            self.user_id,
            event_type,
            subject_key=subject_key,
            occurred_at=at or NOON_IST,
            idempotency_key=key,
        )

    def points(self) -> int:
        summary = get_progression(self.db, self.user_id)
        return summary.displayed_points if summary else 0


class DayBoundaryTests(ProgressionTestBase):
    def test_local_date_uses_india_time_not_utc(self) -> None:
        # 20:00 UTC on the 11th is 01:30 IST on the 12th — the whole point of not
        # using UTC day boundaries.
        late_utc = datetime(2026, 8, 11, 20, 0, tzinfo=timezone.utc)
        self.assertEqual(local_date_for(late_utc).isoformat(), "2026-08-12")

    def test_naive_datetime_is_treated_as_utc(self) -> None:
        naive = datetime(2026, 8, 11, 20, 0)
        aware = datetime(2026, 8, 11, 20, 0, tzinfo=timezone.utc)
        self.assertEqual(local_date_for(naive), local_date_for(aware))

    def test_late_night_session_stays_on_one_day(self) -> None:
        # 23:00 and 23:59 IST on the same evening must share a day — under UTC they
        # would split, handing the user a second 60-point cap.
        first = datetime(2026, 8, 12, 17, 30, tzinfo=timezone.utc)  # 23:00 IST
        second = datetime(2026, 8, 12, 18, 25, tzinfo=timezone.utc)  # 23:55 IST
        self.assertEqual(local_date_for(first), local_date_for(second))


class EventRecordingTests(ProgressionTestBase):
    def test_unknown_event_type_is_rejected(self) -> None:
        with self.assertRaises(ProgressionValidationError):
            record_event(self.db, self.user_id, "definitely_not_an_event")

    def test_derived_return_day_cannot_be_recorded_directly(self) -> None:
        # It is computed from the day's own activity; accepting it would let a caller
        # mint return days at will.
        with self.assertRaises(ProgressionValidationError):
            record_event(self.db, self.user_id, "meaningful_return_day")

    def test_subject_required_where_a_per_subject_rule_exists(self) -> None:
        with self.assertRaises(ProgressionValidationError):
            record_event(self.db, self.user_id, "teaching_moment_explored")

    def test_repeatable_event_requires_explicit_idempotency_key(self) -> None:
        with self.assertRaises(ProgressionValidationError):
            record_event(self.db, self.user_id, "arya_exchange_completed")

    def test_duplicate_is_absorbed_not_double_counted(self) -> None:
        first = self.emit("teaching_moment_explored", subject_key="compounding")
        self.assertTrue(first["recorded"])
        again = self.emit("teaching_moment_explored", subject_key="compounding")
        self.assertFalse(again["recorded"])
        # 10 for the subject, plus the 10-point return day that qualifying Explore
        # activity earns.
        self.assertEqual(self.points(), 20)
        rows = self.db.execute(select(ProgressionEvent)).scalars().all()
        self.assertEqual(len(rows), 1)

    def test_ledger_never_stores_a_point_value(self) -> None:
        self.emit("teaching_moment_explored", subject_key="compounding")
        event = self.db.execute(select(ProgressionEvent)).scalar_one()
        columns = set(event.__table__.columns.keys())
        self.assertNotIn("points", columns)
        self.assertNotIn("dimension", columns)


class AwardRuleTests(ProgressionTestBase):
    def test_teaching_subject_awards_once_ever(self) -> None:
        self.emit("teaching_moment_explored", subject_key="compounding")
        self.emit(
            "teaching_moment_explored",
            subject_key="compounding",
            at=NOON_IST + timedelta(days=30),
        )
        # Only the first day awards: the subject is spent, and day 30 has no other
        # qualifying activity to earn a return day with.
        self.assertEqual(self.points(), 20)
        # The later attempt *is* recorded — its key is day-scoped, so the ledger keeps
        # an honest record that it happened. Suppressing the award is replay's job, not
        # the unique constraint's.
        rows = self.db.execute(select(ProgressionEvent)).scalars().all()
        self.assertEqual(len(rows), 2)

    def test_distinct_subjects_each_award(self) -> None:
        self.emit("teaching_moment_explored", subject_key="compounding")
        self.emit("teaching_moment_explored", subject_key="inflation")
        # 10 + 10, plus the derived return day for a qualifying Explore day.
        self.assertEqual(self.points(), 30)

    def test_arya_caps_at_three_per_day(self) -> None:
        for i in range(5):
            self.emit("arya_exchange_completed", at=NOON_IST, key=f"turn-{i}")
        # 3 × 8 = 24, plus the 10-point return day.
        self.assertEqual(self.points(), 34)

    def test_calculator_limited_per_type_and_across_types_per_day(self) -> None:
        for i in range(3):
            self.emit("calculator_completed", subject_key="tax", key=f"tax-{i}")
        # Same type twice in a day awards once.
        self.assertEqual(self.points(), 12 + 10)
        self.emit("calculator_completed", subject_key="loan", key="loan-0")
        self.emit("calculator_completed", subject_key="esop", key="esop-0")
        # Two across calculators per day is the ceiling — the third type earns nothing.
        self.assertEqual(self.points(), 24 + 10)

    def test_scenario_limited_per_type_and_across_types_per_day(self) -> None:
        for i in range(3):
            self.emit("scenario_completed", subject_key="idle_cash", key=f"idle-{i}")
        # Re-running or reopening one type awards once, independent of its values/outcome.
        self.assertEqual(self.points(), 15 + 10)
        self.emit("scenario_completed", subject_key="debt_cost", key="debt-0")
        self.emit("scenario_completed", subject_key="term_household_support", key="term-0")
        # A second type awards; the third type is recorded but earns nothing that day.
        self.assertEqual(self.points(), 30 + 10)

    def test_revisit_requires_seven_days_after_first_exploration(self) -> None:
        self.emit("teaching_moment_explored", subject_key="compounding")
        baseline = self.points()

        too_soon = NOON_IST + timedelta(days=6)
        self.emit("teaching_moment_revisited", subject_key="compounding", at=too_soon)
        self.assertEqual(self.points(), baseline)

        on_time = NOON_IST + timedelta(days=7)
        self.emit("teaching_moment_revisited", subject_key="compounding", at=on_time)
        # 5 for the revisit, plus a return day for that new qualifying day.
        self.assertEqual(self.points(), baseline + 15)

    def test_revisit_without_a_prior_exploration_never_awards(self) -> None:
        self.emit("teaching_moment_revisited", subject_key="never-seen")
        self.assertEqual(self.points(), 0)

    def test_recap_awards_once_per_rolling_seven_days(self) -> None:
        self.emit("recap_completed", at=NOON_IST, key="recap-1")
        first = self.points()
        self.emit("recap_completed", at=NOON_IST + timedelta(days=6), key="recap-2")
        # Inside the rolling window: the recap itself does not award. The day still has
        # no other qualifying activity, so nothing at all is earned.
        self.assertEqual(self.points(), first)
        self.emit("recap_completed", at=NOON_IST + timedelta(days=7), key="recap-3")
        self.assertEqual(self.points(), first + 8 + 10)

    def test_milestones_are_exempt_from_the_daily_cap(self) -> None:
        for i in range(8):
            self.emit("arya_exchange_completed", key=f"turn-{i}")
        capped = self.points()
        self.emit("onboarding_handled", subject_key="v2")
        self.assertEqual(self.points(), capped + 40)

    def test_repeatable_events_respect_the_daily_cap(self) -> None:
        for subject in ("a", "b", "c", "d", "e", "f", "g", "h"):
            self.emit("teaching_moment_explored", subject_key=subject)
        for i in range(4):
            self.emit("arya_exchange_completed", key=f"turn-{i}")
        summary = get_progression(self.db, self.user_id)
        rollup = self.db.execute(select(ProgressionDailyRollup)).scalar_one()
        self.assertLessEqual(rollup.points_awarded, DAILY_REPEATABLE_CAP)
        self.assertLessEqual(summary.displayed_points, DAILY_REPEATABLE_CAP)

    def test_capped_day_does_not_burn_a_once_ever_award(self) -> None:
        # Crowd the day to within 6 points of the cap (3 Arya = 24, 2 scenarios = 30),
        # then explore a new subject. The 10-point award does not fit, so it must not
        # award *and* must not consume the subject — it has to still be earnable
        # tomorrow rather than silently spent for nothing.
        for i in range(3):
            self.emit("arya_exchange_completed", key=f"turn-{i}")
        self.emit("scenario_completed", subject_key="retire", key="sc-1")
        self.emit("scenario_completed", subject_key="salary", key="sc-2")
        self.emit("teaching_moment_explored", subject_key="compounding")

        crowded = self.points()
        self.assertEqual(crowded, 54)
        self.assertLessEqual(crowded, DAILY_REPEATABLE_CAP)

        self.emit(
            "teaching_moment_explored",
            subject_key="compounding",
            at=NOON_IST + timedelta(days=1),
        )
        # Full value the next day: 10 for the subject, 10 for that day's return award.
        self.assertEqual(self.points(), crowded + 20)

    def test_return_day_requires_qualifying_activity_not_just_a_milestone(self) -> None:
        self.emit("onboarding_handled", subject_key="v2")
        summary = get_progression(self.db, self.user_id)
        # Onboarding is a Milestone: it neither counts for breadth nor earns a return day.
        self.assertEqual(summary.return_days, 0)
        self.assertEqual(summary.displayed_points, 40)
        self.assertEqual(summary.active_dimensions, [])

    def test_return_day_awards_once_per_day(self) -> None:
        self.emit("teaching_moment_explored", subject_key="a")
        self.emit("teaching_moment_explored", subject_key="b")
        summary = get_progression(self.db, self.user_id)
        self.assertEqual(summary.return_days, 1)

    def test_return_days_accumulate_across_days(self) -> None:
        for day in range(3):
            self.emit(
                "arya_exchange_completed",
                at=NOON_IST + timedelta(days=day),
                key=f"turn-{day}",
            )
        summary = get_progression(self.db, self.user_id)
        self.assertEqual(summary.return_days, 3)


class StageTests(ProgressionTestBase):
    def test_stage_floors_require_all_three_conditions(self) -> None:
        # Points alone are not enough for Exploring: breadth and return days also gate it.
        self.assertEqual(resolve_stage(500, 1, 0).name, "discovering")
        self.assertEqual(resolve_stage(100, 2, 2).name, "exploring")
        self.assertEqual(resolve_stage(300, 3, 5).name, "connecting")
        self.assertEqual(resolve_stage(650, 4, 12).name, "deepening")
        self.assertEqual(resolve_stage(1100, 4, 25).name, "expanding")

    def test_unmet_conditions_name_what_is_missing(self) -> None:
        gaps = unmet_conditions(100, 1, 0)
        self.assertEqual(gaps, {"dimensions": 1, "return_days": 2})
        self.assertEqual(unmet_conditions(1100, 4, 25), {})

    def test_expanding_milestones_count_past_the_top_floor(self) -> None:
        self.assertEqual(expanding_milestones(1099), 0)
        self.assertEqual(expanding_milestones(1100), 0)
        self.assertEqual(expanding_milestones(1350), 1)
        self.assertEqual(expanding_milestones(1600), 2)

    def test_onboarding_alone_cannot_satisfy_breadth(self) -> None:
        self.emit("onboarding_handled", subject_key="v2")
        summary = get_progression(self.db, self.user_id)
        self.assertNotIn("milestone", summary.active_dimensions)


class RebuildTests(ProgressionTestBase):
    def _busy_history(self) -> None:
        for day in range(4):
            at = NOON_IST + timedelta(days=day)
            self.emit("teaching_moment_explored", subject_key=f"subject-{day}", at=at)
            self.emit("calculator_completed", subject_key="tax", at=at, key=f"tax-{day}")
            self.emit("arya_exchange_completed", at=at, key=f"turn-{day}")

    def test_rebuild_is_idempotent(self) -> None:
        self._busy_history()
        before = to_api_summary(get_progression(self.db, self.user_id))
        for _ in range(3):
            rebuild(self.db, self.user_id)
        after = to_api_summary(get_progression(self.db, self.user_id))
        self.assertEqual(before, after)

    def test_rebuild_does_not_read_the_wall_clock(self) -> None:
        # Events dated far in the past must replay to the same totals as they did when
        # recorded — any now()-dependent window would break this.
        old = NOON_IST - timedelta(days=900)
        self.emit("teaching_moment_explored", subject_key="compounding", at=old)
        self.emit("arya_exchange_completed", at=old, key="turn-old")
        first = to_api_summary(get_progression(self.db, self.user_id))
        rebuild(self.db, self.user_id)
        self.assertEqual(first, to_api_summary(get_progression(self.db, self.user_id)))

    def test_rollups_match_the_replayed_days(self) -> None:
        self._busy_history()
        rollups = self.db.execute(select(ProgressionDailyRollup)).scalars().all()
        summary = get_progression(self.db, self.user_id)
        self.assertEqual(len(rollups), 4)
        self.assertEqual(sum(r.points_awarded for r in rollups), summary.lifetime_points)
        self.assertTrue(all(r.ruleset_version == RULESET_VERSION for r in rollups))

    def test_displayed_points_never_decrease_under_a_downward_retune(self) -> None:
        self._busy_history()
        summary = get_progression(self.db, self.user_id)
        earned = summary.displayed_points
        self.assertGreater(earned, 0)

        # Simulate a retune that halves every value: replay produces less, the user
        # still sees the high-water mark.
        original = {name: rule.points for name, rule in EVENT_RULES.items()}
        try:
            for name, rule in EVENT_RULES.items():
                object.__setattr__(rule, "points", original[name] // 2)
            rebuilt = rebuild(self.db, self.user_id)
        finally:
            for name, rule in EVENT_RULES.items():
                object.__setattr__(rule, "points", original[name])

        self.assertLess(rebuilt.lifetime_points, earned)
        self.assertEqual(rebuilt.displayed_points, earned)
        self.assertEqual(rebuilt.displayed_points_floor, earned)

    def test_stage_never_regresses(self) -> None:
        summary = get_progression(self.db, self.user_id)
        self.emit("onboarding_handled", subject_key="v2")
        summary = get_progression(self.db, self.user_id)
        summary.stage_floor_index = 2  # pretend they reached Connecting
        summary.stage = "connecting"
        self.db.commit()

        rebuilt = rebuild(self.db, self.user_id)
        self.assertEqual(rebuilt.stage, "connecting")

    def test_floored_stage_gates_target_the_stage_after_the_floor(self) -> None:
        self.emit("onboarding_handled", subject_key="v2")
        summary = get_progression(self.db, self.user_id)
        summary.stage_floor_index = 2
        summary.stage = "connecting"
        self.db.commit()

        payload = to_api_summary(summary)
        self.assertEqual(payload["next_stage"], "deepening")
        self.assertEqual(payload["unmet_conditions"]["points"], 610)
        self.assertEqual(payload["unmet_conditions"]["dimensions"], 4)
        self.assertEqual(payload["unmet_conditions"]["return_days"], 12)

    def test_api_summary_hides_raw_lifetime_points(self) -> None:
        self._busy_history()
        payload = to_api_summary(get_progression(self.db, self.user_id))
        self.assertNotIn("lifetime_points", payload)
        self.assertIn("points", payload)

    def test_api_summary_for_a_user_with_no_events(self) -> None:
        payload = to_api_summary(get_progression(self.db, self.user_id))
        self.assertEqual(payload["stage"], "discovering")
        self.assertEqual(payload["points"], 0)
        self.assertEqual(payload["next_stage"], "exploring")
        self.assertIsNone(payload["last_event_at"])
        self.assertEqual(
            payload["stage_progress"],
            {"start": 0, "end": 100, "value": 0, "fraction": 0.0},
        )

    def test_api_summary_owns_stage_progress_bounds(self) -> None:
        self.emit("onboarding_handled", subject_key="v2")
        payload = to_api_summary(get_progression(self.db, self.user_id))
        self.assertEqual(payload["stage_progress"]["start"], 0)
        self.assertEqual(payload["stage_progress"]["end"], 100)
        self.assertEqual(payload["stage_progress"]["value"], 40)
        self.assertEqual(payload["stage_progress"]["fraction"], 0.4)


class OnboardingCreditTests(ProgressionTestBase):
    def test_grandfathered_credit_is_granted_once(self) -> None:
        first = grant_onboarding_credit(self.db, self.user_id)
        second = grant_onboarding_credit(self.db, self.user_id)
        self.assertTrue(first["recorded"])
        self.assertFalse(second["recorded"])
        self.assertEqual(self.points(), 40)

    def test_credit_is_keyed_by_flow_version(self) -> None:
        grant_onboarding_credit(self.db, self.user_id, flow_version=2)
        event = self.db.execute(select(ProgressionEvent)).scalar_one()
        self.assertEqual(event.idempotency_key, "onboarding_handled:v2")


class RetentionTests(ProgressionTestBase):
    def test_pruning_drops_raw_events_but_preserves_the_score(self) -> None:
        old = NOON_IST - timedelta(days=500)
        self.emit("teaching_moment_explored", subject_key="compounding", at=old)
        self.emit("arya_exchange_completed", at=old, key="turn-old")
        self.emit("teaching_moment_explored", subject_key="inflation", at=NOON_IST)
        before = to_api_summary(get_progression(self.db, self.user_id))

        deleted = prune_raw_events(
            self.db, self.user_id, today=local_date_for(NOON_IST)
        )
        self.assertEqual(deleted, 2)

        after = to_api_summary(get_progression(self.db, self.user_id))
        self.assertEqual(before["points"], after["points"])
        self.assertEqual(before["return_days"], after["return_days"])
        self.assertEqual(before["active_dimensions"], after["active_dimensions"])

    def test_frozen_days_survive_a_later_rebuild(self) -> None:
        old = NOON_IST - timedelta(days=500)
        self.emit("teaching_moment_explored", subject_key="compounding", at=old)
        self.emit("arya_exchange_completed", at=old, key="turn-old")
        prune_raw_events(self.db, self.user_id, today=local_date_for(NOON_IST))
        pruned_state = to_api_summary(get_progression(self.db, self.user_id))

        rebuild(self.db, self.user_id)
        self.assertEqual(
            pruned_state, to_api_summary(get_progression(self.db, self.user_id))
        )

    def test_once_ever_awards_are_not_reissued_after_pruning(self) -> None:
        old = NOON_IST - timedelta(days=500)
        self.emit("teaching_moment_explored", subject_key="compounding", at=old)
        prune_raw_events(self.db, self.user_id, today=local_date_for(NOON_IST))
        after_prune = self.points()

        # The raw event is gone, but the frozen rollup remembers the consumed key, so
        # exploring the same subject again earns only the day's return award.
        self.emit("teaching_moment_explored", subject_key="compounding", at=NOON_IST)
        self.assertEqual(self.points(), after_prune)

    def test_recent_events_are_not_pruned(self) -> None:
        self.emit("teaching_moment_explored", subject_key="compounding")
        deleted = prune_raw_events(
            self.db, self.user_id, today=local_date_for(NOON_IST)
        )
        self.assertEqual(deleted, 0)
        self.assertEqual(len(self.db.execute(select(ProgressionEvent)).scalars().all()), 1)


class VisibilityAndDeletionTests(ProgressionTestBase):
    def test_history_is_newest_first_and_names_the_dimension(self) -> None:
        self.emit("teaching_moment_explored", subject_key="compounding")
        self.emit(
            "calculator_completed",
            subject_key="tax",
            at=NOON_IST + timedelta(hours=1),
            key="tax-1",
        )
        history = list_history(self.db, self.user_id)
        self.assertEqual(history[0]["event_type"], "calculator_completed")
        self.assertEqual(history[0]["dimension"], "model")
        self.assertEqual(history[1]["event_type"], "teaching_moment_explored")

    def test_history_excludes_events_that_did_not_award(self) -> None:
        for index in range(3):
            self.emit(
                "calculator_completed",
                subject_key=f"calculator-{index}",
                at=NOON_IST + timedelta(minutes=index),
                key=f"calculator-{index}",
            )
        history = list_history(self.db, self.user_id)
        self.assertEqual(len(history), 2)
        self.assertNotIn("calculator-2", {event["subject_key"] for event in history})

    def test_account_deletion_removes_all_three_tiers(self) -> None:
        self.emit("teaching_moment_explored", subject_key="compounding")
        delete_progression(self.db, self.user_id)
        for model in (ProgressionEvent, ProgressionDailyRollup, ProgressionSummary):
            self.assertEqual(self.db.execute(select(model)).scalars().all(), [])

    def test_one_users_events_never_affect_another(self) -> None:
        other = uuid.uuid4()
        self.emit("teaching_moment_explored", subject_key="compounding")
        record_event(
            self.db,
            other,
            "teaching_moment_explored",
            subject_key="compounding",
            occurred_at=NOON_IST,
        )
        mine = get_progression(self.db, self.user_id)
        theirs = get_progression(self.db, other)
        self.assertEqual(mine.displayed_points, theirs.displayed_points)
        self.assertEqual(mine.displayed_points, 20)


if __name__ == "__main__":
    unittest.main()
