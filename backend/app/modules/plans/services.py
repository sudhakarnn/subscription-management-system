from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.products.models import Product
from app.modules.plans.models import Plan
from app.modules.plans.schemas import PlanCreate, PlanUpdate


def create_plan(db: Session, data: PlanCreate):
    product = db.get(Product, data.product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    if not product.is_active:
        raise HTTPException(status_code=400, detail="Cannot create a plan for an inactive product.")

    plan = Plan(**data.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def list_plans(db: Session, product_id=None, search=None, page=1, limit=10, active_only=False):
    query = select(Plan)

    if product_id:
        query = query.where(Plan.product_id == product_id)

    if search:
        query = query.where(Plan.name.ilike(f"%{search.strip()}%"))

    if active_only:
        query = query.where(Plan.is_active.is_(True))

    query = query.order_by(Plan.created_at.desc())
    query = query.offset((page - 1) * limit).limit(limit)

    return db.execute(query).scalars().all()


def get_plan(db: Session, plan_id: UUID):
    plan = db.get(Plan, plan_id)

    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    return plan


def update_plan(db: Session, plan_id: UUID, data: PlanUpdate):
    plan = get_plan(db, plan_id)
    updates = data.model_dump(exclude_unset=True, exclude_none=True)

    for field, value in updates.items():
        setattr(plan, field, value)

    db.commit()
    db.refresh(plan)
    return plan