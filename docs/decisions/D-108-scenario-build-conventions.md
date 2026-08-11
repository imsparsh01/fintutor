# D-108 — Scenario build conventions: the app never asserts a rate, and prefills are always editable

**Tier:** 1 (records existing precedent; does not create a new principle)
**Date:** 12-Aug-2026
**Context:** BQ-056 execution (scenario batch 1, decided in D-106)

---

## What was decided

Three conventions, applied across all five scenarios in `app/screens/ScenarioScreen.tsx` and
`app/lib/scenarios.ts`. Each follows from something already settled — none of them is a new rule.

### 1. The app never supplies a rate

Expected return, inflation, and savings-account rates are always user inputs. There is no default,
no "typical" value, and no benchmark anywhere in the scenario code.

**Why this is Tier 1, not a new principle:** it is what `CalculatorScreen` already does — C-04,
C-17, C-22 and C-24 all ask the user for the rate rather than assuming one — and it is the direct
consequence of `CLAUDE.md`'s hard stop on "calculations users rely on". A return figure the app
hands the user is a forecast the app then has to defend. Asking for it is not.

S-07 (idle cash) takes this furthest: it asks for **two** rates — what the cash earns today and
what the user wants to compare against — rather than assuming cash earns nothing or that an
investment earns 12%. The output is the gap between two numbers the user chose.

### 2. Prefills are starting points, not assertions

Every scenario field populated from the user's real budget or holdings is editable, and carries a
visible `from your data` tag plus a note saying where the figure came from. A prefill the user
cannot argue with would be the app telling them what their position is; a prefill they can
overwrite is the app showing its work.

Two prefills required an explicit accuracy call:
- **FD vs RD** — `principal_or_monthly_amount` is a balance for an FD but a monthly instalment for
  an RD. Summing an RD's figure as a balance would overstate emergency runway, so RDs are excluded
  from the deposit total rather than silently counted.
- **PPF/EPF in emergency runway** — D-106 names EPF as an S-05 input, so it is included, but the
  copy states plainly that these balances have withdrawal rules and waiting periods, and tells the
  user they can clear the field to see the runway without them.

### 3. S-01 follows D-106's wording, not BUILD_QUEUE's compression

`docs/BUILD_QUEUE.md` compressed S-01 to "user enters the number; app shows SIP needed". D-106's
own text says: "at your current savings rate, your corpus reaches ₹[user-target] at age [X]."

D-106 governs — it is the decision of record, and the queue line is a summary of it. The queue's
reading would also have duplicated C-04 (SIP Goal Planner), which already answers "what monthly SIP
reaches this target". The scenario answers the different question: *when*, at the rate the user is
already saving. Age is an optional input (the app captures no date of birth); the primary output is
years.

## Reversibility

Fully reversible. All three are conventions inside two new files, with no schema, no dependency,
and no data written anywhere. Changing any of them is an edit, not a migration.

## Flagged for the owner, not decided here

- **"Inaction tax" as a user-facing label (S-07).** D-106 named it; it is kept as named. But the
  phrase presumes that not investing is a cost, which is close to the line P2 draws. The screen
  answers this with a D-091 block that says outright that cash sitting still is sometimes correct —
  an emergency buffer is supposed to sit still. If the owner wants the label itself changed, that is
  a product decision, not a build-time one.
- Whether convention 1 should be elevated to a named principle (P12). Recorded here as practice;
  naming it a principle would be Tier 3.
