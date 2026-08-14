import calendar
import math
import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.models import Holding

_SPREAD_NOTE = (
    "This gain becomes taxable perquisite income on exercise, added to your taxable "
    "salary at your income tax slab rate — the exact tax owed isn't shown here."
)
_UNDERWATER_NOTE = (
    "Exercising would currently cost more than the shares are worth at today's known "
    "valuation — the strike price is above the current FMV."
)
_EQUAL_FMV_NOTE = (
    "The current FMV equals the strike price, so the current paper gain is ₹0."
)
_NO_FMV_NOTE = (
    "No current valuation is recorded for this grant, so a potential taxable gain can't be shown."
)
_NOTHING_VESTED_NOTE = "Nothing has vested yet, so there's nothing to exercise."
_ZERO_UNIT_GRANT_NOTE = "This grant records no units, so there are no units to exercise."
_EXERCISE_WINDOW_NOTE_TEMPLATE = (
    "Vested options typically must be exercised within {months} months of leaving the company."
)
_EXERCISED_ASSUMPTION_NOTE = "This assumes none of this grant has been exercised yet."
_VESTING_TIMING_NOTE = (
    "Vesting months use a month-end-clamped anniversary estimate. Your actual grant schedule controls."
)


def _elapsed_months(grant_date: date, today: date) -> int:
    months = (today.year - grant_date.year) * 12 + (today.month - grant_date.month)
    anniversary_day = min(grant_date.day, calendar.monthrange(today.year, today.month)[1])
    if today.day < anniversary_day:
        months -= 1
    return max(0, months)


def compute_esop_exercise_cost(db: Session, user_id: uuid.UUID, holding_id: uuid.UUID) -> dict:
    """BRIEF-015/D-069: cost of exercising *today* only — never a prediction of future
    valuation (same never-predict-the-future test D-068 already applied). Options only
    (`grant_type == "options"`) — RSUs have no exercise decision, so this doesn't apply
    to them. Vesting is cliff-gated linear (new logic — D-066 left this undesigned).
    """
    holding = (
        db.query(Holding)
        .filter(Holding.user_id == user_id, Holding.id == holding_id)
        .first()
    )
    if holding is None:
        raise LookupError("Holding not found")
    if holding.product_type != "esop":
        raise ValueError(
            f"ESOP exercise cost only applies to esop holdings, not '{holding.product_type}'"
        )

    c = holding.characteristics or {}
    if c.get("grant_type") != "options":
        raise ValueError("ESOP exercise cost only applies to grant_type 'options', not RSUs")

    required = ["grant_date", "total_units_granted", "vesting_period_months", "strike_price"]
    if any(c.get(key) is None for key in required):
        raise ValueError(
            "Grant is missing one of: grant_date, total_units_granted, vesting_period_months, strike_price"
        )

    try:
        grant_date = date.fromisoformat(str(c["grant_date"]))
        total_units_granted = float(c["total_units_granted"])
        vesting_cliff_months = float(c.get("vesting_cliff_months") or 0)
        vesting_period_months = float(c["vesting_period_months"])
        strike_price = float(c["strike_price"])
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Grant fields aren't in the expected shape: {exc}") from exc

    if vesting_period_months <= 0:
        raise ValueError("vesting_period_months must be greater than 0")

    elapsed_months = _elapsed_months(grant_date, date.today())

    if elapsed_months < vesting_cliff_months:
        vested_units = 0.0
    elif elapsed_months >= vesting_period_months:
        vested_units = total_units_granted
    else:
        vested_units = float(math.floor(total_units_granted * elapsed_months / vesting_period_months))

    exercise_cost = vested_units * strike_price

    result: dict = {
        "holding_id": str(holding.id),
        "vested_units": vested_units,
        "total_units_granted": total_units_granted,
        "exercise_cost": round(exercise_cost, 2),
        "exercised_units_assumption_note": _EXERCISED_ASSUMPTION_NOTE,
        "vesting_timing_note": _VESTING_TIMING_NOTE,
        "spread": None,
        "spread_note": None,
    }

    current_fmv = c.get("current_fmv")
    if total_units_granted == 0:
        result["spread"] = 0.0
        result["spread_note"] = _ZERO_UNIT_GRANT_NOTE
    elif vested_units == 0:
        # Nothing vested yet takes priority over both other messages — zero spread here
        # means "nothing to exercise," not "underwater," and not "no valuation."
        result["spread"] = 0.0
        result["spread_note"] = _NOTHING_VESTED_NOTE
    elif current_fmv is None:
        result["spread_note"] = _NO_FMV_NOTE
    else:
        spread = vested_units * (float(current_fmv) - strike_price)
        result["spread"] = round(spread, 2)
        if spread > 0:
            result["spread_note"] = _SPREAD_NOTE
        elif spread < 0:
            result["spread_note"] = _UNDERWATER_NOTE
        else:
            result["spread_note"] = _EQUAL_FMV_NOTE

    exercise_window_months = c.get("exercise_window_months")
    result["exercise_window_note"] = (
        _EXERCISE_WINDOW_NOTE_TEMPLATE.format(months=int(exercise_window_months))
        if exercise_window_months
        else None
    )

    return result
