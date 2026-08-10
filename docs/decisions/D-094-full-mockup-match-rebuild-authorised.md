# D-094 — Full mockup-match rebuild authorised: scope expanded beyond D-093's reskin-only grant

- **Tier:** 3 — owner-decided directly in conversation ("Our entire UI/UX and workflow should match the
  existing approved UI/UX mockups… spawn agents/sub-agents internally as required to get all the design and
  build done"), reaffirmed by selecting "Authorize full rebuild now" over "Diagnose first" and "Just fix
  the fonts" when the scope-crossing was put to them explicitly. **Extends D-093** rather than
  reinterpreting it — D-093 authorised a reskin of existing screens; this authorises the fuller
  mockup-match D-093 deliberately fenced off.
- **Date:** 10-Aug-2026

## Decision

The running app is to be brought into line with the approved v1 mockups (`docs/ux/mockups/MOCKUPS_v1.html`,
adopted in aesthetic layer via D-086..D-092) across visual style **and** workflow — not just the
presentation-layer reskin of already-existing screens that D-093 permitted. The owner has authorised the
specific boundary crossings D-093 reserved.

## What this authorises that D-093 did NOT

1. **New dependencies.** Explicitly: `expo-font` + `@expo-google-fonts/newsreader` +
   `@expo-google-fonts/ibm-plex-sans` + `@expo-google-fonts/ibm-plex-mono` (the drawn typefaces that D-088
   deferred), and `react-native-reanimated` if the drawn motion needs it. These were a hard stop under
   D-093 §2; the owner now owns that decision.
2. **New screens/flows** drawn in the mockups but absent from `app/`: the onboarding chip-conversation
   flow as drawn, the teaching walkthrough as a wired full-screen flow (D-090's `1f`), and the engagement
   surfaces (streak moment). Each was trigger-5 scope growth under D-093 §3.
3. **Workflow changes** to make the in-app flow match the drawn journeys (Flows 01–07 in the mockup notes),
   not only the static appearance of individual screens.

## What this STILL does not authorise — flagged, not silently absorbed

- **Backend/schema changes remain a hard stop.** D-093's verification still holds: every data shape the
  mockups draw already has a service. An agent concluding it needs a schema or new service change must
  **stop and report**, not act.
- **The reconciliation UI cannot be built from this.** §2's core "new / updates / contradicts" feature has
  **no mockup drawn** (stated in `MOCKUPS_v1_NOTES.md`: "baseline reconciliation UI … has no screen yet").
  "Match the mockups" cannot produce a screen that the mockups do not contain — this needs its own design
  pass first and stays out of the fleet's scope.
- **BQ-052 (Tier 3 compliance) is not resolved by this.** The "what we won't say" ESOP-block wording
  contradiction is a specific compliance-messaging decision still owed by the owner; a rebuild does not
  answer what that block should say. Agents must leave the existing approved wording untouched and not
  invent a fix (a prior agent's invented sentence was reverted for claiming a computation the service does
  not perform).
- **Deliberate-only files** (`PROJECT_GOVERNANCE.md`, `docs/DECISION_PROTOCOL.md`,
  `HOW_TO_RUN_THIS_PROJECT.md`, `CLAUDE.md`) stay untouchable.

## Concern recorded (owner proceeded knowingly)

The authorisation was given while the only rendered view available was a desktop React-Native-Web preview
— **not the app's real iOS/Android target** — and with the drawn typefaces not yet installed, both of which
independently make the running app look unlike the mockup without any code being "broken." A full rebuild
also rewrites working, three-reviewer-audited code already on `main`. The owner was told this and chose the
full rebuild over diagnosing first. Recorded so the cost/risk trade was a made decision, not an oversight.

## Execution approach

Staged and verified, not a single blind bulk fire at a 890KB minified mockup:

1. Install the authorised dependencies (fonts, motion) and wire fonts into `app/design/tokens.ts` — the
   single biggest visual lever, and foundational for every screen.
2. Establish a real rendered ground-truth (device/emulator or a clean web build) so agents build against
   evidence, not the desktop-web artifact.
3. Per-flow agent builds (Flows 01–07), fleet-tiered per D-093's table (Haiku mechanical / Sonnet
   implementation / Opus review), each stage reviewed and verified before the next.

## Reversibility

Medium. Agent output is ordinary code on a working branch, reviewable and revertible per commit — but this
rewrites more existing on-`main` surface than D-093 did, so the branch is kept reviewable and merged to
`main` only once it renders correctly, per D-056.
