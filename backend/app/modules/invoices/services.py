import uuid
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.invoices.models import Invoice


def create_invoice_for_subscription(db: Session, subscription):
    invoice = Invoice(
        invoice_number=f"INV-{uuid.uuid4().hex[:10].upper()}",
        subscription_id=subscription.id,
        customer_id=subscription.customer_id,
        issue_date=date.today(),
        due_date=date.today() + timedelta(days=7),
        subtotal=subscription.price,
        tax_amount=Decimal(0),
        discount_amount=Decimal(0),
        total_amount=subscription.price,
        currency=subscription.currency,
        status="unpaid",
    )

    db.add(invoice)
    return invoice


def list_invoices(db: Session):
    statement = select(Invoice).order_by(Invoice.created_at.desc())
    return db.scalars(statement).all()


def get_invoice(db: Session, invoice_id: uuid.UUID):
    invoice = db.get(Invoice, invoice_id)

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    return invoice


def mark_invoice_as_paid(db: Session, invoice_id: uuid.UUID):
    invoice = get_invoice(db, invoice_id)
    if invoice.status == "paid":
        return invoice

    invoice.status = "paid"
    invoice.paid_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(invoice)
    return invoice
