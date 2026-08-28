# Account entry and access — feature package

Product-definition deep dive for FinTutor workstream 1 (portfolio-audit rank 3), approved by **D-152** under
the **D-148** ten-workstream programme. **Owner validation passed on 28-Aug-2026 (BQ-117).** The validated
definition package is frozen at prototype commit `825c439`; production work requires separately bounded
build items.

## Contents

| File | Task | Status |
|---|---|---|
| `PRD.md` | BQ-113 | Done — user/problem/outcome/principles/success/exclusions/deps |
| `JOURNEY_AND_STATES.md` | BQ-113 | Done — journey, state matrix, and the three OPEN owner decisions |
| `CONTRACTS.md` | BQ-114 | Done — functional + content + privacy/accessibility contracts |
| `ACCEPTANCE_MATRIX.md` | BQ-115 | Done — enumerated Given/When/Then acceptance criteria for every state/transition; owner ruled O-A/O-B/O-C as D-153/D-154/D-155 |
| `prototype/` | BQ-116 | Done — standalone, fixture-only clickable journey (`index.html` + `styles.css` + `app.js`) |
| `VALIDATION_RESULT.md` | BQ-117 | Done — owner completed all twelve scenarios; PASS on 28-Aug-2026 |

## Owner decisions (surfaced at BQ-113, ruled at BQ-115 — 26-Aug-2026)

- **O-A → D-153** — session-expiry & network-loss recovery UX = **non-blocking banner + manual retry**.
- **O-B → D-154** — duplicate-registration / wrong-password copy = **neutral, enumeration-safe** (overrides
  Supabase defaults; privacy angle).
- **O-C → D-155** — logout & account-switch device-local state = **active clear on logout** (extends the
  BQ-112 load-time suppression).

## Run the prototype (BQ-116)

Fixture-only: no server call, no FastAPI, no Supabase, no model, no build step, no new library. It opens as
plain files, but the reused font faces load only over `http://`, so serve the repo root rather than opening
the file directly. From the repository root:

```bash
python3 -m http.server 4173
```

Open:

`http://127.0.0.1:4173/docs/features/account-entry/prototype/`

Append `?theme=light` or `?theme=dark` for deterministic theme review; without a parameter the page follows
the operating-system preference. The left panel picks a validation task; the phone on the right is the
account-entry app. The dashed **Fixture controls** strip under the phone injects conditions a static
prototype can't trigger on its own (relaunch, expire session, drop/restore connection, deny a request,
toggle configuration) — it is clearly marked *not part of the product*. Open the browser console to see the
D-154 enumeration self-check line logged at load.

### Fixture accounts (in-memory only)

| Email | Password | State |
|---|---|---|
| `mira@example.in` | `monsoon-lily-42` | confirmed |
| `kabir@example.in` | `harbour-kite-19` | confirmed (second account, for the switch) |
| `unconfirmed@example.in` | `pending-oak-7` | registered but **not** confirmed |

Any other email is treated as "no account". A password is your choice when the task doesn't name one.

### Owner walkthrough (BQ-117 PASS — `ACCEPTANCE_MATRIX.md` Section E)

The task dropdown carries the critical scenarios. Section E asks the owner to record, per task, a
**coaching / comprehension / neutrality / recovery** result and a PASS / REVISE / PARK / ESCALATE
disposition. The four checkboxes under each task map to Section E's four recorded checks:

- **Comprehension** — at every state you can answer "am I signed in, and whose account is this?" without
  coaching. Exercised by *Sign in*, *Reopen the app*, *Expired session*, *Switch accounts*.
- **Neutrality / enumeration (D-154)** — *Wrong password vs. unknown email* and *Register an already-used
  email* must be indistinguishable from their negative cases; the copy never confirms an email is registered.
- **Recovery (D-153)** — every failure offers a safe, non-dead-end next action, and a transient blip is not
  punished by a forced logout. Exercised by *Expired session*, *Connection lost*, *Unauthorized request*.
- **No residue (D-155)** — after *Log out* and *Switch accounts* on one device, no prior-account data
  lingers, and a late in-flight response is discarded (shown in the fixture log).

The owner validated the prototype's behaviour and copy at BQ-117. True assistive-technology conveyance,
timing-invisibility of enumeration paths under a real backend, genuine D-137/D-142 server-side ownership and
D-119 downstream routing cannot be proven by a static prototype; they remain production implementation/test
obligations rather than claims of this PASS.

## Deferred HARD-STOPs (out of this workstream)

Frontend screen/navigation test harness (new library/architecture); production CORS/dev-bypass cleanup
(D-095); backend hosting (BQ-092); Supabase leaked-password protection.

Security architecture (D-137 JWT ownership, D-142 FastAPI-only table access) is already decided and is
referenced, not re-litigated, here.
