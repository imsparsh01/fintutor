# D-002 — Two-model split: Sonnet for teaching, Haiku for reconciliation
- **Decision:** User-facing teaching responses use Sonnet; the narrow "does this new input update the
  baseline" reconciliation step uses Haiku.
- **Why:** Teaching needs quality (it's the product). Reconciliation is narrow/structured/high-volume and
  doesn't need flagship reasoning — Haiku is cheaper and sufficient. Right tool per job = cost control.
- **Reversibility:** High (swap models via config).
- **Date:** 22-Jul-2026
