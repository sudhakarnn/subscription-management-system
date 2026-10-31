
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, validate_password_strength
from app.modules.auth.models import User, UserRole
from app.modules.customers.models import Customer
from app.modules.customers.schemas import CustomerCreate, CustomerUpdate


def create_customer(db: Session, data: CustomerCreate):
    existing_user = db.scalar(
        select(User).where(User.email == data.email)
    )

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        validate_password_strength(data.password)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
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
        country=data.country or "India",
        is_active=True,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer


def list_customers(db: Session):
    statement = select(Customer).order_by(Customer.created_at.desc())
    return db.scalars(statement).all()


def get_customer(db: Session, customer_id: UUID):
    customer = db.get(Customer, customer_id)

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return customer


def update_customer(db: Session, customer_id: UUID, data: CustomerUpdate):
    customer = get_customer(db, customer_id)

    updates = data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(customer, field, value)

    if "full_name" in updates:
        user = db.get(User, customer.user_id)
        if user:
            user.full_name = updates["full_name"]

    db.commit()
    db.refresh(customer)

    return customer


def update_customer_status(db: Session, customer_id: UUID, is_active: bool):
    customer = get_customer(db, customer_id)
    customer.is_active = is_active

    db.commit()
    db.refresh(customer)

    return customer


def delete_customer(db: Session, customer_id: UUID):
    customer = get_customer(db, customer_id)
    user = db.get(User, customer.user_id)
    db.delete(customer)
    if user:
        db.delete(user)
    db.commit()
    return {"message": "Customer deleted successfully"}
