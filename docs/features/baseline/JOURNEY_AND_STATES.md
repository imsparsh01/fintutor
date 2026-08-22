# Baseline journey and state matrix

## Journey

1. **Discover:** enter from Portfolio family sections, Goals, Budget or an Arya confirmation card.
2. **Orient:** see what is recorded, what is not valued, and whether derived summaries are current/partial.
3. **Capture:** choose a secondary manual form or review an Arya transient proposal.
4. **Confirm:** inspect record type, fields and provenance; durable writes require an explicit action.
5. **Correct:** edit a holding, recategorise it with loss preview, or use the currently supported management path.
6. **Reuse:** Budget, goals, Portfolio and Arya read the owned current records without copying their figures.
7. **Return:** refetch on focus/account transition, clearing prior-account presentation first.
8. **Exit:** cancel drafts without persistence; destructive changes disclose downstream effects.

## State matrix

| State | Required presentation | Recovery/exit |
|---|---|---|
| Loading | Shaped placeholders; no prior-account records | Wait or leave safely |
| Empty | “Nothing recorded” plus equal manual/Arya routes; no zero totals | Add, ask Arya, or leave |
| Partial | Available sections remain; unavailable section named | Retry only failed section |
| Valid | Records, source labels and live derived figures | Inspect or edit |
| Unknown | “Not stated/not valued”; never `₹0` | Add/correct later |
| Invalid | Field and reason named; excluded from dependent figure | Edit the source |
| Excluded | Source remains visible with exclusion reason | Correct or accept omission |
| Zero | Explicit measured/entered zero with provenance | Edit if incorrect |
| Unsaved | Draft/proposal labelled “Not saved yet” | Confirm or discard |
| Stale | Do not overwrite silently; show old/current/proposed | Refresh and reconfirm under D-149 |
| Permission denied | No data rendered; account/auth recovery | Reauthenticate or leave |
| Offline/backend failure | Never show empty as success; preserve safe draft | Explicit retry |
| Post-write side effect failure | Authoritative saved state named separately | Retry reminder only under D-149 |
| Cross-account transition | Clear data/drafts/errors before next load | Load new subject only |
| Delete impact | Name affected links/reminders before confirmation | Cancel or confirm |

## Alternate paths and known contradictions

- Income invalid-cadence warning currently asks users to edit, but no source-edit UI exists.
- Goals fetch failure currently collapses to the empty state.
- Income/discretionary/goal lifecycle management is narrower than holdings.
- Direct CRUD lacks stale-write detection; reconciliation has row-locked stale confirmation.
- Holding persistence can succeed before reminder scheduling fails, while UI may report save failure.
- Goal model documentation says current-value progress while runtime sums static earmarks.

These are current-production evidence, not accepted final behaviour. D-149 resolves management breadth, stale
edits and reminder recovery; its goal-progress direction still needs the rule in `GOAL_PROGRESS_RULE_BRIEF.md`.
