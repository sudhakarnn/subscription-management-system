from decimal import Decimal
from pydantic import BaseModel
from typing import Any


class DashboardStats(BaseModel):
    total_customers: int
    active_customers: int
    total_subscriptions: int
    active_subscriptions: int
    mrr: Decimal
    total_invoices: int
    unpaid_invoices: int
    paid_invoices: int
    total_revenue: Decimal
    recent_subscriptions: list[dict[str, Any]]
    recent_invoices: list[dict[str, Any]]
