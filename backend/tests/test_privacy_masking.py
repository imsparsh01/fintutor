import logging
import io
import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from tests.auth_helpers import authenticated_client

from app.db.session import get_db
from app.main import app

from app.services.privacy_masking import PrivacyEnvelope, UnsafeUserTextError, mask_user_text


class NonceSafetyTests(unittest.TestCase):
    """A nonce must never be matchable by our own structured-identifier patterns.

    Regression: secrets.token_hex could return a nonce containing a 10-digit run, which the
    Phone pattern then matched INSIDE an already-emitted token during the structured pass.
    That wrapped a token in a second token and defeated the single-pass rehumanizer, so the
    user saw raw FTM_ tokens instead of their own labels. Intermittent (~1 run in 6) because
    it depended entirely on the random nonce, so it survived several "all green" sessions.
    """

    def test_digit_heavy_nonce_cannot_corrupt_an_emitted_token(self):
        # A real observed failing nonce. Its 16-digit run 9811106076130572 is matched by Card
        # (Phone's trailing (?!\d) fails here); the other observed failure, cd3c7426338500...,
        # tripped Phone instead. Both patterns are live risks, hence screening all of them.
        # side_effect (not return_value) so the rejection can be followed by a usable nonce.
        with patch(
            "app.services.privacy_masking.secrets.token_hex",
            side_effect=["9811106076130572c26632b3", "aaccee" * 4],
        ):
            envelope = PrivacyEnvelope.create(["safe question"])
        self.assertNotIn("9811106076", envelope.nonce)

        # Reproduces the real path: mask_text tokenizes the identity first, THEN runs the
        # structured patterns over text that now contains the nonce. With the old hex nonce
        # the Phone pattern matched inside that fresh token and wrapped it in a second one.
        masked = envelope.mask_text(
            "tell me about Visible Bank", [("Visible Bank", "Holding")], require_meaning=False
        )
        self.assertEqual(masked.count("FTM_"), 1)
        self.assertEqual(envelope.rehumanize(masked), "tell me about Visible Bank")

    def test_nonces_matching_a_structured_pattern_are_rejected(self):
        # Phone and Card guard with (?<!\d)/(?!\d), which adjacent letters satisfy, so these
        # can match inside a longer nonce. \b-anchored patterns (PAN, Aadhaar) cannot, which
        # is why a PAN-shaped run inside a longer hex string is NOT a rejection case.
        for bad in ("9811106076130572c26632b3", "ab7426338500cdefabcdefab", "a1234567890123456789abc"):
            with patch("app.services.privacy_masking.secrets.token_hex", side_effect=[bad, "aaccee" * 4]):
                envelope = PrivacyEnvelope.create(["safe question"])
            self.assertEqual(envelope.nonce, "aaccee" * 4, f"{bad!r} should have been rejected")

    def test_a_clean_nonce_is_accepted_on_the_first_attempt(self):
        with patch("app.services.privacy_masking.secrets.token_hex", side_effect=["aaccee" * 4]):
            envelope = PrivacyEnvelope.create(["safe question"])
        self.assertEqual(envelope.nonce, "aaccee" * 4)


