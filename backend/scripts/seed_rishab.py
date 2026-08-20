"""
Seed script: populate all tables for rishab.sharma@gmail.com with realistic data.
Connects directly to Supabase Postgres using DATABASE_URL from root .env.
Safe to re-run: clears all existing data for this user before inserting.
"""

import os
import sys
import uuid
from datetime import date, datetime, timezone
from pathlib import Path

# Load root .env
env_path = Path(__file__).resolve().parents[2] / ".env"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip())

import psycopg2
from psycopg2.extras import RealDictCursor, Json

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    sys.exit("DATABASE_URL not set — check root .env")

TARGET_EMAIL = "rishab.sharma@gmail.com"


def main():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # ── 1. Resolve user ID ────────────────────────────────────────────────────
    cur.execute("SELECT id FROM auth.users WHERE email = %s", (TARGET_EMAIL,))
    row = cur.fetchone()
    if not row:
        print(f"User '{TARGET_EMAIL}' not found in auth.users.")
        print("Create the account in the app first, then re-run this script.")
        conn.close()
        sys.exit(1)

    uid = str(row["id"])
    print(f"Found user: {TARGET_EMAIL}  →  {uid}")

    # ── 2. Clear existing data (order matters for FK constraints) ─────────────
    print("Clearing existing data …")
    cur.execute("DELETE FROM goal_fundings WHERE goal_id IN (SELECT id FROM goals WHERE user_id = %s)", (uid,))
    cur.execute("DELETE FROM goals WHERE user_id = %s", (uid,))
    cur.execute("DELETE FROM holdings WHERE user_id = %s", (uid,))
    cur.execute("DELETE FROM incomes WHERE user_id = %s", (uid,))
    cur.execute("DELETE FROM discretionary_categories WHERE user_id = %s", (uid,))
    cur.execute("DELETE FROM streak_states WHERE user_id = %s", (uid,))
    cur.execute("DELETE FROM onboarding_assessments WHERE user_id = %s", (uid,))
    cur.execute("DELETE FROM onboarding_states WHERE user_id = %s", (uid,))
    cur.execute("DELETE FROM progression_events WHERE user_id = %s", (uid,))
    cur.execute("DELETE FROM progression_daily_rollups WHERE user_id = %s", (uid,))
    cur.execute("DELETE FROM progression_summaries WHERE user_id = %s", (uid,))
    cur.execute("DELETE FROM financial_contexts WHERE user_id = %s", (uid,))

    now = datetime.now(timezone.utc)
    today = date.today()

    # ── 3. Income ─────────────────────────────────────────────────────────────
    print("Seeding income …")
    cur.execute(
        "INSERT INTO incomes (id, user_id, sources) VALUES (%s, %s, %s)",
        (
            str(uuid.uuid4()),
            uid,
            Json([
                {"label": "Salary", "amount": 80000, "frequency": "monthly"},
                {"label": "Freelance", "amount": 10000, "amount_high": 20000, "frequency": "monthly"},
            ]),
        ),
    )

    # ── 4. Holdings ───────────────────────────────────────────────────────────
    print("Seeding holdings …")
    holdings = [
        # (alias, product_type, display_name, characteristics)
        (
            "ppfas_flexi_cap",
            "equity_mutual_fund",
            "PPFAS Flexi Cap Fund",
            {
                "current_value": 345000,
                "invested_amount": 280000,
                "expense_ratio": 0.59,
                "investment_mode": "SIP",
                "sip_frequency": "monthly",
                "start_date": "2021-06-01",
                "risk_bucket": "flexi_cap",
                "lock_in_period": "none",
            },
        ),
        (
            "mirae_large_cap",
            "equity_mutual_fund",
            "Mirae Asset Large Cap Fund",
            {
                "current_value": 185000,
                "invested_amount": 150000,
                "expense_ratio": 0.54,
                "investment_mode": "SIP",
                "sip_frequency": "monthly",
                "start_date": "2022-03-15",
                "risk_bucket": "large_cap",
                "lock_in_period": "none",
            },
        ),
        (
            "nippon_small_cap",
            "equity_mutual_fund",
            "Nippon India Small Cap Fund",
            {
                "current_value": 95000,
                "invested_amount": 70000,
                "expense_ratio": 1.05,
                "investment_mode": "lumpsum",
                "sip_frequency": "monthly",
                "start_date": "2023-01-10",
                "risk_bucket": "small_cap",
                "lock_in_period": "none",
            },
        ),
        (
            "hdfc_short_duration",
            "debt_mutual_fund",
            "HDFC Short Duration Fund",
            {
                "current_value": 75000,
                "invested_amount": 72000,
                "expense_ratio": 0.42,
                "investment_mode": "lumpsum",
                "sip_frequency": "monthly",
                "start_date": "2022-10-01",
                "risk_bucket": "short_duration",
                "lock_in_period": "none",
            },
        ),
        (
            "ppf_account",
            "ppf_epf",
            "PPF Account (SBI)",
            {
                "retirement_fund_type": "PPF",
                "current_balance": 420000,
                "annual_contribution": 150000,
                "interest_rate": 7.1,
            },
        ),
        (
            "sbi_fd",
            "fd_rd",
            "SBI Fixed Deposit",
            {
                "deposit_mode": "FD",
                "principal_or_monthly_amount": 100000,
                "interest_rate": 7.25,
                "tenure": "2 years",
                "maturity_date": "2026-09-01",
            },
        ),
        (
            "infy_stock",
            "stocks",
            "Infosys Ltd",
            {
                "sector": "technology",
                "current_value": 62000,
                "invested_amount": 50000,
                "purchase_date": "2022-07-20",
                "risk_bucket": "large_cap",
            },
        ),
        (
            "tcs_stock",
            "stocks",
            "TCS Ltd",
            {
                "sector": "technology",
                "current_value": 45000,
                "invested_amount": 40000,
                "purchase_date": "2023-04-05",
                "risk_bucket": "large_cap",
            },
        ),
        (
            "home_loan_hdfc",
            "home_loan",
            "HDFC Home Loan",
            {
                "principal": 3500000,
                "interest_rate": 8.75,
                "tenure_months": 240,
                "emi_amount": 31500,
                "emi_frequency": "monthly",
                "emi_due_day": 5,
                "start_date": "2023-08-01",
                "outstanding_balance": 3320000,
            },
        ),
        (
            "term_insurance_cover",
            "term_insurance",
            "Max Life Term Insurance",
            {
                "sum_assured": 7500000,
                "premium": 14200,
                "premium_frequency": "annual",
                "policy_term": "30 years",
                "start_date": "2022-01-15",
            },
        ),
    ]

    holding_ids = {}
    for alias, ptype, dname, chars in holdings:
        hid = str(uuid.uuid4())
        holding_ids[alias] = hid
        cur.execute(
            """
            INSERT INTO holdings (id, user_id, product_type, alias, display_name, characteristics)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (hid, uid, ptype, alias, dname, Json(chars)),
        )

    # ── 5. Goals + fundings ────────────────────────────────────────────────────
    print("Seeding goals …")
    goals_data = [
        ("emergency_fund", 300000, "2027-03-31", "emergency_fund"),
        ("house_down_payment", 1500000, "2029-06-30", "house_purchase"),
        ("retirement", 30000000, "2055-01-01", "retirement"),
        ("vehicle", 800000, "2027-12-31", "vehicle"),
    ]
    goal_ids = {}
    for name, amount, target_date, category in goals_data:
        gid = str(uuid.uuid4())
        goal_ids[name] = gid
        cur.execute(
            "INSERT INTO goals (id, user_id, target_amount, target_date, category) VALUES (%s, %s, %s, %s, %s)",
            (gid, uid, amount, target_date, category),
        )

    # Goal fundings: FD → emergency fund, PPFAS → house down payment
    cur.execute(
        "INSERT INTO goal_fundings (id, goal_id, holding_id, earmarked_amount) VALUES (%s, %s, %s, %s)",
        (str(uuid.uuid4()), goal_ids["emergency_fund"], holding_ids["sbi_fd"], 100000),
    )
    cur.execute(
        "INSERT INTO goal_fundings (id, goal_id, holding_id, earmarked_amount) VALUES (%s, %s, %s, %s)",
        (str(uuid.uuid4()), goal_ids["house_down_payment"], holding_ids["ppfas_flexi_cap"], 200000),
    )

    # ── 6. Discretionary categories ───────────────────────────────────────────
    print("Seeding discretionary categories …")
    for label, amount in [
        ("Dining out", 4000),
        ("Entertainment", 2000),
        ("Shopping", 5000),
        ("Transport / Commute", 3000),
        ("Personal care", 1500),
    ]:
        cur.execute(
            "INSERT INTO discretionary_categories (id, user_id, label, planned_amount) VALUES (%s, %s, %s, %s)",
            (str(uuid.uuid4()), uid, label, amount),
        )

    # ── 7. Onboarding assessment (completed) ───────────────────────────────────
    print("Seeding onboarding assessment …")
    handled_at = datetime(2026, 7, 15, 10, 30, 0, tzinfo=timezone.utc)
    cur.execute(
        """
        INSERT INTO onboarding_assessments (
            id, user_id, flow_version, status, current_question,
            immediate_intent, earning_context, responsibility_context,
            exposure_flags, familiarity,
            eligibility_confirmed_at, handled_at, handled_via, created_at, updated_at
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            str(uuid.uuid4()), uid, 2, "handled", None,
            "explore", "established_earner", "shared",
            ["investing", "borrowing"], "working_basics",
            datetime(2026, 7, 15, 10, 0, 0, tzinfo=timezone.utc),
            handled_at, "completed",
            handled_at, handled_at,
        ),
    )

    # ── 8. Onboarding state ────────────────────────────────────────────────────
    print("Seeding onboarding state …")
    cur.execute(
        """
        INSERT INTO onboarding_states (id, user_id, track, stage, turns_in_stage)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (str(uuid.uuid4()), uid, "habit_former", "complete", 0),
    )

    # ── 9. Streak state ────────────────────────────────────────────────────────
    print("Seeding streak state …")
    cur.execute(
        """
        INSERT INTO streak_states (id, user_id, current_streak, longest_streak, last_active_date)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (str(uuid.uuid4()), uid, 5, 12, today),
    )

    # ── 10. Progression summary ────────────────────────────────────────────────
    print("Seeding progression …")
    cur.execute(
        """
        INSERT INTO progression_summaries (
            id, user_id, ruleset_version, lifetime_points, displayed_points,
            displayed_points_floor, stage, stage_floor_index, active_dimensions,
            return_days, last_event_at, last_rebuilt_at, created_at, updated_at
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            str(uuid.uuid4()), uid, 1, 380, 380,
            0, "progressing", 1,
            Json(["calculators", "chat", "onboarding"]),
            3, now, now, now, now,
        ),
    )

    # A few progression events
    event_types = [
        ("onboarding_handled", "onboarding_v2", datetime(2026, 7, 15, 10, 30, tzinfo=timezone.utc)),
        ("calculator_completed", "sip_goal", datetime(2026, 7, 16, 14, 0, tzinfo=timezone.utc)),
        ("arya_exchange_completed", None, datetime(2026, 7, 18, 9, 15, tzinfo=timezone.utc)),
        ("calculator_completed", "compound_growth", datetime(2026, 7, 20, 11, 0, tzinfo=timezone.utc)),
        ("calculator_completed", "home_loan_emi", datetime(2026, 8, 1, 16, 30, tzinfo=timezone.utc)),
        ("arya_exchange_completed", None, datetime(2026, 8, 5, 8, 45, tzinfo=timezone.utc)),
        ("capability_first_used", "portfolio", datetime(2026, 8, 10, 10, 0, tzinfo=timezone.utc)),
        ("teaching_moment_explored", "compounding_basics", datetime(2026, 8, 12, 12, 0, tzinfo=timezone.utc)),
    ]
    for etype, skey, occurred in event_types:
        cur.execute(
            """
            INSERT INTO progression_events
              (id, user_id, event_type, subject_key, occurred_at, local_date, idempotency_key, created_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                str(uuid.uuid4()), uid, etype, skey,
                occurred, occurred.date(),
                f"{uid}:{etype}:{occurred.isoformat()}",
                now,
            ),
        )

    # ── 11. Financial context ──────────────────────────────────────────────────
    print("Seeding financial context …")
    cur.execute(
        """
        INSERT INTO financial_contexts (id, user_id, dependant_count, emergency_fund_months, updated_at)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (str(uuid.uuid4()), uid, 1, 2.5, now),
    )

    conn.commit()
    print("\n✓ All done. Data seeded for", TARGET_EMAIL)
    print(f"  Holdings : {len(holdings)}")
    print(f"  Goals    : {len(goals_data)}")
    print(f"  Income   : salary + freelance")
    print(f"  Streak   : 5-day current / 12-day longest")
    print(f"  Progress : 380 pts, stage=progressing")
    conn.close()


if __name__ == "__main__":
    main()
