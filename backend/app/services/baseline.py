import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.models import Goal, Holding
from app.services.budget import compute_budget
from app.services.surfacing import compute_surfacing_candidates


def assemble_baseline(db: Session, user_id: uuid.UUID) -> dict:
    """Assembles the JSON profile slice the teaching engine receives, per
    docs/prompts/SYSTEM_PROMPT_v0_8_runnable.md §4. D-010: holdings carry only alias +
    characteristics — display_name (the real product/institution name) is never included.

    Known gap, not silently invented: §4's `baseline` also describes `dependents` and
    `emergency_fund_months` (see docs/fixtures/FIXTURE_user_01.json). No model in this
    schema captures either field yet — they are omitted here rather than guessed. Adding
    them would be a schema decision (CLAUDE.md hard-stop), not this endpoint's call to make.
    """
    holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
    alias_by_holding_id = {h.id: h.alias for h in holdings}

    budget = compute_budget(db, user_id)

    goals = []
    for goal in db.query(Goal).filter(Goal.user_id == user_id).all():
        horizon_years = round((goal.target_date - date.today()).days / 365, 1)
        funded_by = [
            {
                "alias": alias_by_holding_id.get(f.holding_id, "unknown-holding"),
                "earmarked_amount": float(f.earmarked_amount),
            }
            for f in goal.funded_by
        ]
        goals.append(
            {
                "goal": goal.category,
                "horizon_years": horizon_years,
                "target_amount": float(goal.target_amount),
                "currently_funded_by": funded_by or None,
            }
        )

    known_gaps = [
        {"gap": f"no_{c['product_type']}", "_note": c["reason"]}
        for c in compute_surfacing_candidates(db, user_id)
    ]

    return {
        "baseline": {
            "monthly_take_home": budget["income_total"],
            "monthly_fixed_outgoings": budget["recurring_outflows_total"],
        },
        "goals": goals,
        "holdings": [
            {"alias": h.alias, "product_type": h.product_type, **(h.characteristics or {})}
            for h in holdings
        ],
        "known_gaps": known_gaps,
    }
