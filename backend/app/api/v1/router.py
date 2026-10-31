from fastapi import APIRouter

from app.modules.auth.routes import router as auth_router
from app.modules.customers.routes import router as customers_router
from app.modules.products.routes import router as products_router
from app.modules.plans.routes import router as plans_router
from app.modules.subscriptions.routes import router as subscriptions_router
from app.modules.invoices.routes import router as invoices_router
from app.modules.payments.routes import router as payments_router
from app.modules.taxes.routes import router as taxes_router
from app.modules.discounts.routes import router as discounts_router
from app.modules.quotations.routes import router as quotations_router
from app.modules.analytics.routes import router as analytics_router


api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(auth_router, prefix="/auth")
api_router.include_router(customers_router)
api_router.include_router(products_router)
api_router.include_router(plans_router)
api_router.include_router(subscriptions_router)
api_router.include_router(invoices_router)
api_router.include_router(payments_router)
api_router.include_router(taxes_router)
api_router.include_router(discounts_router)
api_router.include_router(quotations_router)
api_router.include_router(analytics_router)
