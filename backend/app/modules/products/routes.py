from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin
from app.modules.auth.models import User
from app.modules.products.schemas import ProductCreate, ProductUpdate, ProductResponse
from app.modules.products.services import (
    create_product,
    list_products,
    get_product,
    update_product,
)

router = APIRouter()


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_new_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_staff_or_admin),
):
    return create_product(db, data)


@router.get("", response_model=list[ProductResponse])
def get_all_products(
    search: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    active_only: bool = False,
    db: Session = Depends(get_db),
    actor: User = Depends(require_staff_or_admin),
):
    return list_products(db, search, page, limit, active_only)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_details(
    product_id: UUID,
    db: Session = Depends(get_db),
    actor: User = Depends(require_staff_or_admin),
):
    return get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def edit_product(
    product_id: UUID,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_staff_or_admin),
):
    return update_product(db, product_id, data)