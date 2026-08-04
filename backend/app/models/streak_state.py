import uuid
from datetime import date

from sqlalchemy import Date, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class StreakState(Base):
    """Daily app-open streak per user — D-060, P7. Pure app-behavior tracking (opens), never
    derived from financial data (P7's permitted half). One row per user."""

    __tablename__ = "streak_states"
    __table_args__ = (UniqueConstraint("user_id", name="uq_streak_states_user_id"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # No Users table exists yet — loose reference, no FK (same convention as Income/Goal/Holding).
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    current_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_active_date: Mapped[date | None] = mapped_column(Date, nullable=True)
