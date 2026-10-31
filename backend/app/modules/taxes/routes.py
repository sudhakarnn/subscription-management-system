from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin
from app.modules.taxes.schemas import TaxCreate, TaxResponse
from app.modules.taxes.services import create_tax, list_taxes, delete_tax

router = APIRouter(prefix="/taxes", tags=["Taxes"])


@router.post("/", response_model=TaxResponse, status_code=201)
def create_new_tax(
    data: TaxCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return create_tax(db, data)


@router.get("/", response_model=list[TaxResponse])
def read_taxes(
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return list_taxes(db, active_only=active_only)


@router.delete("/{tax_id}")
def remove_tax(
    tax_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return delete_tax(db, tax_id)
