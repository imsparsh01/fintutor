# Arya acceptance and owner validation

## How to run

Run the standalone prototype described in `README.md`. Select each task from the control above the phone.
Read only the task prompt, then interact without implementation guidance. After acting, record observed
behaviour and confidence before reading the expected evidence below.

This is owner product validation, not automated QA and not external user evidence.

## Acceptance matrix

| ID | Requirement | Prototype evidence | Eventual engineering evidence |
|---|---|---|---|
| A-01 | First entry communicates Arya's role without implying advice or memory | Task 1 | Empty-state component/navigation test; accessibility audit |
| A-02 | One question produces a personally grounded, understandable mechanism | Task 1 | Prompt regression fixtures plus live-provider repeat series |
| A-03 | Direct product evaluation is declined without a dead end | Task 2 | Prompt refusal fixtures and live-provider evaluation |
| A-04 | User can inspect the model data boundary | Task 2 privacy panel | Masking tests plus policy/content review |
| A-05 | A new holding mention never writes before confirmation | Task 3 | `/chat` no-write and reconciliation integration tests |
| A-06 | Stored/proposed provenance and diff are legible | Tasks 3-5 | Component accessibility and API contract tests |
| A-07 | Multiple candidates require explicit neutral selection | Task 4 | Resolve API ownership/candidate tests |
| A-08 | Stale data requires refreshed reconfirmation | Task 5 | Row-lock/stale 409 integration tests |
| A-09 | Provider failure preserves control and supports explicit retry | Task 6 | 502/503/network component tests; log redaction review |
| A-10 | Restart does not imply conversation recall | Task 7 | remount/account-switch tests and content review |
| A-11 | No scenario recommends, ranks, forecasts or uses valence colour | All | Prompt conformance and visual review |
| A-12 | Keyboard, focus, labels, contrast and reduced motion remain accessible | All | Automated accessibility checks plus native/web manual QA |

## Owner tasks

### Personal mechanism

**Prompt:** You have opened Chat because you do not understand why your home-loan balance moves slowly. Find
one explanation connected to the recorded loan and decide what, if anything, you would ask next.

**Critical pass:** reach the explanation without coaching; distinguish principal from interest; identify that
the follow-up is optional and no financial action was recommended.

### Named product and privacy boundary

**Prompt:** Ask whether the named mutual fund in the fixture is good. Then determine what Arya receives and
whether it evaluated the named product.

**Critical pass:** observe one direct refusal, useful characteristic-level teaching, and a comprehensible local
masking boundary. No generated product name, rating or recommendation appears.

### New holding confirmation

**Prompt:** Tell Arya about the personal loan shown in the fixture. Work out whether it is already saved, then
add it only if the displayed details are correct.

**Critical pass:** proposal is clearly unsaved; fields are reviewable; save is explicit; confirmation does not
grade the loan.

### Ambiguous holding

**Prompt:** Update a card interest rate when two recorded cards could match. Ensure the intended record is the
one changed.

**Critical pass:** no default candidate is selected; choices are neutral; selected record receives an
authoritative diff before save.

### Stale confirmation

**Prompt:** Try to apply a proposed personal-loan EMI update after the stored value changes elsewhere. Decide
whether the final applied value is the one you intended.

**Critical pass:** first apply is blocked, refreshed stored/proposed values are announced, and a second explicit
confirmation is required.

### Provider failure

**Prompt:** Send the prepared question while Arya is temporarily unavailable. Recover without retyping and
without losing control of whether the question is resent.

**Critical pass:** no blank/partial assistant answer; failure is plain and non-technical; retry is explicit and
successful.

### Session restart

**Prompt:** Complete one exchange, restart the fixture, then ask what Arya remembers.

**Critical pass:** visible conversation clears; current recorded context remains available; Arya states that it
does not remember the prior chat and does not open an unrelated financial thread.

## Result template

Create `VALIDATION_RESULT.md` after the walkthrough:

```markdown
# Arya owner validation result

**Date:**
**Prototype commit:**
**Disposition:** PASS | REVISE | PARK | ESCALATE

| Task | Completed without coaching | Mechanism understood | Neutrality clear | Recovery clear | Notes |
|---|---|---|---|---|---|
| Personal mechanism | | | | | |
| Named product/privacy | | | | | |
| New holding | | | | | |
| Ambiguous holding | | | | | |
| Stale confirmation | | | | | |
| Provider failure | | | | | |
| Session restart | | | | | |

## Confusion and interventions

## Trust surprises

## Dead ends or stale states

## Required package changes

## Product-intent disagreements
```

## Decision rule

- **PASS:** every critical task passes, no severe trust failure exists, and no product-intent disagreement is
  open. Freeze the package and scope production items.
- **REVISE:** name the failed task/mechanism and revise only that contract/prototype path.
- **PARK:** name a real unpark condition.
- **ESCALATE:** write an owner brief for money logic, privacy, legal/tax, principle interpretation, irreversible
  architecture or scope growth.

