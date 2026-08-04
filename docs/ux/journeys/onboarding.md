# Journey: Onboarding

**Traces to:** D-058 (onboarding shape), D-012 (AI-surfaced, not menu-driven capture), BRIEF-013,
BRIEF-010 (fresh-starters need a guided entry point).
**Goal:** build the user's initial baseline profile (income, holdings, goals) without a static form,
without gating the app behind it.

## Steps
1. **Registration completes** (`RegisterScreen` → Supabase session created) → user lands on the
   chip-guided conversation screen, not directly on `MainTabs`. This is the default landing screen right
   after registration (D-058) — not a modal, not a wizard step counter.
2. **Chip-guided conversation** — tappable starter chips (no structured input field anywhere), the AI
   asks about income/holdings/goals conversationally, capturing structured data behind the scenes as the
   user responds. Chips exist specifically because fresh-starters (BRIEF-010's founding sub-profile) don't
   know what to say to an open text box.
3. **Each answer** reconciles into the living baseline the same way any AI-surfaced capture does (D-012)
   — not a separate onboarding-only data path.
4. **User reaches `MainTabs`** once they've either answered enough to have a useful baseline, or skipped.

## Alternate paths
- **Skip, at any point.** D-058 is explicit: this is never a hard gate. A skip affordance is visible from
  the start, not buried after N screens. Skipping drops the user straight to `MainTabs` with whatever
  baseline exists (possibly empty) — the app must degrade gracefully with zero holdings, same as a user
  who registered and never talked to the AI at all.

## Open questions / not yet decided
- **Not built yet.** `BQ-025` (this journey, as real screens) is BLOCKED on `BQ-023`/`BQ-024` — the
  conversational/chat surface doesn't exist as working code yet. Today, `RootNavigator` sends every
  session straight to `MainTabs` with no onboarding step at all. This file describes the *decided* shape,
  not shipped behavior.
- Exact chip content/copy for the starters isn't decided — BRIEF-010/BRIEF-013 establish the shape, not
  the wording.
