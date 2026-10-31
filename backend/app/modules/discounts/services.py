from uuid import UUID
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.discounts.models import Discount
from app.modules.discounts.schemas import DiscountCreate


def create_discount(db: Session, data: DiscountCreate):
    code_upper = data.code.strip().upper()
    existing = db.scalar(select(Discount).where(Discount.code == code_upper))
    if existing:
        raise HTTPException(status_code=400, detail="Discount code already exists")

    discount = Discount(
        code=code_upper,
        description=data.description,
        discount_type=data.discount_type,
        value=data.value,
        valid_until=data.valid_until,
        is_active=data.is_active,
    )
    db.add(discount)
    db.commit()
    db.refresh(discount)
    return discount


def list_discounts(db: Session, active_only: bool = False):
    query = select(Discount)
    if active_only:
        query = query.where(Discount.is_active.is_(True))
    query = query.order_by(Discount.created_at.desc())
    return db.scalars(query).all()


def delete_discount(db: Session, discount_id: UUID):
    discount = db.get(Discount, discount_id)
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found")
    db.delete(discount)
    db.commit()
    return {"message": "Discount deleted successfully"}
