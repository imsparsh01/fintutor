import uuid

from sqlalchemy import Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Holding(Base):
    """A user's investment/loan/insurance holding — D-013's product-type taxonomy.

    `alias` (e.g. "Fund-A", "Loan-1") plus `characteristics` are the only fields
    ever sent to the LLM (D-010). `display_name` is the real product/institution
    name — masked from LLM context, shown only in the app's own UI (D-011's
    re-humanizing step).

    `product_type` is a plain string, not a constrained enum: D-013's 8-type
    taxonomy has an open question (PROJECT_SPEC.md §8 — the `savings_balance`
    type already used in fixtures isn't one of the formal 8) that this model
    deliberately does not resolve (D-044).
    """

    __tablename__ = "holdings"
    __table_args__ = (UniqueConstraint("user_id", "alias", name="uq_holdings_user_alias"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # No Users table exists yet — loose reference, no FK (D-043).
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    product_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    alias: Mapped[str] = mapped_column(String, nullable=False)
    display_name: Mapped[str | None] = mapped_column(String, nullable=True)
    characteristics: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
