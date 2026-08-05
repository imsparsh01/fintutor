# D-081 — Governance-file restructuring for token efficiency: rolling-window archives + protocol cheat sheet

- **Tier:** owner-decided directly in conversation, explicit and unambiguous ("As a CEO, I'm allowing you
  to make all these decisions, whatever I have told you"). Touches two deliberate-only files
  (`CLAUDE.md`, and a new companion to `docs/DECISION_PROTOCOL.md`), which under normal rules require an
  explicit, owner-confirmed decision before editing — this conversation's authorization satisfies that
  bar directly; nothing here was inferred or applied as a side effect of another task.

- **The problem, measured, not assumed:** `CLAUDE.md`'s own session-start instructions require reading
  `PROJECT_SPEC.md`, `docs/DECISION_LOG.md`, `docs/BUILD_QUEUE.md`, and (for most non-trivial tasks)
  `docs/DECISION_PROTOCOL.md` in full, every session. Measured before this change: `PROJECT_SPEC.md`
  ~9,500 tokens, `DECISION_LOG.md` ~28,600 tokens, `BUILD_QUEUE.md` ~11,400 tokens,
  `DECISION_PROTOCOL.md` ~8,600 tokens — roughly **58,000 tokens of mandatory onboarding reading per
  session**, before any actual work. All four are append-only or history-accumulating by design, so this
  was pure, permanent, compounding growth with no existing mechanism to check it, other than D-046's
  earlier (partial, decisions-only, non-retroactive) extraction of full write-ups out of
  `DECISION_LOG.md`.

- **Decision — five changes, all executed in this entry:**
  1. **`DECISION_LOG.md` fully normalized to the D-046 pattern, retroactively.** D-001 through D-044 (44
     decisions, plus BRIEF-001/002/004/005 interspersed — 46 entries total) were previously left inline
     per the file's own note ("D-001–D-044 above this note are untouched and stay inline"). Extracted
     verbatim into individual `docs/decisions/D-0NN-slug.md` files (content verified byte-for-byte
     identical to the original after whitespace normalization — see verification below), replaced in the
     log with a condensed index: title, one teaser line **quoted verbatim from the entry's own first
     substantive bullet** (never paraphrased, to avoid any risk of misrepresenting a historical decision),
     a pointer to the full file, and the date.
  2. **Rolling window applied to `DECISION_LOG.md`.** Only the most recent ~20 decisions (currently
     D-066 onward) stay in the live file. Everything older moves to a new `docs/DECISION_LOG_ARCHIVE.md`,
     same condensed format, chronological, grepped on demand rather than read wholesale. This is now a
     standing session-close habit (`CLAUDE.md` updated), not a one-time cleanup.
  3. **`BUILD_QUEUE.md`'s DONE section extracted to `docs/BUILD_QUEUE_ARCHIVE.md`.** Unlike decisions,
     nothing else in the repo links to individual BQ entries by file path, so this didn't need per-item
     files — the entire DONE section (44 entries) moved verbatim into one archive file. The live
     `BUILD_QUEUE.md` now holds only the rules, READY, BLOCKED, and NOT-IN-QUEUE sections — the only parts
     actually needed to decide what to build next. Going forward, a completed item moves to the archive
     the moment it's marked done, not batched later.
  4. **`docs/DECISION_PROTOCOL_CHEATSHEET.md` created as a companion to (not a replacement for)
     `docs/DECISION_PROTOCOL.md`.** The full protocol is completely untouched — it remains the
     authoritative source for rationale, the five-category taxonomy with retroactive classification,
     worked examples, and the precedent log (§6). The cheat sheet extracts every *operative* rule (the
     routing order, the six triggers, tier definitions, the four lenses, supersession/interpretation
     rules, and the three output formats) into ~950 words, meant for routine reading; `CLAUDE.md` now
     points there for step 3 of session start, falling back to the full protocol only when a case is
     genuinely ambiguous or the reasoning behind a rule actually matters.
  5. **`PROJECT_SPEC.md` §10's change log given the same rolling-window treatment.** The 10 most recent
     entries (v3.8 down through v3.0) stay live; v2.9 and older moved verbatim to
     `docs/PROJECT_SPEC_CHANGELOG_ARCHIVE.md`. Sections 1–9 (the actual current-state spec) are completely
     unaffected — only the historical log tail was ever the target.

- **`CLAUDE.md` updated to reflect all five changes** (the actual deliberate-only-file edit this decision
  authorizes): session-start steps 1–3 now describe the archive files and the cheat sheet and instruct
  grep-on-demand rather than wholesale reads; the File Permissions section documents each rolling-window
  threshold; End-of-every-session gained a new explicit step 2 ("archiving habit check") so this doesn't
  quietly stop happening after this session.

- **Verification performed, not just claimed:** the `DECISION_LOG.md` extraction (the highest-risk step,
  since it touches historical content rather than just moving pre-existing short entries) was checked
  programmatically — the concatenation of all 46 newly-extracted files, converted back to their original
  heading level, was diffed character-for-character against the original D-001–D-044 block after
  normalizing only cosmetic whitespace (trailing spaces, blank-line collapsing). **Result: identical.** No
  content was altered, paraphrased, or dropped — only relocated and re-headed. The `BUILD_QUEUE.md` DONE
  section move was verified the same way against the last committed version in git history.

- **Measured result (see `docs/sessions/2026-08-05-token-optimization.md` for the full before/after
  table):** the ~58,000-token mandatory-reading baseline drops to roughly **9,000–10,000 tokens** for the
  same session-start reads, with the full historical record fully preserved and reachable by grep, not
  deleted. Exact before/after numbers logged there per the owner's explicit request, so a future session
  can independently verify the claimed improvement rather than take it on faith.

- **Why this doesn't itself grow MVP scope or touch a hard-stop:** this is process/documentation
  restructuring — no product behavior, no user-facing code, no financial data, no compliance line, and no
  data migration (git history preserves every byte regardless of which file currently indexes it).
  Reversible in the strongest sense: `git log`/`git show` can reconstruct the pre-restructuring state of
  any file at any time even without this decision's own archive files.

- **Date:** 05-Aug-2026
