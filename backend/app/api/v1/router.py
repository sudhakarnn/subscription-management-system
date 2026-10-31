
from fastapi import APIRouter

api_router = APIRouter()

# Authentication routes
from app.modules.auth.routes import router as auth_router

api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"],
)

# Customer management routes
from app.modules.customers.routes import router as customers_router

api_router.include_router(
    customers_router,
    prefix="/customers",
    tags=["Customers"],
)
from app.modules.products.routes import router as products_router
api_router.include_router(products_router, prefix="/products", tags=["Products"])

from app.modules.plans.routes import router as plans_router
api_router.include_router(plans_router, prefix="/plans", tags=["Plans"])
