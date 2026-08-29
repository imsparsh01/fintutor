import calendar
import math
import uuid
from datetime import date, datetime, timezone

from sqlalchemy.orm import Session

from app.models import Holding
from app.services.progression_ruleset import DAY_BOUNDARY_TZ

_MAX_MONEY_OUTPUT = 1_000_000_000_000_000.0

_SPREAD_NOTE = (
    "Using the recorded FMV, this paper gain becomes taxable perquisite income on exercise, "
    "added to your taxable salary at your income tax slab rate — the exact tax owed isn't shown here."
)
_UNDERWATER_NOTE = (
    "At the recorded FMV, exercising would cost more than the shares are valued at — "
    "the strike price is above the recorded FMV."
)
_EQUAL_FMV_NOTE = (
    "The recorded FMV equals the strike price, so the paper spread is ₹0."
)
_NO_FMV_NOTE = (
    "No FMV is recorded for this grant, so a potential taxable spread can't be shown."
)
_NOTHING_VESTED_NOTE = "Nothing has vested yet, so there's nothing to exercise."
_ZERO_UNIT_GRANT_NOTE = "This grant records no units, so there are no units to exercise."
_EXERCISE_WINDOW_NOTE_TEMPLATE = (
    "This grant records a post-termination exercise window of {months} months. "
    "No termination date is recorded, so this is not a countdown."
)
_EXERCISED_ASSUMPTION_NOTE = "This assumes none of this grant has been exercised yet."
_VESTING_TIMING_NOTE_TEMPLATE = (
    "Vesting is estimated through {today} using whole months and month-end-clamped anniversaries. "
    "Your actual grant schedule controls."
)


def _elapsed_months(grant_date: date, today: date) -> int:
    months = (today.year - grant_date.year) * 12 + (today.month - grant_date.month)
    anniversary_day = min(grant_date.day, calendar.monthrange(today.year, today.month)[1])
    if today.day < anniversary_day:
        months -= 1
    return months


def _finite_number(raw, field: str, *, minimum: float, integer: bool = False) -> float:
    if isinstance(raw, bool) or raw is None:
        raise ValueError(f"{field} must be a finite number")
    try:
        value = float(raw)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{field} must be a finite number") from exc
    if not math.isfinite(value) or value < minimum:
        comparator = "greater than 0" if minimum > 0 else "0 or greater"
        raise ValueError(f"{field} must be finite and {comparator}")
    if integer and not value.is_integer():
        raise ValueError(f"{field} must be a whole number")
    return value


def _calculation_clock(now: datetime | None) -> tuple[date, datetime]:
    instant = now or datetime.now(timezone.utc)
    if instant.tzinfo is None:
        instant = instant.replace(tzinfo=timezone.utc)
    utc_instant = instant.astimezone(timezone.utc)
    return utc_instant.astimezone(DAY_BOUNDARY_TZ).date(), utc_instant


def _guard_output(*values: float) -> None:
    if not all(math.isfinite(value) for value in values):
        raise ValueError("The calculation does not produce finite outputs")


def _guard_money(*values: float) -> None:
    if not all(math.isfinite(value) and abs(value) <= _MAX_MONEY_OUTPUT for value in values):
        raise ValueError("The calculation exceeds the supported ₹1 quadrillion output domain")


