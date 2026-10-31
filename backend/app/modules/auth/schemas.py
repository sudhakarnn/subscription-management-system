from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from datetime import datetime
import uuid
from app.modules.auth.models import UserRole
from app.core.security import validate_password_strength


class UserResponse(BaseModel):
    """
    Public representation of a User.
    Excludes any password hashes or sensitive internal security tokens.
    """
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerRegisterRequest(BaseModel):
    """
    Public registration payload for customers.
    Notice: No 'role' field is accepted; backend strictly hardcodes role to CUSTOMER.
    """
    email: EmailStr
    password: str = Field(..., min_length=9, description="Password must be > 8 characters with upper, lower, digit, and special char")
    full_name: str = Field(..., min_length=2, max_length=255)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        validate_password_strength(v)
        return v


class StaffCreateRequest(BaseModel):
    """
    Payload for Admin creating a new operational Staff account.
    """
    email: EmailStr
    password: str = Field(..., min_length=9)
    full_name: str = Field(..., min_length=2, max_length=255)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        validate_password_strength(v)
        return v


class LoginRequest(BaseModel):
    """
    Standard JSON credentials for JWT token generation.
    """
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """
    JWT Bearer token response envelope.
    """
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
