"""Learning progression ledger and rebuildable summary — BQ-069, approved by D-121.

The replay engine is the heart of this module. It must be **deterministic and
idempotent**: the same events under the same ruleset version must produce the same
summary every time. That forbids wall-clock reads during replay — every window is
computed from ``local_date``, never from ``now()``.
"""

from __future__ import annotations

import functools
import hashlib
import logging
import uuid
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import ProgressionDailyRollup, ProgressionEvent, ProgressionSummary
from app.services.progression_ruleset import (
    BREADTH_DIMENSIONS,
    DAILY_REPEATABLE_CAP,
    DAY_BOUNDARY_TZ,
    EXPANDING_MILESTONE_INTERVAL,
    EVENT_RULES,
    RECORDABLE_EVENT_TYPES,
    RETURN_QUALIFYING_DIMENSIONS,
    RULESET_VERSION,
    STAGES,
    expanding_milestones,
    resolve_stage,
)

# D-121 §5: raw events prune after this many days; rollups and summary persist for
# account life. The number is only meaningful once backup retention is settled in
# D-010 — a 400-day prune on 90-day backups is really 490 days.
RAW_EVENT_RETENTION_DAYS = 400

RETURN_EVENT_TYPE = "meaningful_return_day"

logger = logging.getLogger(__name__)


class ProgressionValidationError(ValueError):
    """Caller supplied an event this ledger will not record."""


def _as_utc(value: datetime) -> datetime:
    """Normalize to an aware UTC datetime.

    Rows just added to the session still carry the aware value they were built with,
    while rows loaded back from a driver that does not preserve tzinfo (SQLite, in the
    tests) come back naive. Replay sorts and compares across both, so every timestamp
    is normalized before use rather than trusting the driver.
    """
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def _ledger_order(event: ProgressionEvent) -> tuple:
    """Total order for replay: the true instant, then insertion order.

    ``occurred_at`` alone is not enough — several events can share an instant, and the
    row id is a random UUID, so using it as the tiebreak would make cap outcomes depend
    on UUID luck. Two users taking the same actions in the same order must score the
    same. ``created_at`` is stored, so this stays stable across replays.
    """
    occurred = _as_utc(event.occurred_at)
    created = _as_utc(event.created_at) if event.created_at else occurred
    return (occurred, created, str(event.id))


def local_date_for(occurred_at: datetime) -> date:
    """Materialize the user-day on the fixed Asia/Kolkata boundary (D-121 §3)."""
    return _as_utc(occurred_at).astimezone(DAY_BOUNDARY_TZ).date()


def once_key(event_type: str, subject_key: str | None) -> str:
    """Stable identity for a once-ever award, e.g. ``onboarding_handled:v2``."""
    return f"{event_type}:{subject_key or ''}"


# --------------------------------------------------------------------------------
# Replay
# --------------------------------------------------------------------------------


@dataclass
class _DayResult:
    points: int = 0
    awarded_types: list[str] = field(default_factory=list)
    dimensions: set[str] = field(default_factory=set)
    once_keys: list[str] = field(default_factory=list)
    return_day_awarded: bool = False
    awarded_event_ids: list[uuid.UUID] = field(default_factory=list)


@dataclass
class _ReplayResult:
    lifetime_points: int = 0
    dimensions: set[str] = field(default_factory=set)
    return_days: int = 0
    day_results: dict[date, _DayResult] = field(default_factory=dict)
    last_event_at: datetime | None = None


