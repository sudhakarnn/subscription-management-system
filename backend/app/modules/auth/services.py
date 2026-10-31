from typing import Optional
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status

from app.modules.auth.models import User, UserRole
from app.modules.auth.schemas import CustomerRegisterRequest, StaffCreateRequest
from app.core.security import hash_password, verify_password, validate_password_strength


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Look up user by normalized (lowercased) email.
    """
    stmt = select(User).where(User.email == email.lower().strip())
    return db.execute(stmt).scalar_one_or_none()


def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
    """
    Look up user by primary key UUID.
    """
    stmt = select(User).where(User.id == user_id)
    return db.execute(stmt).scalar_one_or_none()


def authenticate_user(db: Session, email: str, password: str) -> User:
    """
    Authenticates email and password. Returns User object if valid,
    or raises appropriate HTTP 401 exceptions.
    """
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact support.",
        )
    return user


def register_customer(db: Session, data: CustomerRegisterRequest) -> User:
    """
    Registers a new public customer.
    Enforces CUSTOMER role unconditionally on the backend.
    """
    normalized_email = data.email.lower().strip()
    if get_user_by_email(db, normalized_email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists.",
        )

    user = User(
        email=normalized_email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name.strip(),
        role=UserRole.CUSTOMER,  # Guaranteed CUSTOMER role
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_staff_user(db: Session, data: StaffCreateRequest) -> User:
    """
    Creates an operational Staff account.
    Only invoked by Admin-authorized routes.
    """
    normalized_email = data.email.lower().strip()
    if get_user_by_email(db, normalized_email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists.",
        )

    user = User(
        email=normalized_email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name.strip(),
        role=UserRole.STAFF,  # Guaranteed STAFF role
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_admin_user(db: Session, email: str, password: str, full_name: str) -> User:
    """
    Creates an Admin account. Used primarily by the secure CLI setup tool.
    """
    validate_password_strength(password)
    normalized_email = email.lower().strip()
    existing = get_user_by_email(db, normalized_email)
    if existing:
        raise ValueError(f"User with email '{normalized_email}' already exists.")

    user = User(
        email=normalized_email,
        hashed_password=hash_password(password),
        full_name=full_name.strip(),
        role=UserRole.ADMIN,  # Guaranteed ADMIN role
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
