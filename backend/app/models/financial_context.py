import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class FinancialContext(Base):
    """Optional, user-confirmed context with one authoritative row per account."""

    __tablename__ = "financial_contexts"
    __table_args__ = (UniqueConstraint("user_id", name="uq_financial_contexts_user_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    dependant_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    emergency_fund_months: Mapped[float | None] = mapped_column(Float, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
