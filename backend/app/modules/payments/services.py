import uuid
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.payments.models import Payment
from app.modules.invoices.models import Invoice
from app.modules.payments.schemas import PaymentCreate


def create_payment(db: Session, data: PaymentCreate):
    invoice = db.get(Invoice, data.invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    payment = Payment(
        invoice_id=data.invoice_id,
        customer_id=invoice.customer_id,
        amount=data.amount,
        currency=invoice.currency,
        payment_method=data.payment_method,
        status="completed",
        transaction_id=data.transaction_id or f"TXN-{uuid.uuid4().hex[:12].upper()}",
        notes=data.notes,
        payment_date=datetime.now(timezone.utc),
    )

    db.add(payment)

    # Mark invoice as paid
    invoice.status = "paid"
    invoice.paid_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(payment)
    return payment


def list_payments(db: Session):
    statement = select(Payment).order_by(Payment.created_at.desc())
    return db.scalars(statement).all()


def get_payment(db: Session, payment_id: uuid.UUID):
    payment = db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment
