from uuid import UUID
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.taxes.models import Tax
from app.modules.taxes.schemas import TaxCreate


def create_tax(db: Session, data: TaxCreate):
    tax = Tax(**data.model_dump())
    db.add(tax)
    db.commit()
    db.refresh(tax)
    return tax


def list_taxes(db: Session, active_only: bool = False):
    query = select(Tax)
    if active_only:
        query = query.where(Tax.is_active.is_(True))
    query = query.order_by(Tax.created_at.desc())
    return db.scalars(query).all()


def delete_tax(db: Session, tax_id: UUID):
    tax = db.get(Tax, tax_id)
    if not tax:
        raise HTTPException(status_code=404, detail="Tax not found")
    db.delete(tax)
    db.commit()
    return {"message": "Tax deleted successfully"}
