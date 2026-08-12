import copy
import re
import secrets
from dataclasses import dataclass, field


class UnsafeUserTextError(ValueError):
    pass


_RESERVED = "FTM_"
_INDIAN_INSTITUTIONS = [
    "HDFC Bank", "HDFC", "ICICI Bank", "ICICI", "State Bank of India", "SBI", "Axis Bank",
    "Kotak Mahindra Bank", "Kotak", "Punjab National Bank", "PNB", "Bank of Baroda",
    "Canara Bank", "IDFC First Bank", "Yes Bank", "IndusInd Bank", "LIC",
    "Life Insurance Corporation of India", "Bajaj Finance", "Tata Capital", "Aditya Birla Capital",
    "Aditya Birla Sun Life", "SBI Mutual Fund", "HDFC Mutual Fund", "ICICI Prudential",
    "Nippon India Mutual Fund", "Mirae Asset", "UTI Mutual Fund", "DSP Mutual Fund",
    "Bandhan Bank", "Federal Bank", "RBL Bank", "AU Small Finance Bank", "Muthoot Finance",
    "Shriram Finance", "Cholamandalam Finance", "Max Life Insurance", "HDFC Life",
    "SBI Life", "ICICI Lombard", "New India Assurance",
]
_STRUCTURED = [
    ("PAN", re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", re.I)),
    ("Email", re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)),
    ("Phone", re.compile(r"(?<!\d)(?:\+?91[- .]?)?[6-9](?:[- .]?\d){9}(?!\d)")),
    ("Card", re.compile(r"(?<!\d)\d(?:[ -]?\d){14,18}(?!\d)")),
    ("Aadhaar", re.compile(r"(?<!\d)\d{4}[ -]\d{4}[ -]\d{4}(?!\d)")),
    ("UPI", re.compile(r"\b[A-Z0-9._-]{2,}@[A-Z]{2,}\b", re.I)),
    ("Account", re.compile(r"\b(?:account|a/c|acct)\s*(?:no\.?|number|#)\s*[:.-]?\s*[A-Z0-9](?:[ -]?[A-Z0-9]){5,23}\b", re.I)),
    ("Policy", re.compile(r"\bpolicy\s*(?:no\.?|number|#)\s*[:.-]?\s*[A-Z0-9](?:[ -]?[A-Z0-9]){5,23}\b", re.I)),
    ("Customer", re.compile(r"\b(?:customer\s*id|customer\s*no\.?|CIF)\s*[:#.-]?\s*[A-Z0-9](?:[ -]?[A-Z0-9]){4,23}\b", re.I)),
]
_SUSPECT_LABEL = re.compile(r"\b(?:PAN|account|a/c|acct|policy|card|email|phone|mobile|UPI|CIF|customer\s*id|aadhaar)\b", re.I)
_SUSPECT_VALUE = re.compile(
    r"\b(?:PAN|account|a/c|acct|policy|card|email|phone|mobile|UPI|CIF|customer\s*id|aadhaar)\b"
    r"(?:\s+(?:no\.?|number|id|is))?\s*[:#.-]?\s*[A-Z0-9][A-Z0-9._@ -]{4,}", re.I
)
_SUSPECT_INSTITUTION = re.compile(
    r"\b(?:[A-Z][A-Za-z&.-]*\s+){1,3}(?:[Bb]ank|[Ii]nsurer|[Ii]nsurance|NBFC|[Ff]inance|[Ff]und)\b"
)
_GENERIC_FINANCE_PHRASES = re.compile(
    r"\b(?:bank loan|my bank|the bank|a bank|mutual fund|index fund|debt fund|insurance premium|"
    r"health insurance|term insurance|personal finance|finance concept|finance basics)\b", re.I
)


_NONCE_ATTEMPTS = 100


