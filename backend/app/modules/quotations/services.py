import uuid
from datetime import date, timedelta
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.quotations.models import Quotation
from app.modules.customers.models import Customer
from app.modules.plans.models import Plan
from app.modules.subscriptions.models import Subscription
from app.modules.invoices.services import create_invoice_for_subscription
from app.modules.quotations.schemas import QuotationCreate


def create_quotation(db: Session, data: QuotationCreate):
    customer = db.get(Customer, data.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total = data.subtotal + data.tax_amount - data.discount_amount
    if total < 0:
        total = 0

    quotation = Quotation(
        quotation_number=f"QTN-{uuid.uuid4().hex[:10].upper()}",
        customer_id=data.customer_id,
        plan_id=data.plan_id,
        product_id=data.product_id,
        issue_date=date.today(),
        valid_until=data.valid_until,
        subtotal=data.subtotal,
        tax_amount=data.tax_amount,
        discount_amount=data.discount_amount,
        total_amount=total,
        currency="INR",
        status="sent",
        notes=data.notes,
    )

    db.add(quotation)
    db.commit()
    db.refresh(quotation)
    return quotation


def list_quotations(db: Session):
    statement = select(Quotation).order_by(Quotation.created_at.desc())
    return db.scalars(statement).all()


def get_quotation(db: Session, quotation_id: uuid.UUID):
    quotation = db.get(Quotation, quotation_id)
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return quotation


def convert_quotation_to_subscription(db: Session, quotation_id: uuid.UUID):
    quotation = get_quotation(db, quotation_id)
    if not quotation.plan_id:
        raise HTTPException(status_code=400, detail="Quotation is not linked to a subscription plan")

    plan = db.get(Plan, quotation.plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    billing_days = 365 if plan.billing_interval == "yearly" else 30
    subscription = Subscription(
        customer_id=quotation.customer_id,
        plan_id=quotation.plan_id,
        start_date=date.today(),
        next_billing_date=date.today() + timedelta(days=billing_days),
        price=quotation.total_amount,
        currency=quotation.currency,
        status="active",
    )
    db.add(subscription)
    db.flush()

    create_invoice_for_subscription(db, subscription)

    quotation.status = "converted"
    quotation.subscription_id = subscription.id

    db.commit()
    db.refresh(quotation)
    return quotation
