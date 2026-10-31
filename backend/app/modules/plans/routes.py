
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin

from app.modules.plans.schemas import (
    PlanCreate,
    PlanUpdate,
    PlanResponse,
)

from app.modules.plans.services import (
    create_plan,
    list_plans,
    get_plan,
    update_plan,
)


router = APIRouter(prefix="/plans", tags=["Plans"])


@router.post("/", response_model=PlanResponse, status_code=201)
def create_new_plan(
    data: PlanCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return create_plan(db, data)


@router.get("/", response_model=list[PlanResponse])
def read_plans(
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return list_plans(db)


@router.get("/{plan_id}", response_model=PlanResponse)
def read_plan(
    plan_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return get_plan(db, plan_id)


@router.put("/{plan_id}", response_model=PlanResponse)
def edit_plan(
    plan_id: UUID,
    data: PlanUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return update_plan(db, plan_id, data)
