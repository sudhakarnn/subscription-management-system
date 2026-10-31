
from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SubscriptionCreate(BaseModel):
    customer_id: UUID
    plan_id: UUID
    start_date: date
    next_billing_date: date
    end_date: date | None = None


class SubscriptionUpdate(BaseModel):
    status: Literal["active", "cancelled", "expired", "past_due"] | None = None
    next_billing_date: date | None = None
    end_date: date | None = None
    cancellation_reason: str | None = None


class SubscriptionResponse(BaseModel):
    id: UUID
    customer_id: UUID
    plan_id: UUID
    status: str
    start_date: date
    end_date: date | None
    next_billing_date: date
    price: Decimal
    currency: str
    cancellation_reason: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
