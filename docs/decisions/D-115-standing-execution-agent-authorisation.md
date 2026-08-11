# D-115 — Standing execution-agent authorisation for already-decided work

**Tier:** 3, owner-decided directly in conversation
**Supersedes:** D-093's reskin-only fleet scope and fully unparks D-014's broader execution ambition
**Date:** 12-Aug-2026

## Decision

The primary agent may use agents, subagents, and parallel execution teams across FinTutor without seeking
owner permission for each fleet, whenever work is already decided and parallelism materially improves
speed or review quality. Model/tool choice and task decomposition are implementation decisions owned by the
primary agent.

This is standing mechanical authority, not delegated product judgment. Every agent remains bound by the
same decision hierarchy, file permissions, hard stops, one-task scope, and review requirements as the
primary agent. Agents may execute a confirmed design; they may not resolve a Tier-3 question, silently
expand MVP scope, change money logic, add dependencies, alter schema, or edit deliberate-only files without
the decision/approval that would have been required if the primary agent acted directly.

The primary agent remains responsible for integrating, reviewing, testing, and shipping all delegated
output. Parallelism is optional: small or tightly coupled work should stay in one context when coordination
cost would exceed the benefit.

## Why

The owner wants strategy and implementation to continue without repeated permission checkpoints for normal
mechanics, while preserving escalation for the critical decisions already defined by the decision protocol.
This generalises the successful D-093 execution model beyond one reskin and removes the unnecessary
per-fleet approval ritual without weakening any substantive control.

## Reversibility

High. Delegated output is ordinary reviewed repository work. The authorisation changes process, not product
data or architecture.
