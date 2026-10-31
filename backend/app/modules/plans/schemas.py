
from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PlanCreate(BaseModel):
    product_id: UUID
    name: str = Field(min_length=2, max_length=255)
    description: str | None = None
    price: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    billing_interval: Literal["monthly", "yearly"]
    interval_count: int = Field(default=1, ge=1)
    trial_days: int = Field(default=0, ge=0)


class PlanUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    price: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    billing_interval: Literal["monthly", "yearly"] | None = None
    interval_count: int | None = Field(default=None, ge=1)
    trial_days: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class PlanResponse(BaseModel):
    id: UUID
    product_id: UUID
    name: str
    description: str | None
    price: Decimal
    currency: str
    billing_interval: str
    interval_count: int
    trial_days: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
