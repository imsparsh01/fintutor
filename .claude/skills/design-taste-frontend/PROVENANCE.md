# Provenance — vendored, not self-authored

- **Source:** https://github.com/Leonxlnx/taste-skill (upstream repo/skill name: "taste-skill";
  internal `name:` in this file's own frontmatter is `design-taste-frontend` — the folder here is
  named to match that, per this project's convention of a skill's folder matching its frontmatter name).
- **File vendored:** `skills/taste-skill/SKILL.md` (the repo's current default / v2 — the repo also
  ships a `taste-skill-v1` variant and 11 other specialized skills, e.g. `minimalist-skill`,
  `brutalist-skill`, `imagegen-frontend-mobile`; only this one default file was vendored).
  Copied verbatim from `main` branch via `raw.githubusercontent.com`. **One deviation from verbatim,
  disclosed, not silent:** the frontmatter `description` field was rewritten (D-064) to gate triggering —
  see "Invocation policy" below. The document body (everything after the frontmatter) is untouched.
- **License:** MIT (repo copyright 2026, Leonxlnx).
- **Vendored:** 04-Aug-2026, by request — reviewed for safety before adding (pure markdown
  instructions, no executable code; the repo's own scripts are unrelated README/asset-maintenance
  utilities, not part of this file).
- **Traces to:** `docs/decisions/D-063-vendored-skill-policy-and-taste-skill.md`.

## Invocation policy (D-064, owner-pinned) — read before invoking

This skill is **explicit-ask only.** Do not auto-trigger it off keyword matches ("landing page",
"redesign", "frontend", "UI") — the owner stated this directly: it should not fire on regular small asks
like CEO_DASHBOARD.md/.html work (personal-use tooling, not FinTutor product UI), and should only come up
when the owner explicitly asks for it, specifically when starting UI/design work on the FinTutor app
itself. The frontmatter `description` was edited (the one disclosed deviation from verbatim vendoring,
above) to encode this gate directly, since the description field is the actual trigger mechanism — leaving
the original upstream description in place would have let it fire in exactly the contexts the owner ruled
out.

## Applicability caveat — read before invoking

This skill's own frontmatter scopes it explicitly: **"landing pages, portfolios, and redesigns. Not
dashboards, not data tables, not multi-step product UI."** FinTutor's `app/` (React Native/Expo) is
tab-based, multi-step product UI — exactly what this skill excludes by its own stated scope. Its
concrete, checkable rules (GSAP scroll animation, desktop nav height, hero viewport units, "div-based
fake screenshots") are written for **web** frontends (HTML/CSS/JS), not React Native components.

**Treat it as:**
- **Literal, invokable guidance** — only if FinTutor ever builds a real rendered web page (e.g. a public
  marketing/landing page — not currently in MVP scope per `PROJECT_SPEC.md` §5).
- **Design-philosophy inspiration only** — when working on `app/`'s actual mobile screens: the
  underlying instinct (avoid generic AI-default layouts/palettes, typography and spacing discipline, no
  decorative filler) is transferable, but do not mechanically apply its web-specific checklist items to
  React Native code.

## Updating

To refresh this file against a newer upstream version, re-fetch
`https://raw.githubusercontent.com/Leonxlnx/taste-skill/main/skills/taste-skill/SKILL.md`, diff against
this copy, and re-review before replacing — the same review step this vendoring got, not a silent
overwrite.