def _replay_day(
    day: date,
    events: list[ProgressionEvent],
    consumed_once: dict[str, date],
    last_award_date_by_type: dict[str, date],
) -> _DayResult:
    """Compute one user-day's awards. Pure — mutates only the two carried-state dicts."""
    result = _DayResult()
    remaining_cap = DAILY_REPEATABLE_CAP
    type_counts: Counter[str] = Counter()
    subject_counts: Counter[tuple[str, str | None]] = Counter()

    def try_award(
        event_type: str, subject_key: str | None, event_id: uuid.UUID | None = None
    ) -> bool:
        nonlocal remaining_cap
        rule = EVENT_RULES[event_type]
        key = once_key(event_type, subject_key)

        if rule.once_per_subject and key in consumed_once:
            return False
        if rule.per_day_limit is not None and type_counts[event_type] >= rule.per_day_limit:
            return False
        if (
            rule.per_subject_per_day_limit is not None
            and subject_counts[(event_type, subject_key)] >= rule.per_subject_per_day_limit
        ):
            return False
        if rule.rolling_window_days is not None:
            last = last_award_date_by_type.get(event_type)
            if last is not None and (day - last).days < rule.rolling_window_days:
                return False
        if rule.requires_prior_event is not None:
            prior = consumed_once.get(once_key(rule.requires_prior_event, subject_key))
            if prior is None or (day - prior).days < rule.min_days_after_prior:
                return False

        # An event that does not fit under the remaining daily cap does not award and
        # does not consume its once-ever key, so the same action can earn full credit on
        # a later day. Partial awards were rejected deliberately: they would burn a
        # once-per-subject award for a fraction of its value.
        if not rule.exempt_from_daily_cap:
            if rule.points > remaining_cap:
                return False
            remaining_cap -= rule.points

        result.points += rule.points
        result.awarded_types.append(event_type)
        result.dimensions.add(rule.dimension)
        type_counts[event_type] += 1
        subject_counts[(event_type, subject_key)] += 1
        last_award_date_by_type[event_type] = day
        if rule.once_per_subject:
            consumed_once[key] = day
            result.once_keys.append(key)
        if event_id is not None:
            result.awarded_event_ids.append(event_id)
        return True

    # Deterministic order: the true instant, then the row id as a stable tiebreak.
    for event in sorted(events, key=_ledger_order):
        try_award(event.event_type, event.subject_key, event.id)

    # D-117: a return day is earned once per day *after* at least one eligible
    # Explore/Model/Reflect event. Derived here rather than recorded, so it cannot be
    # emitted spuriously and cannot be missed.
    if result.dimensions & RETURN_QUALIFYING_DIMENSIONS:
        if try_award(RETURN_EVENT_TYPE, None):
            result.return_day_awarded = True

    return result


def _replay(
    events: list[ProgressionEvent], rollups: list[ProgressionDailyRollup]
) -> _ReplayResult:
    """Replay a user's whole history: frozen days as stored, live days recomputed."""
    frozen_by_day = {r.local_date: r for r in rollups if r.events_pruned}
    live_by_day: dict[date, list[ProgressionEvent]] = defaultdict(list)
    for event in events:
        # A frozen day's raw events are gone; if any survive, the day is not frozen.
        if event.local_date not in frozen_by_day:
            live_by_day[event.local_date].append(event)

    consumed_once: dict[str, date] = {}
    last_award_date_by_type: dict[str, date] = {}
    out = _ReplayResult()

    for day in sorted(set(frozen_by_day) | set(live_by_day)):
        frozen = frozen_by_day.get(day)
        if frozen is not None:
            out.lifetime_points += frozen.points_awarded
            out.dimensions.update(frozen.dimensions or [])
            if frozen.return_day_awarded:
                out.return_days += 1
            for key in frozen.once_keys or []:
                consumed_once.setdefault(key, day)
            for event_type in frozen.awarded_types or []:
                last_award_date_by_type[event_type] = day
            continue

        day_result = _replay_day(
            day, live_by_day[day], consumed_once, last_award_date_by_type
        )
        out.day_results[day] = day_result
        out.lifetime_points += day_result.points
        out.dimensions.update(day_result.dimensions)
        if day_result.return_day_awarded:
            out.return_days += 1

    if events:
        out.last_event_at = max(_as_utc(e.occurred_at) for e in events)
    return out


# --------------------------------------------------------------------------------
# Persistence
# --------------------------------------------------------------------------------


def _load_events(db: Session, user_id: uuid.UUID) -> list[ProgressionEvent]:
    return list(
        db.execute(
            select(ProgressionEvent)
            .where(ProgressionEvent.user_id == user_id)
            .order_by(
                ProgressionEvent.occurred_at,
                ProgressionEvent.created_at,
                ProgressionEvent.id,
            )
        ).scalars()
    )


