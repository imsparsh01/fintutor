# Portfolio decision register and owner briefs

**Status:** Complete. Owner approved O-PF-1C, O-PF-2C, O-PF-3A and O-PF-4C as D-162..D-165.

## Settled constraints preserved

- Three MVP families only: Investments, Loans and Insurance.
- Separate per-family totals, never a synthetic net-worth subtraction (D-065).
- Persistent family reachability and neutral empty teaching (D-076/D-089/D-096).
- Record-count allocation and broad-category concentration only; no rupee weighting or scheme overlap (D-106).
- Visible name “Portfolio Health,” four levers and user-controlled drill-down (D-106/D-111).
- No advice, priority, performance verdict, product recommendation or financial valence treatment.
- Definition/fixture only until BQ-129 PASS; no current production behavior is silently promoted to contract.

## Owner brief O-PF-1 — Which insurance score formula governs Portfolio Health?

- **Triggers fired:** financial data/calculation users may rely on; interpretation or supersession of D-106;
  committed implementation already depends on a different formula. Tier 3.
- **The question:** Should insurance points follow D-106's term/health/cover-amount model or the shipped
  health-first model?

### Path A — Restore the exact D-106 formula

`50 if term cover exists + 25 if health cover is confirmed + 25 if recorded term sum assured is at least
10× annual income`, capped at 100. With no qualifying input, score is 0 once the required sources resolve.

- Matches the explicit owner decision and makes sufficient recorded cover amount part of the lever.
- Requires authoritative annual income and sum-assured provenance; unknown income/cover cannot receive the
  final 25 and must be explained.
- Term-only becomes 50 and health-only becomes 25, unlike the shipped UI.

### Path B — Ratify the shipped health-first formula

`0 when health cover is confirmed no; 50 for confirmed health cover; 75 for health plus any term record`.
Sum assured and income do not affect this lever.

- Matches current code/copy and is simpler to explain.
- Supersedes D-106 and makes term-only worth 0; that is a substantive product judgment, not a repair.
- Measures presence only and avoids calling a recorded amount sufficient, but discards the originally
  approved 100-point case.

### Path C — Replace one insurance score with transparent components

Show separate confirmed states for health cover, term cover and recorded cover-to-income ratio, with no
single insurance points value; overall Portfolio Health would need a new aggregation treatment.

- Most transparent and least likely to read as adequacy.
- Materially changes D-106's four-score architecture and overall formula; larger prototype/production change.
- Keeps observations distinct but removes simple comparability with the other three levers.

- **What only the owner can judge:** which insurance mechanism Portfolio Health is meant to represent and
  whether a single score should encode recorded cover sufficiency.
- **Rule extraction:** none apparent; financial score formulas require explicit source, unknown and meaning
  decisions per lever.
- **Owner outcome:** **Path C approved — D-162.** Insurance becomes transparent factual components, not a score.

## Owner brief O-PF-2 — What happens to the overall score when some levers are unknown?

- **Triggers fired:** financial score meaning and reinterpretation of D-106's “average of four”; Tier 3.
- **The question:** May Portfolio Health show an overall number before all four levers are measured?

### Path A — Hide the overall until all four are measured

Show “2 of 4 areas measured,” the two known lever values and the two explicit unknowns. The overall appears
only when all four exist.

- Strongest protection against a high/low partial average being mistaken for the full picture.
- Preserves unknown as unknown and makes denominator simple.
- Delays the headline number and may make Portfolio Health feel less immediately useful.

### Path B — Show an explicitly partial measured-area average

Average only non-null levers and label it everywhere as “Partial: 2-area average,” adjacent to the unknown
levers. Adding a newly measured lever can move the average sharply without any financial change.

- Matches shipped arithmetic and offers a result earlier.
- Requires strong repeated disclosure; the same number means different input sets across users/time.
- A newly supplied low value can look like deterioration even though only measurement changed.

### Path C — Show four slots but no overall number at any completeness level

Keep the four lever values and source explanations permanently; remove the composite average.

- Maximally transparent and avoids collapsing unlike mechanisms.
- Supersedes the approved 0–100 overall score and changes Home/Portfolio hierarchy.
- Loses the compact summary that D-105/D-106/D-111 intentionally introduced.

