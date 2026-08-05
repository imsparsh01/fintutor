# D-010 — Architectural aliasing: the LLM never sees real product/institution names; sensitive data is masked by design
- **Decision:** All user holdings (funds, stocks, insurance policies, and the institutions/companies behind
  them) are stored internally under an alias (e.g. "Fund-A", "Policy-3"). Every real characteristic of that
  holding — asset class, expense ratio, lock-in period, risk profile, historical behavior, etc. — is tracked
  normally against that alias. The Anthropic API is NEVER sent the real name — only the alias plus its
  characteristics. Separately, a broader data privacy policy governs what other sensitive user data (e.g.
  full legal name, PAN, phone, address) is masked before reaching the LLM vs. what's simply encrypted/
  protected at rest in the database.
- **Why:** D-009 already forbids the LLM from *outputting* a product name, but that's a prompt-level rule —
  it depends on the model correctly following instructions every time. If the real name is architecturally
  never sent to the LLM in the first place, an entire class of failure (prompt injection, model mistake,
  logging leak on Anthropic's side) is closed off rather than just discouraged. This turns a policy into a
  structural guarantee, which is a stronger compliance posture and a more defensible one if ever questioned.
  It also reduces the sensitivity of what's leaving your infrastructure at all, which matters independent of
  SEBI — it's good data-handling practice for any app holding real financial data.
- **Reversibility:** Medium-low once the alias table and backend resolution logic are built and the app's
  data model depends on it — but the underlying real data is still stored, just under a different key, so
  reversing the *masking* (if ever legally cleared to loosen) is more like exposing a lookup than a data
  migration.
- **Still to design (see Section 8 open items):** the alias-resolution methodology (how the backend maps a
  user's natural-language reference to the right internal record), what characteristics get tracked per
  product type, whether/how LLM output gets re-humanized for the user post-response, and the full data
  privacy policy (masking rules + at-rest protection + retention/deletion).
- **Date:** 23-Jul-2026
