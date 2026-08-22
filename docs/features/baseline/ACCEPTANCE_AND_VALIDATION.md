# Baseline acceptance and owner validation

## Acceptance matrix

| ID | Requirement | Prototype task | Eventual engineering evidence |
|---|---|---|---|
| A-01 | Recorded, unknown, excluded and zero remain distinct | Baseline orientation | Aggregation/component tests |
| A-02 | Draft/AI proposal is not durable before confirmation | Captured holding | No-write/integration tests |
| A-03 | Recategorisation discloses field loss before save | Recategorise | Component/API regression |
| A-04 | Invalid cadence names exclusion and correction route | Budget cadence | Budget/service/UI tests |
| A-05 | Goal links state provenance, no movement and shared proportional value | Goal funding | Money/ownership/UI tests |
| A-06 | Partial failure never becomes empty success | Partial outage | Screen state tests |
| A-07 | Post-write failure distinguishes saved record | Side-effect failure | Integration/idempotency tests |
| A-08 | Account switch clears old data and drafts | Account switch | Cross-account async tests |
| A-09 | Errors/loading/save results are accessible | All | Accessibility + keyboard/native QA |
| A-10 | No state evaluates financial quality | All | Content/visual review |

## Owner tasks

1. **Baseline orientation:** identify one recorded value, one unknown value and one excluded source; explain the
   displayed budget net without treating unknown as zero.
2. **Captured holding:** review Arya's personal-loan proposal and determine exactly when it becomes saved.
3. **Recategorise:** change an equity fund fixture to a debt fund, inspect fields that will be removed, then
   cancel once and confirm once.
4. **Budget cadence:** find why freelance income is excluded, correct its cadence and predict which budget rows
   change.
5. **Goal funding:** link a ₹2,00,000 holding across ₹1,50,000 and ₹1,00,000 earmarks; explain the proportional
   ₹1,20,000/₹80,000 result, why the holding is counted once, and what the links do not do.
6. **Partial outage:** encounter a goals-service failure while other baseline sections remain available; recover
   without creating a duplicate goal.
7. **Saved record, reminder failed:** complete a holding save whose reminder side effect fails; identify the
   authoritative saved state and safe next action under D-149.
8. **Account switch:** switch from Mira to Kabir while a load is pending; verify no Mira record/draft appears in
   Kabir's account.

Run without explanatory coaching beyond the task prompt. For each task record: completed without coaching,
state/provenance understood, neutrality clear, recovery clear, and any intervention or trust surprise.

## Disposition rule

- **PASS:** all eight tasks pass with no critical trust or product-intent disagreement.
- **REVISE:** return only failed presentation/workflow hypotheses to the package/prototype.
- **PARK:** name an explicit unpark condition.
- **ESCALATE:** keep owner-decision forks open; do not freeze or authorise production.
