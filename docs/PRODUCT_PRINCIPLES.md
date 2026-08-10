# FinTutor — Product Principles (v1.5, 05-Aug-2026)

> **What this is.** The substantive product point of view that non-technical decisions are checked
> against. DECISION_PROTOCOL.md governs *how* a decision is made and *who* owns it; this file supplies
> *what FinTutor believes*, so that the Product lens has real content to test against rather than a vibe.
>
> **How it earns its keep.** A principle here is not a slogan — it is a **usable test**. The bar for
> inclusion: a future decision must be checkable against it *without the owner in the room*. If a
> statement can't resolve a real fork on its own, it isn't a principle yet.
>
> **How it routes (authorized by D-030).** A product decision cleanly resolved by a principle below is a
> Tier-1 application — handled and logged, not escalated. The owner is asked only when principles
> conflict, when none covers the decision, or when a decision would set or amend a principle. See
> DECISION_PROTOCOL.md §3.1 (Product lens) and §3.7 (the routing rule).
>
> **How it grows.** Like DECISION_PROTOCOL.md §6, this file fills by accretion. The founding set below
> was *extracted from decisions already made* (D-009, D-012, D-015, D-025, D-010, D-011), not invented —
> each principle points to where it was already operating. New principles are added only when a real
> decision reveals one; a principle earns its place by resolving a fork, never by sounding good.

---

## The principles

### P1 — Don't ask; infer, surface, or defer.
**Test:** For any point where the app would ask the user to enter something, can the AI infer it, surface
it in context, or defer it until the user shows interest? If yes, don't ask. Every field the user is
asked to fill must justify why it could not be inferred, surfaced, or deferred.

- **Scope:** app-wide. Onboarding, capture, portfolio, every input surface.
- **Traced to:** D-012 (AI-surfaced, not menu-driven; "minimize explicit user input everywhere"). The
  most-repeated commitment in the project and the source of the whole surfacing architecture. Narrowed by
  D-031: a manual/browse entry point into the same sections is permitted as the secondary path — this
  principle governs which path is primary, not whether a fallback may exist.
- **What it forbids:** "Add X" button menus the user has to seek out; forms that demand a full schema up
  front; asking for anything the profile or context already implies.

### P2 — Teach, never advise — and the line is what the output *does*, not what it says.
**Test:** Does this output make something legible (a rate, a mechanism, a consequence), or does it tell
the user what to attend to, choose, or prioritise? The first is teaching and is the product; the second
is advice and is forbidden — however it is phrased.

- **Scope:** app-wide, but load-bearing for every teaching moment and every piece of generated copy.
- **Traced to:** D-009 (strict no-advice stance), D-025 (unprompted prioritisation is advice), D-028
  (structural prioritisation is advice too). The "does, not says" formulation is the hard-won refinement
  from BRIEF-002 — it exists because wording-level rules were routed around twice.
- **What it forbids:** ranking the user's problems; picking a winner among paths; steering by structure
  (which thing gets explained, named first, or made the frame) even when no sentence advises.
- **Compliance note:** this principle is also a compliance object. Any decision that touches *where* the
  advice line sits is Compliance-category and therefore Tier 3 (protocol §4.3) — P2 does not license the
  Product lens to settle advisory-line questions on its own.

### P4 — Start strict, relax deliberately — never the reverse.
**Test:** When unsure how permissive a behaviour should be, choose the stricter setting and record what
specific evidence would justify loosening it later. Loosening is always a deliberate, conditioned
decision; it never happens by default, by drift, or by accretion of individually-reasonable narrowings.

- **Scope:** app-wide, wherever a permissiveness dial exists.
- **Traced to:** D-009 (explicit), D-025 (Path A over B, by this logic by name), and the recurring
  "park the growth direction with explicit unpark conditions" pattern (Path B of both BRIEF-001 and -002).
- **What it forbids:** shipping the permissive version "to see how it goes"; loosening because a strict
  setting is momentarily inconvenient; treating elapsed time or user count as sufficient reason to relax.

### P6 — The user sees their real world; only the model sees the masked one.
**Test:** Does this masking, aliasing, or abstraction protect what reaches the LLM, or does it degrade
what the user sees? Protecting the model's input is required; degrading the user's own view of their own
money is forbidden. The user always gets their real names, real numbers, real world back.

