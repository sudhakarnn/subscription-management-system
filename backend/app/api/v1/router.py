
from fastapi import APIRouter

from app.modules.auth.routes import router as auth_router
from app.modules.customers.routes import router as customers_router
from app.modules.products.routes import router as products_router
from app.modules.plans.routes import router as plans_router
from app.modules.subscriptions.routes import router as subscriptions_router
from app.modules.invoices.routes import router as invoices_router


api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(customers_router)
api_router.include_router(products_router)
api_router.include_router(plans_router)
api_router.include_router(subscriptions_router)
api_router.include_router(invoices_router)
