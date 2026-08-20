# D-147 — Python 3.14 / Windows compatibility fixes in requirements.txt

**Tier:** 1 — bounded conformance repair; no product behaviour change.  
**Date:** 20-Aug-2026

## What was decided

Three `requirements.txt` changes are needed to keep the backend runnable after the system Python
was upgraded from 3.12 to 3.14 on the development machine:

1. `psycopg2-binary==2.9.9` → `psycopg2-binary>=2.9.12`  
   2.9.9 has no pre-built wheel for Python 3.14 and fails to build from source without `pg_config`.
   2.9.12 ships a `cp314-cp314-win_amd64.whl`.

2. `sqlalchemy==2.0.35` → `sqlalchemy>=2.0.36`  
   2.0.35 raises `TypeError: descriptor '__getitem__' requires a 'typing.Union' object but received a
   'tuple'` at model-scan time on Python 3.14 (a stdlib typing module change). Fixed in 2.0.36+.

3. `alembic==1.13.2` → `alembic>=1.13.3`  
   Tracks the SQLAlchemy pin; alembic 1.13.2 has no stated Python 3.14 support.

4. Added `tzdata` (new dependency)  
   Python's `zoneinfo` module on Windows requires the `tzdata` package to resolve IANA timezone keys
   (e.g. `Asia/Kolkata`). Linux/macOS provide system timezone data; Windows does not. Without it,
   `ZoneInfo("Asia/Kolkata")` raises `ZoneInfoNotFoundError` at import time and the server fails to
   start. `tzdata` is the stdlib-recommended solution on Windows.

## Why Tier 1

All four changes are pure compatibility shims with no effect on product behaviour, data schema,
money calculations, or API contracts. They are reversible (pinning back to old versions would restore
the previous state, though the server would then not start on Python 3.14). They affect only the
development environment, not production (which is deferred — D-143).

## Reversibility

High. Pinning back to the old versions is a one-line edit per package. The only non-reversible aspect
is that the old Python 3.12 interpreter is no longer present on this machine.