def compute_esop_exercise_cost(
    db: Session,
    user_id: uuid.UUID,
    holding_id: uuid.UUID,
    *,
    now: datetime | None = None,
) -> dict:
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
    except (TypeError, ValueError) as exc:
        raise ValueError("grant_date must be a valid ISO calendar date") from exc

    total_units_granted = _finite_number(
        c["total_units_granted"], "total_units_granted", minimum=0, integer=True
    )
    cliff_raw = c.get("vesting_cliff_months")
    vesting_cliff_months = (
        0.0
        if cliff_raw is None
        else _finite_number(cliff_raw, "vesting_cliff_months", minimum=0, integer=True)
    )
    vesting_period_months = _finite_number(
        c["vesting_period_months"], "vesting_period_months", minimum=1, integer=True
    )
    strike_price = _finite_number(c["strike_price"], "strike_price", minimum=0)
    if vesting_cliff_months > vesting_period_months:
        raise ValueError("vesting_cliff_months cannot exceed vesting_period_months")

    calculation_date, retrieved_at = _calculation_clock(now)
    if grant_date > calculation_date:
        raise ValueError("grant_date cannot be in the future")
    elapsed_months = _elapsed_months(grant_date, calculation_date)

    if elapsed_months < vesting_cliff_months:
        vested_units = 0.0
    elif elapsed_months >= vesting_period_months:
        vested_units = total_units_granted
    else:
        vesting_numerator = total_units_granted * elapsed_months
        _guard_output(vesting_numerator)
        vested_units = float(math.floor(vesting_numerator / vesting_period_months))

    exercise_cost = vested_units * strike_price
    _guard_output(vested_units, total_units_granted)
    _guard_money(exercise_cost)

    current_fmv = c.get("current_fmv")
    recorded_fmv = (
        None
        if current_fmv is None
        else _finite_number(current_fmv, "current_fmv", minimum=0)
    )

    result: dict = {
        "holding_id": str(holding.id),
        "vested_units": vested_units,
        "total_units_granted": total_units_granted,
        "exercise_cost": round(exercise_cost, 2),
        "exercised_units_assumption_note": _EXERCISED_ASSUMPTION_NOTE,
        "vesting_timing_note": _VESTING_TIMING_NOTE_TEMPLATE.format(
            today=calculation_date.isoformat()
        ),
        "calculation_date": calculation_date.isoformat(),
        "calculation_timezone": "Asia/Kolkata",
        "fmv_basis_label": "Recorded FMV",
        "spread": None,
        "spread_note": None,
    }

    if total_units_granted == 0:
        result["spread"] = 0.0
        result["spread_note"] = _ZERO_UNIT_GRANT_NOTE
    elif vested_units == 0:
        # Nothing vested yet takes priority over both other messages — zero spread here
        # means "nothing to exercise," not "underwater," and not "no valuation."
        result["spread"] = 0.0
        result["spread_note"] = _NOTHING_VESTED_NOTE
    elif recorded_fmv is None:
        result["spread_note"] = _NO_FMV_NOTE
    else:
        spread_difference = recorded_fmv - strike_price
        spread = vested_units * spread_difference
        _guard_output(spread_difference)
        _guard_money(spread)
        result["spread"] = round(spread, 2)
        if spread > 0:
            result["spread_note"] = _SPREAD_NOTE
        elif spread < 0:
            result["spread_note"] = _UNDERWATER_NOTE
        else:
            result["spread_note"] = _EQUAL_FMV_NOTE

    exercise_window_raw = c.get("exercise_window_months")
    exercise_window_months = (
        None
        if exercise_window_raw is None
        else _finite_number(
            exercise_window_raw, "exercise_window_months", minimum=0, integer=True
        )
    )
    result["exercise_window_note"] = (
        _EXERCISE_WINDOW_NOTE_TEMPLATE.format(months=int(exercise_window_months))
        if exercise_window_months is not None
        else None
    )
    result["source_evidence"] = {
        "source_kind": "holding",
        "source_record_id": str(holding.id),
        "source_label": holding.display_name or holding.alias,
        "source_fields": [
            "grant_type",
            "grant_date",
            "total_units_granted",
            "vesting_cliff_months",
            "vesting_period_months",
            "strike_price",
            "current_fmv",
            "exercise_window_months",
        ],
        "source_version": holding.version,
        "record_updated_at": None,
        "retrieved_at": retrieved_at.isoformat(),
        "freshness": "unavailable",
        "freshness_note": "Freshness unavailable",
    }

    return result
