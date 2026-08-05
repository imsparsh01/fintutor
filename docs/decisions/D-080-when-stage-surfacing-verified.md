### D-080 — D-051's WHEN-stage verification satisfied (Phase-1 Run 7); network-access assumption and a live dependency bug corrected

- **Tier:** 1 — running an already-designed test protocol (D-051's own stated precondition) and recording
  what happened. No trigger fires; no new decision made about product behavior. The network-access and
  dependency-bug corrections below are factual/technical, not product decisions.
- **What happened:** D-051 required re-verifying D-032's on-topic surfacing constraint before treating
  `known_gaps`-driven surfacing (already live in every `/chat` call via `assemble_baseline`) as validated.
  Ran Q7 (the exact FINDING 8 question) n=5 against the current prompt (`SYSTEM_PROMPT_v0_8_runnable.md`)
  and `FIXTURE_user_01.json`, live, via `scripts/run_phase1_test.py`. Full results:
  `docs/PHASE1_RUN7_RESULTS.md`.
- **Result: FINDING 8 does not reproduce, 0/5.** D-032's fix (§2 rule 3 tightened to on-topic-only) holds
  three prompt regenerations after it was last tested (v0.5→v0.8), including specifically for the
  unrecorded-holding (`known_gaps`) case D-051 was concerned about. **D-051's WHEN-stage precondition is
  now satisfied** — the surfacing mechanism already live in `baseline.py`/`compute_surfacing_candidates`
  (BQ-013) can be treated as verified, not merely provisional.
- **Correction to D-051's own text, recorded for the record (not a rewrite — D-051 is left as written):**
  D-051 describes D-032's original test scenario as "naming an already-held holding on an off-topic
  question." Re-reading `PHASE1_RUN3_RESULTS.md` and D-032 itself, FINDING 8 was actually about
  volunteering an **unrecorded** holding (the `known_gaps` term-insurance gap) on an off-topic question —
  the identical scenario D-051 was worried about, not a different one. This doesn't change D-051's
  conclusion (re-verification was still warranted, since the fix had never been re-run against the current
  prompt across three regenerations) but the stated reasoning should be read as corrected by this entry.

- **Standing assumption corrected: this environment CAN make live, authenticated Anthropic API calls.**
  Every prior session recorded (in `scripts/run_phase1_test.py`'s docstring and several `BUILD_QUEUE.md`
  entries) that "Cowork's sandbox blocks any outbound request to `api.anthropic.com` that carries an
  API-key header." That was never re-verified — this session checked it directly (`curl` to
  `api.anthropic.com` returned a genuine `401`, not a network-level failure; `anthropic.com` is explicitly
  allow-listed in this environment's egress proxy config) and found it **does not hold in this specific
  remote-execution environment** — network policy is configured per-environment, and this one permits
  direct egress to Anthropic's own domain. The owner provided a real `ANTHROPIC_API_KEY` this session
  (written to the gitignored repo-root `.env`, confirmed never staged/committed, never echoed in any
  output) enabling Run 7 above to be executed directly from inside this session for the first time. Future
  sessions should verify this assumption for their own environment rather than assume it either way —
  it may differ by how the environment was configured.
- **`scripts/run_phase1_test.py`'s docstring updated** to reflect this is environment-dependent rather than
  a blanket claim, mechanical documentation fix, not a behavior change to the script itself.

- **A real, previously-undetected dependency bug was caught and fixed in the same process:**
  `backend/requirements.txt` pinned `anthropic==0.39.0`, whose base HTTP client passes a `proxies` kwarg
  that `httpx>=0.28.0` removed — instantiating the real client crashes immediately. No prior backend
  verification caught this because every one mocked the Anthropic client rather than actually instantiating
  it (confirmed by checking: `deepen_classifier`, `holding_capture_classifier`, and `teaching.py` were all
  only ever unit-tested against a mocked `anthropic.Anthropic`). **This means the deployed backend, as
  pinned before this fix, would have crashed on its first real `/chat`, `deepen`, or holding-capture call**
  — not a hypothetical, reproduced directly this session before the fix and resolved after it. Fixed by
  pinning `httpx<0.28` alongside the existing `anthropic` pin in `requirements.txt`. Mechanical bug fix
  (Tier 1, same class as BQ-038's disclosed fixes) — no new library introduced, no architectural change.
- **Reversibility:** High — the verification result and the two corrections are all either documentation or
  a dependency version pin; no schema or committed behavior depends on this entry.
- **Date:** 05-Aug-2026
