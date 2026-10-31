from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class PaymentCreate(BaseModel):
    invoice_id: UUID
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    payment_method: str = Field(default="Credit Card")  # Credit Card, Bank Transfer, UPI, Cash
    transaction_id: str | None = None
    notes: str | None = None


class PaymentResponse(BaseModel):
    id: UUID
    invoice_id: UUID
    customer_id: UUID
    customer_name: str | None = None
    invoice_number: str | None = None
    amount: Decimal
    currency: str
    payment_method: str
    status: str
    transaction_id: str | None = None
    payment_date: datetime
    notes: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
