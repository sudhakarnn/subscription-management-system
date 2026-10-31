
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin, get_current_user
from app.modules.customers.schemas import (
    CustomerCreate,
    CustomerUpdate,
    CustomerStatusUpdate,
    CustomerResponse,
)
from app.modules.customers.services import (
    create_customer,
    list_customers,
    get_customer,
    update_customer,
    update_customer_status,
)


router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=CustomerResponse, status_code=201)
def create_new_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return create_customer(db, data)


@router.get("/", response_model=list[CustomerResponse])
def read_customers(
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return list_customers(db)


@router.get("/me", response_model=CustomerResponse)
def read_my_customer_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_customer(db, current_user.id)


@router.put("/me", response_model=CustomerResponse)
def update_my_customer_profile(
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return update_customer(db, current_user.id, data)


@router.get("/{customer_id}", response_model=CustomerResponse)
def read_customer(
    customer_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return get_customer(db, customer_id)


@router.put("/{customer_id}", response_model=CustomerResponse)
def edit_customer(
    customer_id: UUID,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return update_customer(db, customer_id, data)


@router.patch("/{customer_id}/status", response_model=CustomerResponse)
def change_customer_status(
    customer_id: UUID,
    data: CustomerStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return update_customer_status(db, customer_id, data.is_active)
