from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin
from app.modules.discounts.schemas import DiscountCreate, DiscountResponse
from app.modules.discounts.services import create_discount, list_discounts, delete_discount

router = APIRouter(prefix="/discounts", tags=["Discounts"])


@router.post("/", response_model=DiscountResponse, status_code=201)
def create_new_discount(
    data: DiscountCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return create_discount(db, data)


@router.get("/", response_model=list[DiscountResponse])
def read_discounts(
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return list_discounts(db, active_only=active_only)


@router.delete("/{discount_id}")
def remove_discount(
    discount_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return delete_discount(db, discount_id)
