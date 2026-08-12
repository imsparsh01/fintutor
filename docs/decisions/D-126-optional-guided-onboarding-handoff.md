# D-126 — Onboarding ends with an optional, user-chosen first action

**Date:** 12-Aug-2026  
**Tier:** 3 — owner-decided product flow and financial-context collection boundary.  
**Interprets:** D-118/D-119 and reconciles PROJECT_SPEC §4's older baseline-building language.

## Decision

New-user onboarding remains the short five-axis orientation approved by D-118/D-119. When it is handled,
FinTutor offers a clear but entirely optional first action based on what the user wants to do:

- ask Arya a question;
- add or understand something they already manage;
- create or explore a goal;
- try a calculator or scenario; or
- enter the app and look around without providing further context.

Income, holdings, goals, amounts, names, and other financial details are not mandatory onboarding fields.
They enter the living baseline progressively, only through an explicit user action and the existing
confirmation/manual-capture boundaries. Skipping context gives the same access as providing it.

The handoff is navigation and explanation, not a new financial assessment, recommendation, completion gate,
or separate stored state. D-119's normalized assessment schema remains unchanged; the approved immediate
intent may choose the initially highlighted route, while the user can select any route or Home.

## Why

The user needs direction after orientation but does not owe FinTutor a financial census before receiving
value. A chosen next step connects intent to an existing capability, begins the living baseline only when
useful, and supports students or users with no holdings without forcing irrelevant disclosure.

## Boundaries

- No mandatory amount, holding, income, goal, institution, or product-name capture.
- No auto-save or inferred financial record.
- No new route, schema, dependency, financial calculation, or progression reward.
- Empty-state Home and every offered destination must remain usable without financial data.
- This decision does not settle true holding reconciliation/contradiction semantics.

## Rule extraction

Onboarding may orient and offer a relevant doorway; it may not make financial disclosure the price of
entering or understanding FinTutor.

