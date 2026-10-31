import uuid
from datetime import datetime, date
from decimal import Decimal

from sqlalchemy import String, Boolean, DateTime, Date, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.database import Base


class Discount(Base):
    __tablename__ = "discounts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )

    description: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )

    discount_type: Mapped[str] = mapped_column(
        String(20), default="percentage", nullable=False
    )  # percentage or fixed

    value: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    valid_until: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
