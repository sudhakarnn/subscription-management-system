from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.products.models import Product
from app.modules.products.schemas import ProductCreate, ProductUpdate


def create_product(db: Session, data: ProductCreate):
    if data.sku:
        existing = db.execute(
            select(Product).where(Product.sku == data.sku)
        ).scalar_one_or_none()

        if existing:
            raise HTTPException(status_code=409, detail="SKU already exists.")

    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def list_products(db: Session, search=None, page=1, limit=10, active_only=False):
    query = select(Product)

    if search:
        query = query.where(Product.name.ilike(f"%{search.strip()}%"))

    if active_only:
        query = query.where(Product.is_active.is_(True))

    query = query.order_by(Product.created_at.desc())
    query = query.offset((page - 1) * limit).limit(limit)

    return db.execute(query).scalars().all()


def get_product(db: Session, product_id: UUID):
    product = db.get(Product, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    return product


def update_product(db: Session, product_id: UUID, data: ProductUpdate):
    product = get_product(db, product_id)
    updates = data.model_dump(exclude_unset=True, exclude_none=True)

    if "sku" in updates and updates["sku"]:
        existing = db.execute(
            select(Product).where(
                Product.sku == updates["sku"],
                Product.id != product_id
            )
        ).scalar_one_or_none()

        if existing:
            raise HTTPException(status_code=409, detail="SKU already exists.")

    for field, value in updates.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product