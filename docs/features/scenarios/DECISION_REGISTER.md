# Scenario suite decision register and owner briefs

**Status:** Two reversible UX/IA forks resolved autonomously under Tier 2. Money, advice-boundary,
financial-data/privacy and schema/API forks remain Tier 3 and block BQ-133.

## Autonomous decision O-SC-2 — taxonomy and discovery

- **Tier:** 2 — REVIEW-FLAGGED because it interprets the approved suite hierarchy.
- **Decision:** Tools uses the user-facing category **Scenarios** for the five dedicated scenarios. The four
  focused explorers use action copy such as “Explore this mechanism” from their relevant record/context and
  are not duplicated as context-free Tools cards. Internal documentation may retain “focused explorer”; the
  user does not need a third product taxonomy label.
- **Lenses:** Compliance PASS — equal-order contextual actions create no urgency, product naming or ranking;
  Product PASS — the distinction follows entry purpose rather than quality; Technical PASS — existing routes
  remain contextual; Cost-and-scope PASS — no duplicate flows or index machinery.
- **Why:** A third catalogue category teaches product architecture rather than financial mechanism. Contextual
  entry preserves eligibility, source authorship and exact return destination while Tools remains the complete
  home of broadly usable scenarios.
- **Reversibility:** Copy/routing presentation only; no stored data, schema or calculation changes.

## Autonomous decision O-SC-3 — changed-input result treatment

- **Tier:** 2.
- **Decision:** Any dependent input edit immediately removes the prior numeric/component result and replaces
  it with a compact neutral state: **“Inputs changed — run again to see a result for these values.”** The prior
  result cannot be announced, handed off or rewarded.
- **Lenses:** Compliance PASS — no advice/legal reinterpretation; Product PASS — visible inputs always own the
  visible result; Technical PASS — simpler and safer than retaining a disabled stale result; Cost-and-scope
  PASS — bounded component-state behavior.
- **Why:** A warning cannot fully undo the authority of a still-visible financial number. Removal makes the
  current-versus-stale distinction unambiguous and directly enforces the PRD's authorship principle.
- **Reversibility:** In-memory UI behavior only; no persistence or calculation change.

## Tier-3 brief O-SC-1 — What is S-07 called?

- **Trigger fired:** standing teach-never-advise principle; “Inaction tax” can frame one path as a loss.
- **Question:** retain **Inaction tax** or use mechanism-first **Idle cash over time**?
- **Path A — Inaction tax:** memorable and consistent with older D-106 wording; rhetorically valenced and may
  imply failure to act despite neutral arithmetic.
- **Path B — Idle cash over time:** states the mechanism without verdict; less vivid but consistent with the
  shipped label and neutral comparison contract.
- **What only the owner can judge:** acceptable rhetorical force at the teach/advice boundary.
- **Rule extraction:** labels that pre-judge a financial path require the same scrutiny as result verdicts.
- **Team recommendation:** Path B, **Idle cash over time**. It describes the mechanism without pre-judging a
  user's existing choice and is already the shipped neutral label.

## Autonomous decision O-SC-14 — Arya handoff applicability

- **Tier:** 2; logged as D-169.
- **Decision:** Show “Explore the mechanism with Arya” only for a current result with an approved bounded
  mechanism prompt. Hide it for invalid, changed/stale, capped, permission-loss, tax-gated and unavailable
  states. It remains secondary and opens exact-payload confirmation.
- **Why:** Handoff applicability follows teaching value, never the financial outcome, and avoids a chat funnel.

## Tier-3 brief O-SC-4 — What numeric domain is supported?

- **Trigger fired:** money calculations users may rely on.
- **Question:** which explicit rupee/rate/horizon ceilings govern S-01/S-02/S-03/S-06/S-07 before finite math?
- **Path A — uniform conservative caps:** simple and predictable but rejects some legitimate large cases.
- **Path B — formula-specific caps:** broader valid domain tied to numerical stability; more rules to explain,
  test and maintain.
