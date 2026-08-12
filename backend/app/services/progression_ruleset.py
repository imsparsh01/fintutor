"""Learning progression ruleset — versioned constants (D-117, approved by D-121).

Nothing in this module is ever written to an event row. D-121's load-bearing schema
decision is that an event records *that a qualifying action happened*, not what it was
worth: point values, dimension mapping, repeat limits, caps, and stage floors all live
here and are applied at computation time. Storing points on the row would freeze v1
into user data and destroy the replayability the ledger exists for.

To retune, add a new version below rather than editing v1 in place. A ruleset change
after real users exist is a separate decision (D-117's tuning rule).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal
from zoneinfo import ZoneInfo

RULESET_VERSION = 1

# D-121 §3: fixed for v1, materialized onto the event row at write time. Correct for the
# entire intended audience, deterministic, and keeps replay reproducible. A user who
# travels keeps IST day boundaries — disclosed in docs/KNOWN_LIMITATIONS.md.
DAY_BOUNDARY_TZ = ZoneInfo("Asia/Kolkata")

Dimension = Literal["explore", "model", "reflect", "return", "milestone"]

# Stage breadth counts "2 of 4", "3 of 4", "4 of 4" — the milestone dimension is
# deliberately excluded, per D-117's "onboarding alone cannot satisfy a breadth
# requirement."
BREADTH_DIMENSIONS: tuple[Dimension, ...] = ("explore", "model", "reflect", "return")

# Repeatable events contribute at most this many points per user-day. One-time
# milestones sit outside it because they cannot be farmed.
DAILY_REPEATABLE_CAP = 60


@dataclass(frozen=True)
class EventRule:
    """One row of D-117's eligible-events table."""

    dimension: Dimension
    points: int
    # A once-ever award, keyed by (event_type, subject_key). Never re-awarded.
    once_per_subject: bool = False
    # Max awards for this event type per user-day. None = unlimited (still capped by
    # DAILY_REPEATABLE_CAP).
    per_day_limit: int | None = None
    # Max awards per (event_type, subject_key) per user-day.
    per_subject_per_day_limit: int | None = None
    # Minimum whole days since this subject's first qualifying award of
    # `requires_prior_event`, e.g. a teaching revisit 7 days after its exploration.
    requires_prior_event: str | None = None
    min_days_after_prior: int = 0
    # One award in any rolling window of this many days, across all subjects.
    rolling_window_days: int | None = None
    # Exempt from DAILY_REPEATABLE_CAP.
    exempt_from_daily_cap: bool = False
    # Derived by the replay engine rather than recorded by a caller.
    derived: bool = False


EVENT_RULES: dict[str, EventRule] = {
    "onboarding_handled": EventRule(
        dimension="milestone",
        points=40,
        once_per_subject=True,
        exempt_from_daily_cap=True,
    ),
    "capability_first_used": EventRule(
        dimension="explore",
        points=15,
        once_per_subject=True,
        exempt_from_daily_cap=True,
    ),
    "teaching_moment_explored": EventRule(
        dimension="explore",
        points=10,
        once_per_subject=True,
    ),
    "teaching_moment_revisited": EventRule(
        dimension="reflect",
        points=5,
        per_day_limit=1,
        requires_prior_event="teaching_moment_explored",
        min_days_after_prior=7,
    ),
    "calculator_completed": EventRule(
        dimension="model",
        points=12,
        per_day_limit=2,
        per_subject_per_day_limit=1,
    ),
    "scenario_completed": EventRule(
        dimension="model",
        points=15,
        per_day_limit=2,
        per_subject_per_day_limit=1,
    ),
    "arya_exchange_completed": EventRule(
        dimension="reflect",
        points=8,
        per_day_limit=3,
    ),
    "recap_completed": EventRule(
        dimension="reflect",
        points=8,
        rolling_window_days=7,
    ),
    "context_prompt_handled": EventRule(
        dimension="reflect",
        points=5,
        once_per_subject=True,
    ),
    "meaningful_return_day": EventRule(
        dimension="return",
        points=10,
        per_day_limit=1,
        derived=True,
    ),
}

# Event types a caller may record. `meaningful_return_day` is derived during replay from
# the day's own qualifying activity — deriving it rather than accepting it means it
# cannot be emitted spuriously, and it is not information the ledger would otherwise
# lack.
RECORDABLE_EVENT_TYPES = frozenset(
    name for name, rule in EVENT_RULES.items() if not rule.derived
)

# The Explore/Model/Reflect activity that qualifies a day as a meaningful return day.
RETURN_QUALIFYING_DIMENSIONS: frozenset[str] = frozenset({"explore", "model", "reflect"})


@dataclass(frozen=True)
class Stage:
    name: str
    min_points: int
    min_dimensions: int
    min_return_days: int


# Ordered lowest to highest. All three conditions must hold to reach a stage.
STAGES: tuple[Stage, ...] = (
    Stage("discovering", 0, 0, 0),
    Stage("exploring", 100, 2, 2),
    Stage("connecting", 300, 3, 5),
    Stage("deepening", 650, 4, 12),
    Stage("expanding", 1100, 4, 25),
)

# Past Expanding, each additional this-many lifetime points is a cosmetic milestone.
# Not a sixth rank — the lifetime total stays visible so a cycle indicator never looks
# like erased progress.
EXPANDING_MILESTONE_INTERVAL = 250


def resolve_stage(points: int, dimension_count: int, return_days: int) -> Stage:
    """Highest stage whose three conditions are all met."""
    reached = STAGES[0]
    for stage in STAGES:
        if (
            points >= stage.min_points
            and dimension_count >= stage.min_dimensions
            and return_days >= stage.min_return_days
        ):
            reached = stage
    return reached


def unmet_conditions(
    points: int, dimension_count: int, return_days: int
) -> dict[str, int]:
    """What still blocks the next stage, so the product can explain a stalled bar.

    D-117: "The product should explain an unmet breadth or return-day condition
    directly instead of leaving a bar at an unexplained ceiling." Empty dict at the
    top stage.
    """
    current = resolve_stage(points, dimension_count, return_days)
    remaining = [s for s in STAGES if s.min_points > current.min_points]
    if not remaining:
        return {}
    nxt = remaining[0]
    gaps: dict[str, int] = {}
    if points < nxt.min_points:
        gaps["points"] = nxt.min_points - points
    if dimension_count < nxt.min_dimensions:
        gaps["dimensions"] = nxt.min_dimensions - dimension_count
    if return_days < nxt.min_return_days:
        gaps["return_days"] = nxt.min_return_days - return_days
    return gaps


def expanding_milestones(points: int) -> int:
    """Completed cosmetic milestone cycles past the Expanding floor."""
    top = STAGES[-1]
    if points < top.min_points:
        return 0
    return (points - top.min_points) // EXPANDING_MILESTONE_INTERVAL
