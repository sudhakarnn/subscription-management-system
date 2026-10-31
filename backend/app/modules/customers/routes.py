
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin, require_customer
from app.modules.auth.models import User
from app.modules.customers.models import Customer
from app.modules.customers.schemas import (
    CustomerCreate,
    CustomerUpdate,
    CustomerStatusUpdate,
    CustomerResponse,
)
from app.modules.customers.services import (
    create_customer,
    get_customers,
    get_customer_by_id,
    update_customer,
    update_customer_status,
)

router = APIRouter()


def serialize_customer(customer, user):
    return {
        "id": customer.id,
        "user_id": customer.user_id,
        "email": user.email,
        "full_name": user.full_name,
        "phone": customer.phone,
        "company_name": customer.company_name,
        "billing_address": customer.billing_address,
        "city": customer.city,
        "state": customer.state,
        "postal_code": customer.postal_code,
        "country": customer.country,
        "is_active": customer.is_active and user.is_active,
        "created_at": customer.created_at,
    }


# Create customer - Staff/Admin
@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_new_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_staff_or_admin),
):
    customer = create_customer(db, data)
    user = db.get(User, customer.user_id)
    return serialize_customer(customer, user)


# List customers - Staff/Admin
@router.get("", response_model=list[CustomerResponse])
def list_customers(
    search: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    actor: User = Depends(require_staff_or_admin),
):
    results = get_customers(db, search, page, limit)

    return [
        serialize_customer(customer, user)
        for customer, user in results
    ]


# Get own profile - Customer
@router.get("/me", response_model=CustomerResponse)
def get_my_customer_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer),
):
    result = db.execute(
        select(Customer, User)
        .join(User, Customer.user_id == User.id)
        .where(Customer.user_id == current_user.id)
    ).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Customer profile not found.",
        )

    return serialize_customer(*result)


# Update own profile - Customer
@router.put("/me", response_model=CustomerResponse)
def update_my_customer_profile(
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer),
):
    customer = db.execute(
        select(Customer).where(Customer.user_id == current_user.id)
    ).scalar_one_or_none()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer profile not found.",
        )

    customer, user = update_customer(db, customer.id, data)
    return serialize_customer(customer, user)


# Get customer by ID - Staff/Admin
@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: UUID,
    db: Session = Depends(get_db),
    actor: User = Depends(require_staff_or_admin),
):
    customer, user = get_customer_by_id(db, customer_id)
    return serialize_customer(customer, user)


# Update customer - Staff/Admin
@router.put("/{customer_id}", response_model=CustomerResponse)
def edit_customer(
    customer_id: UUID,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_staff_or_admin),
):
    customer, user = update_customer(db, customer_id, data)
    return serialize_customer(customer, user)


# Activate/Deactivate customer - Staff/Admin
@router.patch("/{customer_id}/status", response_model=CustomerResponse)
def change_customer_status(
    customer_id: UUID,
    data: CustomerStatusUpdate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_staff_or_admin),
):
    customer, user = update_customer_status(
        db,
        customer_id,
        data.is_active,
    )

    return serialize_customer(customer, user)
