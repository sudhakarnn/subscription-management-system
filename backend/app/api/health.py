from fastapi import APIRouter, status
from datetime import datetime, timezone
from app.core.config import settings
from app.core.database import check_db_connection

router = APIRouter(tags=["Health"])


@router.get("/health", status_code=status.HTTP_200_OK)
def get_health_status():
    """
    Health check endpoint returning overall application health,
    active runtime environment, timestamp, and database connectivity.
    """
    db_status = check_db_connection()
    is_healthy = db_status["status"] == "connected" or settings.ENVIRONMENT == "development"

    return {
        "success": True,
        "message": "Brightloop backend service is running",
        "data": {
            "service": settings.PROJECT_NAME,
            "status": "healthy" if is_healthy else "degraded",
            "environment": settings.ENVIRONMENT,
            "version": "0.1.0",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "currency": settings.DEFAULT_CURRENCY,
            "database": db_status,
        },
    }
