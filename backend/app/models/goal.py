import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Goal(Base):
    """Goal { target_amount, target_date, category, funded_by: [...] } — see D-038.

    Progress is computed live from `funded_by` holdings' current values —
    never stored on this record (reference-vs-store test, D-038).
    """

    __tablename__ = "goals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # No Users table exists yet — loose reference, no FK (owner decision, BQ-009 session).
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    target_amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    target_date: Mapped[date] = mapped_column(Date, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)

    funded_by: Mapped[list["GoalFunding"]] = relationship(
        back_populates="goal", cascade="all, delete-orphan"
    )


class GoalFunding(Base):
    """funded_by: [{holding_id, earmarked_amount}] — the thin link half of D-038's Goal.

    holding_id has no FK: no Holdings table exists yet (owner decision, BQ-009 session).
    Wire up the real foreign key once Holdings is built.
    """

    __tablename__ = "goal_fundings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    goal_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("goals.id", ondelete="CASCADE"), nullable=False, index=True
    )
    holding_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    earmarked_amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)

    goal: Mapped["Goal"] = relationship(back_populates="funded_by")
