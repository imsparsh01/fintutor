# D-101 — Local reminders use explicit credit-card dates and EMI due days

- **Tier:** 3, owner-approved directly in conversation
- **Decision:** Use local device notifications. Credit-card reminders use the explicitly captured `payment_due_date`. Home and personal loan reminders use an optional recurring `emi_due_day` from 1–31; no date is inferred from `start_date` or payment amount. Months shorter than the selected day clamp to the last day of that month. Missing dates remain unscheduled.
- **Permission:** Request notification permission only when a holding with a supported explicit date is saved or edited. A denied permission leaves the holding unchanged and unscheduled.
- **Scope:** Initial implementation schedules the next upcoming occurrence; no server push, reminder history, or silent scheduling is added.
- **Why:** Local notifications deliver useful reminders without a new backend service, while explicit due-day capture avoids inventing a financial date.
- **Reversibility:** Presentation/client scheduling plus JSON characteristics; no database migration.
- **Date:** 10-Aug-2026
