# D-063 — Vendored-skill category added to skill management (D-062 extension); first instance: `design-taste-frontend` ("taste-skill")

- **Tier:** 2 — no §2.1 trigger fires (no money; no legal/regulatory/advisory/data-handling surface — MIT
  license, pure markdown instructions, no user data touched; doesn't grow `PROJECT_SPEC.md` §4 MVP scope —
  this is Claude Code tooling, not a product feature; fully reversible, no populated data or depended-on
  code touched; classifies cleanly as Sequencing/PM, same category as D-007/D-014/D-047/D-050/D-062).
  Deliberated through the evaluation lenses, acted on immediately per §2.3, subject to retroactive veto.
- **Context:** D-062 (previous session) scoped project skills narrowly to self-authored, mechanical
  execution of already-decided FinTutor procedures. The owner then asked to bring in a specific
  third-party, published skill — not a general-purpose capability, a named one (`Leonxlnx/taste-skill`,
  71.3k★, MIT) — which does not fit D-062's "only executes an already-decided procedure" description at
  all: it's new capability (frontend design-taste guidance), not mechanization of a FinTutor decision. This
  entry names that as a genuinely different category rather than silently treating it as covered by D-062.
- **Decision:**
  1. **A second skill category exists: vendored.** Project skills are now either **self-authored**
     (D-062's scope — mechanical, already-decided, FinTutor-specific) or **vendored** — third-party
     published skills, pulled in deliberately and reviewed, not generated here. Same folder
     (`.claude/skills/<name>/SKILL.md`), told apart by a required `PROVENANCE.md` sibling file for every
     vendored skill (source repo/URL, exact file vendored, license, date, and — the part self-authored
     skills don't need — an explicit note on whether/how it actually applies to *this* project, since a
     general-purpose published skill is written for an audience wider than FinTutor and may not fit
     cleanly).
  2. **Review-before-vendor is mandatory, every time.** Before any vendored file lands in the repo: fetch
     and actually read its real content (not a third-party summary), check for bundled executable code and
     what it does, and assess actual fit to this project. Silent trust of a star count or a marketing page
     is not review.
  3. **First instance: `design-taste-frontend`.** Vendored `skills/taste-skill/SKILL.md` (current default/
     v2) from `github.com/Leonxlnx/taste-skill` verbatim, folder renamed to match the file's own
     frontmatter `name:` field (`design-taste-frontend`) rather than the upstream repo's product name
     (`taste-skill`), for the same folder-matches-frontmatter-name convention `session-close` already
     established. Reviewed before adding: pure markdown instructions, no executable code in the vendored
     file itself; the source repo's own `scripts/*.mjs` are unrelated README/asset-maintenance utilities,
     not part of what was vendored.
  4. **Applicability caveat recorded, not smoothed over.** The skill's own frontmatter self-scopes to
     "landing pages, portfolios, and redesigns. Not dashboards, not data tables, not multi-step product
     UI." FinTutor's `app/` is React Native/Expo, tab-based, multi-step product UI — exactly what the
     skill excludes by its own stated scope, and its concrete checklist (GSAP animation, desktop nav
     height, hero viewport units) is web-specific, not React Native. `PROVENANCE.md` records this plainly:
     literal/invokable only if FinTutor ever ships a real rendered web page (not current MVP scope);
     design-philosophy inspiration only when applied to `app/`'s actual mobile screens. Not rejected
     outright — kept as the first proof of the vendoring pattern, same "pilot" framing D-062 used for
     `session-close`, with the honest caveat that this particular pilot currently has little to no live
     surface to apply itself to.
- **Why:** The owner asked for something concrete, already reviewed the general skill-management shape and
  approved it (prior turn), and named a specific public skill rather than asking for a general capability —
  so the right move was to actually fetch and read it, not assume from its name or a marketing page what it
  contains. Logging it as a category addition (not folded into D-062) keeps the append-only log honest about
  what D-062 actually committed to versus what's being added now, and the applicability caveat keeps a
  71.3k-star repo's popularity from being mistaken for fit to this specific project.
- **Lenses:**
  ```
  Compliance      PASS      MIT-licensed markdown instructions, no user data, no advisory-line surface —
                            D-009/D-010/D-016 untouched.
  Product         skip      Not run — the vendored skill has no live application to app/'s current
                            screens per its own stated scope (see applicability caveat); nothing here
                            changes what a user sees.
  Technical       PASS      Inert markdown file, easily diffed/updated/removed; reviewed for embedded
                            code (none) before adding.
  Cost-and-Scope  CONCERN   A second skill sub-category (vendored vs. self-authored) is more to keep
                            straight, and this particular pilot instance currently has near-zero
                            applicable surface in this repo — risk of clutter with no payoff. Answered by
                            the mandatory PROVENANCE.md pattern (making the boundary auditable rather than
                            assumed) and by treating this as proving the vendoring mechanism itself is
                            sound, not as a claim of immediate high value.
  ```
- **Reversibility:** High — `.claude/skills/design-taste-frontend/` is two files; deleting the directory
  fully reverts this. No data, no product code, no other file's permission tier touched.
- **Date:** 04-Aug-2026
