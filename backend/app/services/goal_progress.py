import uuid
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

from sqlalchemy.orm import Session

from app.models import Goal, Holding

_VALUE_FIELDS = {
    "equity_mutual_fund": "current_value",
    "debt_mutual_fund": "current_value",
    "stocks": "current_value",
    "fd_rd": "principal_or_monthly_amount",
    "ppf_epf": "current_balance",
    "endowment_ulip": "current_fund_value",
}
_EXCLUDED_TYPES = {
    "home_loan", "personal_loan", "credit_card_debt", "term_insurance", "esop"
}


def _money(cents: int) -> float:
    return float(Decimal(cents) / 100)


def _classify_value(holding: Holding) -> tuple[int | None, str | None, str | None, str | None]:
    field = _VALUE_FIELDS.get(holding.product_type)
    if field is None:
        reason = "product_type_excluded" if holding.product_type in _EXCLUDED_TYPES else "product_type_unclassified"
        return None, None, None, reason
    characteristics = holding.characteristics
    if not isinstance(characteristics, dict) or field not in characteristics or characteristics[field] is None:
        return None, field, None, "valuation_missing"
    raw = characteristics[field]
    safe_raw = str(raw)
    if len(safe_raw) > 120:
        safe_raw = safe_raw[:117] + "..."
    if isinstance(raw, bool):
        return None, field, safe_raw, "valuation_invalid"
    try:
        value = Decimal(str(raw))
    except (InvalidOperation, TypeError, ValueError):
        return None, field, safe_raw, "valuation_invalid"
    if not value.is_finite():
        return None, field, safe_raw, "valuation_invalid"
    if value < 0:
        return None, field, safe_raw, "valuation_negative"
    cents = int(value.scaleb(2).to_integral_value(rounding=ROUND_HALF_UP))
    rounded = Decimal(cents).scaleb(-2)
    return cents, field, format(rounded, ".2f"), None


def _empty_goal_result() -> dict:
    return {
        "progress": 0.0,
        "_progress_cents": 0,
        "progress_status": "measured",
        "progress_is_partial": False,
        "progress_provenance": [],
    }


def compute_goal_progress(
    db: Session, user_id: uuid.UUID, goals: list[Goal] | None = None
) -> dict[uuid.UUID, dict]:
    """Compute D-150/D-151 live progress across the complete owned goal set.

    No result is persisted. A holding is allocated once across every owned goal link,
    then per-goal known contributions are summed.
    """
    queried_goals = goals if goals is not None else db.query(Goal).filter(Goal.user_id == user_id).all()
    owned_goals = [goal for goal in queried_goals if goal.user_id == user_id]
    results = {goal.id: _empty_goal_result() for goal in owned_goals}
    holdings = {
        holding.id: holding
        for holding in db.query(Holding).filter(Holding.user_id == user_id).all()
    }
    links_by_holding: dict[uuid.UUID, list[tuple[Goal, object]]] = {}
    for goal in owned_goals:
        for link in goal.funded_by:
            links_by_holding.setdefault(link.holding_id, []).append((goal, link))

    for holding_id in sorted(links_by_holding, key=str):
        linked = links_by_holding[holding_id]
        linked.sort(key=lambda item: str(item[0].id))
        holding = holdings.get(holding_id)
        if holding is None:
            classified = (None, None, None, "holding_unavailable")
        else:
            classified = _classify_value(holding)
        value_cents, value_field, recorded_value, reason = classified

        if value_cents is None:
            for goal, link in linked:
                result = results[goal.id]
                result["progress_is_partial"] = True
                result["progress_status"] = "partial"
                result["progress_provenance"].append({
                    "holding_id": str(holding_id),
                    "holding_alias": holding.alias if holding is not None else None,
                    "holding_display_name": holding.display_name if holding is not None else None,
                    "product_type": holding.product_type if holding is not None else None,
                    "valuation_field": value_field,
                    "recorded_value": recorded_value,
                    "earmarked_amount": float(link.earmarked_amount),
                    "applied_amount": None,
                    "proportional_adjustment": None,
                    "was_proportionally_adjusted": False,
                    "status": "unknown",
                    "reason": reason,
                })
            continue

        earmark_cents = [int(Decimal(str(link.earmarked_amount)) * 100) for _, link in linked]
        total_earmarked = sum(earmark_cents)
        if total_earmarked <= value_cents:
            applied = list(earmark_cents)
        else:
            divided = [divmod(value_cents * amount, total_earmarked) for amount in earmark_cents]
            applied = [base for base, _ in divided]
            remaining = value_cents - sum(applied)
            order = sorted(
                range(len(linked)),
                key=lambda index: (-divided[index][1], str(linked[index][0].id)),
            )
            for index in order[:remaining]:
                applied[index] += 1

        for (goal, link), earmark, contribution in zip(linked, earmark_cents, applied):
            result = results[goal.id]
            result["_progress_cents"] += contribution
            result["progress_provenance"].append({
                "holding_id": str(holding_id),
                "holding_alias": holding.alias,
                "holding_display_name": holding.display_name,
                "product_type": holding.product_type,
                "valuation_field": value_field,
                "recorded_value": recorded_value,
                "earmarked_amount": _money(earmark),
                "applied_amount": _money(contribution),
                "proportional_adjustment": _money(earmark - contribution),
                "was_proportionally_adjusted": contribution != earmark,
                "status": "applied",
                "reason": None,
            })
    for result in results.values():
        result["progress"] = _money(result.pop("_progress_cents"))
    return results
