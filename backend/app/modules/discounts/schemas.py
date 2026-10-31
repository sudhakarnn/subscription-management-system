from datetime import datetime, date
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class DiscountCreate(BaseModel):
    code: str = Field(min_length=2, max_length=50)
    description: str | None = None
    discount_type: str = "percentage"  # percentage or fixed
    value: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    valid_until: date | None = None
    is_active: bool = True


class DiscountResponse(BaseModel):
    id: UUID
    code: str
    description: str | None = None
    discount_type: str
    value: Decimal
    valid_until: date | None = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
