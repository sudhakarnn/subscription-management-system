from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin
from app.modules.auth.models import User
from app.modules.plans.schemas import PlanCreate, PlanUpdate, PlanResponse
from app.modules.plans.services import (
    create_plan,
    list_plans,
    get_plan,
    update_plan,
)

router = APIRouter()


@router.post("", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
def create_new_plan(
    data: PlanCreate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_staff_or_admin),
):
    return create_plan(db, data)


@router.get("", response_model=list[PlanResponse])
def get_all_plans(
    product_id: UUID | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    active_only: bool = False,
    db: Session = Depends(get_db),
    actor: User = Depends(require_staff_or_admin),
):
    return list_plans(db, product_id, search, page, limit, active_only)


@router.get("/{plan_id}", response_model=PlanResponse)
def get_plan_details(
    plan_id: UUID,
    db: Session = Depends(get_db),
    actor: User = Depends(require_staff_or_admin),
):
    return get_plan(db, plan_id)


@router.put("/{plan_id}", response_model=PlanResponse)
def edit_plan(
    plan_id: UUID,
    data: PlanUpdate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_staff_or_admin),
):
    return update_plan(db, plan_id, data)