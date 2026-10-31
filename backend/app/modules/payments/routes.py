from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin
from app.modules.payments.schemas import PaymentCreate, PaymentResponse
from app.modules.payments.services import create_payment, list_payments, get_payment

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/", response_model=PaymentResponse, status_code=201)
def record_payment(
    data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return create_payment(db, data)


@router.get("/", response_model=list[PaymentResponse])
def read_payments(
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return list_payments(db)


@router.get("/{payment_id}", response_model=PaymentResponse)
def read_payment(
    payment_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return get_payment(db, payment_id)
