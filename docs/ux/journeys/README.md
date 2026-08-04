# User journey specs

One file per journey. A journey spec is written FROM an already-decided shape — a `DECISION_LOG.md`
entry, a `BRIEF-*.md`, or already-shipped behavior — not invented ahead of one. If a journey requires a
decision that hasn't been made yet, that's the signal to stop and get the decision first, same discipline
as everything else in this repo.

**Template for a new journey file:**

```markdown
# Journey: [name]

**Traces to:** [DECISION_LOG entries / BRIEF that decided this shape]
**Goal:** [what the user is trying to accomplish]

## Steps
1. [Screen/state] — [what the user sees/does] — [what happens next, and why]
2. ...

## Alternate paths
- [Path name] — [when it branches, where it goes]

## Open questions
- [anything the journey surfaces that isn't decided yet — don't silently resolve it here]
```

See `onboarding.md` for a worked example.