- **Scope:** app-wide, wherever compliance/privacy machinery meets the user-facing surface.
- **Traced to:** D-010 (aliasing protects the API boundary), D-011 (full re-humanising in the UI —
  masking applies only to what the LLM sees, never to the user's own view).
- **What it forbids:** showing the user "Fund-A" instead of their fund's real name; letting privacy
  machinery make the app feel sterile or foreign to the person whose data it is.

### P7 — Engagement design may use the full behavioral toolkit, but only on behavior — never on the user's real financial data.
**Test:** Does this game/engagement element (reward, streak, mascot reaction, XP, fictional skin) respond
to something the user *did in the app* — opened it, completed a teaching moment, hit a session count — or
to their *actual financial data* — a number, a holding, net worth? The first is permitted without
restriction, deliberately including techniques associated with habit-forming design (streaks, variable/
unpredictable reward feedback, the full Hook Loop architecture). The second is forbidden: real financial
data is always shown straight, undecorated — never scored, never used to drive a character's mood, never
wrapped in game fiction.

- **Scope:** app-wide, anywhere a habit/retention/engagement mechanic is designed.
- **Traced to:** D-060 (full adoption of engagement mechanics — streaks, variable reward, Hook Loop — as
  an explicit, on-the-record carve-out from P4's start-strict default, not a supersession of it) and D-061
  (interprets P6 into gamification design for the first time — game elements may react to behavior, never
  to real financial data).
- **What it forbids:** XP/levels/badges tied to net worth or a specific holding; a mascot whose mood is
  driven by the user's financial figures; an RPG/fantasy skin wrapping real loan or investment data; any
  progress mechanic that scores or fictionalizes a real number from the living baseline.
- **Relationship to P4:** this principle is a named, scoped exception to P4's "start strict, relax
  deliberately" default — chosen explicitly and knowingly (D-060), not by drift. P4 continues to govern
  every other permissiveness dial in the product, including compliance-adjacent ones, unchanged.
- **Relationship to P2:** the permission this principle grants is for *general app engagement* only. A
  mechanic that ties a specific reward, streak, or badge to a specific financial action or choice (not
  just app usage) is not covered by P7's blanket permission — that shape of feature steers a financial
  decision via a game-shaped nudge and needs its own P2 (teach-never-advise) check when it's actually
  designed.

### P8 — A holding family's section is always reachable — never gated behind having data in it.
**Test:** For any holding family in the D-013 taxonomy, is its section reachable through the app's
persistent navigation regardless of whether the user currently holds anything in it? If a section would be
hidden, collapsed out of navigation, or otherwise made unreachable until data exists in it, that fails.

- **Scope:** app-wide information architecture — which sections exist in persistent navigation and when.
  Does NOT govern what an empty section's screen looks like or says — that is empty-state *design*, left
  open until a real screen decision forces it (same extraction discipline as the aesthetic layer below).
- **Traced to:** D-031 (the app is structured as persistent, user-facing category sections — Investments/
  Loans/Insurance — not a menu-less, AI-surfacing-only surface).
- **What it forbids:** hiding an empty family's tab/section from navigation; treating zero holdings as a
  reason to suppress a section entirely; making a section's reachability conditional on having data in it.
- **Resolved tension (item 2 of the 2026-08-05 UX-principles discussion):** "persistent" was checked
  against whether it should apply differently to an empty section vs. a populated one. Resolved: no —
  empty sections are shown, not hidden. This commits only to reachability; it does not pre-design what the
  empty state shows.

### P9 — No comprehension gates: teaching content is never locked behind a quiz or a prior lesson.
**Test:** Can the user reach any relevant teaching content the moment it's surfaced, or does something
stand between them and it — a comprehension check, a passed quiz, a completed prior lesson, a "you must
finish X to unlock Y" sequence? If something stands between them, that fails, regardless of how the gate
is dressed up (a game mechanic, a "level," a locked card).

- **Scope:** app-wide, everywhere a teaching moment or piece of content could be sequenced or gated.
- **Traced to:** `PROJECT_SPEC.md` §2 ("Learn on the go. No curriculum/lesson tree. Teaching is triggered
  by the user's real actions and data.") and §4 item 6 (teaching moments are AI-surfaced by real actions,
  not button-tapped through a structured sequence) — founding-spec language never before promoted to a
  checkable Product-lens test.
- **What it forbids:** quizzes or comprehension checks gating access to content; a lesson-tree/curriculum
  structure where later content unlocks only after earlier content is "completed"; any gamification
  element (see P7) that conditions access to real teaching content on passing a check, rather than merely
  reacting to app usage.
- **Relationship to P7:** P7 permits the full behavioral-engagement toolkit (streaks, variable reward, the
  Hook Loop) but only reacting to *app usage* — opening the app, completing a moment, a session count. P9
  draws the adjacent line explicitly so P7's "full toolkit" permission is never read as licensing a
  gate: a mechanic like "answer 3/3 correctly to unlock the next teaching moment" is a comprehension gate
  on *content*, not an engagement reaction to *usage*, and P9 forbids it even though it could be dressed up
  as a game mechanic P7 would otherwise appear to bless.
- **Resolved scope note (item 3 of the 2026-08-05 UX-principles discussion):** no exception carved for a
  "light-touch" check (e.g. confirming the user read a number before moving on) — the framing was
  confirmed as-is, no such case is permitted.

### P10 — A real financial figure is never styled by valence.
**Test:** Does this styling choice tell the user something is *true*, or something is *good*? The first is
presentation and is permitted; the second is a verdict delivered by typography and is forbidden.

- **Scope:** app-wide, every surface that renders a number from the living baseline — holding values,
  balances, rates, EMI amounts, goal progress, budget lines.
- **Traced to:** D-087, from the v1 mockups' "real numbers wear no costume" (`docs/ux/mockups/`). Extends
  P2's "does, not says" test into the visual channel, which wording-level rules cannot reach.
- **What it forbids:** green/red by direction or performance; arrows or trend glyphs implying good/bad;
  coloured or gradient progress fills; conditional emphasis (bold/size/colour) triggered by a threshold;
  "on track"/"behind" styling; celebratory treatment attached to a figure rather than to an action.
- **Relationship to P7:** P7 blocks the mascot reacting to net worth; P10 blocks the net worth itself
  being coloured. P7 covers game surfaces, P10 covers the quieter case — ordinary, non-game styling that
  still encodes a judgement. Together they close the surface.
- **Relationship to P6:** P10 constrains decoration, never legibility. Stripping valence must not strip
  information — the user still gets their real numbers, in full.
- **Worked example:** a goal at 27% is drawn in neutral ink. It is not failing; it is at 27%. Colouring it
  would be the app forming an opinion about the user's pace toward a target only the user set.

### P11 — The tutor's voice has its own typeface.
**Test:** Can the user tell, without reading a word of it, which text on this screen is FinTutor
*explaining* something versus the app *labelling or reporting*? If the two are typographically
indistinguishable, that fails.

- **Scope:** app-wide, every surface carrying both generated teaching copy and interface text.
- **Traced to:** D-088, from the v1 mockups. Serves D-009/D-025's teaching-vs-advice boundary by making it
  continuously visible; the alternative — a disclaimer on every explanation — is worse to read and, by
  repetition, less credible.
- **Implementation scope:** satisfied by the *distinction*, not by any particular typeface. Platform system
  faces (serif / sans / mono) are a complete implementation. The specific faces the mockups draw
  (Newsreader, IBM Plex) require `expo-font` + `@expo-google-fonts/*` — a dependency decision, separately
  escalated, deliberately not bundled into this principle.
- **What it forbids:** setting teaching copy in the interface face; setting a real value in the tutor
  serif; using the serif decoratively on non-teaching text (a heading, a button) — which dissolves the
  very signal the principle carries.

---

## Deliberately unprincipled (for now)

**Gamification/engagement design now has a principle — P7 (D-060, D-061).** Unlike the founding four
(extracted from decisions already made), P7 was decided through live, explicit deliberation in a
dedicated founding UX/gamification-framework session — working through a 25-principle candidate list
cluster by cluster, with real tension surfaced and real tradeoffs stated, rather than extracted from a
prior decision's implied stance.

**The broader UX/interaction-model principles D-031 anticipated have now been fully extracted (session
2026-08-05a, D-075/D-076/D-077).** Of the five characteristics named: aliases never shown is already P6;
AI-primary/manual-secondary population and progressive capture are P1's territory (patched, D-075);
persistent, always-accessible sections is **P8** (D-076); no comprehension gates / no lesson-tree is **P9**
(D-077). All five are now covered — this backlog item is closed.

**The aesthetic layer is no longer unprincipled, as of 10-Aug-2026 (D-086..D-092).** It stayed open on an
explicit condition — "until real screen decisions force it" — and the v1 mockups
(`docs/ux/mockups/MOCKUPS_v1.html`) were that forcing function: a full screen inventory across seven flows
made the palette, type, density and hierarchy questions unavoidable rather than hypothetical. Two
principles were extracted (**P10** valence, **P11** typeface); the rest of the register landed as decisions
rather than principles, because a colour value resolves no future fork on its own. The extraction
discipline held — nothing here was invented ahead of a screen that needed it.

What remains genuinely unprincipled: **motion and density.** The reskin uses React Native's built-in
`Animated`/`LayoutAnimation` only, and no decision yet says what motion *means* in this product — whether
it may respond to a real figure (P7/P10's question, transposed into time) is unanswered and will stay so
until a real screen forces it.

---

## Change log
- v1.6 (10-Aug-2026) — **P10 and P11 added; the aesthetic layer is no longer unprincipled** (D-087, D-088,
  in the D-086..D-092 mockup-adoption set). **P10** — a real financial figure is never styled by valence;
  extends P2's does-not-says test into the visual channel and closes, together with P7, the gap where
  ordinary non-game styling encodes a judgement. **P11** — the tutor's voice has its own typeface; makes
  D-009/D-025's boundary visible without a per-bubble disclaimer, scoped to platform system faces so the
  principle is not blocked on a font-dependency decision. Both extracted from
  `docs/ux/mockups/MOCKUPS_v1.html`, the forcing function the "deliberately unprincipled" section had been
  waiting for since v1.1. Motion and density remain unprincipled — see that section.
- v1.5 (05-Aug-2026) — **P9 added: no comprehension gates — teaching content is never locked behind a quiz
  or a prior lesson** (D-077). Item 3 of 3, closing the live UX-principles-section discussion opened in
  session 2026-08-05a. Traces to `PROJECT_SPEC.md` §2/§4's "learn on the go, no curriculum" language.
  Explicitly names its relationship to P7: P7's engagement toolkit reacts to app usage only, never
  gates access to content — P9 forbids dressing a comprehension gate up as a game mechanic. No
  light-touch-check exception carved; owner confirmed the framing as-is. This closes the D-031-anticipated
  UX-principles backlog item entirely — see the "Deliberately unprincipled" section below for the summary.
- v1.4 (05-Aug-2026) — **P8 added: a holding family's section is always reachable, never gated behind
  having data in it** (D-076). Item 2 of the live UX-principles-section discussion opened in session
  2026-08-05a. Traces to D-031 (persistent, user-facing category sections). Resolves the flagged tension
  from the prior checkpoint: empty sections are shown, not hidden — the principle governs reachability
  only, not empty-state screen design, which stays open per this file's extraction discipline. Item 3 (no
  comprehension gates) remains open. "Deliberately unprincipled" section updated to reflect P8 and the
  live-extraction status of the other D-031 characteristics.
- v1.3 (05-Aug-2026) — **P1's "Traced to" note patched (D-075), no change to P1's test or scope.** Records
  that D-031 narrowed D-012 by permitting a manual/browse entry point into the same sections as a
  secondary path — P1 still governs which path is *primary*, not whether a fallback may exist. Item 1 of
  the live UX-principles-section discussion opened in session 2026-08-05a; items 2 (persistent,
  always-accessible sections) and 3 (no comprehension gates) remain open.
- v1.2 (04-Aug-2026) — **P7 added: engagement design may use the full behavioral toolkit, but only on
  behavior, never on real financial data.** First principle decided through live deliberation rather than
  extracted from a prior decision — from a dedicated founding UX/gamification-framework session working a
  25-candidate-principle list cluster by cluster. Traces to D-060 (full adoption of Duolingo-style
  engagement mechanics — streaks, variable reward, the Hook Loop — an explicit, named exception to P4's
  start-strict default) and D-061 (interprets P6 into gamification design for the first time — game
  elements may react to app behavior, never to the user's real financial data). Two candidate principles
  from the same session — gated feature-unlock sequencing, social/group stakes — were NOT adopted; both
  already contradicted standing decisions (D-058, PROJECT_SPEC.md §5) and needed no new principle.
  "Deliberately unprincipled" section updated: gamification now has a principle; the broader UX/
  interaction-model section D-031 anticipated is unblocked (Decision 2 and 3 both resolved) but still
  unwritten, pending its own session; the aesthetic layer remains untouched.
- v1.1 (25-Jul-2026) — Updated the "deliberately unprincipled" note per **D-031**: a UX principles section is
  now pending (not indefinite), to be extracted once Decision 3 (budgeting/goals model) and Decision 2
  (per-item management depth) exist. Aesthetic layer still deliberately unprincipled. No change to the
  founding four.
- v1.0 (25-Jul-2026) — File created (authorized by D-030). Founding four principles extracted from
  decisions already made: **P1** (don't ask; infer/surface/defer — from D-012), **P2** (teach not advise,
  the line is what the output does not says — from D-009/D-025/D-028), **P4** (start strict, relax
  deliberately — from D-009/D-025), **P6** (user sees the real world, only the model sees the masked one —
  from D-010/D-011). Numbering preserves the extraction-pass labels (P3 was redirected to
  DECISION_PROTOCOL §6 as a precedent about *how to fix*, not a product principle; P5 — depth rationed,
  visibility not — was placed in the teaching-method design as a teaching-scoped principle, not app-wide).
  UX/UI surface deliberately left unprincipled, to fill by accretion.
