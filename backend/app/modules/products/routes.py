
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin
from app.modules.products.schemas import ProductCreate, ProductUpdate, ProductResponse
from app.modules.products.services import (
    create_product,
    list_products,
    get_product,
    update_product,
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", response_model=ProductResponse, status_code=201)
def create_new_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return create_product(db, data)


@router.get("/", response_model=list[ProductResponse])
def read_products(
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return list_products(db)


@router.get("/{product_id}", response_model=ProductResponse)
def read_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def edit_product(
    product_id: UUID,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return update_product(db, product_id, data)
