# BQ-112 production validation record

Date: 24-Aug-2026

## Automated and build evidence

- Backend lifecycle, ownership, stale-write, impact, reconciliation-version and export coverage: 366/366 tests passed in the implementation agent's configured environment.
- Frontend dependency-free suite: 78/78 tests passed, including 10 focused API-response and baseline-state tests.
- TypeScript: `npx tsc --noEmit` passed.
- Web bundle: `npx expo export --platform web` passed.
- Diff whitespace validation passed.
- No component test dependency was introduced. The repository has no component-test library; BQ-112 therefore uses pure state/API tests, backend integration tests, TypeScript/export checks, and the validated controlled-fixture journeys.

## Eight frozen scenarios mapped to production

1. Baseline orientation: budget preserves recorded/unknown/excluded distinctions and server-authored recurring-outflow provenance. PASS in controlled-fixture validation; production contracts and rendering retained.
2. Captured holding: the transient proposal save boundary remains outside BQ-112 and previously passed; BQ-112 does not change proposal persistence.
3. Recategorise safely: production now lists every populated source field that will be removed, cancel restores the original type and values, and confirm is required before the versioned write.
4. Budget cadence: invalid cadence remains excluded and its warning now opens the matching income-source editor; corrected data refreshes both income and computed budget independently.
5. Goal funding: production renders backend-authored applied amounts, partial/unknown status, exact source provenance and proportional adjustment without recomputing or implying money movement.
6. Partial outage: goals and every Budget section have explicit named failure/retry states; failed goals never become an empty list and goal creation is hidden until the existing list is known.
7. Saved record/reminder failure: backend holding success is authoritative; reminder failure exposes a reminder-only retry and cannot repeat the financial write. Delete uses the same separation for local cleanup.
8. Account switch: family, Budget, Goals and holding-detail presentation suppress prior-account data synchronously; delayed completions are generation-guarded and transient editors are cleared.

The revised controlled-fixture prototype previously passed all eight scenarios independently. A new in-app-browser replay was attempted during this production close, but the browser safety layer blocked the local `file://` artifact and no authenticated production fixture account is available. Source inspection was not substituted for that browser result; the production evidence is the automated/build checks plus the already-recorded independent prototype validation above.

## Remaining release gate

Migration `b112c152a001` adds the durable holding concurrency version. Its application to the populated development database requires the owner's explicit high-critical approval. Until it is applied and verified, BQ-112 remains READY rather than SHIPPED.
