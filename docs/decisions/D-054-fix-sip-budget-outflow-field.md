# D-054 — Fix compute_budget() SIP outflow field (owner-confirmed)

- **Tier:** Documenting a decision the owner made in conversation (CLAUDE.md's append-only lane) —
  this is a money-calculation change, hard-stop per CLAUDE.md regardless of how mechanical the fix
  looks, so it waited on explicit owner sign-off rather than being applied when the bug was first
  found (see D-053).
- **Decision:** `backend/app/services/budget.py`'s `compute_budget()` now reads a SIP-mode holding's
  monthly recurring outflow from `characteristics["monthly_sip_amount"]` instead of
  `characteristics["invested_amount"]`.
- **Why:** `invested_amount` is the cumulative total invested to date (consistent across all three
  fixtures and the D-013 field list already in this log — see the `invested_amount`/`current_value`
  entries for equity/debt mutual funds and stocks). Reading it as a monthly figure overstated a SIP
  holding's monthly outflow by roughly 36x for FIXTURE_user_01's Fund-A (₹288,000 vs. the correct
  ₹8,000). `monthly_sip_amount` is the field that actually represents the recurring monthly
  contribution.
- **How it was caught:** a unit test (BQ-015/D-053) encoding the already-decided D-013 field
  semantics failed against the existing implementation — not a new decision about what the fields
  mean, just the code not matching a semantics that was already settled.
- **Verified:** `pytest -q` from `backend/` — 35 passed, 0 failed (was 34/35 before this fix).
- **Reversibility:** High — single-line change, no migration, no stored data affected (this is a
  live/computed view, nothing persisted).
- **Date:** 04-Aug-2026