- **What only the owner can judge:** whether early summary value outweighs the risk of a partial composite
  reading as a complete financial judgment.
- **Rule extraction:** an aggregate with missing components must explicitly choose hide, partial-denominator
  average or no aggregate; unknown may never silently become zero.
- **Owner outcome:** **Path C approved — D-163.** Portfolio Health has no composite score at any completeness.

## Owner brief O-PF-3 — Where should optional health-insurance presence live?

- **Triggers fired:** financial-data handling, privacy/retention/export/deletion, and touched-data persistence;
  Tier 3.
- **The question:** Should the optional yes/no answer be account-owned across devices, device-local, or
  session-only?

### Path A — Account-owned backend context

Add health-insurance presence to the dedicated optional financial-context record, with authenticated
view/change/clear, export, deletion, retention and cross-device behavior.

- Consistent across devices and with emergency months; strongest provenance and user control.
- Requires an explicit schema/API migration and privacy-policy/data-registry update before production.
- Persists an additional sensitive financial-context fact for account life until cleared/deleted.

### Path B — Subject-scoped device-local context

Keep current subject-keyed local storage, actively clear on logout/account switch, and explain that the answer
applies only on this device and is absent from export/cross-device views.

- No backend schema and least server-side data.
- Different devices can show different insurance scores for the same account; reinstall loses the answer.
- Requires reliable active-clear coverage and plain disclosure wherever the value is used.

### Path C — Session-only, never persisted

Ask only when the user opens the insurance lever; use the answer in the current in-memory session and forget it
on app close/logout/switch.

- Strongest minimization and no cross-device contradiction stored anywhere.
- Repeated questioning and unstable Portfolio Health across sessions may reduce trust/usability.
- Overall score cannot be durable or comparable unless the answer is supplied each time.

- **What only the owner can judge:** whether cross-device consistency or data minimization is more important
  for this optional sensitive fact.
- **Rule extraction:** every optional fact that feeds a persistent-looking financial score must declare its
  authority scope, lifetime, export/deletion behavior and cross-device meaning.
- **Owner outcome:** **Path A approved — D-164.** Health-insurance presence is account-owned optional context.

## Owner brief O-PF-4 — Should Portfolio Health use score-band labels?

- **Triggers fired:** reinterpretation of D-106 and teach-never-advise/financial-judgment boundary; Tier 3.
- **The question:** Keep the approved bands (“Getting started,” “Building up,” “On track,” “Strong”) or avoid
  categorical labels?

### Path A — Keep D-106's four bands

Display the numeric score and its band in neutral ink, with the non-judgment explanation and formulas.

- Matches D-106 and gives users a plain-language shorthand.
- “On track” and “Strong” can read as advice/adequacy even without green/red color.
- The same band is especially misleading if O-PF-2 allows a partial average.

### Path B — Omit bands; show number plus measured denominator

Display `72 / 100 · 4 of 4 areas measured` (or the O-PF-2 partial treatment) and keep only mechanism/source
language. No adjective describes the score.

- Closest to the non-judgment contract and current shipped measured-area presentation.
- Less immediately interpretable; user must inspect levers to understand the number.
- Supersedes D-106's band labels while preserving the numeric architecture.

### Path C — Omit both bands and headline number

Show only four named lever values and measured states. This is viable only with O-PF-2 Path C.

- Removes the strongest judgment cues.
- Also removes D-106/D-111's intended compact summary and is not an independent copy choice.

- **What only the owner can judge:** whether categorical shorthand helps understanding enough to justify its
  unavoidable evaluative tone.
- **Rule extraction:** labels attached to financial scores are part of the advice/judgment boundary even when
  color is neutral; wording must be approved separately from arithmetic.
- **Owner outcome:** **Path C approved — D-165.** No bands or headline grade; individual measures only.

## Prototype gate

BQ-128 must implement only the owner-approved combination and make its consequences testable. A decision that
changes production formula, persistence or standing copy is validated in the fixture first; production work
remains separately bounded after BQ-129.
