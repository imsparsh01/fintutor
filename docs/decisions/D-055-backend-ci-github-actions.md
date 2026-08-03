# D-055 — Add CI: GitHub Actions runs the backend pytest suite on push/PR

- **Tier:** Documenting a decision the owner made in conversation (CLAUDE.md's append-only lane).
  GitHub Actions is a new service per CLAUDE.md's hard-stop list ("introducing a new library,
  service, or architectural pattern that wasn't already decided"), so — same pattern as D-053 for
  pytest itself — it's logged here as the owner-confirmed decision it needed, rather than added
  silently. The owner was given three specific follow-on options (CI, a real-database/integration
  test strategy, re-running the Phase 1 prompt regression battery) and replied delegating the choice
  ("you decide... start working"); CI is the one of the three fully executable from this session (the
  other two either need a live Anthropic API call this sandbox is deliberately blocked from making,
  or a bigger, undecided test-infrastructure choice).
- **Decision:** `.github/workflows/backend-tests.yml` — runs `pytest -q` from `backend/` on every
  push and pull request that touches `backend/**` or the workflow file itself. `ubuntu-latest`,
  Python 3.11 (matching the version verified locally), installs from `requirements-dev.txt`.
- **Why this scope, not more:**
  - **No secrets required.** The suite added in D-053 deliberately needs no `DATABASE_URL` or
    `ANTHROPIC_API_KEY` — it fakes the DB session and never calls the LLM — so this workflow doesn't
    need to touch GitHub Secrets at all. Wiring up either credential in CI would be its own decision
    (storing a real DB/API credential in a shared CI environment) and is explicitly NOT what this
    does.
  - **Backend only.** `app/` (the Expo skeleton) has no test suite yet (a separate, already-flagged
    gap) — nothing exists for CI to run there. Not addressed by this pass.
  - **Does not attempt Phase 1 prompt testing.** `scripts/run_phase1_test.py` calls
    `api.anthropic.com` directly and is explicitly designed to run outside any sandboxed agent
    environment (its own docstring says so) — putting that in CI would require deciding to store the
    Anthropic API key as a repo secret, a separate decision with its own stakes, not assumed here.
- **Verified:** workflow YAML added; local `pytest -q` from `backend/` still passes 35/35 with the
  exact command the workflow runs. First real trigger will be this session's push — checked via the
  GitHub API after pushing (see session log for the run result).
- **Reversibility:** High — a single workflow file; deleting it fully reverts this.
- **Date:** 04-Aug-2026
