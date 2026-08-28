# D-165 — Portfolio Health uses no score bands or headline grade

- **Tier:** 3, owner-decided interpretation of the teach-never-advise boundary.
- **Supersedes:** D-106's “Getting started / Building up / On track / Strong” bands.
- **Builds on:** D-163's removal of the overall score.
- **Date:** 29-Aug-2026

## Decision

Portfolio Health uses no categorical score bands and no headline grade. Each measure shows its factual value,
unit, source, formula boundary and unknown state. Copy never describes the user's Portfolio as strong, weak,
on track, behind, healthy or unhealthy.

## Why

Neutral colour does not neutralize evaluative words. “On track” and “Strong” imply adequacy and can steer the
user even when the underlying number is transparent.

## Boundaries

- Factual mechanism labels remain.
- Descriptive copy such as “3 measures available; 1 not provided” is allowed.
- No production code changes until the fixture receives owner PASS.

## Reversibility

High. Content/presentation definition and fixture behavior only.

## Disposition

READY → BQ-128 controlled-fixture realization and BQ-129 validation. Production remains separate.
