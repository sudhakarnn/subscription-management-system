from datetime import datetime, date
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class QuotationCreate(BaseModel):
    customer_id: UUID
    plan_id: UUID | None = None
    product_id: UUID | None = None
    subtotal: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    tax_amount: Decimal = Field(default=Decimal(0), ge=0, max_digits=12, decimal_places=2)
    discount_amount: Decimal = Field(default=Decimal(0), ge=0, max_digits=12, decimal_places=2)
    valid_until: date
    notes: str | None = None


class QuotationResponse(BaseModel):
    id: UUID
    quotation_number: str
    customer_id: UUID
    customer_name: str | None = None
    customer_email: str | None = None
    plan_id: UUID | None = None
    plan_name: str | None = None
    product_id: UUID | None = None
    subscription_id: UUID | None = None
    issue_date: date
    valid_until: date
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    currency: str
    status: str
    notes: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
