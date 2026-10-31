from datetime import datetime, date
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class InvoiceResponse(BaseModel):
    id: UUID
    invoice_number: str
    subscription_id: UUID | None = None
    customer_id: UUID
    customer_name: str | None = None
    customer_email: str | None = None
    company_name: str | None = None
    issue_date: date
    due_date: date
    subtotal: Decimal
    tax_amount: Decimal = Decimal(0)
    discount_amount: Decimal = Decimal(0)
    total_amount: Decimal
    currency: str
    status: str
    notes: str | None = None
    paid_at: datetime | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
