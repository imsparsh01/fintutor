# Session 2026-08-10 — recurring cadence and budget provenance (D-098)

- Owner approved Option C: expand recurring cadence data before exposing provenance.
- Added explicit `sip_frequency` and `emi_frequency` characteristics and capture allow-list entries.
- Budget now normalizes only recurring amounts with an explicit cadence and returns generic provenance rows; EPF remains deferred.
- Budget UI renders the “Where this comes from” breakdown from the backend response.
- Verified TypeScript and backend syntax.
