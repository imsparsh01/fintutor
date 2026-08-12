# Decisions waiting on you

**Last updated:** 12-Aug-2026 · **Waiting:** 4 questions below, plus 4 raised by the D-125 audit ·
**Blocking:** the Part 1 questions block nothing. The D-125 audit questions do — see
`docs/sessions/2026-08-12-D125-MVP-RECONCILIATION.md`, which is the live list. READY is empty.

**How to answer:** type your answer on the `→ Your answer:` line under each question, then save. Or just
tell me in the next session ("1 to 4: A, A, A, A"). Either works. "Let's discuss" is a valid answer to any
of them.

---

# Part 1 — The self-driving build pipeline

This is the idea that answering questions from your phone should be enough to make the build work happen
on its own, overnight, without you opening a session. The design is written up and ready; these four
choices are what's left. None of them blocks anything today — the queue has work in it either way.

Full technical version: `docs/decisions/D-120-commit-triggered-autonomous-build-pipeline.md`

## 1. Does the overnight work come back as a pull request, or go straight into the project?

**Why it matters:** You decided a while back (D-056) to skip pull requests and merge straight to main. That
was the right call for sessions you're watching happen. An unattended 2am run is a different situation —
there's nobody watching.

**Options**

- **A — Pull request, one per run.** You look at it in the morning and merge or close it.
- **B — Straight to main,** same as your normal sessions.

**My recommendation: A.** It costs you about thirty seconds on a phone in the morning. What it buys is
that a bad night is a closed pull request instead of you untangling main mid-workday. Your existing
straight-to-main rule stays exactly as it is for sessions you're actually in.

→ **Your answer:**

---

## 2. Should overnight runs use the subscription you already pay for, or the pay-per-use API?

**Why it matters:** The subscription is already paid. The open question is whether overnight runs eat into
the capacity you want during the day.

**Options**

- **A — Subscription first,** with pay-per-use switched off. Revisit after a week of real data.
- **B — Pay-per-use API for overnight runs,** keeping the subscription for your own sessions.

**My recommendation: A.** Paying for API while subscription capacity sits idle is waste. Whether overnight
runs actually squeeze your mornings is a question one week of data answers, and switching later is easy.

**Before this gets built** I need to confirm the subscription login actually works in the automated
environment. If it doesn't, this comes back to you rather than quietly defaulting to the paid option.

→ **Your answer:**

---

## 3. Can overnight runs work on tasks involving money calculations?

**Why it matters:** Automated checks can catch code that crashes. They cannot catch a tax number that is
wrong but looks reasonable.

**Options**

- **A — Yes, but flagged.** Anything producing a number a user acts on — tax, Portfolio Health,
  projections, budget math — gets labelled so you know that one needs real reading, not a skim.
- **B — No.** Money-math tasks wait for a session you're in.

**My recommendation: A.** B sounds safer but mostly just moves the same work back onto you. The actual
protection is you reading the output carefully, and a label is what tells you which ones to read carefully.

→ **Your answer:**

---

## 4. Should the autopilot switch turn itself off after each run?

**Why it matters:** This is the kill switch. There's an on/off line in this file that the automation reads.

**Options**

- **A — Turns itself off after every run.** You switch it back on in the same save that carries your
  answers, so answering and enabling are one action.
- **B — Stays on** until you turn it off.

**My recommendation: A.** A run that goes wrong at 2am can't repeat at 6am. It also means autopilot is
always off while you're at the desktop, so automated and live work never collide.

→ **Your answer:**

---

# Part 2 — Answered, for your records

## The five progress-tracking questions — answered 12-Aug-2026: A, A, A, A, A

Written up as **D-121**. This unblocked BQ-069, which was built and archived on 12-Aug-2026 (along with
BQ-070's surfaces and BQ-071's emitters). What you decided:

1. **No permission popup** for recording learning activity — it's treated as part of the app working, with
   three standing protections: never sold, never sent to an outside analytics company, always visible to
   the user.
2. **400 days** for the detailed activity log, then a daily summary kept forever.
3. **Progress never visibly goes down**, even if the scoring gets retuned later.
4. **Existing users start at zero**, apart from the onboarding credit already promised.
5. **Decide now, build now** — the privacy policy adopts these numbers when it gets written.

**Two things I'm carrying forward rather than treating as closed.** Neither blocks the build:

- **Backups aren't decided yet.** Your 400-day answer is only true if backups don't quietly hold the data
  longer. If backups keep 90 days, the honest public number is 490. That gets settled when the privacy
  policy does.
- **Question 1 is privacy-law-adjacent.** You already have legal review before public launch on your list.
  This answer should get checked there rather than treated as settled forever.

*Full write-up: `docs/features/progression/decisions/D-121-progression-instrumentation-privacy-package.md`*
