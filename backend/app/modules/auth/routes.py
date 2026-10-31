from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_admin
from app.core.security import create_access_token
from app.modules.auth.models import User
from app.modules.auth.schemas import (
    CustomerRegisterRequest,
    StaffCreateRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
)
from app.modules.auth.services import (
    authenticate_user,
    register_customer,
    create_staff_user,
)

router = APIRouter(tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Public Customer Registration",
    description="Registers a new customer. Role is unconditionally assigned to CUSTOMER on the backend.",
)
def register(
    payload: CustomerRegisterRequest,
    db: Session = Depends(get_db),
) -> UserResponse:
    user = register_customer(db, payload)
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
    description="Authenticates credentials and returns a signed JWT Bearer access token.",
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = authenticate_user(db, payload.email, payload.password)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
        }
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.post(
    "/staff",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Staff Account",
    description="Allows an authenticated Administrator to provision a new Staff user account.",
)
def create_staff(
    payload: StaffCreateRequest,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> UserResponse:
    staff_user = create_staff_user(db, payload)
    return staff_user


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Current User Profile",
    description="Retrieves profile information and role permissions for the currently authenticated user.",
)
def get_me(
    current_user: User = Depends(get_current_active_user),
) -> UserResponse:
    return current_user
