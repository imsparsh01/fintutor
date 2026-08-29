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

## Tier-3 brief O-SC-5 — Is zero additional SIP valid?

- **Trigger fired:** money-calculation semantics.
- **Path A:** accept zero and show equal paths, teaching that unchanged input produces unchanged outcome.
- **Path B:** require greater than zero because the tool's stated action is an increase.
- **What only the owner can judge:** equality teaching value versus semantic strictness.

## Tier-3 brief O-SC-6 — Does S-02 support a zero-rate loan?

- **Trigger fired:** financial-model eligibility and formula semantics.
- **Path A:** implement an explicit zero-rate branch and show the no-interest consequence.
- **Path B:** require a positive rate and explain the explorer is unavailable for this record.
- **What only the owner can judge:** completeness versus the intended break-even mechanism boundary.

## Tier-3 brief O-SC-7 — What debt periods and types are eligible?

- **Trigger fired:** money formula normalization and financial-product eligibility.
- **Path A:** positive integer months only; home/personal loans only under the existing fixed-amortisation model.
- **Path B:** accept fractional months with an explicit rounding rule and/or add credit-card debt after defining
  repayment assumptions; broader but transforms user input and changes model meaning.
- **What only the owner can judge:** whether convenience/breadth justifies transformed periods or a new debt model.

## Tier-3 brief O-SC-8 — What freshness can the suite promise?

- **Trigger fired:** financial-data provenance and low-reversibility API/schema enrichment.
- **Path A:** promise retrieval time and available record version only; never label a value current/fresh.
- **Path B:** enrich APIs/schema with authoritative update/component provenance.
- **Path C:** prototype Path A now and decide enrichment only in production reconciliation.
- **What only the owner can judge:** limited honest assurance versus added persistent/API authority.

## Tier-3 production follow-up briefs

### O-SC-9A — S-02 request privacy

- **Trigger fired:** financial-data privacy.
- **Path A:** move selection/prepayment from GET query to an authenticated POST body.
- **Path B:** exchange selection for an opaque short-lived token before calculation.
- **Owner judgment:** log-exposure reduction versus recovery/deep-link and implementation complexity.

### O-SC-9B — ESOP provenance authority

- **Trigger fired:** financial-data handling/API contract.
- **Path A:** backend response carries authoritative record version/update/source evidence.
- **Path B:** client joins owned-record metadata to the calculation response.
- **Owner judgment:** single backend authority versus client coordination/race risk.

### O-SC-9C — Budget aggregate provenance

- **Trigger fired:** financial-data handling and possible API/schema change.
- **Path A:** backend aggregate enumerates component IDs/versions/timestamps.
- **Path B:** disclose aggregate-only retrieval evidence without claiming component freshness.
- **Path C:** client fetches and assembles components, increasing race and consistency risk.
- **Owner judgment:** assurance depth versus API complexity and authority fragmentation.

## Standing gates not reopened

EX-80C statutory provenance/external release remains gated by D-105/D-145. EX-TERM external use remains
counsel-gated. These do not block controlled-fixture prototype design beyond showing the standing disclosure.
