
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str | None = None
    sku: str | None = Field(default=None, max_length=100)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    sku: str | None = Field(default=None, max_length=100)
    is_active: bool | None = None


class ProductResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    sku: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
