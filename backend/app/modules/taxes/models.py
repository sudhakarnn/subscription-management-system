import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import String, Boolean, DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.database import Base


class Tax(Base):
    __tablename__ = "taxes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )

    percentage: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
