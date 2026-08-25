from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.database import get_db
from app.models.models import Notification, User
from app.schemas.schemas import NotificationResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

from pydantic import BaseModel
import uuid

class SendNotificationRequest(BaseModel):
    recipient_user_id: str
    title: str
    message: str
    notification_type: str = "inquiry"

@router.get("", response_model=List[NotificationResponse])
async def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc())
    notifs = (await db.execute(stmt)).scalars().all()
    return [NotificationResponse.model_validate(n) for n in notifs]

@router.post("/send")
async def send_notification(
    req: SendNotificationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        recipient_id = uuid.UUID(req.recipient_user_id) if isinstance(req.recipient_user_id, str) else req.recipient_user_id
    except ValueError:
        # If recipient_user_id is a profile_id, check ClientProfile or StudentProfile
        from app.models.models import ClientProfile, StudentProfile
        cp = (await db.execute(select(ClientProfile).filter(ClientProfile.id == req.recipient_user_id))).scalars().first()
        if cp:
            recipient_id = cp.user_id
        else:
            sp = (await db.execute(select(StudentProfile).filter(StudentProfile.id == req.recipient_user_id))).scalars().first()
            if sp:
                recipient_id = sp.user_id
            else:
                recipient_id = current_user.id

    notif = Notification(
        id=uuid.uuid4(),
        user_id=recipient_id,
        title=req.title,
        message=f"{current_user.email}: {req.message}",
        type=req.notification_type
    )
    db.add(notif)
    await db.commit()
    return {"status": "success", "message": "Notification sent successfully."}

