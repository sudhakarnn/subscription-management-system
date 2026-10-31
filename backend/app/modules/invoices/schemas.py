
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class InvoiceResponse(BaseModel):
    id: UUID
    invoice_number: str
    subscription_id: UUID
    customer_id: UUID
    issue_date: date
    due_date: date
    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    currency: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
