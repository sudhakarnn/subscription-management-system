import uuid
from datetime import datetime, date
from decimal import Decimal

from sqlalchemy import String, DateTime, Date, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Quotation(Base):
    __tablename__ = "quotations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    quotation_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False, index=True
    )

    plan_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("plans.id"), nullable=True
    )

    product_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id"), nullable=True
    )

    subscription_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subscriptions.id"), nullable=True
    )

    issue_date: Mapped[date] = mapped_column(
        Date, nullable=False
    )

    valid_until: Mapped[date] = mapped_column(
        Date, nullable=False
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=0, nullable=False
    )

    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=0, nullable=False
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    currency: Mapped[str] = mapped_column(
        String(3), default="INR", nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20), default="draft", nullable=False
    )  # draft, sent, accepted, rejected, converted

    notes: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    customer = relationship("app.modules.customers.models.Customer", lazy="joined")
    plan = relationship("app.modules.plans.models.Plan", lazy="joined")
    product = relationship("app.modules.products.models.Product", lazy="joined")
    subscription = relationship("app.modules.subscriptions.models.Subscription", lazy="joined")

    @property
    def customer_name(self) -> str:
        return self.customer.full_name if self.customer else ""

    @property
    def customer_email(self) -> str:
        return self.customer.email if self.customer else ""

    @property
    def plan_name(self) -> str:
        return self.plan.name if self.plan else ""
