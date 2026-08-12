import unittest
import uuid
from unittest.mock import patch

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base
from app.models import ProgressionDailyRollup, ProgressionEvent, ProgressionSummary
from app.services.progression import (
    emit_safely,
    get_progression,
    record_arya_exchange,
    record_context_prompt,
    record_onboarding_handled,
)

# BQ-071 — the emitters that feed the ledger. The ledger's own award rules are covered
# in test_progression.py; what matters here is that emitters fire on the right trigger,
# key themselves correctly, and can never take down the feature that called them.


class EmitterTests(unittest.TestCase):
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
        self.db = sessionmaker(bind=engine)()
        self.user_id = uuid.uuid4()

    def tearDown(self) -> None:
        self.db.close()

    def events(self, event_type: str | None = None) -> list[ProgressionEvent]:
        rows = list(self.db.execute(select(ProgressionEvent)).scalars())
        if event_type:
            rows = [e for e in rows if e.event_type == event_type]
        return rows

    def points(self) -> int:
        summary = get_progression(self.db, self.user_id)
        return summary.displayed_points if summary else 0


class AryaEmitterTests(EmitterTests):
    def test_exchange_records_and_unlocks_the_capability(self) -> None:
        record_arya_exchange(self.db, self.user_id, "How does compounding work?")
        self.assertEqual(len(self.events("arya_exchange_completed")), 1)
        self.assertEqual(len(self.events("capability_first_used")), 1)
        # 8 for the exchange, 15 for first capability use, 10 for the return day.
        self.assertEqual(self.points(), 33)

    def test_empty_or_whitespace_question_records_nothing(self) -> None:
        record_arya_exchange(self.db, self.user_id, "")
        record_arya_exchange(self.db, self.user_id, "   ")
        self.assertEqual(self.events(), [])

    def test_identical_question_same_day_does_not_create_a_second_event(self) -> None:
        record_arya_exchange(self.db, self.user_id, "What is an ELSS?")
        record_arya_exchange(self.db, self.user_id, "  what is an ELSS?  ")
        # D-117: identical payloads, retries and refreshes do not create new events.
        # Case and surrounding whitespace do not make a question distinct.
        self.assertEqual(len(self.events("arya_exchange_completed")), 1)

    def test_different_questions_each_record(self) -> None:
        record_arya_exchange(self.db, self.user_id, "What is an ELSS?")
        record_arya_exchange(self.db, self.user_id, "What is an NPS?")
        self.assertEqual(len(self.events("arya_exchange_completed")), 2)

    def test_capability_is_awarded_only_once_across_many_exchanges(self) -> None:
        for i in range(4):
            record_arya_exchange(self.db, self.user_id, f"Question {i}?")
        self.assertEqual(len(self.events("capability_first_used")), 1)


class AssessmentEmitterTests(EmitterTests):
    def test_context_prompt_is_once_per_prompt(self) -> None:
        record_context_prompt(self.db, self.user_id, "assessment_v2:immediate_intent")
        record_context_prompt(self.db, self.user_id, "assessment_v2:immediate_intent")
        self.assertEqual(len(self.events("context_prompt_handled")), 1)

    def test_distinct_prompts_each_record(self) -> None:
        record_context_prompt(self.db, self.user_id, "assessment_v2:immediate_intent")
        record_context_prompt(self.db, self.user_id, "assessment_v2:familiarity")
        self.assertEqual(len(self.events("context_prompt_handled")), 2)

    def test_onboarding_handled_is_keyed_by_flow_version(self) -> None:
        record_onboarding_handled(self.db, self.user_id, flow_version=2)
        record_onboarding_handled(self.db, self.user_id, flow_version=2)
        events = self.events("onboarding_handled")
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0].idempotency_key, "onboarding_handled:v2")


class ResilienceTests(EmitterTests):
    def test_a_failing_emit_is_swallowed_not_raised(self) -> None:
        # The whole contract of emit_safely: a broken ledger must not become a broken
        # feature. A caller mid-request should never see this.
        with patch(
            "app.services.progression.record_event", side_effect=RuntimeError("boom")
        ):
            self.assertFalse(
                emit_safely(self.db, self.user_id, "arya_exchange_completed")
            )

    def test_a_failing_emit_leaves_the_session_usable(self) -> None:
        with patch(
            "app.services.progression.record_event", side_effect=RuntimeError("boom")
        ):
            emit_safely(self.db, self.user_id, "arya_exchange_completed")
        # The caller's session must still work afterwards.
        record_arya_exchange(self.db, self.user_id, "Still working?")
        self.assertEqual(len(self.events("arya_exchange_completed")), 1)

    def test_a_failure_before_the_write_is_also_contained(self) -> None:
        # Emitters do work around the write — hashing, reading the clock. That is
        # outside emit_safely's guard, so the emitters carry their own.
        with patch(
            "app.services.progression.local_date_for",
            side_effect=RuntimeError("clock exploded"),
        ):
            record_arya_exchange(self.db, self.user_id, "Does this still return?")
        self.assertEqual(self.events("arya_exchange_completed"), [])

    def test_an_invalid_emit_does_not_raise_through_the_helper(self) -> None:
        # A repeatable event with no idempotency_key is a programming error, but it
        # still must not surface as a 500 on the feature that triggered it.
        self.assertFalse(
            emit_safely(self.db, self.user_id, "arya_exchange_completed")
        )


if __name__ == "__main__":
    unittest.main()
