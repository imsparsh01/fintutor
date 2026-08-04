# D-067 — BQ-026 detection mechanism resolved: user-triggered for v1 (Path D), auto-detection deferred to real usage evidence

- **Tier:** owner-decided directly in conversation, resolving half of BQ-026 (BRIEF-013's comparison-view
  item). No hard-stop trigger fires: not money movement/calculation itself (the trigger mechanism, not the
  math — see the still-open second half of BQ-026); not legal/tax/regulatory shape; doesn't contradict a
  standing principle (reinforces D-012's AI-primary/manual-secondary pattern rather than breaking it);
  fully reversible (no data or code populated yet, additive to whichever detection approach comes later);
  not an MVP scope increase (comparison functionality was already anticipated in BRIEF-012's must-haves —
  this resolves *how* it triggers, not whether it exists). Real tradeoffs were weighed across four
  candidate paths, which is why this went to conversation rather than being decided silently.
- **Context:** BQ-026 (comparison-view modal + decision-shaped path computation) was flagged in
  `docs/BUILD_QUEUE.md` as very likely needing its own decision, same shape as D-065. It actually splits
  into two separable questions: (1) how the app detects a decision-shaped moment worth showing the
  comparison view, and (2) the actual comparison math (loan-vs-invest breakeven, tax-saving modeling,
  ESOP-timing). This decision resolves (1) only; (2) remains open.
- **Decision:** For v1, detection is **user-triggered, not automatic** (Path D of four candidates
  considered). An explicit "Compare paths" affordance lets the user invoke the comparison flow directly,
  rather than the app inferring intent from conversational phrasing. Auto-detection (a Haiku classifier —
  Path B, the strongest of the automatic candidates) is deliberately deferred, to be revisited **only once
  real usage from the user-triggered path shows what actual demand and actual phrasing look like** — not
  built against guessed patterns now.
- **Paths considered (not adopted, why):**
  - **A — backend keyword/pattern matching.** Ruled out, not just deprioritized: this exact shape of
    approach already has a direct precedent failure in this codebase — D-049 found it "does little useful
    work in practice" for the structurally similar `deepen`-selection problem.
  - **B — a second Haiku classifier call in the `/chat` path.** Architecturally the "right" long-term
    answer (extends D-002's model-per-job split to a third use of Haiku) and most likely to actually catch
    real intent. Deferred, not rejected — see below.
  - **C — the teaching model self-signals via a structured marker alongside its answer.** Ruled out: its
    failure mode (a malformed marker corrupting the visible answer) is worse than simply not triggering,
    since it risks breaking the thing that actually matters rather than just missing an enrichment.
  - **D — user-triggered, no automatic detection.** **Adopted for v1.**
- **Why D, and why now rather than B:** This project's own demonstrated discipline is proving things with
  real evidence before generalizing — D-006's reasoning for running Phase 1 before building plumbing,
  and BQ-002/BQ-003's second fixture before trusting a Phase 1 finding. There are no live users yet, so any
  classifier (A or B) or self-signaling scheme (C) would be built against *guessed* patterns of real
  decision-shaped phrasing — precisely the kind of blind spot FINDING 2 (the "worth" leak) demonstrated
  isn't visible until real output exists to inspect. D is also not a lesser or stopgap option: D-012
  already established AI-surfaced-primary/manual-secondary as legitimate, standing doctrine, shipped for
  every holding-capture flow in this app — D applies the identical pattern here, not a compromise against
  it.
- **Compliance note, not a new finding — restated because it shaped confidence in this choice:** the
  comparison modal does not carry the "never pick a winner" guarantee by itself; the chat engine's text
  answer already has to satisfy that independently (§2 rule 2, §3 rule 5 require naming every path with
  equal weight regardless of whether a modal exists). So detection reliability is a UX/product risk here,
  not a compliance one, as long as the modal's own content obeys the same neutral-ordering rule BRIEF-013
  already specified for it.
- **Named but not resolved — flagged for the owner explicitly, not defaulted either way:** `deepen`/BQ-004
  is a structural cousin (something other than the user's literal words decides what happens next), and
  that item is still blocked on an unresolved regulatory question (BRIEF-006). This decision treats
  comparison-detection as meaningfully different — intent classification, not ranking a winner among the
  user's holdings — and does not treat BQ-004's caution as automatically transferring. If that distinction
  turns out to be wrong, this is the entry to revisit.
- **Reversibility:** High — D is additive; nothing about shipping it forecloses B later. The comparison
  modal and math backend (once (2) is resolved) are shared by any detection path, so no work here is lost
  if a smarter trigger replaces D in the future.
- **Unpark condition for Path B:** real usage data from the user-triggered path showing a genuine gap (a
  demonstrated pattern of decision-shaped questions users ask in chat without using the explicit trigger)
  — not elapsed time, not a hunch. Same evidence-before-generalizing bar this project already holds itself
  to elsewhere.
- **Feeds:** unblocks the UI-shell half of BQ-026 once (2) — the comparison math — is also resolved;
  `docs/BUILD_QUEUE.md` updated to reflect this is still not fully buildable until the math question closes.
- **Date:** 04-Aug-2026
