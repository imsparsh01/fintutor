import re
import uuid
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models import Holding
from app.services.holding_fields import validate_reconciliation_fields
from app.services.holdings import _validate_tax_inputs, create_holding


@dataclass
class ReconciliationStaleError(Exception):
    proposal: dict


class ReconciliationValidationError(ValueError):
    pass


def redact_display_names(message: str, holdings: list[dict]) -> str:
    """Replace exact local display-name mentions before any classifier call."""
    redacted = message
    names = sorted(
        ((h.get("display_name"), h["alias"]) for h in holdings if h.get("display_name")),
        key=lambda item: len(item[0]),
        reverse=True,
    )
    for display_name, alias in names:
        redacted = re.sub(re.escape(display_name), alias, redacted, flags=re.IGNORECASE)
    return redacted


def _candidate(holding: dict | Holding) -> dict:
    return {
        "id": str(holding["id"] if isinstance(holding, dict) else holding.id),
        "alias": holding["alias"] if isinstance(holding, dict) else holding.alias,
        "display_name": holding.get("display_name") if isinstance(holding, dict) else holding.display_name,
        "product_type": holding["product_type"] if isinstance(holding, dict) else holding.product_type,
    }


def _diff(stored: dict, proposed: dict) -> list[dict]:
    rows = []
    for field, proposed_value in proposed.items():
        present = field in stored
        stored_value = stored.get(field)
        status = "unchanged" if present and stored_value == proposed_value else ("conflicting" if present else "added")
        rows.append({
            "field": field,
            "status": status,
            "stored_value": stored_value if present else None,
            "proposed_value": proposed_value,
        })
    return rows


def _new_proposal(product_type: str, characteristics: dict) -> dict:
    return {
        "kind": "new",
        "product_type": product_type,
        "characteristics": characteristics,
        "candidates": [],
        "target": None,
        "diff": [
            {"field": key, "status": "added", "stored_value": None, "proposed_value": value}
            for key, value in characteristics.items()
        ],
    }


def build_reconciliation_proposal(
    message: str,
    holdings: list[dict],
    product_type: str,
    characteristics: dict,
) -> dict:
    try:
        validate_reconciliation_fields(product_type, characteristics)
    except ValueError as exc:
        raise ReconciliationValidationError(str(exc)) from exc
    same_type = [h for h in holdings if h["product_type"] == product_type]
    exact = []
    for holding in same_type:
        local_names = [holding.get("display_name"), holding.get("alias")]
        if any(name and re.search(re.escape(name), message, re.IGNORECASE) for name in local_names):
            exact.append(holding)
    if len(exact) == 1:
        return proposal_for_holding(exact[0], characteristics)
    if len(same_type) == 0:
        return _new_proposal(product_type, characteristics)
    return {
        "kind": "select",
        "product_type": product_type,
        "characteristics": characteristics,
        "candidates": [_candidate(h) for h in same_type],
        "target": None,
        "diff": [],
    }


def proposal_for_holding(holding: dict | Holding, characteristics: dict) -> dict:
    stored = holding["characteristics"] if isinstance(holding, dict) else (holding.characteristics or {})
    return {
        "kind": "update",
        "product_type": holding["product_type"] if isinstance(holding, dict) else holding.product_type,
        "characteristics": characteristics,
        "candidates": [],
        "target": _candidate(holding),
        "diff": _diff(stored, characteristics),
    }


def resolve_reconciliation(
    db: Session,
    user_id: uuid.UUID,
    product_type: str,
    characteristics: dict,
    target_id: uuid.UUID | None,
    add_as_new: bool,
) -> dict:
    try:
        validate_reconciliation_fields(product_type, characteristics)
    except ValueError as exc:
        raise ReconciliationValidationError(str(exc)) from exc
    if add_as_new:
        if target_id is not None:
            raise ReconciliationValidationError("Choose either an owned holding or Add as new, not both")
        return _new_proposal(product_type, characteristics)
    if target_id is None:
        raise ReconciliationValidationError("Choose an owned holding or Add as new")
    holding = db.query(Holding).filter(
        Holding.user_id == user_id,
        Holding.id == target_id,
        Holding.product_type == product_type,
    ).first()
    if holding is None:
        raise ReconciliationValidationError("The selected holding is not available")
    return proposal_for_holding(holding, characteristics)


def apply_reconciliation(
    db: Session,
    user_id: uuid.UUID,
    product_type: str,
    characteristics: dict,
    target_id: uuid.UUID | None,
    expected_diff: list[dict],
) -> dict:
    try:
        validate_reconciliation_fields(product_type, characteristics)
    except ValueError as exc:
        raise ReconciliationValidationError(str(exc)) from exc
    if not isinstance(expected_diff, list) or len(expected_diff) != len(characteristics):
        raise ReconciliationValidationError("The confirmed field comparison is malformed")
    fields = [row.get("field") for row in expected_diff if isinstance(row, dict)]
    if len(fields) != len(expected_diff) or len(set(fields)) != len(fields):
        raise ReconciliationValidationError("The confirmed field comparison is malformed")
    required_keys = {"field", "status", "stored_value", "proposed_value"}
    if any(set(row) != required_keys or row.get("status") not in {"added", "unchanged", "conflicting"} for row in expected_diff):
        raise ReconciliationValidationError("The confirmed field comparison is malformed")
    if target_id is None:
        expected = {
            row.get("field"): (row.get("stored_value"), row.get("proposed_value"), row.get("status"))
            for row in expected_diff
        }
        current = {
            row["field"]: (row["stored_value"], row["proposed_value"], row["status"])
            for row in _new_proposal(product_type, characteristics)["diff"]
        }
        if expected != current:
            raise ReconciliationValidationError("Review the proposed fields before adding this holding")
        return create_holding(db, user_id, product_type, None, None, characteristics)

    holding = db.query(Holding).filter(
        Holding.user_id == user_id,
        Holding.id == target_id,
        Holding.product_type == product_type,
    ).with_for_update().first()
    if holding is None:
        raise ReconciliationValidationError("The selected holding is not available")

    refreshed = proposal_for_holding(holding, characteristics)
    expected = {
        row.get("field"): (row.get("stored_value"), row.get("proposed_value"), row.get("status"))
        for row in expected_diff
    }
    current = {
        row["field"]: (row["stored_value"], row["proposed_value"], row["status"])
        for row in refreshed["diff"]
    }
    if set(expected) != set(characteristics) or expected != current:
        raise ReconciliationStaleError(refreshed)

    changed = [row for row in refreshed["diff"] if row["status"] != "unchanged"]
    merged = dict(holding.characteristics or {})
    merged.update(characteristics)
    try:
        _validate_tax_inputs(product_type, merged)
    except ValueError as exc:
        raise ReconciliationValidationError(str(exc)) from exc
    holding.characteristics = merged
    db.commit()
    db.refresh(holding)
    result = {
        "id": str(holding.id),
        "product_type": holding.product_type,
        "alias": holding.alias,
        "display_name": holding.display_name,
        "characteristics": holding.characteristics,
        "reconciliation": {
            "status": "contradiction" if any(row["status"] == "conflicting" for row in changed) else "updated",
            "product_type": holding.product_type,
            "changed_fields": [row["field"] for row in changed],
        },
    }
    return result
