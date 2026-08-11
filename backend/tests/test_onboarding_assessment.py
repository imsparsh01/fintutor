import unittest
import uuid

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base
from app.models import OnboardingAssessment, OnboardingState
from app.services.onboarding_assessment import (
    QUESTION_ORDER,
    answer_current_question,
    clear_assessment,
    get_assessment,
    handle_assessment,
    skip_current_question,
    start_assessment,
    update_context,
)


class OnboardingAssessmentServiceTests(unittest.TestCase):
    def setUp(self) -> None:
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(
            engine, tables=[OnboardingState.__table__, OnboardingAssessment.__table__]
        )
        self.Session = sessionmaker(bind=engine)
        self.db = self.Session()
        self.user_id = uuid.uuid4()

    def tearDown(self) -> None:
        self.db.close()

    def test_requires_eligibility_acknowledgement(self) -> None:
        with self.assertRaisesRegex(ValueError, "eligibility"):
            start_assessment(self.db, self.user_id, eligibility_confirmed=False)
        self.assertIsNone(get_assessment(self.db, self.user_id))

    def test_start_is_versioned_and_idempotent(self) -> None:
        first = start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        resumed = start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        self.assertEqual(first["flow_version"], 2)
        self.assertEqual(first["current_question"], QUESTION_ORDER[0])
        self.assertEqual(first["eligibility_confirmed_at"], resumed["eligibility_confirmed_at"])

    def test_read_does_not_create_and_future_version_is_separate(self) -> None:
        self.assertIsNone(get_assessment(self.db, self.user_id))
        start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        future = start_assessment(
            self.db, self.user_id, eligibility_confirmed=True, flow_version=3
        )
        self.assertEqual(future["flow_version"], 3)
        self.assertEqual(
            self.db.query(OnboardingAssessment).filter_by(user_id=self.user_id).count(), 2
        )
        with self.assertRaisesRegex(ValueError, "positive"):
            start_assessment(
                self.db, uuid.uuid4(), eligibility_confirmed=True, flow_version=0
            )

    def test_answers_advance_in_order_and_finish(self) -> None:
        start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        answers = {
            "immediate_intent": "learn_basics",
            "earning_context": "student",
            "responsibility_context": "self",
            "exposure_flags": ["saving", "goals", "saving"],
            "familiarity": "foundations",
        }
        state = None
        for question in QUESTION_ORDER:
            state = answer_current_question(self.db, self.user_id, question, answers[question])
        assert state is not None
        self.assertEqual(state["status"], "handled")
        self.assertIsNone(state["current_question"])
        self.assertEqual(state["exposure_flags"], ["saving", "goals"])
        self.assertIsNotNone(state["handled_at"])
        self.assertEqual(state["handled_via"], "completed")

    def test_replayed_answer_is_idempotent(self) -> None:
        start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        first = answer_current_question(
            self.db, self.user_id, "immediate_intent", "learn_basics"
        )
        replayed = answer_current_question(
            self.db, self.user_id, "immediate_intent", "learn_basics"
        )
        self.assertEqual(first["current_question"], "earning_context")
        self.assertEqual(replayed["current_question"], "earning_context")
        with self.assertRaisesRegex(ValueError, "different value"):
            answer_current_question(
                self.db, self.user_id, "immediate_intent", "explore"
            )

    def test_rejects_out_of_order_or_unsupported_answers(self) -> None:
        start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        with self.assertRaisesRegex(ValueError, "expected answer"):
            answer_current_question(self.db, self.user_id, "earning_context", "student")
        with self.assertRaisesRegex(ValueError, "unsupported"):
            answer_current_question(self.db, self.user_id, "immediate_intent", "become_rich")

    def test_exclusive_exposure_values_cannot_be_combined(self) -> None:
        start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        for question in QUESTION_ORDER[:3]:
            skip_current_question(self.db, self.user_id, question)
        with self.assertRaisesRegex(ValueError, "cannot be combined"):
            answer_current_question(
                self.db, self.user_id, "exposure_flags", ["none", "investing"]
            )

    def test_global_handle_sets_every_unknown_axis_to_undisclosed(self) -> None:
        start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        state = handle_assessment(self.db, self.user_id)
        self.assertEqual(state["status"], "handled")
        self.assertEqual(state["immediate_intent"], "undisclosed")
        self.assertEqual(state["exposure_flags"], ["undisclosed"])
        self.assertEqual(state["handled_via"], "global_exit")
        replayed = handle_assessment(self.db, self.user_id)
        self.assertEqual(replayed["handled_at"], state["handled_at"])

    def test_clear_removes_context_but_keeps_eligibility_record(self) -> None:
        started = start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        handle_assessment(self.db, self.user_id)
        cleared = clear_assessment(self.db, self.user_id)
        self.assertEqual(cleared["status"], "handled")
        self.assertEqual(cleared["immediate_intent"], "undisclosed")
        self.assertEqual(cleared["exposure_flags"], ["undisclosed"])
        self.assertIsNotNone(cleared["cleared_at"])
        self.assertIsNotNone(cleared["handled_at"])
        self.assertEqual(
            cleared["eligibility_confirmed_at"], started["eligibility_confirmed_at"]
        )
        cleared_again = clear_assessment(self.db, self.user_id)
        self.assertEqual(cleared_again["cleared_at"], cleared["cleared_at"])

    def test_clear_in_progress_handles_without_forcing_redisclosure(self) -> None:
        start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        cleared = clear_assessment(self.db, self.user_id)
        self.assertEqual(cleared["status"], "handled")
        self.assertEqual(cleared["handled_via"], "global_exit")
        self.assertEqual(cleared["familiarity"], "undisclosed")

    def test_future_version_can_be_mutated_explicitly(self) -> None:
        start_assessment(
            self.db, self.user_id, eligibility_confirmed=True, flow_version=3
        )
        state = answer_current_question(
            self.db,
            self.user_id,
            "immediate_intent",
            "explore",
            flow_version=3,
        )
        self.assertEqual(state["flow_version"], 3)
        self.assertEqual(state["current_question"], "earning_context")

    def test_handled_context_can_be_changed_without_reopening(self) -> None:
        start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        handled = handle_assessment(self.db, self.user_id)
        updated = update_context(
            self.db, self.user_id, "familiarity", "working_basics"
        )
        self.assertEqual(updated["status"], "handled")
        self.assertEqual(updated["handled_at"], handled["handled_at"])
        self.assertEqual(updated["familiarity"], "working_basics")
        self.assertIsNone(updated["cleared_at"])

    def test_legacy_state_is_not_read_or_mutated(self) -> None:
        legacy = OnboardingState(
            user_id=self.user_id,
            track="fresh_starter",
            stage="sequencing",
            turns_in_stage=2,
        )
        self.db.add(legacy)
        self.db.commit()

        start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        handle_assessment(self.db, self.user_id)
        self.db.refresh(legacy)
        self.assertEqual(legacy.track, "fresh_starter")
        self.assertEqual(legacy.stage, "sequencing")
        self.assertEqual(legacy.turns_in_stage, 2)


if __name__ == "__main__":
    unittest.main()