- **Path C — runtime safe-integer/finite rejection only:** least arbitrary, but poor pre-run guidance and a weak
  promise about supported inputs.
- **What only the owner can judge:** acceptable product domain and reliance boundary.
- **Rule extraction:** every personal-money model declares supported numeric domain before rendering results.
- **Code evidence:** current Scenario functions have no declared caps and can return non-finite results; S-01
  can mistake overflowed infinity for target reached. Existing calculator caps are precedent, not authority.
- **Team recommendation:** Path B. Define separate ceilings for rupee inputs, rates, periods, units and derived
  outputs; reject every unsafe intermediate/output before render. Do not silently reuse another calculator's domain.

## Tier-3 brief O-SC-5 — Is zero additional SIP valid?

- **Trigger fired:** money-calculation semantics.
- **Path A:** accept zero and show equal paths, teaching that unchanged input produces unchanged outcome.
- **Path B:** require greater than zero because the tool's stated action is an increase.
- **What only the owner can judge:** equality teaching value versus semantic strictness.
- **Code evidence:** current production requires `extraSip > 0` but fails to reject every malformed/negative
  companion input consistently.
- **Team recommendation:** Path B. Preserve the stated “increase” mechanism; test equality through S-07 and
  other explicit comparison fixtures rather than turning no change into a successful increase.

## Tier-3 brief O-SC-6 — Does S-02 support a zero-rate loan?

- **Trigger fired:** financial-model eligibility and formula semantics.
- **Path A:** define `remaining_months = P/E`, tenure reduction `X/E`, new EMI `(P-X)/remaining_months`, and
  zero interest-saved/hurdle outputs while preserving `0 < X < P`.
- **Path B:** require a positive rate and explain the explorer is unavailable for this record.
- **What only the owner can judge:** completeness versus the intended break-even mechanism boundary.
- **Code evidence:** current backend and tests reject zero/non-positive loan rates; the logarithmic tenure
  formula is undefined at zero.
- **Team recommendation:** Path B. A zero-rate loan has no interest-versus-alternative hurdle, so it falls
  outside this explorer's approved mechanism and avoids adding a second model.

## Tier-3 brief O-SC-7 — What debt periods and types are eligible?

- **Trigger fired:** money formula normalization and financial-product eligibility.
- **Path A:** positive integer months only; home/personal loans only under the existing fixed-amortisation model.
- **Path B:** accept fractional months with an explicit rounding rule and/or add credit-card debt after defining
  repayment assumptions; broader but transforms user input and changes model meaning.
- **What only the owner can judge:** whether convenience/breadth justifies transformed periods or a new debt model.
- **Code evidence:** current client silently rounds months and includes credit-card debt, while the backend S-02
  precedent restricts fixed-amortisation modeling to home/personal loans.
- **Team recommendation:** Path A: positive integer monthly instalments and home/personal loans only. Never
  transform fractional input silently; revolving credit-card payoff belongs to its existing dedicated calculator.

## Tier-3 brief O-SC-8 — What freshness can the suite promise?

- **Trigger fired:** financial-data provenance and low-reversibility API/schema enrichment.
- **Path A:** promise retrieval time and available record version only; never label a value current/fresh.
- **Path B:** enrich APIs/schema with authoritative update/component provenance.
- **Path C:** prototype Path A now and decide enrichment only in production reconciliation.
- **What only the owner can judge:** limited honest assurance versus added persistent/API authority.
- **Team recommendation:** Path C operationally with Path A as permanent wording. Use available record version
  plus retrieval time, say “Freshness unavailable,” and add no timestamp schema in the prototype phase.

## Tier-3 production follow-up briefs

### O-SC-9A — S-02 request privacy

- **Trigger fired:** financial-data privacy.
- **Path A:** move selection/prepayment from GET query to an authenticated POST body.
- **Path B:** exchange selection for an opaque short-lived token before calculation.
- **Owner judgment:** log-exposure reduction versus recovery/deep-link and implementation complexity.
- **Code evidence:** current frontend and GET route put both holding ID and prepayment amount in the URL.
- **Team recommendation:** Path A: authenticated POST body. It removes sensitive values from URL surfaces
  without token state/expiry machinery and preserves server-side owned-record refetch.