def _load_rollups(db: Session, user_id: uuid.UUID) -> list[ProgressionDailyRollup]:
    return list(
        db.execute(
            select(ProgressionDailyRollup)
            .where(ProgressionDailyRollup.user_id == user_id)
            .order_by(ProgressionDailyRollup.local_date)
        ).scalars()
    )


def rebuild(db: Session, user_id: uuid.UUID) -> ProgressionSummary:
    """Replay the ledger and rewrite the rollups and summary.

    Idempotent: running it twice with no new events leaves the same state. The whole
    ledger is replayed rather than the summary being incrementally patched — with v1
    volumes that is cheap, and it means the stored summary can never drift from what
    the events say.
    """
    events = _load_events(db, user_id)
    rollups = _load_rollups(db, user_id)
    replayed = _replay(events, rollups)

    existing_by_day = {r.local_date: r for r in rollups}
    for day, day_result in replayed.day_results.items():
        rollup = existing_by_day.get(day)
        if rollup is None:
            rollup = ProgressionDailyRollup(
                user_id=user_id, local_date=day, ruleset_version=RULESET_VERSION
            )
            db.add(rollup)
        rollup.points_awarded = day_result.points
        rollup.awarded_types = sorted(set(day_result.awarded_types))
        rollup.dimensions = sorted(day_result.dimensions)
        rollup.once_keys = list(day_result.once_keys)
        rollup.return_day_awarded = day_result.return_day_awarded
        rollup.ruleset_version = RULESET_VERSION

    # A live day that no longer awards anything leaves no rollup behind.
    for day, rollup in existing_by_day.items():
        if not rollup.events_pruned and day not in replayed.day_results:
            db.delete(rollup)

    def _load_summary() -> ProgressionSummary | None:
        return db.execute(
            select(ProgressionSummary).where(ProgressionSummary.user_id == user_id)
        ).scalar_one_or_none()

    summary = _load_summary()
    if summary is None:
        # Two events arriving together for a user who has none yet would otherwise both
        # insert and one would fail the unique constraint. Losing the race is fine —
        # rebuild recomputes from the ledger either way, so the winner's row is correct.
        # ruleset_version has no column default and the savepoint flushes immediately,
        # so it must be set here rather than left to the assignments below.
        summary = ProgressionSummary(user_id=user_id, ruleset_version=RULESET_VERSION)
        try:
            with db.begin_nested():
                db.add(summary)
        except IntegrityError:
            summary = _load_summary()
            if summary is None:
                raise

    breadth = replayed.dimensions & set(BREADTH_DIMENSIONS)

    # Monotonicity (D-121 §6). displayed_points is the high-water mark of everything
    # replay has ever produced, so a downward retune is invisible to the user; stage is
    # floored the same way. These two are the only durable fields on the summary.
    floor = max(summary.displayed_points_floor or 0, replayed.lifetime_points)
    displayed = floor
    stage = resolve_stage(displayed, len(breadth), replayed.return_days)
    stage_index = STAGES.index(stage)
    stage_floor_index = max(summary.stage_floor_index or 0, stage_index)

    summary.ruleset_version = RULESET_VERSION
    summary.lifetime_points = replayed.lifetime_points
    summary.displayed_points = displayed
    summary.displayed_points_floor = floor
    summary.stage = STAGES[stage_floor_index].name
    summary.stage_floor_index = stage_floor_index
    summary.active_dimensions = sorted(breadth)
    summary.return_days = replayed.return_days
    # Only raw events know the true instant, so a rebuild after pruning must not reset
    # this to null — the frozen rollups carry the day but not the time.
    existing_last = _as_utc(summary.last_event_at) if summary.last_event_at else None
    if replayed.last_event_at is not None:
        summary.last_event_at = (
            max(replayed.last_event_at, existing_last)
            if existing_last is not None
            else replayed.last_event_at
        )
    summary.last_rebuilt_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(summary)
    return summary


