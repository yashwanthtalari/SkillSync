from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.database import get_db
from app.models.models import Notification, User
from app.schemas.schemas import NotificationResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
async def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc())
    notifs = (await db.execute(stmt)).scalars().all()
    return [NotificationResponse.model_validate(n) for n in notifs]
