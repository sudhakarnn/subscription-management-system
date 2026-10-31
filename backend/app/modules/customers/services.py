
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from fastapi import HTTPException, status

from app.modules.auth.models import User, UserRole
from app.modules.auth.services import get_user_by_email
from app.core.security import hash_password
from app.modules.customers.models import Customer
from app.modules.customers.schemas import CustomerCreate, CustomerUpdate
from app.core.security import validate_password_strength


def create_customer(db: Session, data: CustomerCreate):
    email = data.email.lower().strip()

    if get_user_by_email(db, email):
        raise HTTPException(
            status_code=409,
            detail="Email already registered."
        )

    validate_password_strength(data.password)

    try:
        user = User(
            email=email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name.strip(),
            role=UserRole.CUSTOMER,
            is_active=True,
        )

        db.add(user)
        db.flush()

        customer = Customer(
            user_id=user.id,
            phone=data.phone,
            company_name=data.company_name,
            billing_address=data.billing_address,
            city=data.city,
            state=data.state,
            postal_code=data.postal_code,
            country=data.country,
            is_active=True,
        )

        db.add(customer)
        db.commit()
        db.refresh(customer)

        return customer

    except Exception:
        db.rollback()
        raise


def get_customers(
    db: Session,
    search: str | None = None,
    page: int = 1,
    limit: int = 10,
):
    query = (
        select(Customer, User)
        .join(User, Customer.user_id == User.id)
    )

    if search:
        term = f"%{search.strip()}%"
        query = query.where(
            or_(
                User.full_name.ilike(term),
                User.email.ilike(term),
                Customer.company_name.ilike(term),
            )
        )

    query = query.order_by(Customer.created_at.desc())
    query = query.offset((page - 1) * limit).limit(limit)

    return db.execute(query).all()


def get_customer_by_id(db: Session, customer_id):
    result = db.execute(
        select(Customer, User)
        .join(User, Customer.user_id == User.id)
        .where(Customer.id == customer_id)
    ).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Customer not found."
        )

    return result


def update_customer(db: Session, customer_id, data: CustomerUpdate):
    customer, user = get_customer_by_id(db, customer_id)

    updates = data.model_dump(exclude_unset=True)

    if "full_name" in updates:
        user.full_name = updates.pop("full_name")

    for field, value in updates.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)

    return customer, user


def update_customer_status(db: Session, customer_id, is_active: bool):
    customer, user = get_customer_by_id(db, customer_id)

    customer.is_active = is_active
    user.is_active = is_active

    db.commit()
    db.refresh(customer)

    return customer, user
