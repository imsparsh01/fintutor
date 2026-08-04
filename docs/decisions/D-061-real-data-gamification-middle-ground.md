# D-061 — Founding UX framework, cluster 2 of 3 resolved: middle ground — game elements may react to app behavior, never to real financial data

- **Tier:** 3 — **two things fired.**
  - **Trigger 5 (MVP scope increase)**, continued from D-060: this cluster is still part of the same
    gamification/engagement capability not yet in `PROJECT_SPEC.md` §4. No new scope-batching action taken
    here — D-060 already flagged §4 as pending until all three clusters resolve.
  - **Trigger 3 / §4.3 interpretation.** This decision extends **P6** (`PRODUCT_PRINCIPLES.md` —
    "the user sees their real world; only the model sees the masked one") into a domain it wasn't written
    for. P6's original test ("does this masking/aliasing protect what reaches the LLM, or degrade what the
    user sees?") is about the D-010/D-011 privacy-masking boundary. This decision applies its underlying
    logic to gamification/UI design instead — a case P6 didn't originally address. Because P6 traces to
    compliance/privacy machinery (§4.1's stricter-category-governs rule), this interpretation is treated at
    Tier 3, not Tier 2 + REVIEW-FLAG — consistent with how `DECISION_PROTOCOL.md` §4.3 treats
    interpretation of compliance-flavored principles. Owner-decided directly in conversation.
- **Interprets:** P6 (`PRODUCT_PRINCIPLES.md`). New operative test established for gamification
  specifically: *does a game element (score, mascot mood, fictional skin) react to the user's actual
  financial data, or only to their in-app behavior?* The former is now forbidden; the latter is permitted.
  This doesn't contradict P6 — P6 already implied real money should be shown as itself — it makes that
  implication explicit and binding for a domain (game design) P6 never named.
- **Context:** cluster 2 of 3 from the founding UX/gamification framework session. Cluster 1 (engagement
  mechanics — streaks, variable reward, Hook Loop) resolved full-adopt at D-060. This cluster covers
  XP/levels/badges (#8), a virtual pet/companion (#11), and an RPG/fantasy skin (#20) — specifically
  whether any of those may be derived from or reactive to the user's real financial figures. Cluster 3
  (previously flagged as blocked outright by standing decisions — gated feature-unlock sequencing
  contradicts D-058; social/group stakes contradicts §5's no-social-sharing exclusion) remains to close
  out, though those are non-starters rather than open questions.
- **Decision: middle ground adopted.**
  - **Permitted:** cosmetic, behavior-reactive game elements — a mascot celebrating a completed teaching
    moment, generic visual/audio flourishes tied to app usage (opens, streaks, session completion). This is
    the same territory already authorized generally by D-060's engagement-mechanics adoption.
  - **Forbidden:** any XP value, badge, level, mascot mood, or fictional skin that is derived from or
    reacts to the user's actual financial data — loan balance, net worth, savings rate, a specific holding,
    or any number from the living baseline. Real financial data is always presented straight and
    undecorated, never scored, never wrapped in game fiction, never used to drive a character's emotional
    state.
- **Why:** Owner chose the middle path after the three options were laid out plainly. This balances the
  engagement value already committed to in D-060 against the two real risks unique to this cluster: (1)
  a game element reacting to real money risks implying judgment about the user's choices (a "sad" pet
  after a bad month reads as the app telling the user their decision was wrong — brushes P2's teach-not-
  advise line even though it's a cartoon, not a sentence) and (2) trivializing serious financial data by
  scoring or fictionalizing it directly contradicts why P6 exists — protecting the user's real view of
  their own money from being degraded by something the product layers on top.
- **What this does not decide:** exact implementation boundaries (e.g., is a generic "well done" animation
  after any teaching moment always behavior-only even if the teaching moment happened to be about the
  user's largest holding? is a running app-wide streak counter itself "reactive to financial data" if
  streak length happens to correlate with financial engagement?) are real edge cases for whoever builds the
  first gamification UI, to be checked against this decision's test, not re-litigated as new Tier-3
  questions unless a case doesn't fit the test cleanly.
- **Rule extraction (candidate, not yet adopted as standing):** *any proposed game/engagement element
  should be checked against — is it reactive to app behavior (permitted) or to the user's real financial
  data (forbidden)?* If confirmed by the owner as a standing test, future gamification-element decisions of
  this shape would drop to Tier 2 rather than returning to Tier 3.
- **Reversibility:** High as logged now — nothing built yet, no real gamification UI or user engagement
  data exists.
- **Date:** 04-Aug-2026