### O-SC-9B — ESOP provenance authority

- **Trigger fired:** financial-data handling/API contract.
- **Path A:** backend response carries authoritative record ID/version, source fields and retrieval time; absent
  update time is explicit and never described as current/fresh.
- **Path B:** client joins owned-record metadata to the calculation response.
- **Owner judgment:** single backend authority versus client coordination/race risk.
- **Team recommendation:** Path A using existing holding version, with no schema migration. Client joining can
  label a result from version N+1 with stale metadata from version N.

### O-SC-9C — Budget aggregate provenance

- **Trigger fired:** financial-data handling and possible API/schema change.
- **Path A:** backend aggregate enumerates component IDs/versions/source fields and retrieval time; absent update
  timestamps remain explicit. This also covers S-01 corpus and S-05 budget-outgoing aggregates.
- **Path B:** disclose aggregate-only retrieval evidence without claiming component freshness.
- **Path C:** client fetches and assembles components, increasing race and consistency risk.
- **Owner judgment:** assurance depth versus API complexity and authority fragmentation.
- **Team recommendation:** Path A using existing IDs/versions without schema enrichment. It keeps aggregation
  authority in one backend response and distinguishes duplicate product types/components.

## Tier-3 brief O-SC-10 — What makes an ESOP result true “today”?

- **Trigger fired:** employment-linked money calculation and valuation/date provenance.
- **Path A:** backend server date under the approved account/India-time convention; reject future grant dates;
  show FMV as recorded, never current without update evidence; exercise-window months remain disclosure-only.
- **Path B:** user confirms an explicit as-of date and valuation date each run; more authored but adds two
  consequential inputs and can diverge from the stored grant.
- **Team recommendation:** Path A using the existing fixed India-time product convention, plus explicit
  retrieved/version evidence and future-date rejection. Do not invent a countdown without termination data.

## Tier-3 brief O-SC-11 — What version authority governs EX-80C?

- **Trigger fired:** tax/legal exposure.
- **Path A:** before non-fixture/external use, bind ₹150,000 and eligible-source rules to a named financial year,
  official primary sources, verified date, accountable reviewer and stale shutdown.
- **Path B:** keep the explorer fixture/internal-only with production calculation unavailable.
- **Team recommendation:** Path B for the present programme; O-SC-11 remains governed by D-105/D-145 and
  un-parks only with its official-source/counsel contract.

## Tier-3 brief O-SC-12 — May recorded candidates begin included?

- **Trigger fired:** consequential use of personal financial data and authorship interpretation.
- **Path A:** every recorded candidate starts offered but excluded; user includes it before Run.
- **Path B:** formula-natural candidates may start included when visibly source-labelled/editable and repeated
  in the pre-run summary; EX-TERM remains excluded under D-132.
- **Team recommendation:** Path A. One additional confirmation is preferable to making account data look like
  an app-authored assumption, and it produces one consistent rule across the suite.

## Tier-3 brief O-SC-13 — What numeric input grammar is accepted?

- **Trigger fired:** personal-money parsing semantics and India locale ambiguity.
- **Path A:** canonical digits plus optional decimal separator; reject grouping symbols; format output `en-IN`.
- **Path B:** accept validated Indian/international grouping and normalize; reject ambiguous/mixed grouping.
- **Path C:** platform-locale parsing plus visible normalized confirmation; broadest and least deterministic.
- **Team recommendation:** Path B with a strict whole-string parser and visible normalized input summary. It
  supports ordinary Indian entry without permissive prefix parsing. Whitespace-only, partial exponent,
  multiple separators, `NaN`, infinity and trailing junk always reject.

## Standing gates not reopened

EX-80C statutory provenance/external release remains gated by D-105/D-145. EX-TERM external use remains
counsel-gated. These do not block controlled-fixture prototype design beyond showing the standing disclosure.
