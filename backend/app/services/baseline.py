import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.models import FinancialContext, Goal, Holding
from app.services.budget import compute_budget
from app.services.surfacing import compute_surfacing_candidates


def assemble_baseline(db: Session, user_id: uuid.UUID, deepen_alias: str | None = None) -> dict:
    """Assembles the JSON profile slice the teaching engine receives, per
    docs/prompts/SYSTEM_PROMPT_v0_8_runnable.md §4. D-010: holdings carry only alias +
    characteristics — display_name (the real product/institution name) is never included.

    D-071: `deepen_alias`, when given, must come from an app-known UI signal (currently
    only HoldingDetailScreen's "Ask about this" button, which knows its holding's alias
    with certainty) — never from parsing the question text; that's still BQ-004's open,
    unresolved case. Only set `deepen` when the alias resolves to one of this user's own
    holdings, so an unrecognized or stale value degrades to D-028's safe "deepen nothing"
    default rather than being trusted blindly.

    D-145: optional dependant count and emergency-fund months come only from the caller's
    confirmed FinancialContext row. Missing values remain omitted rather than guessed.
    """
    holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
    alias_by_holding_id = {h.id: h.alias for h in holdings}
    known_aliases = set(alias_by_holding_id.values())

    budget = compute_budget(db, user_id)
    context = db.query(FinancialContext).filter(FinancialContext.user_id == user_id).one_or_none()

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
        {
            "gap": f"no_{c['product_type']}",
            "_reason": c["reason"],
            "_mechanism_difference": c["mechanism_difference"],
        }
        for c in compute_surfacing_candidates(db, user_id)
    ]

    result = {
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
    if context is not None:
        if context.dependant_count is not None:
            result["baseline"]["dependents"] = context.dependant_count
        if context.emergency_fund_months is not None:
            result["baseline"]["emergency_fund_months"] = context.emergency_fund_months
    if deepen_alias is not None and deepen_alias in known_aliases:
        result["deepen"] = {
            "alias": deepen_alias,
            "reason": "the user asked directly about this holding",
        }
    return result
