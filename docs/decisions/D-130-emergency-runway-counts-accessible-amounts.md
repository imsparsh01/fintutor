# D-130 — Emergency runway counts accessible amounts, not total recorded wealth

**Date:** 12-Aug-2026  
**Tier:** 3 — owner-decided financial-calculation scope and interpretation.  
**Supersedes:** D-106/D-108 only where S-05 automatically included full recorded PPF/EPF balances.

## Decision

Emergency Runway and the D-128 Emergency Coverage calculator use one shared liquidity-narrow mechanism:

- user-entered cash/bank balance;
- editable recorded fixed-deposit principal, with a clear premature-closure caveat;
- an optional user-entered “other amount you know you could access”; and
- editable monthly outgoings.

Full recorded PPF/EPF balances are not automatically included. FinTutor does not infer whether a user is
eligible to withdraw retirement funds, how much is available, how long access takes, or what tax, penalty,
or conditions apply. A user who knows an additional amount is accessible may include that amount explicitly.

The result is `entered accessible balances / entered monthly outgoings`, stated as the number of months those
inputs cover. It never says that the runway is enough, safe, adequate, or a recommended target.

## Why

Emergency runway measures accessible funding time, not ownership or net worth. FinTutor lacks the legal,
employment, account, timing, and eligibility context needed to treat a full retirement balance as emergency
liquidity. Excluding it by default produces a smaller but more defensible number and keeps the user in control
of any amount they know can actually be accessed.

## Required presentation

- Identify every balance category counted in the result.
- State that fixed-deposit premature closure can reduce or delay available proceeds.
- State that taxes, penalties, access delays, changing expenses, and returns are not modeled.
- Monthly outgoings remain editable; FinTutor does not decide which expenses the user would cut.
- Use neutral figure styling and mechanism copy under P2/P10/D-091.

## Boundaries

- No retirement-withdrawal eligibility, tax, penalty, or processing-time calculation.
- No persistence for the optional accessible amount.
- No new cash/bank holding family or schema.
- No change to Portfolio Health's separately self-reported emergency-month answer.
- No recommended emergency-month target.