def _safe_nonce() -> str:
    """A nonce that cannot be matched by our own structured-identifier patterns.

    The namespace is embedded in every emitted token, and mask_text runs the structured
    patterns over text that ALREADY contains those tokens. A plain hex nonce can therefore
    carry a digit run that Phone (10 digits) or Card (15+) matches *inside* an existing
    token — wrapping a token in a second token, which the deliberately single-pass
    rehumanizer cannot restore. Those two are the live risk because they guard with
    (?<!\d)/(?!\d), which letters satisfy; the \b-anchored patterns cannot match inside a
    longer alphanumeric run at all. Underscore is not a valid separator in any of them, so
    a match can never cross the namespace boundary — containing the guarantee to the nonce
    itself is sufficient. We screen against every structured pattern regardless, so a
    future pattern without \b guards is covered on the day it is added.
    Same class of nested-token corruption the goal-label comment above guards against.
    """
    for _ in range(_NONCE_ATTEMPTS):
        nonce = secrets.token_hex(12)
        if not any(pattern.search(nonce) for _, pattern in _STRUCTURED):
            return nonce
    # Roughly a 1-in-10 rejection rate, so exhausting this is ~1e-100. Bounded rather than
    # `while True` so a degenerate entropy source fails closed instead of hanging the request.
    raise UnsafeUserTextError("Could not establish a safe privacy namespace. Please try again.")


