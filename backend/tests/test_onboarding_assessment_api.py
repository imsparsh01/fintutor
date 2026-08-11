import unittest
import uuid
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app
from app.models import OnboardingAssessment
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
        Base.metadata.create_all(self.engine, tables=[OnboardingAssessment.__table__])
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
