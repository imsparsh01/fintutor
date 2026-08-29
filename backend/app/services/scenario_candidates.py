import math
import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import DiscretionaryCategory, Holding
from app.services.budget import _RECURRING_FREQUENCIES, _to_monthly


_EMI_TYPES = {"home_loan", "personal_loan"}
_SIP_TYPES = {"equity_mutual_fund", "debt_mutual_fund"}
_PREMIUM_TYPES = {"term_insurance", "endowment_ulip"}
_CORPUS_FIELDS = {
    "equity_mutual_fund": "current_value",
    "debt_mutual_fund": "current_value",
    "stocks": "current_value",
    "ppf_epf": "current_balance",
}
_FRESHNESS_NOTE = "Freshness unavailable"


def _retrieval_instant(retrieved_at: datetime | None) -> datetime:
    instant = retrieved_at or datetime.now(timezone.utc)
    if instant.tzinfo is None:
        instant = instant.replace(tzinfo=timezone.utc)
    return instant.astimezone(timezone.utc)


def _non_negative_number(raw) -> tuple[str, float | None, str | None]:
    if raw is None:
        return "unavailable", None, "The recorded value is unavailable."
    if isinstance(raw, bool):
        return "malformed", None, "The recorded value is not a valid number."
    try:
        value = float(raw)
    except (TypeError, ValueError):
        return "malformed", None, "The recorded value is not a valid number."
    if not math.isfinite(value) or value < 0:
        return "malformed", None, "The recorded value must be finite and non-negative."
    return "available", value, None


def _base_candidate(
    *,
    source_kind: str,
    source_record_id,
    source_label: str,
    source_fields: list[str],
    source_version: int,
    product_type: str | None,
    retrieved_at: str,
    unit: str,
    value_status: str,
    original_value: float | None,
    value_note: str | None,
) -> dict:
    status = "malformed" if value_status == "malformed" else "unavailable"
    return {
        "source_kind": source_kind,
        "source_record_id": str(source_record_id),
        "source_label": source_label,
        "source_fields": source_fields,
        "source_version": source_version,
        "record_updated_at": None,
        "retrieved_at": retrieved_at,
        "status": status,
        "status_note": value_note or _FRESHNESS_NOTE,
        "freshness": "unavailable",
        "freshness_note": _FRESHNESS_NOTE,
        "value_status": value_status,
        "editable": True,
        "included": False,
        "original_value": original_value,
        "unit": unit,
        "product_type": product_type,
    }


def _holding_value_candidate(
    holding: Holding,
    field: str,
    retrieved_at: str,
    *,
    unit: str = "INR",
    source_fields: list[str] | None = None,
) -> dict:
    value_status, value, value_note = _non_negative_number(
        (holding.characteristics or {}).get(field)
    )
    return _base_candidate(
        source_kind="holding",
        source_record_id=holding.id,
        source_label=holding.display_name or holding.alias,
        source_fields=source_fields or [field],
        source_version=holding.version,
        product_type=holding.product_type,
        retrieved_at=retrieved_at,
        unit=unit,
        value_status=value_status,
        original_value=value,
        value_note=value_note,
    )


def _monthly_holding_candidate(
    holding: Holding,
    amount_field: str,
    frequency_field: str,
    retrieved_at: str,
    *,
    eligibility_fields: list[str] | None = None,
) -> dict:
    c = holding.characteristics or {}
    value_status, amount, value_note = _non_negative_number(c.get(amount_field))
    frequency = c.get(frequency_field)
    normalized_frequency = str(frequency).strip().lower() if frequency is not None else ""
    if value_status == "available" and not normalized_frequency:
        value_status, value_note = "unavailable", "The recorded cadence is unavailable."
    elif value_status == "available" and normalized_frequency not in _RECURRING_FREQUENCIES:
        value_status, value_note = "malformed", "The recorded cadence is not recognised."

    monthly_value = None
    if value_status == "available" and amount is not None:
        try:
            monthly_value = _to_monthly(amount, normalized_frequency)
        except (TypeError, ValueError, OverflowError):
            value_status, value_note = "malformed", "The monthly normalization is invalid."
        if monthly_value is not None and (
            not math.isfinite(monthly_value) or monthly_value < 0
        ):
            value_status, value_note = "malformed", "The monthly normalization is invalid."
            monthly_value = None

    return _base_candidate(
        source_kind="holding",
        source_record_id=holding.id,
        source_label=holding.display_name or holding.alias,
        source_fields=[*(eligibility_fields or []), amount_field, frequency_field],
        source_version=holding.version,
        product_type=holding.product_type,
        retrieved_at=retrieved_at,
        unit="INR/month",
        value_status=value_status,
        original_value=monthly_value,
        value_note=value_note,
    )


