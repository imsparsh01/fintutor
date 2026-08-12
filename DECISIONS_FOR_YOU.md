# Decisions waiting on you

**Last updated:** 12-Aug-2026 · **Waiting:** 5 questions · **Blocking:** all remaining build work

Right now the build queue is empty and nothing can start until these are answered. Everything here
needs you specifically — it's about privacy, user trust, and how we treat early users. None of it is
technical.

**How to answer:** type your answer on the `→ Your answer:` line under each question, then save. Or just
tell me in the next session ("decisions 1 to 5: A, A, A, A, yes"). Either works. "Let's discuss" is a
valid answer to any of them.

---

## 1. Do we ask users' permission before recording their learning activity?

To show someone a progress score, the app has to record things like "opened this lesson," "used the
calculator," "came back today." The question is whether we show a permission popup before doing that.

**Why it matters:** A popup looks careful and gives us legal cover. But it adds a step before someone can
use the app, and if they decline, their progress bar simply doesn't work — we'd be asking permission to
run a feature they can see on screen. This is different from hidden tracking; the user is looking at the
result of it.

**Options**

- **A — No popup.** Treat it as part of the app working. Explain it in the privacy policy, and let anyone
  see exactly what was recorded about them.
- **B — Popup.** Ask before recording anything.
- **C — Split.** No popup for the visible progress feature; ask separately if we ever want the data for
  business analysis.

**My recommendation: A.** This isn't surveillance, it's a scoreboard the user is actively looking at.
Asking permission to show someone their own score is confusing, and anyone who says no gets a broken
screen. The protections that actually matter here are different ones, and I'd hold us to all three: we
never sell this data, it never goes to an outside analytics company, and the user can always see their own
records. C sounds like a reasonable middle ground but in practice it's A plus a promise we're already
making.

**Caveat:** this is a privacy-law-adjacent call and you already have "legal review before public launch"
on your list. This answer should get checked by that lawyer, not treated as settled forever.

→ **Your answer:**

---

## 2. How long do we keep the detailed activity records?

There are two kinds of records: a detailed log of individual actions, and a running summary. The summary
is small and permanent. The question is the detailed log.

**Why it matters:** Keeping it longer lets us answer things like "do people who use calculators stick
around?" and lets us fix scoring mistakes properly. Keeping it shorter means less personal data sitting
around to be lost or leaked — which matters more for a money app than for most products.

**Options**

- **A — About a year (400 days),** then delete the detail and keep a daily summary forever.
- **B — 90 days,** then summary only.
- **C — Keep everything forever.**

**My recommendation: A.** 400 days gives you a full year plus margin, so you can compare this year to last
year. After that the detail earns its keep less and less, while the risk of holding it stays flat. The
daily summary that survives is boring by design — it can't embarrass anyone.

**One thing to settle alongside this:** whatever number you pick is only real if our backups don't quietly
keep the data longer. Nobody has decided how long backups live yet. If backups keep 90 days, a "400-day"
policy is really 490 days, and that's the number we'd have to stand behind. Worth deciding both together.

→ **Your answer:**

---

## 3. If we change the scoring rules later, can someone's progress go down?

The point values are set but deliberately provisional — the plan has always been to test them and tune
before launch. If we lower a value after someone has already earned points, their score could drop.

**Why it matters:** Very little damages trust faster than a progress bar going backwards. But if we lock
the numbers permanently, we can never fix scoring that turns out to be badly balanced.

**Options**

- **A — Progress never visibly decreases.** We can retune and recalculate as much as we want internally,
  but nobody is ever shown a smaller number than they saw yesterday.
- **B — Recalculate honestly** and let scores move in either direction.
- **C — Freeze the rules at launch** and never change them.

**My recommendation: A.** It gives us full freedom to fix the scoring while making the user-facing promise
unconditional. The cost is one extra stored value per person. B is more "correct" and would feel like a
betrayal to anyone on the receiving end. C trades a permanent constraint for a problem A already solves.

→ **Your answer:**

---

## 4. Do existing users get credit for what they did before this feature existed?

You and your test users have been using the app. When progress launches, do those accounts start at zero?

**Why it matters:** It'd be nice to reward early users. The problem is we never recorded their past
activity, so any credit we give is an estimate, not a record.

**Options**

- **A — Start at zero,** except the onboarding credit you already committed to giving existing users.
- **B — Estimate from what we can infer** — for example, guess return-days from the existing streak counter.
- **C — Everyone starts fresh,** including the already-promised onboarding credit.

**My recommendation: A.** B means inventing entries and putting them into the one system whose entire
value is that it's an accurate record of what actually happened — and you already set exactly this
precedent when you decided not to infer assessment answers from old data. C would walk back a commitment
for no gain. Practically this affects almost nobody today, which is a good argument for doing the clean
thing now while it's free.

→ **Your answer:**

---

## 5. Do we need the privacy policy written before building this?

You have an unwritten privacy policy on your open list. It's the document that would publicly state the
answer to question 2. So: settle these now and have the policy match later, or write the policy first?

**Why it matters:** Deciding now means building starts immediately. The risk is that writing the policy
properly later surfaces something that changes one of these answers — and changing them after real users
have data is genuinely expensive.

**Options**

- **A — Decide now, build now.** When the policy gets written, it adopts these answers rather than
  inventing new ones.
- **B — Write the privacy policy first,** then build to match.

**My recommendation: A,** with one condition: the policy, when written, treats these as already settled.
The risk is real but it's cheap right now because no real users exist. My answer would flip to B if you
were within weeks of a public launch.

→ **Your answer:**

---

## Already handled — no input needed unless you disagree

These came up while working through the above. They're technical judgment calls, not product or privacy
ones, so I've made them. Flagging for visibility only:

- **A "day" ends at midnight India time.** All your daily limits and streaks use that boundary. Correct for
  your entire intended audience. Someone who moves abroad keeps Indian day boundaries — noted as a known
  limitation rather than solved now.
- **The activity log records that something happened, not what it was worth.** Point values get applied
  when the score is calculated, not when the action is recorded. This is what makes question 3's
  recommendation possible at all.
- **Duplicate protection is enforced by the database,** not by app code — so refreshes, retries, and back
  button presses can't quietly inflate anyone's score.

---

*Full technical version, with the reasoning and the alternatives that were rejected:*
*`docs/features/progression/BRIEF-progression-instrumentation-privacy.md`*
