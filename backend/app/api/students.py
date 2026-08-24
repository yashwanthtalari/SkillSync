from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.models import StudentProfile, StudentSkill, Skill, StudentAvailability, User
from app.schemas.schemas import StudentProfileResponse, StudentProfileUpdate, StudentSkillCreate, StudentSkillResponse, AvailabilityCreate, AvailabilityResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/{student_id}", response_model=StudentProfileResponse)
async def get_student_profile(student_id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(StudentProfile)
        .options(
            selectinload(StudentProfile.skills).selectinload(StudentSkill.skill),
            selectinload(StudentProfile.availability),
            selectinload(StudentProfile.user)
        )
        .filter(StudentProfile.id == student_id)
    )
    res = await db.execute(stmt)
    student = res.scalars().first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found.")

    formatted_skills = []
    for ss in student.skills:
        formatted_skills.append(StudentSkillResponse(
            id=ss.id,
            skill_id=ss.skill_id,
            skill_name=ss.skill.name if ss.skill else "Skill",
            category=ss.skill.category if ss.skill else "General",
            proficiency_level=ss.proficiency_level,
            years_experience=ss.years_experience
        ))

    return StudentProfileResponse(
        id=student.id,
        user_id=student.user_id,
        email=student.user.email if student.user else None,
        full_name=student.full_name,
        university=student.university,
        degree=student.degree,
        graduation_year=student.graduation_year,
        bio=student.bio,
        hourly_rate=student.hourly_rate,
        work_mode=student.work_mode,
        reliability_score=student.reliability_score,
        completed_tasks=student.completed_tasks,
        average_rating=student.average_rating,
        verification_status=student.verification_status,
        skills=formatted_skills,
        availability=[AvailabilityResponse.model_validate(a) for a in student.availability],
        created_at=student.created_at
    )

@router.put("/{student_id}", response_model=StudentProfileResponse)
async def update_student_profile(
    student_id: UUID,
    req: StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(StudentProfile).filter(StudentProfile.id == student_id)
    res = await db.execute(stmt)
    student = res.scalars().first()

    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found.")

    # Authorization Check
    if student.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to modify another student's profile.")

    if req.full_name is not None:
        student.full_name = req.full_name
    if req.university is not None:
        student.university = req.university
    if req.degree is not None:
        student.degree = req.degree
    if req.graduation_year is not None:
        student.graduation_year = req.graduation_year
    if req.bio is not None:
        student.bio = req.bio
    if req.hourly_rate is not None:
        student.hourly_rate = req.hourly_rate
    if req.work_mode is not None:
        student.work_mode = req.work_mode

    await db.commit()
    return await get_student_profile(student_id=student_id, db=db)

@router.post("/{student_id}/skills", response_model=StudentSkillResponse)
async def add_student_skill(
    student_id: UUID,
    req: StudentSkillCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(StudentProfile).filter(StudentProfile.id == student_id)
    res = await db.execute(stmt)
    student = res.scalars().first()
    if not student or student.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to add skills for this profile.")

    # Find or create master Skill
    skill_res = await db.execute(select(Skill).filter(Skill.name.ilike(req.skill_name.strip())))
    master_skill = skill_res.scalars().first()

    if not master_skill:
        master_skill = Skill(
            name=req.skill_name.strip().title(),
            category=req.category or "General",
            description=f"Skill: {req.skill_name}"
        )
        db.add(master_skill)
        await db.flush()

    # Check if student already has skill
    ss_res = await db.execute(
        select(StudentSkill)
        .filter(StudentSkill.student_id == student_id, StudentSkill.skill_id == master_skill.id)
    )
    existing_ss = ss_res.scalars().first()

    if existing_ss:
        existing_ss.proficiency_level = req.proficiency_level
        existing_ss.years_experience = req.years_experience
        await db.commit()
        return StudentSkillResponse(
            id=existing_ss.id,
            skill_id=master_skill.id,
            skill_name=master_skill.name,
            category=master_skill.category,
            proficiency_level=existing_ss.proficiency_level,
            years_experience=existing_ss.years_experience
        )

    new_ss = StudentSkill(
        student_id=student_id,
        skill_id=master_skill.id,
        proficiency_level=req.proficiency_level,
        years_experience=req.years_experience
    )
    db.add(new_ss)
    await db.commit()

    return StudentSkillResponse(
        id=new_ss.id,
        skill_id=master_skill.id,
        skill_name=master_skill.name,
        category=master_skill.category,
        proficiency_level=new_ss.proficiency_level,
        years_experience=new_ss.years_experience
    )

@router.put("/{student_id}/availability", response_model=List[AvailabilityResponse])
async def update_student_availability(
    student_id: UUID,
    availability_list: List[AvailabilityCreate],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(StudentProfile).filter(StudentProfile.id == student_id)
    res = await db.execute(stmt)
    student = res.scalars().first()

    if not student or student.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to update availability.")

    # Remove existing availability
    del_stmt = select(StudentAvailability).filter(StudentAvailability.student_id == student_id)
    old_avails = (await db.execute(del_stmt)).scalars().all()
    for item in old_avails:
        await db.delete(item)

    # Insert new ones
    new_avails = []
    for item in availability_list:
        av = StudentAvailability(
            student_id=student_id,
            day_of_week=item.day_of_week,
            start_time=item.start_time,
            end_time=item.end_time,
            timezone=item.timezone or "IST"
        )
        db.add(av)
        new_avails.append(av)

    await db.commit()
    return [AvailabilityResponse.model_validate(a) for a in new_avails]