class PrivacyMaskingTests(unittest.TestCase):
    def test_masks_stored_and_new_institution_and_exactly_rehumanizes(self):
        masked = mask_user_text(
            "My HDFC Bank loan and ICICI card",
            [{"display_name": "HDFC Bank", "alias": "Home Loan-1"}],
        )
        self.assertNotIn("HDFC", masked.text)
        self.assertNotIn("ICICI", masked.text)
        self.assertNotIn("Home Loan-1", masked.text)
        institution_token = next(token for token, original in masked.replacements.items() if original == "ICICI")
        holding_token = next(token for token, original in masked.replacements.items() if original == "HDFC Bank")
        response = masked.rehumanize(f"{holding_token} and {institution_token}")
        self.assertEqual("HDFC Bank and ICICI", response)

    def test_reserved_token_injection_and_unknown_or_partial_output_fail_closed(self):
        with self.assertRaises(UnsafeUserTextError):
            PrivacyEnvelope.create(["please explain FTM_attack_1"])
        envelope = PrivacyEnvelope.create(["safe question"])
        token = envelope.token_for("Local name", "Holding")
        with self.assertRaises(UnsafeUserTextError):
            envelope.rehumanize(f"{token} {envelope.namespace}Holding_999")
        with self.assertRaises(UnsafeUserTextError):
            envelope.rehumanize(f"partial {envelope.namespace}")

    def test_tokens_are_one_to_one_and_duplicate_original_is_stable(self):
        envelope = PrivacyEnvelope.create(["safe"])
        first = envelope.token_for("same", "Holding")
        self.assertEqual(first, envelope.token_for("same", "Goal"))
        self.assertNotEqual(first, envelope.token_for("different", "Holding"))

    def test_holding_alias_and_uuid_share_entity_token_rehumanized_to_visible_name(self):
        envelope = PrivacyEnvelope.create(["safe", "Loan-A", "Visible Bank", "00000000-0000-0000-0000-000000000001"])
        token = envelope.register_entity(
            ["Loan-A", "Visible Bank", "00000000-0000-0000-0000-000000000001"],
            "Visible Bank",
            "Holding",
        )
        self.assertEqual(token, envelope.originals_to_tokens["Loan-A"])
        self.assertEqual("Visible Bank", envelope.rehumanize(token))

    def test_baseline_identity_references_are_single_tokens_not_nested_tokens(self):
        envelope = PrivacyEnvelope.create(["safe", "Loan-A", "Visible Bank"])
        local = [{"id": "00000000-0000-0000-0000-000000000001", "alias": "Loan-A", "display_name": "Visible Bank"}]
        masked = envelope.mask_baseline({
            "holdings": [{"alias": "Loan-A", "product_type": "home_loan"}],
            "deepen": {"alias": "Loan-A", "reason": "direct"},
            "goals": [{"goal": "Wedding", "currently_funded_by": [{"alias": "Loan-A"}]}],
        }, local)
        aliases = [masked["holdings"][0]["alias"], masked["deepen"]["alias"], masked["goals"][0]["currently_funded_by"][0]["alias"]]
        self.assertEqual(len(set(aliases)), 1)
        self.assertEqual(aliases[0].count("FTM_"), 1)
        self.assertEqual(masked["goals"][0]["goal"].count("FTM_"), 1)

    def test_generic_finance_language_passes_but_reviewed_variants_mask(self):
        generic = "Explain my bank loan, a mutual fund, insurance premium, and this finance concept"
        self.assertEqual(generic, PrivacyEnvelope.create([generic]).mask_text(generic))
        for reviewed in ["hdfc bank", "ICICI prudential", "sbi mutual fund", "muthoot finance"]:
            envelope = PrivacyEnvelope.create([reviewed])
            self.assertNotIn(reviewed.lower(), envelope.mask_text(reviewed).lower())

    def test_masks_structured_identifiers(self):
        raw = (
            "PAN ABCDE1234F account no 123456789012 policy no POL-123456 "
            "card 4111 1111 1111 1111 email me@example.com phone +91 9876543210"
        )
        masked = mask_user_text(raw, [])
        for secret in ["ABCDE1234F", "123456789012", "POL-123456", "4111", "me@example.com", "9876543210"]:
            self.assertNotIn(secret, masked.text)

    def test_suspected_unhandled_sensitive_identifier_fails_closed(self):
        with self.assertRaises(UnsafeUserTextError):
            mask_user_text("My account secretisABCDEF12345", [])
        with self.assertRaises(UnsafeUserTextError):
            mask_user_text("My Example Finance loan rate changed", [])

    @patch("app.services.teaching.anthropic.Anthropic")
    @patch("app.services.teaching.settings.anthropic_api_key", "test-key")
    def test_model_and_logs_receive_only_masked_text(self, anthropic_client):
        from app.services.teaching import ask_teaching_engine

        masked = mask_user_text("HDFC Bank account no 123456789", [])
        anthropic_client.return_value.messages.create.return_value = SimpleNamespace(
            content=[SimpleNamespace(type="text", text="Private-Institution-1")]
        )
        with self.assertLogs(level=logging.WARNING) as logs:
            logging.getLogger("privacy-test").warning("safe operation")
            answer = ask_teaching_engine({"holdings": []}, masked.text)
        sent = anthropic_client.return_value.messages.create.call_args.kwargs["messages"][0]["content"]
        self.assertNotIn("HDFC", sent)
        self.assertNotIn("123456789", sent)
        self.assertNotIn("HDFC", " ".join(logs.output))
        self.assertEqual(answer, "Private-Institution-1")

    @patch("app.main.record_turn", return_value={"track": "unclassified", "stage": "intro"})
    @patch("app.main.build_onboarding_instruction", return_value={"instruction": "safe"})
    @patch("app.main.start_or_resume", return_value=SimpleNamespace(track="unclassified", stage="intro"))
    @patch("app.main.classify_holding_capture", return_value=None)
    @patch("app.main.ask_teaching_engine", return_value="safe response")
    @patch("app.main.classify_deepen", return_value=None)
    @patch("app.main.assemble_baseline")
    @patch("app.main.list_holdings")
    def test_chat_route_masks_every_model_boundary_and_complete_baseline(
        self, list_holdings, assemble, deepen, teaching, capture, start, instruction, record
    ):
        user_id = uuid.uuid4()
        holding_id = uuid.uuid4()
        alias = "Malicious Alias Canary"
        display = "HDFC Bank Canary"
        goal = "Private Wedding Canary"
        local = [{"id": str(holding_id), "alias": alias, "display_name": display, "product_type": "home_loan", "characteristics": {}}]
        list_holdings.return_value = local
        assemble.return_value = {
            "baseline": {},
            "holdings": [{"alias": alias, "product_type": "home_loan", "note": "ICICI Bank"}],
            "goals": [{"goal": goal, "currently_funded_by": [{"alias": alias, "holding_id": str(holding_id)}]}],
        }
        app.dependency_overrides[get_db] = lambda: MagicMock()
        log_stream = io.StringIO()
        handler = logging.StreamHandler(log_stream)
        logging.getLogger().addHandler(handler)
        try:
            response = authenticated_client(app, uuid.UUID(int=1)).post(
                f"/chat?user_id={user_id}",
                json={"question": f"Tell me about {display}", "onboarding": True, "onboarding_last_ai_message": f"Earlier {display}"},
            )
        finally:
            logging.getLogger().removeHandler(handler)
            app.dependency_overrides.clear()
        self.assertEqual(response.status_code, 200)
        forbidden = [alias, display, goal, str(holding_id), "ICICI"]
        for mocked in [deepen, teaching, capture, start, instruction, record]:
            rendered = repr(mocked.call_args_list)
            for canary in forbidden:
                self.assertNotIn(canary, rendered)
        for canary in forbidden:
            self.assertNotIn(canary, log_stream.getvalue())

    @patch("app.main.record_arya_exchange")
    @patch("app.main.classify_holding_capture", return_value=None)
    @patch("app.main.classify_deepen", return_value=None)
    @patch("app.main.assemble_baseline")
    @patch("app.main.list_holdings")
    @patch("app.main.ask_teaching_engine")
    def test_chat_route_echo_rehumanizes_visible_labels_without_ftm_remnants(
        self, teaching, list_holdings, assemble, _deepen, _capture, _progress
    ):
        holding_id = str(uuid.uuid4())
        list_holdings.return_value = [{"id": holding_id, "alias": "Loan-A", "display_name": "Visible Bank", "product_type": "home_loan", "characteristics": {}}]
        assemble.return_value = {"baseline": {}, "holdings": [{"alias": "Loan-A", "product_type": "home_loan"}], "goals": [{"goal": "Wedding", "currently_funded_by": [{"alias": "Loan-A"}]}]}
        teaching.side_effect = lambda baseline, _question: f"{baseline['holdings'][0]['alias']} for {baseline['goals'][0]['goal']}"
        app.dependency_overrides[get_db] = lambda: MagicMock()
        try:
            response = authenticated_client(app, uuid.UUID(int=1)).post(f"/chat?user_id={uuid.uuid4()}", json={"question": "Explain Loan-A"})
        finally:
            app.dependency_overrides.clear()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["response"], "Visible Bank for Wedding")
        self.assertNotIn("FTM_", response.text)

    @patch("app.main.record_arya_exchange")
    @patch("app.main.classify_holding_capture", return_value=None)
    @patch("app.main.classify_deepen", return_value=None)
    @patch("app.main.list_holdings", return_value=[])
    @patch("app.main.assemble_baseline")
    @patch("app.main.ask_teaching_engine")
    def test_chat_route_echo_restores_full_institution_goal_label_once(
        self, teaching, assemble, _holdings, _deepen, _capture, _progress
    ):
        assemble.return_value = {
            "baseline": {},
            "holdings": [],
            "goals": [{"goal": "ICICI Bank wedding", "currently_funded_by": None}],
        }
        teaching.side_effect = lambda baseline, _question: baseline["goals"][0]["goal"]
        app.dependency_overrides[get_db] = lambda: MagicMock()
        try:
            response = authenticated_client(app, uuid.UUID(int=1)).post(
                f"/chat?user_id={uuid.uuid4()}", json={"question": "Explain my goal"}
            )
        finally:
            app.dependency_overrides.clear()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["response"], "ICICI Bank wedding")
        self.assertNotIn("FTM_", response.text)

    @patch("app.main.ask_teaching_engine")
    @patch("app.main.classify_deepen")
    @patch("app.main.classify_holding_capture")
    @patch("app.main.list_holdings")
    @patch("app.main.assemble_baseline")
    def test_baseline_masking_failures_are_422_before_any_model_call(
        self, assemble, list_holdings, capture, deepen, teaching
    ):
        cases = [
            ([{"id": str(uuid.uuid4()), "alias": "FTM_bad", "display_name": None, "product_type": "home_loan", "characteristics": {}}], {"holdings": [], "goals": []}),
            ([{"id": str(uuid.uuid4()), "alias": "Loan-A", "display_name": "FTM_bad", "product_type": "home_loan", "characteristics": {}}], {"holdings": [], "goals": []}),
            ([
                {"id": str(uuid.uuid4()), "alias": "Collision", "display_name": "First Bank", "product_type": "home_loan", "characteristics": {}},
                {"id": str(uuid.uuid4()), "alias": "Loan-B", "display_name": "Collision", "product_type": "home_loan", "characteristics": {}},
            ], {"holdings": [], "goals": []}),
        ]
        app.dependency_overrides[get_db] = lambda: MagicMock()
        try:
            for holdings, baseline in cases:
                list_holdings.return_value = holdings
                assemble.return_value = baseline
                response = authenticated_client(app, uuid.UUID(int=1)).post(f"/chat?user_id={uuid.uuid4()}", json={"question": "safe question"})
                self.assertEqual(response.status_code, 422)
        finally:
            app.dependency_overrides.clear()
        teaching.assert_not_called()
        deepen.assert_not_called()
        capture.assert_not_called()

    @patch("app.main.ask_teaching_engine")
    @patch("app.main.list_holdings")
    def test_malicious_reserved_alias_fails_before_model(self, list_holdings, teaching):
        list_holdings.return_value = [{"id": str(uuid.uuid4()), "alias": "FTM_injected", "display_name": None, "product_type": "home_loan", "characteristics": {}}]
        app.dependency_overrides[get_db] = lambda: MagicMock()
        try:
            response = authenticated_client(app, uuid.UUID(int=1)).post(f"/chat?user_id={uuid.uuid4()}", json={"question": "safe question"})
        finally:
            app.dependency_overrides.clear()
        self.assertEqual(response.status_code, 422)
        teaching.assert_not_called()


if __name__ == "__main__":
    unittest.main()
