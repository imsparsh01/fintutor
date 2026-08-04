# Screen wireframes

One file per screen (or a tightly related group, like the three holding-family list screens which share
one component). No design-tool integration exists in this repo, so a wireframe here is a structured text
spec, not an image — purpose, key elements, and every real state the screen can be in.

**Template for a new wireframe file:**

```markdown
# Wireframe: [screen name]

**Traces to:** [BQ item / BRIEF / decision that shaped this screen]
**Component(s):** [file path(s) in app/]

## Purpose
[one or two sentences]

## Elements
- [element] — [what it shows / does]

## States
- Loading — [what's shown]
- Empty — [what's shown]
- Error — [what's shown]
- Populated — [what's shown]
```

See `holdings-list.md` for a worked example, written from the already-shipped `HoldingsList` component
(BQ-019, BQ-027) rather than invented ahead of the code.
