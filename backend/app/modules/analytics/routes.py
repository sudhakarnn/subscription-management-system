from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin
from app.modules.analytics.schemas import DashboardStats
from app.modules.analytics.services import get_dashboard_metrics

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardStats)
def read_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_or_admin),
):
    return get_dashboard_metrics(db)
