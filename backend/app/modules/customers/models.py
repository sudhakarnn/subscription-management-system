
import uuid
from datetime import datetime

from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    user = relationship("app.modules.auth.models.User", lazy="joined")

    @property
    def email(self) -> str:
        return self.user.email if self.user else ""

    @property
    def full_name(self) -> str:
        return self.user.full_name if self.user else ""

    phone: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )

    company_name: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )

    billing_address: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )

    city: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )

    state: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )

    postal_code: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )

    country: Mapped[str] = mapped_column(
        String(100), default="India", nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
