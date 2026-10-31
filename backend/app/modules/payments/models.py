import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import String, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    invoice_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False, index=True
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    currency: Mapped[str] = mapped_column(
        String(3), default="INR", nullable=False
    )

    payment_method: Mapped[str] = mapped_column(
        String(50), default="Credit Card", nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20), default="completed", nullable=False
    )  # completed, pending, failed, refunded

    transaction_id: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )

    payment_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    notes: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    invoice = relationship("app.modules.invoices.models.Invoice", lazy="joined")
    customer = relationship("app.modules.customers.models.Customer", lazy="joined")

    @property
    def customer_name(self) -> str:
        return self.customer.full_name if self.customer else ""

    @property
    def invoice_number(self) -> str:
        return self.invoice.invoice_number if self.invoice else ""