def record_event(
    db: Session,
    user_id: uuid.UUID,
    event_type: str,
    *,
    subject_key: str | None = None,
    occurred_at: datetime | None = None,
    idempotency_key: str | None = None,
) -> dict:
    """Append one qualifying action to the ledger, then rebuild.

    Returns ``{"recorded": bool, "summary": …}``. ``recorded`` is False when the
    unique constraint rejected a duplicate — which is a success, not an error: retries,
    refreshes, and back-navigation are expected to land here.
    """
    if event_type not in RECORDABLE_EVENT_TYPES:
        raise ProgressionValidationError(f"Unrecordable event type: {event_type}")

    rule = EVENT_RULES[event_type]
    needs_subject = (
        rule.once_per_subject
        or rule.per_subject_per_day_limit is not None
        or rule.requires_prior_event is not None
    )
    if needs_subject and not subject_key:
        raise ProgressionValidationError(f"{event_type} requires a subject_key")

    occurred_at = _as_utc(occurred_at or datetime.now(timezone.utc))
    local_date = local_date_for(occurred_at)

    if idempotency_key is None:
        if not rule.once_per_subject:
            # Repeatable events must say what makes this occurrence distinct — a run id,
            # a chat turn id. Defaulting would silently collapse legitimate repeats.
            raise ProgressionValidationError(
                f"{event_type} requires an explicit idempotency_key"
            )
        idempotency_key = once_key(event_type, subject_key)
        if not rule.exempt_from_daily_cap:
            # A once-ever event that is *subject* to the daily cap may be crowded out on
            # a busy day and not award. Scoping its key to the day lets the same action
            # be recorded again later and earn its full value, while still absorbing the
            # same-day retries and refreshes D-117 cares about. The award itself stays
            # once-ever regardless — that is enforced during replay, not here.
            #
            # Cap-exempt milestones keep a lifetime key, so onboarding stays exactly
            # `onboarding_handled:v{flow_version}` as D-121 specifies.
            idempotency_key = f"{idempotency_key}:{local_date.isoformat()}"

    event = ProgressionEvent(
        user_id=user_id,
        event_type=event_type,
        subject_key=subject_key,
        occurred_at=occurred_at,
        local_date=local_date,
        idempotency_key=idempotency_key,
    )

    recorded = True
    try:
        with db.begin_nested():
            db.add(event)
    except IntegrityError:
        recorded = False

    summary = rebuild(db, user_id)
    return {"recorded": recorded, "summary": to_api_summary(summary)}


def grant_onboarding_credit(
    db: Session, user_id: uuid.UUID, flow_version: int = 2
) -> dict:
    """The one historical award D-121 authorises — D-119's onboarding-handled credit.

    Keyed so the unique constraint prevents a duplicate on its own. Nothing else is
    ever backfilled: inferring return days from streaks or capability use from holdings
    would put fabricated entries into the one system whose value is that it records
    what actually happened.
    """
    return record_event(
        db,
        user_id,
        "onboarding_handled",
        subject_key=f"v{flow_version}",
    )


# --------------------------------------------------------------------------------
# Emitters — BQ-071
# --------------------------------------------------------------------------------


def emit_safely(db: Session, user_id: uuid.UUID, event_type: str, **kwargs) -> bool:
    """Record an event without ever letting it break the feature that triggered it.

    Progression is a side effect of using FinTutor, never a precondition for it. A
    failure here must not turn a working calculator or a good Arya answer into an error
    the user sees, so everything is swallowed and logged.

    Call this only *after* the host request's own writes are committed — the rollback
    below is what keeps a broken emit from poisoning the session, and it must have
    nothing of the caller's left to undo.
    """
    try:
        record_event(db, user_id, event_type, **kwargs)
        return True
    except Exception:
        logger.exception("Progression emit failed for %s; continuing", event_type)
        try:
            db.rollback()
        except Exception:
            logger.exception("Progression rollback failed")
        return False


def _never_raises(fn):
    """Make an emitter total.

    `emit_safely` only guards the `record_event` call itself, but emitters do real work
    around it — hashing a question, deriving a key, reading the clock. A failure there
    would propagate into whatever route called it, which is exactly what the emitters
    exist to avoid. Everything an emitter does is inside the guard, not just the write.
    """

    @functools.wraps(fn)
    def wrapper(db: Session, user_id: uuid.UUID, *args, **kwargs):
        try:
            return fn(db, user_id, *args, **kwargs)
        except Exception:
            logger.exception("Progression emitter %s failed; continuing", fn.__name__)
            try:
                db.rollback()
            except Exception:
                logger.exception("Progression rollback failed")
            return None

    return wrapper


