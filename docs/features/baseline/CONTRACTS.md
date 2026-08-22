# Baseline functional, data and content contracts

## Persisted inputs

| Object | Inputs | Ownership/persistence |
|---|---|---|
| Holding | product type, local display name, allowlisted characteristics | JWT subject; alias generated; JSONB characteristics |
| Income | labelled conservative amount, optional typical amount, cadence | JWT subject; source arrays in income rows |
| Discretionary | label, planned amount | JWT subject; stored category |
| Goal | category, target amount/date, funding links | JWT subject; links reference owned holdings |
| Financial context | confirmed dependants/emergency months | Separate optional owned record; not baseline completeness |

## Derived outputs

- Budget is not stored: normalized conservative income minus live recurring holding outflows minus planned
  discretionary categories.
- Consolidated valuation is not stored: recognized finite valuation fields plus explicit invalid/unvalued/
  unclassified counts.
- Goal progress currently sums persisted earmarked amounts. No money moves or becomes reserved.
- Arya receives aliases/characteristics and permitted derived context, never local display names.

## Write semantics

- Manual holding create generates an alias; ordinary PATCH replaces supplied characteristics wholesale.
- Arya capture remains transient until resolve/apply; apply merges only confirmed fields and stale-checks under
  a row lock.
- Funding update atomically replaces the goal's link set and validates positive finite owned links.
- Cancel/not-now persists nothing.
- Account export and deletion cover every owned baseline model through registry tests.

## Validation contract

- Inputs must distinguish raw editing state from parsed values.
- Required/optional labels are explicit; placeholders are not labels.
- Non-finite, negative where unsupported, malformed dates, invalid cadence and excessive precision are rejected
  at the source with a reason.
- Typical income cannot silently become the conservative budget input.
- Unknown or malformed values never coerce to zero.
- No new bound or cross-field financial rule is introduced by this package.

## Failure semantics

- Fetch failure is not an empty state.
- Partial services fail independently where a safe partial view is possible.
- A failed write keeps the draft and gives explicit retry; it does not imply success.
- If a holding write committed but reminder scheduling failed, the saved record remains authoritative and the
  reminder is a separate non-blocking retry under D-149.
- Cross-account changes invalidate in-flight responses and clear local presentation/drafts.
- Ordinary direct writes use durable compare-on-write state and refreshed explicit reconfirmation under D-149.

## Privacy and security

- Backend derives ownership from the verified JWT subject; caller `user_id` is non-authoritative.
- Application tables remain FastAPI-only with RLS and no client-role privileges.
- Display names stay within FinTutor/model-masking boundaries.
- Export/deletion/retention follow D-138 to D-144.
- Logs and user-facing errors do not echo financial payloads.

## Accessibility

- Every input has a persistent accessible name, hint, error association and disabled state.
- Loading, errors, exclusions, save results and refreshed comparisons are announced.
- All controls have at least 44px targets and full keyboard/screen-reader operation.
- Focus returns predictably after modal close and moves only at meaningful result boundaries.
- Figures and states never rely on colour alone; reduced motion is respected.

## Content and neutrality

- Say recorded, proposed, saved, unknown, invalid, excluded and computed precisely.
- Never say complete, healthy, good, bad, on track, affordable or recommended based on baseline content.
- Goal links are planning labels. They do not move, lock or reserve money.
- Deletion/recategorisation copy describes data effects, not whether the financial action is wise.
- Provenance format: value, source object/field, cadence/as-of context where applicable, exclusion reason.

## Events

Baseline writes are not learning achievements or financial-outcome rewards. Existing learning events may fire
only from genuine teaching interaction and must remain non-fatal.
