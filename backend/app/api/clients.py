from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from app.core.database import get_db
from app.models.models import ClientProfile, User
from app.schemas.schemas import ClientProfileResponse, ClientProfileUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.get("/{client_id}", response_model=ClientProfileResponse)
async def get_client_profile(client_id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(ClientProfile).options(selectinload(ClientProfile.user)).filter(ClientProfile.id == client_id)
    res = await db.execute(stmt)
    client = res.scalars().first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client profile not found.")

    return ClientProfileResponse(
        id=client.id,
        user_id=client.user_id,
        email=client.user.email if client.user else None,
        full_name=client.full_name,
        organization_name=client.organization_name,
        bio=client.bio,
        verification_status=client.verification_status,
        created_at=client.created_at
    )

@router.put("/{client_id}", response_model=ClientProfileResponse)
async def update_client_profile(
    client_id: UUID,
    req: ClientProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ClientProfile).filter(ClientProfile.id == client_id)
    res = await db.execute(stmt)
    client = res.scalars().first()

    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client profile not found.")

    if client.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to modify this client profile.")

    if req.full_name is not None:
        client.full_name = req.full_name
    if req.organization_name is not None:
        client.organization_name = req.organization_name
    if req.bio is not None:
        client.bio = req.bio

    await db.commit()
    return await get_client_profile(client_id=client_id, db=db)
