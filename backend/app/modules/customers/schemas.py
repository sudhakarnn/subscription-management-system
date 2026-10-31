
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class CustomerCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=9)
    full_name: str = Field(min_length=2, max_length=255)

    phone: str | None = None
    company_name: str | None = None
    billing_address: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str = "India"


class CustomerUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    phone: str | None = None
    company_name: str | None = None
    billing_address: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = None


class CustomerStatusUpdate(BaseModel):
    is_active: bool


class CustomerResponse(BaseModel):
    id: UUID
    user_id: UUID
    email: EmailStr
    full_name: str
    phone: str | None
    company_name: str | None
    billing_address: str | None
    city: str | None
    state: str | None
    postal_code: str | None
    country: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
