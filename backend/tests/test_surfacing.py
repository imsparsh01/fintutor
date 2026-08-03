import uuid

from app.models import Holding
from app.services.surfacing import compute_surfacing_candidates

from tests.conftest import FakeSession, make_holding

USER_ID = uuid.uuid4()

TERM_INSURANCE_CANDIDATE = {"product_type": "term_insurance", "reason": "loan_without_life_cover"}


def test_home_loan_without_term_insurance_yields_candidate():
    db = FakeSession({Holding: [make_holding(USER_ID, product_type="home_loan", characteristics={})]})
    assert compute_surfacing_candidates(db, USER_ID) == [TERM_INSURANCE_CANDIDATE]


def test_personal_loan_without_term_insurance_yields_candidate():
    db = FakeSession({Holding: [make_holding(USER_ID, product_type="personal_loan", characteristics={})]})
    assert compute_surfacing_candidates(db, USER_ID) == [TERM_INSURANCE_CANDIDATE]


def test_loan_with_term_insurance_already_held_yields_no_candidate():
    db = FakeSession({Holding: [
        make_holding(USER_ID, product_type="home_loan", characteristics={}),
        make_holding(USER_ID, product_type="term_insurance", characteristics={}),
    ]})
    assert compute_surfacing_candidates(db, USER_ID) == []


def test_endowment_ulip_does_not_suppress_term_insurance_candidate():
    """D-051/BQ-013, owner-confirmed: holding Endowment/ULIP does not suppress the
    term_insurance gap — D-013 split Term from Endowment/ULIP because the teaching
    moment genuinely differs, so the gap stands regardless of what else is held."""
    db = FakeSession({Holding: [
        make_holding(USER_ID, product_type="home_loan", characteristics={}),
        make_holding(USER_ID, product_type="endowment_ulip", characteristics={}),
    ]})
    assert compute_surfacing_candidates(db, USER_ID) == [TERM_INSURANCE_CANDIDATE]


def test_no_loan_yields_no_candidate():
    db = FakeSession({Holding: [make_holding(USER_ID, product_type="equity_mutual_fund", characteristics={})]})
    assert compute_surfacing_candidates(db, USER_ID) == []


def test_no_holdings_yields_no_candidate():
    db = FakeSession({})
    assert compute_surfacing_candidates(db, USER_ID) == []


def test_multiple_qualifying_loans_do_not_duplicate_candidate():
    db = FakeSession({Holding: [
        make_holding(USER_ID, product_type="home_loan", characteristics={}),
        make_holding(USER_ID, product_type="personal_loan", characteristics={}),
    ]})
    assert compute_surfacing_candidates(db, USER_ID) == [TERM_INSURANCE_CANDIDATE]
