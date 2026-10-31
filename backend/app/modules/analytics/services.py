from decimal import Decimal
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.modules.customers.models import Customer
from app.modules.subscriptions.models import Subscription
from app.modules.invoices.models import Invoice
from app.modules.plans.models import Plan


def get_dashboard_metrics(db: Session):
    total_customers = db.scalar(select(func.count(Customer.id))) or 0
    active_customers = db.scalar(select(func.count(Customer.id)).where(Customer.is_active.is_(True))) or 0

    total_subscriptions = db.scalar(select(func.count(Subscription.id))) or 0
    active_subscriptions = db.scalar(select(func.count(Subscription.id)).where(Subscription.status == "active")) or 0

    # Calculate MRR from active subscriptions
    active_subs = db.scalars(select(Subscription).where(Subscription.status == "active")).all()
    mrr = Decimal(0)
    for sub in active_subs:
        plan = db.get(Plan, sub.plan_id)
        if plan:
            if plan.billing_interval == "yearly":
                mrr += Decimal(str(sub.price)) / Decimal(12)
            else:
                mrr += Decimal(str(sub.price))

    total_invoices = db.scalar(select(func.count(Invoice.id))) or 0
    unpaid_invoices = db.scalar(select(func.count(Invoice.id)).where(Invoice.status == "unpaid")) or 0
    paid_invoices = db.scalar(select(func.count(Invoice.id)).where(Invoice.status == "paid")) or 0

    # Total collected revenue
    total_revenue = db.scalar(select(func.sum(Invoice.total_amount)).where(Invoice.status == "paid")) or Decimal(0)

    # Recent subscriptions (latest 5)
    recent_subs_query = select(Subscription).order_by(Subscription.created_at.desc()).limit(5)
    recent_subs = db.scalars(recent_subs_query).all()
    recent_subs_data = [
        {
            "id": str(s.id),
            "customer_name": s.customer_name,
            "plan_name": s.plan_name,
            "price": float(s.price),
            "status": s.status,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in recent_subs
    ]

    # Recent invoices (latest 5)
    recent_invs_query = select(Invoice).order_by(Invoice.created_at.desc()).limit(5)
    recent_invs = db.scalars(recent_invs_query).all()
    recent_invs_data = [
        {
            "id": str(inv.id),
            "invoice_number": inv.invoice_number,
            "customer_name": inv.customer_name,
            "total_amount": float(inv.total_amount),
            "status": inv.status,
            "issue_date": inv.issue_date.isoformat() if inv.issue_date else None,
        }
        for inv in recent_invs
    ]

    return {
        "total_customers": total_customers,
        "active_customers": active_customers,
        "total_subscriptions": total_subscriptions,
        "active_subscriptions": active_subscriptions,
        "mrr": round(mrr, 2),
        "total_invoices": total_invoices,
        "unpaid_invoices": unpaid_invoices,
        "paid_invoices": paid_invoices,
        "total_revenue": total_revenue,
        "recent_subscriptions": recent_subs_data,
        "recent_invoices": recent_invs_data,
    }
