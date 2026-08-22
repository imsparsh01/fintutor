import uuid

from sqlalchemy import Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class DiscretionaryCategory(Base):
    """{label, planned_amount} — the discretionary half of D-038's computed budget.

    Has no holding to live on (reference-vs-store test, D-038), so it's stored
    directly, sibling to Income/Goal rather than a field on either.
    """

    __tablename__ = "discretionary_categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # No Users table exists yet — loose reference, no FK (same as Income/Goal/Holding).
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String, nullable=False)
    planned_amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
