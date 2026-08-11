# FinTutor — CEO Dashboard (source data)

> On-demand source for `docs/CEO_DASHBOARD.html` (D-042). All status below was re-derived from the live
> spec, decision logs, build queue/archive, TODOs, known limitations, feature PRDs, and source tree.

**Last synced:** 12-Aug-2026, through D-111. `main` is clean and synchronized with `origin/main` at the
start of this refresh. PROJECT_SPEC.md was not changed.

## Snapshot

- **Mission:** Teach personal finance from first principles using the user's context; never advise.
- **Phase:** MVP app/backend build is feature-complete for every queued item. Private testing has not begun.
- **Decisions indexed:** 109 entries through D-111 (the historical D-number gaps remain).
- **Source footprint:** 61 app TypeScript/TSX files; 37 backend/Alembic Python files.
- **Build queue:** READY empty; BLOCKED empty. BQ-058 and BQ-060 shipped today.
- **Latest product state:** five-tab app; Portfolio and Home restructures shipped; user-facing feature name
  is **Portfolio Health**; all four Home sub-scores deep-link into their mechanism detail.
- **Automated tests/CI:** no committed app tests, backend tests, Jest/Pytest configuration, or CI workflows.
- **Prompt:** v0.8; Phase-1 teaching-engine validation remains complete.

## Pending inventory

### Launch/security blockers — owner action required

1. **Data privacy policy (D-010):** decide LLM masking beyond product names, encryption expectations,
   retention, export, account deletion, and deletion propagation.
2. **Backend authorization boundary:** API routes trust a query-string `user_id`; they do not validate a
   Supabase JWT or enforce ownership. Decide the production auth contract before private beta.
3. **Legal review of D-009:** engage an India securities/fintech lawyer before public launch.
4. **Native pass:** real iOS/Android rendering and native Supabase authentication remain unverified.
5. **Deployment cleanup:** keep dev auth variables unset and replace localhost-only CORS with the actual
   deployment-origin policy before any non-dev/web deployment.

### Product/calculation decisions — owner action required

1. **80C inconsistency (trigger now met):** Portfolio Health excludes an insurance premium whose cadence
   is missing; Tax Saving Room can count it as monthly (12×). BQ-060 put Portfolio Health on Home, meeting
   D-109's explicit revisit trigger. Recommended direction: apply strict cadence handling in both places.
2. **Half-yearly premiums:** the form/display accepts them, but budget and Portfolio Health calculations
   ignore them. Approve adding the same six-month divisor to backend and frontend together.
3. **C-16/C-23 tax calculators:** concept and framing are approved, but D-105 specifies FY 2025-26. The
   current build date is FY 2026-27; owner must confirm the target tax year/rule-update policy before build.
4. **Baseline profile fields:** `dependents` and `emergency_fund_months` exist in the system prompt but not
   in schema/context. Needs a schema-home decision.
5. **Jest infrastructure:** approve `jest-expo` as a dev dependency before app unit tests are added.

### Build/evidence work — autonomous once selected or unblocked

1. Run a real native iOS/Android simulator/device QA pass.
2. Test onboarding's real skip → resume interaction.
3. Review/tighten model-generated per-stage onboarding guidance copy if the owner wants fixed wording.
4. Add app/backend automated tests and CI after the Jest dependency decision; first target is
   `computeSubScores()` plus API/budget/surfacing behavior.
5. Build the remaining calculator roadmap after sequencing and any calculation-specific decisions.

### Shipped limitations — evidence-triggered, not current blockers

- Loan-vs-invest omits prepayment/foreclosure charges.
- ESOP calculation does not subtract units already exercised.
- ELSS cannot be distinguished from a regular equity fund for 80C.
- Comparison-view auto-detection remains deferred until usage proves the explicit trigger is missed.
- A fuller tax-saving estimate using a self-reported bracket remains deferred pending usage evidence.
- Engagement/streak fit should be reviewed when real users exist.

### Parked/post-MVP scope

- Real estate, cash/bank, and alternatives holding families.
- General conversation memory; broad open-ended chat.
- Account Aggregator/bank import.
- Multi-user/social/sharing; RAG; fine-tuning; payments/subscriptions/monetization.
- Rent-vs-buy scenario (needs schema inputs) and exact XIRR (needs transaction dates).
- Broader execution-subagent capability beyond the already-authorized reskin use.

### Marketing/launch decisions

- Waitlist incentive and eventual pricing/monetization stance.
- Whether public materials prominently say “Powered by Claude/Anthropic.”
- Real metrics/social proof do not exist yet and must not be fabricated.
- Landing-page/privacy/terms copy must wait for the privacy and legal decisions above.

## Recommended sequence

1. Owner decides the two cadence/calculation items: 80C missing cadence and half-yearly premiums.
2. Owner defines D-010 privacy plus the backend JWT ownership boundary.
3. Codex runs the native QA pass and skip/resume onboarding test.
4. Owner confirms tax-year policy; Codex builds C-16/C-23 or the next non-tax calculator batch.
5. Approve Jest infrastructure; Codex adds tests and CI.
6. Schedule legal review, then begin private structured testing.

## Recent decisions

| ID | Date | Outcome |
|---|---|---|
| D-111 | 12-Aug | Home gets tappable 2×2 Portfolio Health grid; visible name changed from Health Score. |
| D-110 | 12-Aug | Portfolio and detail screen share a lightweight computed-health snapshot. |
| D-109 | 12-Aug | Missing insurance cadence is excluded from Portfolio Health 80C. |
| D-108 | 12-Aug | Scenario rates are user inputs; all data prefills remain editable. |
| D-107 | 11-Aug | gstack plan/review loop adopted; local installation is currently unavailable. |
| D-106 | 11-Aug | Five-tab nav, health formula, scenario batch, and category concentration decided. |

## Compliance pulse

- Phase-1 findings: 11 raised, 11 resolved; targeted Run 7 reconfirmed FINDING 8 clean.
- No product/security names may reach the LLM; no screen may recommend or style financial figures by
  valence.
- The next material compliance gates are privacy policy, API authorization, tax-year correctness, and
  external legal review.
