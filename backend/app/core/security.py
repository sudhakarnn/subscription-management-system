from datetime import datetime, timedelta, timezone
from typing import Optional, Any
import re
import bcrypt
import jwt
from fastapi import HTTPException, status
from app.core.config import settings

# Characters allowed as special characters in password policy
SPECIAL_CHARACTERS = set("!@#$%^&*()_+-=[]{}|;:,.<>?")


def hash_password(password: str) -> str:
    """
    Hashes a plain-text password using bcrypt with 12 salt rounds.
    """
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a stored bcrypt hash.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def validate_password_strength(password: str) -> None:
    """
    Enforces Brightloop password security requirements:
    - More than 8 characters (minimum 9 characters)
    - At least one uppercase character (A-Z)
    - At least one lowercase character (a-z)
    - At least one numeric digit (0-9)
    - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
    """
    if len(password) <= 8:
        raise ValueError("Password must be more than 8 characters long (at least 9 characters).")
    if not any(c.isupper() for c in password):
        raise ValueError("Password must contain at least one uppercase letter (A-Z).")
    if not any(c.islower() for c in password):
        raise ValueError("Password must contain at least one lowercase letter (a-z).")
    if not any(c.isdigit() for c in password):
        raise ValueError("Password must contain at least one numeric digit (0-9).")
    if not any(c in SPECIAL_CHARACTERS for c in password):
        raise ValueError("Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?).")


def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Encodes identity and role payload into a signed JWT access token.
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": now,
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decodes and validates JWT token expiration and signature.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
