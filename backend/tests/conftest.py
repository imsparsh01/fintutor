"""Shared test doubles for the backend unit tests.

`compute_budget()` and `compute_surfacing_candidates()` (app/services/) only ever
call `db.query(Model).filter(...).all()` — they never touch anything
Postgres-specific (JSONB, native UUID, etc). That means the business logic can be
unit tested with a fake Session that dispatches by model class to a canned list of
plain objects, with no real database, no SQLite type-compatibility shims, and no
Docker/Postgres dependency. Real database behavior (migrations, constraints, FK
cascades) is a separate, still-open test category — see the session log.
"""
import uuid
from types import SimpleNamespace


class _FakeQuery:
    def __init__(self, items):
        self._items = items

    def filter(self, *args, **kwargs):
        return self

    def all(self):
        return self._items


class FakeSession:
    """Stand-in for a SQLAlchemy Session. `rows_by_model` maps a model class to the
    list of fake rows `db.query(that_model)` should return."""

    def __init__(self, rows_by_model: dict):
        self._rows_by_model = rows_by_model

    def query(self, model):
        return _FakeQuery(self._rows_by_model.get(model, []))


def override_get_db(fake_db):
    """Build a FastAPI dependency-override callable for `get_db`, matching its
    generator shape (`get_db` is `Depends`ed as a generator)."""

    def _gen():
        yield fake_db

    return _gen


def make_holding(user_id: uuid.UUID, *, product_type: str, characteristics: dict, alias: str = "Test-1"):
    return SimpleNamespace(
        id=uuid.uuid4(),
        user_id=user_id,
        product_type=product_type,
        alias=alias,
        display_name=None,
        characteristics=characteristics,
    )


def make_income(user_id: uuid.UUID, *, sources: list[dict]):
    return SimpleNamespace(id=uuid.uuid4(), user_id=user_id, sources=sources)


def make_discretionary_category(user_id: uuid.UUID, *, label: str, planned_amount: float):
    return SimpleNamespace(id=uuid.uuid4(), user_id=user_id, label=label, planned_amount=planned_amount)
