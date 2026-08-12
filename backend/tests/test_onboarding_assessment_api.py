import unittest
import uuid
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app
from app.models import (
    OnboardingAssessment,
    OnboardingState,
    ProgressionDailyRollup,
    ProgressionEvent,
    ProgressionSummary,
)
from app.services.onboarding_assessment import (
    QUESTION_ORDER,
    answer_current_question,
    handle_assessment,
    start_assessment,
)


class OnboardingAssessmentApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(
            self.engine,
            tables=[
                OnboardingState.__table__,
                OnboardingAssessment.__table__,
                # BQ-071: these routes now emit progression. Created here so the
                # emitters are actually exercised rather than silently swallowed.
                ProgressionEvent.__table__,
                ProgressionDailyRollup.__table__,
                ProgressionSummary.__table__,
            ],
        )
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()
        self.user_id = uuid.uuid4()

        def override_db():
            yield self.db

        app.dependency_overrides[get_db] = override_db
        self.client = TestClient(app)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        self.db.close()

    def _path(self, suffix: str = "") -> str:
        return f"/onboarding-assessment{suffix}?user_id={self.user_id}"

    def test_read_is_non_creating_and_start_response_is_minimal(self) -> None:
        self.assertEqual(self.client.get(self._path()).status_code, 404)
        response = self.client.post(
            self._path("/start"), json={"eligibility_confirmed": True}
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["current_question"], "immediate_intent")
        self.assertIsNone(body["answers"]["exposure_flags"])
        self.assertIn("answers", body)
        self.assertNotIn("user_id", body)
        self.assertNotIn("eligibility_confirmed_at", body)

    def test_compatibility_grandfathers_any_legacy_state_without_inference(self) -> None:
        empty = self.client.get(self._path("/compatibility"))
        self.assertEqual(empty.status_code, 200)
        self.assertEqual(empty.json(), {"legacy_user": False})

        legacy = OnboardingState(
            user_id=self.user_id,
            track="fresh_starter",
            stage="intro",
            turns_in_stage=1,
        )
        self.db.add(legacy)
        self.db.commit()

        present = self.client.get(self._path("/compatibility"))
        self.assertEqual(present.json(), {"legacy_user": True})
        self.assertEqual(self.client.get(self._path()).status_code, 404)
        self.db.refresh(legacy)
        self.assertEqual(legacy.track, "fresh_starter")
        self.assertEqual(legacy.stage, "intro")

        legacy.stage = "complete"
        self.db.commit()
        complete = self.client.get(self._path("/compatibility"))
        self.assertEqual(complete.json(), {"legacy_user": True})
        self.db.refresh(legacy)
        self.assertEqual(legacy.track, "fresh_starter")
        self.assertEqual(legacy.stage, "complete")

    def test_invalid_and_stale_answers_have_stable_status_codes(self) -> None:
        self.client.post(self._path("/start"), json={"eligibility_confirmed": True})
        invalid = self.client.post(
            self._path("/answer"),
            json={"question": "immediate_intent", "value": "become_rich"},
        )
        self.assertEqual(invalid.status_code, 422)
        stale = self.client.post(
            self._path("/answer"),
            json={"question": "earning_context", "value": "student"},
        )
        self.assertEqual(stale.status_code, 409)
        self.assertNotIn("student", stale.text)

    def test_answering_the_assessment_awards_progression(self) -> None:
        # BQ-071 integration: the wired routes really do feed the ledger.
        self.client.post(self._path("/start"), json={"eligibility_confirmed": True})
        self.client.post(
            self._path("/answer"),
            json={"question": "immediate_intent", "value": "learn_basics"},
        )
        summary = self.client.get(f"/progression?user_id={self.user_id}").json()
        self.assertGreater(summary["points"], 0)

        events = self.client.get(f"/progression/history?user_id={self.user_id}").json()
        self.assertEqual(
            [e["event_type"] for e in events["events"]], ["context_prompt_handled"]
        )

    def test_skipping_earns_exactly_what_answering_earns(self) -> None:
        # D-117: disclosure is never rewarded over declining to disclose.
        self.client.post(self._path("/start"), json={"eligibility_confirmed": True})
        self.client.post(
            self._path("/skip"), json={"question": "immediate_intent"}
        )
        skipped = self.client.get(f"/progression?user_id={self.user_id}").json()

        other = uuid.uuid4()
        self.client.post(
            f"/onboarding-assessment/start?user_id={other}",
            json={"eligibility_confirmed": True},
        )
        self.client.post(
            f"/onboarding-assessment/answer?user_id={other}",
            json={"question": "immediate_intent", "value": "learn_basics"},
        )
        answered = self.client.get(f"/progression?user_id={other}").json()

        self.assertEqual(skipped["points"], answered["points"])

    def test_global_exit_still_earns_the_onboarding_milestone(self) -> None:
        # D-117: onboarding is handled whether prompts are answered, individually
        # skipped, or globally skipped.
        self.client.post(self._path("/start"), json={"eligibility_confirmed": True})
        self.client.post(self._path("/handle"))
        events = self.client.get(f"/progression/history?user_id={self.user_id}").json()
        self.assertIn(
            "onboarding_handled", [e["event_type"] for e in events["events"]]
        )

    def test_a_broken_ledger_never_breaks_the_assessment(self) -> None:
        # The fire-and-forget contract, at the route level.
        with patch(
            "app.services.progression.record_event",
            side_effect=RuntimeError("ledger down"),
        ):
            self.client.post(
                self._path("/start"), json={"eligibility_confirmed": True}
            )
            answered = self.client.post(
                self._path("/answer"),
                json={"question": "immediate_intent", "value": "learn_basics"},
            )
        self.assertEqual(answered.status_code, 200)
        self.assertEqual(answered.json()["answers"]["immediate_intent"], "learn_basics")

    @patch("app.main.classify_holding_capture")
    @patch("app.main.record_turn")
    @patch("app.main.build_onboarding_instruction")
    @patch("app.main.start_or_resume")
    @patch("app.main.classify_deepen")
    @patch("app.main.ask_teaching_engine")
    @patch("app.main.assemble_baseline")
    def test_assessment_routes_never_enter_chat_pipeline(
        self,
        assemble_baseline,
        ask_teaching_engine,
        classify_deepen,
        start_or_resume,
        build_onboarding_instruction,
        record_turn,
        classify_holding_capture,
    ) -> None:
        self.client.post(self._path("/start"), json={"eligibility_confirmed": True})
        self.client.post(
            self._path("/answer"),
            json={"question": "immediate_intent", "value": "learn_basics"},
        )
        self.client.post(
            self._path("/skip"), json={"question": "earning_context"}
        )
        self.client.post(self._path("/handle"))
        self.client.put(
            self._path("/context/familiarity"), json={"value": "foundations"}
        )
        clear = self.client.post(self._path("/clear"))
        self.assertEqual(clear.status_code, 200)
        self.assertNotIn("holding_proposal", clear.json())
        assemble_baseline.assert_not_called()
        ask_teaching_engine.assert_not_called()
        classify_deepen.assert_not_called()
        start_or_resume.assert_not_called()
        build_onboarding_instruction.assert_not_called()
        record_turn.assert_not_called()
        classify_holding_capture.assert_not_called()

    def test_eligibility_acknowledgement_requires_a_strict_boolean(self) -> None:
        response = self.client.post(
            self._path("/start"), json={"eligibility_confirmed": "yes"}
        )
        self.assertEqual(response.status_code, 422)
        self.assertEqual(
            self.db.query(OnboardingAssessment).filter_by(user_id=self.user_id).count(), 0
        )

    @patch("app.main.classify_holding_capture", return_value=None)
    @patch("app.main.classify_deepen", return_value=None)
    @patch("app.main.ask_teaching_engine", return_value="ok")
    @patch("app.main.assemble_baseline", return_value={"holdings": []})
    def test_chat_receives_only_derived_relevant_learning_context(
        self, assemble_baseline, ask_teaching_engine, classify_deepen, classify_holding_capture
    ) -> None:
        start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        answers = {
            "immediate_intent": "connect_picture",
            "earning_context": "early_earner",
            "responsibility_context": "dependents",
            "exposure_flags": ["borrowing", "saving"],
            "familiarity": "working_basics",
        }
        for question in QUESTION_ORDER:
            answer_current_question(
                self.db, self.user_id, question, answers[question]
            )

        response = self.client.post(
            f"/chat?user_id={self.user_id}",
            json={"question": "Explain this", "learning_topic": "borrowing"},
        )
        self.assertEqual(response.status_code, 200)
        sent_baseline = ask_teaching_engine.call_args.args[0]
        self.assertEqual(
            sent_baseline["learning_context"],
            {
                "explanation_style": "simple_first",
                "prior_exposure_to_current_topic": True,
            },
        )
        serialized = str(sent_baseline)
        self.assertNotIn("connect_picture", serialized)
        self.assertNotIn("early_earner", serialized)
        self.assertNotIn("dependents", serialized)
        self.assertNotIn("saving", serialized)

    @patch("app.main.classify_holding_capture", return_value=None)
    @patch("app.main.classify_deepen", return_value=None)
    @patch("app.main.ask_teaching_engine", return_value="ok")
    @patch("app.main.assemble_baseline", return_value={"holdings": []})
    def test_cleared_assessment_adds_no_learning_context(
        self, assemble_baseline, ask_teaching_engine, classify_deepen, classify_holding_capture
    ) -> None:
        start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        handle_assessment(self.db, self.user_id)
        self.client.post(self._path("/clear"))
        response = self.client.post(
            f"/chat?user_id={self.user_id}", json={"question": "Hello"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("learning_context", ask_teaching_engine.call_args.args[0])

    @patch("app.main.record_turn", return_value={"track": "fresh_starter", "stage": "complete"})
    @patch("app.main.build_onboarding_instruction", return_value={"track": "fresh_starter"})
    @patch("app.main.start_or_resume", return_value={"track": "fresh_starter"})
    @patch("app.main.classify_holding_capture", return_value=None)
    @patch("app.main.classify_deepen", return_value=None)
    @patch("app.main.ask_teaching_engine", return_value="ok")
    @patch("app.main.assemble_baseline", return_value={"holdings": []})
    def test_legacy_onboarding_does_not_receive_v2_learning_context(
        self,
        assemble_baseline,
        ask_teaching_engine,
        classify_deepen,
        classify_holding_capture,
        start_or_resume,
        build_onboarding_instruction,
        record_turn,
    ) -> None:
        start_assessment(self.db, self.user_id, eligibility_confirmed=True)
        handle_assessment(self.db, self.user_id)
        response = self.client.post(
            f"/chat?user_id={self.user_id}",
            json={"question": "Legacy", "onboarding": True},
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("learning_context", ask_teaching_engine.call_args.args[0])


if __name__ == "__main__":
    unittest.main()
