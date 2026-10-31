from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin
from app.modules.quotations.schemas import QuotationCreate, QuotationResponse
from app.modules.quotations.services import (
    create_quotation,
    list_quotations,
    get_quotation,
    convert_quotation_to_subscription,
)

router = APIRouter(prefix="/quotations", tags=["Quotations"])


@router.post("/", response_model=QuotationResponse, status_code=201)
def create_new_quotation(
    data: QuotationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return create_quotation(db, data)


@router.get("/", response_model=list[QuotationResponse])
def read_quotations(
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return list_quotations(db)


@router.get("/{quotation_id}", response_model=QuotationResponse)
def read_quotation(
    quotation_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return get_quotation(db, quotation_id)


@router.post("/{quotation_id}/convert", response_model=QuotationResponse)
def convert_to_subscription(
    quotation_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return convert_quotation_to_subscription(db, quotation_id)