@_never_raises
def _capability(db: Session, user_id: uuid.UUID, family: str) -> None:
    """First use of a capability family. Once ever, and cap-exempt, so it is safe to
    fire alongside every qualifying completion — the unique constraint absorbs the rest.
    """
    emit_safely(db, user_id, "capability_first_used", subject_key=family)


@_never_raises
def record_arya_exchange(db: Session, user_id: uuid.UUID, question: str) -> None:
    """A non-empty question that received a successful response (D-117).

    /chat is stateless and carries no turn id, so the key is the question itself for
    the day. That is exactly D-117's rule: identical payloads and retries do not create
    new events, while a reworded prompt may still qualify inside the three-per-day cap.
    No semantic judgement of the question happens here — v1 deliberately avoids that.
    """
    if not question or not question.strip():
        return
    digest = hashlib.sha256(question.strip().lower().encode()).hexdigest()[:32]
    today = local_date_for(datetime.now(timezone.utc))
    accepted = emit_safely(
        db,
        user_id,
        "arya_exchange_completed",
        idempotency_key=f"arya:{today.isoformat()}:{digest}",
    )
    if accepted:
        _capability(db, user_id, "arya")


@_never_raises
def record_context_prompt(db: Session, user_id: uuid.UUID, prompt_key: str) -> None:
    """A context prompt was handled — answered, skipped, or deferred, all equal.

    D-117 is explicit that disclosure is never rewarded by amount, completeness,
    financial value, or sensitivity, so the caller must not vary this by what the user
    actually said.
    """
    emit_safely(db, user_id, "context_prompt_handled", subject_key=prompt_key)


@_never_raises
def record_onboarding_handled(db: Session, user_id: uuid.UUID, flow_version: int = 2) -> None:
    """Onboarding reached a handled state, however it got there — answered, individually
    skipped, or globally skipped all earn the same (D-117)."""
    emit_safely(
        db, user_id, "onboarding_handled", subject_key=f"v{flow_version}"
    )


def get_progression(db: Session, user_id: uuid.UUID) -> ProgressionSummary | None:
    return db.execute(
        select(ProgressionSummary).where(ProgressionSummary.user_id == user_id)
    ).scalar_one_or_none()


def list_history(
    db: Session, user_id: uuid.UUID, limit: int = 50, offset: int = 0
) -> list[dict]:
    """The user's own records, newest first — D-121's "visibility, not a toggle".

    Note there is deliberately no selective delete alongside this. D-119 established
    that clearing assessment context never removes earned progress, so progress is
    intentionally sticky; account deletion removes everything.
    """
    limit = max(1, min(limit, 200))
    all_events = _load_events(db, user_id)
    replayed = _replay(all_events, _load_rollups(db, user_id))
    awarded_ids = {
        event_id
        for day_result in replayed.day_results.values()
        for event_id in day_result.awarded_event_ids
    }
    events = sorted(
        (event for event in all_events if event.id in awarded_ids),
        key=_ledger_order,
        reverse=True,
    )[max(0, offset) : max(0, offset) + limit]
    return [
        {
            "event_type": e.event_type,
            "subject_key": e.subject_key,
            "dimension": EVENT_RULES[e.event_type].dimension,
            "occurred_at": e.occurred_at.isoformat(),
            "local_date": e.local_date.isoformat(),
        }
        for e in events
    ]


def delete_progression(db: Session, user_id: uuid.UUID) -> None:
    """Hard delete across all three tiers — the account-deletion path D-119 committed to."""
    for model in (ProgressionEvent, ProgressionDailyRollup, ProgressionSummary):
        for row in db.execute(select(model).where(model.user_id == user_id)).scalars():
            db.delete(row)
    db.commit()


