# FinTutor — Product Requirements & Brand Overview
### For waitlist landing page + Instagram marketing materials

> **Grounding note:** every fact in this document is pulled from FinTutor's real, decided project spec and
> research (`PROJECT_SPEC.md`, `docs/decisions/`, `docs/BRIEF-008` through `BRIEF-011`) — nothing here is
> invented to fill a template. A handful of fields (waitlist incentive, visual palette, launch metrics) are
> genuinely undecided or don't exist yet as real data; those are marked **[OPEN]** rather than guessed at,
> because handing a developer/designer a fabricated stat or an unconfirmed pricing perk is worse than
> leaving it blank. Read the **Compliance & Copy Guardrails** section at the end before writing a single
> line of public copy — it isn't boilerplate, it's the reason this product exists in its current shape.

---

## 1. Executive Summary & Brand Identity

**Startup name (working title):** FinTutor. Used consistently across all internal specs and decisions —
but no formal naming/trademark decision has ever been logged, so treat this as a strong working title, not
a legally cleared final name.

**One-sentence elevator pitch:**
> FinTutor is the financial companion that teaches you how your own money actually works — never tells you
> what to buy, always shows you the math on your real numbers so you decide with confidence.

**Brand tone & personality — grounded, not invented:** FinTutor already has a real, written voice
specification (used to govern its in-app AI's every response), and it's the closest thing to a brand-tone
brief that exists today:

- **Plain, warm, unhurried, direct.** Short sentences, concrete nouns, no unexplained jargon. Never
  bureaucratic ("it may be observed that…"), never chirpy ("Great question!"), never salesy. "Warm" means
  the tone of someone who has time for you — not exclamation marks, not encouragement-as-filler.
- **No hedging into uselessness.** Warmth isn't softness about numbers — when the product states a
  consequence, it states it plainly, with the actual figure, not a vague qualifier.
- **Indian English, naturally** — lakh/crore as the default units, not "₹200,000" with a rupee symbol
  pasted onto international formatting. Real instrument vocabulary as it's actually spoken: EMI, SIP, PPF,
  term plan, prepayment, tenure.
- **A growth metaphor, not a finance-bro one.** The in-app mascot is named **Ankur** (Hindi for "sprout" /
  "bud") — currently a placeholder 🌱 emoji, reacting only to app engagement (streaks, completed teaching
  moments), *never* to financial figures — that boundary is deliberate product policy (P7), not a missing
  feature. The metaphor is patient growth, not hype or urgency.

**In one phrase for a designer:** *a patient, plain-spoken companion — not a slick fintech dashboard, not a
gamified hustle-culture app.* Closer to a good teacher than a trading terminal.

**Visual identity — honest status: undesigned, not "TBD-but-secretly-fixed."** The current app UI is a
functional placeholder (`#111` text on `#fff`, one green `#116611` accent) explicitly seeded from
whatever screens happened to use it, not a considered palette — nothing here should be treated as brand
color. **This is a genuine blank canvas for your designer**, constrained only by the tone above: warm,
plain, unhurried. Avoid "sleek futuristic dark-mode" or "bold developer-focused" framing — those don't fit
a financial-literacy product whose whole differentiator is patience and clarity over slickness.

---

## 2. Target Audience & Pain Points

FinTutor's founding segment isn't a guess — it's the output of two independently-run research passes
(product-fit lens and business/GTM lens) that converged on the same answer.

**Primary founding segment:** early-career earners with a **single income stream and low financial
complexity** (0–2 holding types, no legacy portfolio) — not defined by age, defined by "financially
unmanaged but willing." This segment contains three real, equally-in-scope internal profiles — same people,
two ways of describing them:

| By financial-habit maturity | By career stage/timing |
|---|---|
| **Fresh starters** — no framework yet, don't know what a "first move" even is | **Campus-to-first-job** — near-zero holdings, near-zero urgency |
| **Reactive dabblers** — hold one product bought under pressure (family/agent), can't explain what it does | **Settled early-career** — likely already tried a budgeting/broker app, highest expectations |
| **Habit-formers** — already tracking in a spreadsheet, wants a blind-spot check, not a lecture | **Startup/gig employee** — irregular income, ESOP confusion is a top-cited pain point |

**"The Old Way" — real, researched pain points, not invented ones:**

1. **No single place to see "what do I actually have."** Holdings scattered across apps, paper, and memory;
   EMI/premium due dates tracked by memory or bank SMS, so missed payments get discovered only after a
   penalty already hit.
2. **Jargon opacity on their own statements.** NAV, sum assured, XIRR, principal outstanding — terms that
   show up unexplained on documents that are supposedly *theirs*, forcing a choice between confusion and a
   Google search that doesn't know their actual numbers.
3. **No neutral place to reason about a real decision.** A reactive dabbler holds a product bought under
   family/agent pressure and can't tell if it's even right for its stated purpose — every place they'd ask
   ("should I keep this?") either sells them something or won't engage with their specific numbers at all.

**"The New Way" — what FinTutor actually does about each:**

1. A **living Consolidated view** — every holding across Investments, Loans, and Insurance in one place,
   kept current because the AI nudges completeness when a mentioned-but-unlogged holding comes up in
   conversation, not through a form the user has to remember to fill in.
2. **Jargon explained inline, computed against the user's own numbers** the moment it's relevant — not a
   generic glossary entry, an answer that uses their actual EMI, their actual salary.
3. **Decision-shaped moments modeled side by side on the user's real numbers** — mechanism, numbers,
   trajectory, and risk for every real path, closing on a single concrete "number to watch" — never a
   verdict, always enough rigor that neutral doesn't feel like a shrug.

---

## 3. Core Product Features (Top 4 — all real, already built)

### Feature 1: Zero-friction, AI-guided capture
**What it is:** Nothing to fill in. Holdings enter the app because the AI notices them in conversation — a
loan conversation naturally surfaces term insurance as a relevant concept; the user confirms, the AI
handles categorization. A manual "add" path exists for users who want to log something directly, but it's
the fallback, not the front door.
**Benefit:** the single biggest onboarding-abandonment risk for a finance app — a long form before any
value is delivered — simply doesn't exist here.

### Feature 2: The Consolidated view
**What it is:** One living picture of everything the user holds — Investments, Loans, Insurance — updated
as the AI-guided conversation captures more, not a static dashboard that goes stale within weeks.
**Benefit:** answers the single most common pain point across every researched profile: "what do I actually
have, all in one place."

### Feature 3: Decision-shaped teaching moments — mechanism, never a verdict
**What it is:** For a real financial fork (pay down a loan vs. invest the surplus; how much unused 80C tax
room is left; what exercising ESOP options would actually cost today), FinTutor models every real path
side-by-side on the user's own numbers — never picks a winner, never says "you should." Built today:
loan-vs-invest hurdle-rate comparison, unused-80C tax-saving room, ESOP exercise-cost-today calculator.
**Benefit:** the exact moment competitors either oversell a verdict (advice, which is regulated) or go
generic (useless) — FinTutor stays rigorous and specific without crossing into advice.

### Feature 4: Privacy-by-design — real product names never reach the AI
**What it is:** Every fund, stock, or policy a user holds is stored internally under an alias (e.g.
"Fund-A"); all its real characteristics are tracked normally, but the actual name is never sent to the AI
model at all — architecturally, not just as a prompt instruction. This closes off an entire class of
failure (a model mistake, a prompt-injection attempt, a logging leak) rather than just discouraging it.
**Benefit:** a genuine, concrete trust claim for marketing — "your fund and policy names never leave our
infrastructure" is a specific, verifiable statement, not a generic "bank-grade security" platitude.

---

## 4. Interactive Hero Demo / Preview Idea

**Concept: "Watch a number explain itself."**

A single interactive widget in the hero section — no login, no data linking. The visitor drags a slider or
types one real-feeling number (e.g. "₹40L home loan, 8.5%, 20-year tenure") and watches, live, a plain-
English breakdown appear: how much of the EMI is interest right now, what a ₹2L prepayment today actually
changes, phrased exactly the way the product itself talks (short sentences, the real number, no hedging).

**Why this shape specifically, not a generic "before/after" slider:** it demonstrates the actual
differentiator — mechanism computed on a real number, in FinTutor's real voice — in five seconds, without
requiring the visitor to trust the app with their real data first. It's a preview of the product's core
loop (loan-vs-invest, tax room, EMI mechanics), not a decorative mockup.

**Build note for your developer:** this should be a self-contained client-side calculation (the same math
as the real `loan-vs-invest`/`tax-saving-room` backend logic, reimplemented simply) — it must **not** call
the live backend or require an account, and it must **never** recommend anything ("prepaying saves you ₹X
in interest" is fine — a fact; "you should prepay" is not, see the Compliance section below).

---

## 5. Waitlist Offer & Incentives

**[OPEN — no pricing or monetization decision has been made yet.]** Nothing below should be read as
decided; these are safe, low-risk placeholder options that don't presuppose a business model FinTutor
hasn't chosen yet. Do not commit to a discount percentage or a credit system in real copy until that
decision actually exists — it's the kind of call this project's own process treats as owner-only, not
something to back into via a landing page.

**Reasonable primary incentive (pending confirmation):** *Founding member early access* — first cohort into
the private beta, with a direct feedback channel into what gets built next. Costs nothing to promise,
doesn't presuppose pricing.

**Secondary lead magnet — on-brand and safe to build today:** a short, plain-English **"Decode Your
Payslip/Loan Statement" cheat sheet** (PDF or single landing-page section) — explains EPF, NAV, sum
assured, XIRR, principal-outstanding in the same voice as the product itself. This is genuinely valuable,
costs nothing to produce, and is unambiguously *educational* content — no compliance risk, unlike a
"template" or "guide" that could shade into advice.

---

## 6. Key Integrations & Tech Stack

Real, current stack — safe to disclose:

- **App:** React Native via Expo (cross-platform mobile + web)
- **Backend:** Python, FastAPI, SQLAlchemy, Alembic
- **Data & Auth:** Supabase (managed Postgres + authentication)
- **AI:** Anthropic Claude — Sonnet for the teaching/conversation engine, Haiku for lightweight
  classification tasks (e.g. detecting which holding a question is about)

**[OPEN]** Whether to feature "Powered by Claude / Anthropic" prominently on the landing page is a
positioning call, not a technical fact — some fintech products lead with their AI vendor, others keep it a
backend detail. Your call; either is accurate.

There are no GitHub/Stripe/Slack/Chrome-extension integrations — those don't apply to this product's actual
category (a consumer mobile app, not a developer tool), and including them would misrepresent the product.

---

## 7. Key Stats & Metrics to Highlight

**[OPEN — genuinely no data yet.]** FinTutor is pre-launch with no real users, so there are no real usage
numbers to cite. Do not fabricate a stat like "saves 10+ hours/week" or "99.9% uptime" for a product with
zero live users — that's not a placeholder, it's a false claim the moment it's published, and for a
product operating under real regulatory scrutiny (see below), that's a genuine risk, not just bad form.

**What to use instead, today:** qualitative, verifiable claims about the *mechanism*, not fabricated social
proof:
- "Every answer traces to your own numbers — not an average, not a stock tip."
- "Your fund and policy names never reach our AI — by architecture, not by promise." (Feature 4, above)

**Worth tracking once real users exist**, to replace the above with real numbers post-launch: onboarding
completion rate, time-to-first-value-moment (first computed answer), 7-day/30-day return rate. None of
these exist yet — noted here only so this section isn't quietly skipped when it's time to update this doc.

---

## Compliance & Copy Guardrails (read before writing any public-facing copy)

This is not boilerplate. FinTutor's entire product architecture exists because of a specific, named
regulatory risk: SEBI's Investment Advisers Regulations draw enforcement scrutiny around content that
functions as personalized investment advice *regardless of "educational" framing* — including a real,
recent case where a finfluencer's "education" was ruled unregistered advisory activity (₹546 crore
impounded). FinTutor's in-app AI is built strictly to never name a product, never rank a path, never say
"you should" — landing page and Instagram copy need the exact same discipline, because the same regulator
doesn't distinguish between in-app text and marketing copy:

- **Never**: "our AI picks the best fund for you," "10x your returns," "we recommend," any phrasing that
  implies a verdict or a specific outcome.
- **Always fine**: mechanism claims ("see exactly how compound interest works on your own EMI"), factual
  claims about what the product computes ("a breakeven number — the exact point where two paths are
  mathematically equal"), architecture/privacy claims (Feature 4).
- **Watch for structural ranking**, not just banned phrases — presenting options in a fixed order, or
  visually emphasizing one path, can read as a recommendation even with neutral wording. If a mockup shows
  two paths side by side, keep the treatment visually equal.
- If in doubt on a specific line of copy, treat it exactly like a product-copy decision inside the app
  itself — flag it rather than publish it, and check `docs/decisions/D-009-compliance-stance-strict-no-product-security-names.md`
  for the full reasoning.
