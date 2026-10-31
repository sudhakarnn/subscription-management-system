from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class TaxCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    percentage: Decimal = Field(ge=0, le=100, max_digits=5, decimal_places=2)
    description: str | None = None
    is_active: bool = True


class TaxResponse(BaseModel):
    id: UUID
    name: str
    percentage: Decimal
    description: str | None = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
