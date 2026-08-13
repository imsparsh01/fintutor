# Account-deletion-safe restore runbook

This is the mandatory D-139/BQ-099 gate for any recovery from a backup older than the current production
database. A backup is never restored in place and never becomes user-serving immediately.

1. Restore or clone the backup into an isolated replacement project with public traffic disabled.
2. Export the active Auth-user IDs from the still-current production project immediately before recovery.
3. In the isolated project, hard-delete every application row and Auth user whose ID is absent from that
   current allow-list. This reapplies every account deletion after the restore point.
4. Run the account-deletion coverage query/test and cross-account authorization suite against the isolated
   project.
5. Only after the deletion reconciliation and security checks pass may traffic cut over.

If the current Auth-user list cannot be obtained or deletion reconciliation cannot be proven, do not serve
the restored project. Escalate to the owner and Supabase support. Recovery convenience never overrides the
promise that a deleted account will not reappear.
