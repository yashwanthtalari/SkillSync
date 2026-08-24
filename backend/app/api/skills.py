from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.database import get_db
from app.models.models import Skill
from app.schemas.schemas import SkillResponse

router = APIRouter(prefix="/skills", tags=["Skills"])

@router.get("", response_model=List[SkillResponse])
async def list_skills(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Skill).order_by(Skill.category, Skill.name))
    skills = res.scalars().all()
    return [SkillResponse.model_validate(s) for s in skills]