def _discretionary_candidate(row: DiscretionaryCategory, retrieved_at: str) -> dict:
    value_status, value, value_note = _non_negative_number(row.planned_amount)
    return _base_candidate(
        source_kind="discretionary_category",
        source_record_id=row.id,
        source_label=row.label,
        source_fields=["planned_amount"],
        source_version=row.version,
        product_type=None,
        retrieved_at=retrieved_at,
        unit="INR/month",
        value_status=value_status,
        original_value=value,
        value_note=value_note,
    )


def _sort_candidates(candidates: list[dict]) -> list[dict]:
    return sorted(
        candidates,
        key=lambda item: (
            item["source_label"].casefold(),
            item["source_kind"],
            item["source_record_id"],
            tuple(item["source_fields"]),
        ),
    )


def _group(candidates: list[dict]) -> dict:
    ordered = _sort_candidates(candidates)
    return {"absent": not ordered, "candidates": ordered}


def enumerate_scenario_candidates(
    db: Session,
    user_id: uuid.UUID,
    *,
    retrieved_at: datetime | None = None,
) -> dict:
    """D-170/O-SC-9C: enumerate owned Scenario sources without summing or selecting.

    The endpoint intentionally returns component evidence, not anonymous aggregate totals.
    BQ-141 owns the transient user-authorship state and formula integration.
    """
    loaded_at = _retrieval_instant(retrieved_at).isoformat()
    holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
    categories = (
        db.query(DiscretionaryCategory)
        .filter(DiscretionaryCategory.user_id == user_id)
        .all()
    )

    monthly_outgoings: list[dict] = []
    monthly_sips: list[dict] = []
    invested_corpus: list[dict] = []
    fd_principal: list[dict] = []

    for holding in holdings:
        c = holding.characteristics or {}
        recurring: dict | None = None
        if holding.product_type in _EMI_TYPES:
            recurring = _monthly_holding_candidate(
                holding, "emi_amount", "emi_frequency", loaded_at
            )
        elif (
            holding.product_type in _SIP_TYPES
            and str(c.get("investment_mode") or "").strip().upper() == "SIP"
        ):
            recurring = _monthly_holding_candidate(
                holding,
                "invested_amount",
                "sip_frequency",
                loaded_at,
                eligibility_fields=["investment_mode"],
            )
            monthly_sips.append(dict(recurring))
        elif holding.product_type in _PREMIUM_TYPES:
            recurring = _monthly_holding_candidate(
                holding, "premium", "premium_frequency", loaded_at
            )
        if recurring is not None:
            monthly_outgoings.append(recurring)

        corpus_field = _CORPUS_FIELDS.get(holding.product_type)
        if corpus_field is not None:
            invested_corpus.append(
                _holding_value_candidate(holding, corpus_field, loaded_at)
            )
        elif (
            holding.product_type == "fd_rd"
            and str(c.get("deposit_mode") or "").strip().upper() == "FD"
        ):
            candidate = _holding_value_candidate(
                holding,
                "principal_or_monthly_amount",
                loaded_at,
                source_fields=["deposit_mode", "principal_or_monthly_amount"],
            )
            fd_principal.append(dict(candidate))
            invested_corpus.append(candidate)

    monthly_outgoings.extend(
        _discretionary_candidate(row, loaded_at) for row in categories
    )

    return {
        "retrieved_at": loaded_at,
        "freshness": "unavailable",
        "freshness_note": _FRESHNESS_NOTE,
        "monthly_outgoings": _group(monthly_outgoings),
        "monthly_sips": _group(monthly_sips),
        "invested_corpus": _group(invested_corpus),
        "fd_principal": _group(fd_principal),
    }
