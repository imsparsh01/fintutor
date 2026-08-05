# Token optimization — before/after (D-081)

**Purpose:** the owner asked for a logged baseline and a logged result so a future session can
independently verify the claimed improvement, not take it on faith. Word counts via `wc -w`; token
estimate is words × 1.3 (a standard rough ratio for English prose) — approximate, but consistent across
both measurements, so the *relative* change is meaningful even if the absolute numbers aren't exact.

## Files read at session start (per `CLAUDE.md`'s own instructions)

| File | Before (tokens) | After (tokens) | Change |
|---|---:|---:|---:|
| `CLAUDE.md` | ~1,600 | ~2,031 | +431 (new archiving-habit instructions) |
| `PROJECT_SPEC.md` | ~9,538 | ~5,742 | −3,796 |
| `docs/DECISION_LOG.md` | ~28,592 | ~2,481 | −26,111 |
| `docs/BUILD_QUEUE.md` | ~11,437 | ~426 | −11,011 |
| `docs/DECISION_PROTOCOL.md` (before) / `docs/DECISION_PROTOCOL_CHEATSHEET.md` (after) | ~8,606 | ~1,227 | −7,379 |
| **Total mandatory reading** | **~59,773** | **~11,907** | **−47,866 (≈80% reduction)** |

## What moved, not what disappeared

Nothing was deleted. Everything above the rolling-window/cheat-sheet cutoffs is one grep away:

| New archive/reference file | Tokens | Read when |
|---|---:|---|
| `docs/DECISION_LOG_ARCHIVE.md` | ~6,169 | grepping for a specific older decision ID |
| `docs/BUILD_QUEUE_ARCHIVE.md` | ~11,229 | grepping for how a specific BQ item was built |
| `docs/PROJECT_SPEC_CHANGELOG_ARCHIVE.md` | ~3,993 | grepping for older spec history |
| `docs/DECISION_PROTOCOL.md` (full) | ~8,606 | a genuinely ambiguous case, or needing the *why* behind a rule |
| `docs/decisions/D-0NN-slug.md` (81 files total now) | varies | full reasoning for any specific decision, always |

## What changed structurally (see D-081 for the full decision)

1. `docs/DECISION_LOG.md`'s D-001–D-044 (44 decisions + 4 BRIEFs, previously left inline per the file's
   own note) were extracted to individual files, same pattern D-046 already used for D-045+ — verified
   byte-for-byte identical to the original via a programmatic diff, not just visually spot-checked.
2. A rolling window applied on top: only ~20 most recent decisions stay in the live log.
3. `docs/BUILD_QUEUE.md`'s 44-entry DONE section moved wholesale to an archive file — verified against
   git history to confirm nothing was lost.
4. A new `docs/DECISION_PROTOCOL_CHEATSHEET.md` extracts every operative rule from
   `docs/DECISION_PROTOCOL.md` (which is untouched and remains authoritative) into a ~950-word reference
   for routine use.
5. `PROJECT_SPEC.md` §10's change log given the same rolling-window treatment (10 most recent entries
   live, rest archived).
6. `CLAUDE.md` updated to point at all of the above and make archiving a standing per-session-close habit,
   not a one-time cleanup — so this reduction doesn't silently erode back to the old numbers over the next
   80 decisions.

## How to use this file to verify the claim yourself

Run the same measurement any time:
```
wc -w CLAUDE.md PROJECT_SPEC.md docs/DECISION_LOG.md docs/BUILD_QUEUE.md docs/DECISION_PROTOCOL_CHEATSHEET.md
```
Multiply by ~1.3 for a rough token estimate, sum, and compare against the ~11,907 "after" figure above.
If it's grown well past ~20/~10/DONE-should-be-empty on the respective files, the rolling-window habit
has lapsed and is worth flagging.