@dataclass
class PrivacyEnvelope:
    nonce: str = field(default_factory=_safe_nonce)
    originals_to_tokens: dict[str, str] = field(default_factory=dict)
    tokens_to_originals: dict[str, str] = field(default_factory=dict)
    _counter: int = 0

    @classmethod
    def create(cls, inputs: list[str]) -> "PrivacyEnvelope":
        if any(_RESERVED in value for value in inputs):
            raise UnsafeUserTextError("Remove the reserved-looking token and rephrase your message.")
        while True:
            envelope = cls()
            if all(envelope.namespace not in value for value in inputs):
                return envelope

    @property
    def namespace(self) -> str:
        return f"{_RESERVED}{self.nonce}_"

    def token_for(self, original: str, kind: str) -> str:
        if original in self.originals_to_tokens:
            return self.originals_to_tokens[original]
        self._counter += 1
        token = f"{self.namespace}{kind}_{self._counter}"
        self.originals_to_tokens[original] = token
        self.tokens_to_originals[token] = original
        return token

    def register_entity(self, identifiers: list[str], visible_value: str, kind: str) -> str:
        existing = {self.originals_to_tokens[value] for value in identifiers if value in self.originals_to_tokens}
        if len(existing) > 1:
            raise UnsafeUserTextError("Conflicting local identity mapping; rephrase and try again.")
        if existing and any(value not in self.originals_to_tokens for value in identifiers):
            raise UnsafeUserTextError("Conflicting local identity mapping; rephrase and try again.")
        token = next(iter(existing), None)
        if token is None:
            self._counter += 1
            token = f"{self.namespace}{kind}_{self._counter}"
        self.tokens_to_originals[token] = visible_value
        for value in identifiers:
            prior = self.originals_to_tokens.get(value)
            if prior is not None and prior != token:
                raise UnsafeUserTextError("Conflicting local identity mapping; rephrase and try again.")
            self.originals_to_tokens[value] = token
        return token

    def mask_text(self, raw_text: str, identities: list[tuple[str, str]] = (), require_meaning: bool = True) -> str:
        if _RESERVED in raw_text:
            raise UnsafeUserTextError("Remove the reserved-looking token and rephrase your message.")
        text = raw_text
        for original, kind in sorted(identities, key=lambda item: len(item[0]), reverse=True):
            if not original:
                continue
            pattern = re.compile(rf"(?<!\w){re.escape(original)}(?!\w)", re.I)
            text = pattern.sub(self.token_for(original, kind), text)
        for institution in sorted(_INDIAN_INSTITUTIONS, key=len, reverse=True):
            pattern = re.compile(rf"(?<!\w){re.escape(institution)}(?!\w)", re.I)
            text = pattern.sub(lambda m: self.token_for(m.group(0), "Institution"), text)
        for kind, pattern in _STRUCTURED:
            text = pattern.sub(lambda m: self.token_for(m.group(0), kind), text)

        token_shape = re.escape(self.namespace) + r"[A-Za-z]+_\d+"
        scan = re.sub(
            r"\b(?:PAN|account|a/c|acct|policy|card|email|phone|mobile|UPI|CIF|customer\s*id|aadhaar)\b\s*(?:no\.?|number|id|is)?\s*[:#.-]?\s*"
            + token_shape,
            "",
            text,
            flags=re.I,
        )
        scan = re.sub(token_shape, "", scan)
        if _SUSPECT_VALUE.search(scan):
            raise UnsafeUserTextError("Remove or rephrase the account, policy, payment, contact, or identity detail and try again.")
        institution_scan = _GENERIC_FINANCE_PHRASES.sub("", scan)
        if _SUSPECT_INSTITUTION.search(institution_scan):
            raise UnsafeUserTextError("Refer to the institution generically and try again, for example 'my bank' or 'my insurer'.")
        if require_meaning and (not text.strip() or not re.search(r"[A-Za-z]", text)):
            raise UnsafeUserTextError("Rephrase without the private identifier so Arya has enough context to help.")
        return text

    def mask_baseline(self, baseline: dict, local_holdings: list[dict]) -> dict:
        masked = copy.deepcopy(baseline)
        holding_tokens: dict[str, str] = {}
        identities: list[tuple[str, str]] = []
        display_counts = {
            name: sum(1 for h in local_holdings if h.get("display_name") == name)
            for name in {h.get("display_name") for h in local_holdings if h.get("display_name")}
        }
        for holding in local_holdings:
            alias = holding.get("alias")
            display = holding.get("display_name")
            holding_id = str(holding.get("id"))
            identifiers = [value for value in (alias, holding_id) if value]
            if display and display_counts.get(display) == 1:
                identifiers.append(display)
            token = self.register_entity(identifiers, display or alias or holding_id, "Holding")
            holding_tokens[alias] = token
            identities.extend([(alias, "Holding"), (display, "HoldingName"), (holding_id, "HoldingId")])

        # Register the complete local goal label before recursively scanning its words.
        # Otherwise a label such as "ICICI Bank wedding" could become
        # "<institution-token> wedding" and then be wrapped in a second Goal token,
        # which cannot be restored by the deliberately single-pass rehumanizer.
        for goal in masked.get("goals", []):
            label = goal.get("goal")
            if isinstance(label, str) and label:
                self.token_for(label, "Goal")
                identities.append((label, "Goal"))

        def sanitize_value(value):
            if isinstance(value, dict):
                return {key: sanitize_value(item) for key, item in value.items()}
            if isinstance(value, list):
                return [sanitize_value(item) for item in value]
            if isinstance(value, str):
                if value in self.tokens_to_originals:
                    return value
                return self.mask_text(value, identities, require_meaning=False)
            return value

        masked = sanitize_value(masked)
        def existing_or_token(value, kind):
            if value in self.tokens_to_originals:
                return value
            return holding_tokens.get(value, self.token_for(str(value), kind))

        for holding in masked.get("holdings", []):
            holding["alias"] = existing_or_token(holding.get("alias"), "Holding")
        if "deepen" in masked:
            masked["deepen"]["alias"] = existing_or_token(masked["deepen"].get("alias"), "Holding")
        for goal in masked.get("goals", []):
            if isinstance(goal.get("goal"), str):
                goal["goal"] = goal["goal"] if goal["goal"] in self.tokens_to_originals else self.token_for(goal["goal"], "Goal")
            for funding in goal.get("currently_funded_by") or []:
                funding["alias"] = existing_or_token(funding.get("alias"), "Holding")
        return masked

    def rehumanize(self, response: str) -> str:
        if _RESERVED not in response:
            return response
        token_pattern = re.compile(re.escape(self.namespace) + r"[A-Za-z]+_\d+")
        seen = token_pattern.findall(response)
        residual = token_pattern.sub("", response)
        if _RESERVED in residual or any(token not in self.tokens_to_originals for token in seen):
            raise UnsafeUserTextError("Arya's response could not be safely restored. Please try again.")
        return token_pattern.sub(lambda m: self.tokens_to_originals[m.group(0)], response)


# Compatibility helper for focused local reconciliation; provider traffic uses PrivacyEnvelope.
def mask_user_text(raw_text: str, holdings: list[dict]):
    inputs = [raw_text] + [str(value) for h in holdings for value in h.values() if isinstance(value, str)]
    envelope = PrivacyEnvelope.create(inputs)
    identities = [(h.get("display_name"), "HoldingName") for h in holdings if h.get("display_name")]
    text = envelope.mask_text(raw_text, identities)
    return type("MaskedText", (), {"text": text, "replacements": envelope.tokens_to_originals, "rehumanize": envelope.rehumanize})()
