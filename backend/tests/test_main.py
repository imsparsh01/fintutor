import uuid

from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app
from app.models import Holding, Income

from tests.conftest import FakeSession, make_holding, make_income, override_get_db

client = TestClient(app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_health_db_returns_503_when_engine_not_configured(monkeypatch):
    # Explicitly patched rather than relying on ambient DATABASE_URL state, so this
    # test behaves the same in CI, this sandbox, and a laptop with a real .env.
    monkeypatch.setattr("app.main.engine", None)
    resp = client.get("/health/db")
    assert resp.status_code == 503
    assert "DATABASE_URL" in resp.json()["detail"]


def test_health_db_masks_raw_exception_detail(monkeypatch):
    """Guards the behavior app/main.py's own comment calls out: a DB connection
    failure must never echo the raw exception (which can embed the DSN/host/user)
    back to the caller — only the exception type name."""

    class _FailingEngine:
        def connect(self):
            raise RuntimeError(
                "connection to server at host secret-db-host.internal, user=admin, password=hunter2 failed"
            )

    monkeypatch.setattr("app.main.engine", _FailingEngine())
    resp = client.get("/health/db")
    assert resp.status_code == 503
    detail = resp.json()["detail"]
    assert "hunter2" not in detail
    assert "secret-db-host" not in detail
    assert "RuntimeError" in detail


def test_budget_endpoint_uses_injected_session():
    user_id = uuid.uuid4()
    fake_db = FakeSession({
        Income: [make_income(user_id, sources=[{"label": "salary", "amount": 100000, "frequency": "monthly"}])]
    })
    app.dependency_overrides[get_db] = override_get_db(fake_db)
    try:
        resp = client.get(f"/budget?user_id={user_id}")
        assert resp.status_code == 200
        assert resp.json()["income_total"] == 100000
    finally:
        app.dependency_overrides.clear()


def test_budget_endpoint_rejects_non_uuid_user_id():
    # Override get_db even though validation should fail first — FastAPI resolves
    # sibling dependencies alongside parameter validation rather than short-
    # circuiting on the first failure, so this would otherwise hit the real,
    # unconfigured get_db() and fail on that instead of the validation error
    # we're actually testing for.
    app.dependency_overrides[get_db] = override_get_db(FakeSession({}))
    try:
        resp = client.get("/budget?user_id=not-a-uuid")
        assert resp.status_code == 422
    finally:
        app.dependency_overrides.clear()


def test_surfacing_candidates_endpoint_uses_injected_session():
    user_id = uuid.uuid4()
    fake_db = FakeSession({Holding: [make_holding(user_id, product_type="home_loan", characteristics={})]})
    app.dependency_overrides[get_db] = override_get_db(fake_db)
    try:
        resp = client.get(f"/surfacing-candidates?user_id={user_id}")
        assert resp.status_code == 200
        assert resp.json() == [{"product_type": "term_insurance", "reason": "loan_without_life_cover"}]
    finally:
        app.dependency_overrides.clear()
