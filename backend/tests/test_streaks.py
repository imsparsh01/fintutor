import unittest
import uuid
from datetime import date, timedelta
from unittest.mock import MagicMock, patch

from app.models import StreakState
from app.services.streaks import get_streak, record_app_open

USER_ID = uuid.uuid4()
TODAY = date(2026, 8, 12)


def _state(current: int, longest: int, last_active: date | None) -> StreakState:
    return StreakState(
        id=uuid.uuid4(),
        user_id=USER_ID,
        current_streak=current,
        longest_streak=longest,
        last_active_date=last_active,
    )


def _db(state: StreakState | None) -> MagicMock:
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = state
    return db


def _frozen_today():
    return patch("app.services.streaks.date", **{"today.return_value": TODAY})


class StreakReadTests(unittest.TestCase):
    """D-060: get_streak reports a zeroed state before any app open, and never writes."""

    def test_missing_state_reads_as_a_zeroed_streak(self) -> None:
        result = get_streak(_db(None), USER_ID)

        self.assertEqual(result, {
            "user_id": str(USER_ID),
            "current_streak": 0,
            "longest_streak": 0,
            "last_active_date": None,
        })

    def test_existing_state_is_serialised_with_an_iso_date(self) -> None:
        result = get_streak(_db(_state(4, 9, date(2026, 8, 11))), USER_ID)

        self.assertEqual(result["current_streak"], 4)
        self.assertEqual(result["longest_streak"], 9)
        self.assertEqual(result["last_active_date"], "2026-08-11")
        self.assertEqual(result["user_id"], str(USER_ID))

    def test_state_without_a_last_active_date_serialises_none(self) -> None:
        result = get_streak(_db(_state(0, 0, None)), USER_ID)

        self.assertIsNone(result["last_active_date"])

    def test_reading_a_streak_never_writes(self) -> None:
        db = _db(_state(1, 1, date(2026, 8, 12)))
        get_streak(db, USER_ID)

        db.add.assert_not_called()
        db.commit.assert_not_called()


class StreakFirstOpenTests(unittest.TestCase):
    """D-060/BQ-029: the very first recorded open creates the state at 1."""

    def test_first_ever_open_creates_state_at_one(self) -> None:
        db = _db(None)
        with _frozen_today():
            result = record_app_open(db, USER_ID)

        self.assertEqual(result["current_streak"], 1)
        self.assertEqual(result["longest_streak"], 1)
        self.assertEqual(result["last_active_date"], TODAY.isoformat())

    def test_first_ever_open_persists_the_new_row(self) -> None:
        db = _db(None)
        with _frozen_today():
            record_app_open(db, USER_ID)

        db.add.assert_called_once()
        db.commit.assert_called_once()
        self.assertEqual(db.add.call_args[0][0].user_id, USER_ID)


class StreakDayBoundaryTests(unittest.TestCase):
    """D-060/BQ-029: day-boundary transitions — continue, break, or no-op."""

    def test_same_day_reopen_is_a_no_op(self) -> None:
        state = _state(5, 7, TODAY)
        db = _db(state)
        with _frozen_today():
            result = record_app_open(db, USER_ID)

        self.assertEqual(result["current_streak"], 5)
        self.assertEqual(result["longest_streak"], 7)
        self.assertEqual(state.current_streak, 5)
        db.commit.assert_not_called()
        db.add.assert_not_called()

    def test_consecutive_day_continues_the_streak(self) -> None:
        state = _state(5, 7, TODAY - timedelta(days=1))
        db = _db(state)
        with _frozen_today():
            result = record_app_open(db, USER_ID)

        self.assertEqual(result["current_streak"], 6)
        self.assertEqual(result["last_active_date"], TODAY.isoformat())
        db.commit.assert_called_once()

    def test_one_missed_day_breaks_the_streak_back_to_one(self) -> None:
        state = _state(5, 7, TODAY - timedelta(days=2))
        db = _db(state)
        with _frozen_today():
            result = record_app_open(db, USER_ID)

        self.assertEqual(result["current_streak"], 1)
        self.assertEqual(result["last_active_date"], TODAY.isoformat())

    def test_a_long_absence_breaks_the_streak_back_to_one(self) -> None:
        state = _state(30, 30, TODAY - timedelta(days=365))
        db = _db(state)
        with _frozen_today():
            result = record_app_open(db, USER_ID)

        self.assertEqual(result["current_streak"], 1)

    def test_state_with_no_last_active_date_starts_at_one(self) -> None:
        state = _state(0, 0, None)
        db = _db(state)
        with _frozen_today():
            result = record_app_open(db, USER_ID)

        self.assertEqual(result["current_streak"], 1)
        self.assertEqual(result["longest_streak"], 1)

    def test_a_future_last_active_date_resets_to_one(self) -> None:
        state = _state(9, 9, TODAY + timedelta(days=1))
        db = _db(state)
        with _frozen_today():
            result = record_app_open(db, USER_ID)

        self.assertEqual(result["current_streak"], 1)
        self.assertEqual(result["last_active_date"], TODAY.isoformat())

    def test_repeated_consecutive_days_accumulate(self) -> None:
        state = _state(1, 1, date(2026, 8, 9))
        for day in (date(2026, 8, 10), date(2026, 8, 11), date(2026, 8, 12)):
            with patch("app.services.streaks.date", **{"today.return_value": day}):
                result = record_app_open(_db(state), USER_ID)

        self.assertEqual(result["current_streak"], 4)
        self.assertEqual(result["longest_streak"], 4)


class StreakLongestTrackingTests(unittest.TestCase):
    """D-060: longest_streak is a high-water mark that a break never lowers."""

    def test_longest_streak_advances_with_a_new_record(self) -> None:
        state = _state(7, 7, TODAY - timedelta(days=1))
        with _frozen_today():
            result = record_app_open(_db(state), USER_ID)

        self.assertEqual(result["current_streak"], 8)
        self.assertEqual(result["longest_streak"], 8)

    def test_a_break_preserves_the_previous_longest(self) -> None:
        state = _state(12, 12, TODAY - timedelta(days=4))
        with _frozen_today():
            result = record_app_open(_db(state), USER_ID)

        self.assertEqual(result["current_streak"], 1)
        self.assertEqual(result["longest_streak"], 12)

    def test_continuing_below_the_record_leaves_longest_untouched(self) -> None:
        state = _state(2, 40, TODAY - timedelta(days=1))
        with _frozen_today():
            result = record_app_open(_db(state), USER_ID)

        self.assertEqual(result["current_streak"], 3)
        self.assertEqual(result["longest_streak"], 40)


class StreakStateIsolationTests(unittest.TestCase):
    """D-060/D-061: streak state is app-open behaviour only, never financial data."""

    def test_returned_payload_exposes_only_streak_fields(self) -> None:
        with _frozen_today():
            result = record_app_open(_db(_state(3, 3, TODAY - timedelta(days=1))), USER_ID)

        self.assertEqual(
            set(result), {"user_id", "current_streak", "longest_streak", "last_active_date"}
        )

    def test_recording_an_open_reads_only_the_streak_table(self) -> None:
        db = _db(_state(1, 1, TODAY - timedelta(days=1)))
        with _frozen_today():
            record_app_open(db, USER_ID)

        for call in db.query.call_args_list:
            self.assertEqual(call[0], (StreakState,))


if __name__ == "__main__":
    unittest.main()
