
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin
from app.modules.invoices.schemas import InvoiceResponse
from app.modules.invoices.services import list_invoices, get_invoice


router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.get("", response_model=list[InvoiceResponse])
def read_invoices(
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return list_invoices(db)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def read_invoice(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return get_invoice(db, invoice_id)