def prune_raw_events(db: Session, user_id: uuid.UUID, today: date | None = None) -> int:
    """Drop raw events past the retention window, freezing their days into rollups.

    A frozen rollup carries the day's points, dimensions, return-day flag, awarded
    types, and consumed once-ever keys — enough for replay to stay correct without the
    raw rows. Returns the number of events deleted.

    Not scheduled here: wiring this to a periodic job is infrastructure, and no data is
    near 400 days old yet.
    """
    today = today or local_date_for(datetime.now(timezone.utc))
    cutoff = today - timedelta(days=RAW_EVENT_RETENTION_DAYS)

    # Rollups must reflect the current ledger before their days lose their events.
    rebuild(db, user_id)

    stale = list(
        db.execute(
            select(ProgressionEvent).where(
                ProgressionEvent.user_id == user_id,
                ProgressionEvent.local_date < cutoff,
            )
        ).scalars()
    )
    if not stale:
        return 0

    rollups = {r.local_date: r for r in _load_rollups(db, user_id)}
    for day in {e.local_date for e in stale}:
        rollup = rollups.get(day)
        if rollup is not None:
            rollup.events_pruned = True
    for event in stale:
        db.delete(event)
    db.commit()
    return len(stale)


# --------------------------------------------------------------------------------
# API projection
# --------------------------------------------------------------------------------


def to_api_summary(summary: ProgressionSummary | None) -> dict:
    """What the client is allowed to see.

    ``lifetime_points`` is deliberately not exposed: it is the raw replay output, which
    can sit below the displayed high-water mark after a retune, and showing both would
    surface exactly the decrease the floor exists to hide.
    """
    if summary is None:
        # A user who has done nothing yet has no row. Synthesizing the zero state here
        # keeps every caller off a "no progression" special case, and Discovering with
        # nothing earned is exactly what the absent row means.
        return {
            "stage": STAGES[0].name,
            "points": 0,
            "active_dimensions": [],
            "return_days": 0,
            "next_stage": STAGES[1].name,
            "unmet_conditions": _unmet_for_stage(0, 0, 0, 0),
            "expanding_milestones": 0,
            "ruleset_version": RULESET_VERSION,
            "last_event_at": None,
            "stage_progress": _stage_progress(0, 0),
        }
    return {
        "stage": summary.stage,
        "points": summary.displayed_points,
        "active_dimensions": summary.active_dimensions,
        "return_days": summary.return_days,
        "next_stage": (
            STAGES[summary.stage_floor_index + 1].name
            if summary.stage_floor_index + 1 < len(STAGES)
            else None
        ),
        "unmet_conditions": _unmet_for_stage(
            summary.displayed_points,
            len(summary.active_dimensions or []),
            summary.return_days,
            summary.stage_floor_index,
        ),
        "expanding_milestones": expanding_milestones(summary.displayed_points),
        "ruleset_version": summary.ruleset_version,
        "last_event_at": (
            summary.last_event_at.isoformat() if summary.last_event_at else None
        ),
        "stage_progress": _stage_progress(
            summary.displayed_points, summary.stage_floor_index
        ),
    }


def _unmet_for_stage(
    points: int, dimension_count: int, return_days: int, stage_index: int
) -> dict[str, int]:
    """Gaps from the durable displayed stage, not a freshly resolved lower stage."""
    if stage_index + 1 >= len(STAGES):
        return {}
    nxt = STAGES[stage_index + 1]
    gaps: dict[str, int] = {}
    if points < nxt.min_points:
        gaps["points"] = nxt.min_points - points
    if dimension_count < nxt.min_dimensions:
        gaps["dimensions"] = nxt.min_dimensions - dimension_count
    if return_days < nxt.min_return_days:
        gaps["return_days"] = nxt.min_return_days - return_days
    return gaps


def _stage_progress(points: int, stage_index: int) -> dict:
    """Backend-authoritative bounds for the continuous Home/detail bar.

    Before Expanding, the bar spans the current stage's point floor to the next
    stage's floor. It may reach 100% while breadth or return-day gates remain unmet;
    those gates are projected separately. Expanding repeats factual 250-point cycles
    without inventing a sixth rank.
    """
    current = STAGES[stage_index]
    if stage_index + 1 < len(STAGES):
        start = current.min_points
        end = STAGES[stage_index + 1].min_points
    else:
        completed = expanding_milestones(points)
        start = current.min_points + completed * EXPANDING_MILESTONE_INTERVAL
        end = start + EXPANDING_MILESTONE_INTERVAL
    value = min(max(points, start), end)
    fraction = (value - start) / (end - start)
    return {"start": start, "end": end, "value": value, "fraction": fraction}
