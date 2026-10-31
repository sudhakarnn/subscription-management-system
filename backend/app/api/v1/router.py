from fastapi import APIRouter

api_router = APIRouter()

from app.modules.auth.routes import router as auth_router

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
