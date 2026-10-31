
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin

from app.modules.subscriptions.schemas import (
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionResponse,
)

from app.modules.subscriptions.services import (
    create_subscription,
    list_subscriptions,
    get_subscription,
    update_subscription,
    cancel_subscription,
    renew_subscription,
    delete_subscription,
)


router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


@router.post("/", response_model=SubscriptionResponse, status_code=201)
def create_new_subscription(
    data: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return create_subscription(db, data)


@router.get("/", response_model=list[SubscriptionResponse])
def read_subscriptions(
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return list_subscriptions(db)


@router.get("/{subscription_id}", response_model=SubscriptionResponse)
def read_subscription(
    subscription_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return get_subscription(db, subscription_id)


@router.put("/{subscription_id}", response_model=SubscriptionResponse)
def edit_subscription(
    subscription_id: UUID,
    data: SubscriptionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return update_subscription(db, subscription_id, data)


@router.post("/{subscription_id}/cancel", response_model=SubscriptionResponse)
def cancel_sub(
    subscription_id: UUID,
    reason: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return cancel_subscription(db, subscription_id, reason or "Cancelled by administrator")


@router.post("/{subscription_id}/renew", response_model=SubscriptionResponse)
def renew_sub(
    subscription_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return renew_subscription(db, subscription_id)


@router.delete("/{subscription_id}")
def remove_subscription(
    subscription_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return delete_subscription(db, subscription_id)
