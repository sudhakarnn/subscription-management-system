
from datetime import date, timedelta
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.subscriptions.models import Subscription
from app.modules.customers.models import Customer
from app.modules.plans.models import Plan
from app.modules.invoices.services import create_invoice_for_subscription


def create_subscription(db: Session, data):
    customer = db.get(Customer, data.customer_id)

    if not customer or not customer.is_active:
        raise HTTPException(status_code=404, detail="Active customer not found")

    plan = db.get(Plan, data.plan_id)

    if not plan or not plan.is_active:
        raise HTTPException(status_code=404, detail="Active plan not found")

    if data.next_billing_date < data.start_date:
        raise HTTPException(
            status_code=400,
            detail="Next billing date cannot be before start date",
        )

    if data.end_date and data.end_date < data.start_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date",
        )

    subscription = Subscription(
        customer_id=data.customer_id,
        plan_id=data.plan_id,
        start_date=data.start_date,
        end_date=data.end_date,
        next_billing_date=data.next_billing_date,
        price=plan.price,
        currency=plan.currency,
        status="active",
    )

    try:
        db.add(subscription)
        db.flush()

        create_invoice_for_subscription(db, subscription)

        db.commit()
        db.refresh(subscription)

        return subscription

    except Exception:
        db.rollback()
        raise


def list_subscriptions(db: Session):
    statement = select(Subscription).order_by(Subscription.created_at.desc())
    return db.scalars(statement).all()


def get_subscription(db: Session, subscription_id: UUID):
    subscription = db.get(Subscription, subscription_id)

    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")

    return subscription


def update_subscription(db: Session, subscription_id: UUID, data):
    subscription = get_subscription(db, subscription_id)

    updates = data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(subscription, field, value)

    db.commit()
    db.refresh(subscription)

    return subscription


def cancel_subscription(db: Session, subscription_id: UUID, reason: str | None = "Customer requested cancellation"):
    subscription = get_subscription(db, subscription_id)
    subscription.status = "cancelled"
    subscription.cancellation_reason = reason
    db.commit()
    db.refresh(subscription)
    return subscription


def renew_subscription(db: Session, subscription_id: UUID):
    subscription = get_subscription(db, subscription_id)
    plan = db.get(Plan, subscription.plan_id)

    current_billing = subscription.next_billing_date or date.today()
    if plan and plan.billing_interval == "yearly":
        new_billing = current_billing + timedelta(days=365)
    else:
        new_billing = current_billing + timedelta(days=30)

    subscription.next_billing_date = new_billing
    subscription.status = "active"

    # Create new invoice for the renewal period
    create_invoice_for_subscription(db, subscription)

    db.commit()
    db.refresh(subscription)
    return subscription


def delete_subscription(db: Session, subscription_id: UUID):
    subscription = get_subscription(db, subscription_id)
    db.delete(subscription)
    db.commit()
    return {"message": "Subscription deleted successfully"}
