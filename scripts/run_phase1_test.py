#!/usr/bin/env python3
"""
Phase 1 test runner — calls the Anthropic API directly.

Run this wherever ANTHROPIC_API_KEY is available and outbound HTTPS to api.anthropic.com
is permitted. Network policy is configured per Claude Code/Cowork environment, not fixed
across all of them — some block outbound calls carrying an API-key header, some (verified
directly, D-080, 05-Aug-2026) allow-list api.anthropic.com and permit this script to run
from inside the session itself. Check your own environment rather than assume either way;
your own Terminal has no such restriction either way.

No third-party dependencies — uses only the Python standard library, so any Python 3
on your Mac can run it as-is.

Usage (defaults are pre-configured for BQ-007):
    python3 scripts/run_phase1_test.py

Reads ANTHROPIC_API_KEY from the .env file in the repo root. Run from the repo root,
or pass --repo-root if running from elsewhere.

Override any default to run a different question/fixture/prompt version:
    python3 scripts/run_phase1_test.py --system docs/prompts/SYSTEM_PROMPT_v0_7_runnable.md \\
        --fixture docs/fixtures/FIXTURE_user_02.json \\
        --question "Some other question text" --n 3 --label my_test
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

DEFAULT_Q1 = "I've got ₹2 lakh spare. Should I put it on the home loan or invest it?"


def load_env(repo_root: Path) -> None:
    env_path = repo_root / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def call_claude(api_key: str, model: str, system_text: str, user_text: str, max_tokens: int = 4096) -> dict:
    """Returns the full parsed response body, not just the text — callers that only
    want the text should read result["_text"]. Keeping the raw body lets us diagnose
    empty/truncated responses (stop_reason, usage, etc.) instead of guessing."""
    url = "https://api.anthropic.com/v1/messages"
    payload = json.dumps({
        "model": model,
        "max_tokens": max_tokens,
        "system": system_text,
        "messages": [{"role": "user", "content": user_text}],
    }).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        method="POST",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = json.loads(resp.read().decode("utf-8"))
    body["_text"] = "".join(block.get("text", "") for block in body.get("content", []))
    return body


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--repo-root", default=".", help="Path to the fintutor repo root (default: current dir)")
    parser.add_argument("--system", default="docs/prompts/SYSTEM_PROMPT_v0_7_runnable.md")
    parser.add_argument("--fixture", default="docs/fixtures/FIXTURE_user_01.json")
    parser.add_argument("--question", default=DEFAULT_Q1)
    parser.add_argument("--n", type=int, default=5, help="Number of fresh, independent calls to make")
    parser.add_argument("--model", default="claude-sonnet-5")
    parser.add_argument("--label", default="bq007", help="Used to name the output folder")
    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()
    load_env(repo_root)
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not found. Make sure you're running this from inside", file=sys.stderr)
        print("the fintutor repo (or pass --repo-root) and that .env exists there.", file=sys.stderr)
        sys.exit(1)

    system_path = repo_root / args.system
    fixture_path = repo_root / args.fixture
    if not system_path.exists():
        print(f"ERROR: system prompt file not found: {system_path}", file=sys.stderr)
        sys.exit(1)
    if not fixture_path.exists():
        print(f"ERROR: fixture file not found: {fixture_path}", file=sys.stderr)
        sys.exit(1)

    system_text = system_path.read_text()
    fixture_text = fixture_path.read_text()
    user_text = f"Here is the user's profile slice:\n\n{fixture_text}\n\n{args.question}"

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_dir = repo_root / "docs" / "sessions" / "test_outputs" / f"{args.label}_{timestamp}"
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Model:    {args.model}")
    print(f"System:   {args.system}")
    print(f"Fixture:  {args.fixture}")
    print(f"Question: {args.question}")
    print(f"Runs:     {args.n} (fresh, independent — no shared conversation history)")
    print(f"Output:   {out_dir.relative_to(repo_root)}")
    print()

    ok = 0
    empty = 0
    for i in range(1, args.n + 1):
        print(f"  run {i}/{args.n}...", end=" ", flush=True)
        try:
            body = call_claude(api_key, args.model, system_text, user_text)
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", errors="replace")[:300]
            print(f"FAILED ({e.code}): {detail}")
            continue
        except Exception as e:
            print(f"FAILED: {e}")
            continue
        text = body.get("_text", "")
        (out_dir / f"run_{i}.txt").write_text(text)
        ok += 1
        if not text:
            empty += 1
            # Empty response but no HTTP error — save the raw body so we can see
            # stop_reason / usage instead of guessing why nothing came back.
            (out_dir / f"run_{i}_raw.json").write_text(json.dumps(body, indent=2))
            stop_reason = body.get("stop_reason", "?")
            usage = body.get("usage", {})
            print(f"done (0 words) — EMPTY, stop_reason={stop_reason}, usage={usage} — see run_{i}_raw.json")
        else:
            print(f"done ({len(text.split())} words)")
        if i < args.n:
            time.sleep(1)

    print()
    if ok == args.n and empty == 0:
        print(f"All {ok} runs saved. Tell Claude it's done and point it at:")
    elif empty:
        print(f"{ok}/{args.n} runs saved, {empty} came back empty (see *_raw.json in the output folder).")
        print("Tell Claude what happened, or re-run.")
    else:
        print(f"{ok}/{args.n} runs saved (some failed — see above). Tell Claude what happened, or re-run.")
    print(f"  {out_dir.relative_to(repo_root)}")


if __name__ == "__main__":
    main()
