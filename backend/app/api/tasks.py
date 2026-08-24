from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import or_, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.models.models import Task, TaskSkill, Skill, ClientProfile, TaskStatus, User, StudentProfile, StudentSkill, StudentAvailability, Application
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskSkillResponse, TaskAnalyzeRequest, TaskAnalyzeResponse, MatchResponse
from app.api.deps import get_current_user, get_current_client
from app.ai.task_parser import ai_task_parser
from app.matching.engine import matching_engine

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/analyze", response_model=TaskAnalyzeResponse)
async def analyze_task_description(req: TaskAnalyzeRequest):
    if not req.description or len(req.description.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task description is too short to analyze."
        )
    return await ai_task_parser.parse_task_description(req.description)

@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    search: Optional[str] = None,
    category: Optional[str] = None,
    work_mode: Optional[str] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None,
    status_filter: Optional[str] = Query("open", alias="status"),
    client_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Task).options(
        selectinload(Task.client),
        selectinload(Task.task_skills).selectinload(TaskSkill.skill),
        selectinload(Task.applications)
    )

    conditions = []
    if status_filter:
        conditions.append(Task.status == status_filter)
    if client_id:
        conditions.append(Task.client_id == client_id)
    if category:
        conditions.append(Task.category.ilike(f"%{category}%"))
    if work_mode:
        conditions.append(Task.work_mode == work_mode)
    if min_budget:
        conditions.append(Task.budget_max >= min_budget)
    if max_budget:
        conditions.append(Task.budget_min <= max_budget)
    if search:
        search_pattern = f"%{search}%"
        conditions.append(or_(
            Task.title.ilike(search_pattern),
            Task.description.ilike(search_pattern),
            Task.category.ilike(search_pattern)
        ))

    if conditions:
        stmt = stmt.filter(and_(*conditions))

    stmt = stmt.order_by(Task.created_at.desc())
    res = await db.execute(stmt)
    tasks = res.scalars().all()

    formatted = []
    for t in tasks:
        skills_resp = [
            TaskSkillResponse(
                id=ts.id,
                skill_id=ts.skill_id,
                skill_name=ts.skill.name if ts.skill else "Skill",
                required_level=ts.required_level,
                importance=ts.importance
            ) for ts in t.task_skills
        ]
        formatted.append(TaskResponse(
            id=t.id,
            client_id=t.client_id,
            client_name=t.client.full_name if t.client else "Client",
            organization_name=t.client.organization_name if t.client else "Independent Client",
            title=t.title,
            description=t.description,
            category=t.category,
            budget_min=t.budget_min,
            budget_max=t.budget_max,
            deadline=t.deadline,
            estimated_hours=t.estimated_hours,
            work_mode=t.work_mode,
            location=t.location,
            status=t.status,
            required_skills=skills_resp,
            created_at=t.created_at,
            updated_at=t.updated_at,
            applications_count=len(t.applications)
        ))

    return formatted

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    req: TaskCreate,
    current_client: ClientProfile = Depends(get_current_client),
    db: AsyncSession = Depends(get_db)
):
    new_task = Task(
        client_id=current_client.id,
        title=req.title,
        description=req.description,
        category=req.category,
        budget_min=req.budget_min,
        budget_max=req.budget_max,
        deadline=req.deadline,
        estimated_hours=req.estimated_hours,
        work_mode=req.work_mode,
        location=req.location,
        status=TaskStatus.OPEN.value
    )
    db.add(new_task)
    await db.flush()

    for s_item in req.skills:
        skill_res = await db.execute(select(Skill).filter(Skill.name.ilike(s_item.name.strip())))
        master_skill = skill_res.scalars().first()
        if not master_skill:
            master_skill = Skill(
                name=s_item.name.strip().title(),
                category=req.category,
                description=f"Skill for task {s_item.name}"
            )
            db.add(master_skill)
            await db.flush()

        task_skill = TaskSkill(
            task_id=new_task.id,
            skill_id=master_skill.id,
            required_level=s_item.required_level,
            importance=s_item.importance
        )
        db.add(task_skill)

    await db.commit()
    return await get_task(task_id=new_task.id, db=db)

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Task)
        .options(
            selectinload(Task.client),
            selectinload(Task.task_skills).selectinload(TaskSkill.skill),
            selectinload(Task.applications)
        )
        .filter(Task.id == task_id)
    )
    res = await db.execute(stmt)
    t = res.scalars().first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    skills_resp = [
        TaskSkillResponse(
            id=ts.id,
            skill_id=ts.skill_id,
            skill_name=ts.skill.name if ts.skill else "Skill",
            required_level=ts.required_level,
            importance=ts.importance
        ) for ts in t.task_skills
    ]

    return TaskResponse(
        id=t.id,
        client_id=t.client_id,
        client_name=t.client.full_name if t.client else "Client",
        organization_name=t.client.organization_name if t.client else "Independent Client",
        title=t.title,
        description=t.description,
        category=t.category,
        budget_min=t.budget_min,
        budget_max=t.budget_max,
        deadline=t.deadline,
        estimated_hours=t.estimated_hours,
        work_mode=t.work_mode,
        location=t.location,
        status=t.status,
        required_skills=skills_resp,
        created_at=t.created_at,
        updated_at=t.updated_at,
        applications_count=len(t.applications)
    )

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    req: TaskUpdate,
    current_client: ClientProfile = Depends(get_current_client),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Task).filter(Task.id == task_id)
    t = (await db.execute(stmt)).scalars().first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    if t.client_id != current_client.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to modify another client's task.")

    if req.title is not None:
        t.title = req.title
    if req.description is not None:
        t.description = req.description
    if req.category is not None:
        t.category = req.category
    if req.budget_min is not None:
        t.budget_min = req.budget_min
    if req.budget_max is not None:
        t.budget_max = req.budget_max
    if req.deadline is not None:
        t.deadline = req.deadline
    if req.estimated_hours is not None:
        t.estimated_hours = req.estimated_hours
    if req.work_mode is not None:
        t.work_mode = req.work_mode
    if req.status is not None:
        t.status = req.status

    await db.commit()
    return await get_task(task_id=task_id, db=db)

@router.delete("/{task_id}")
async def delete_task(
    task_id: UUID,
    current_client: ClientProfile = Depends(get_current_client),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Task).filter(Task.id == task_id)
    t = (await db.execute(stmt)).scalars().first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    if t.client_id != current_client.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to delete another client's task.")

    await db.delete(t)
    await db.commit()
    return {"message": "Task deleted successfully."}

@router.get("/{task_id}/matches", response_model=List[MatchResponse])
async def get_task_recommended_matches(task_id: UUID, db: AsyncSession = Depends(get_db)):
    # Load task and skills
    t_stmt = (
        select(Task)
        .options(selectinload(Task.task_skills).selectinload(TaskSkill.skill))
        .filter(Task.id == task_id)
    )
    t = (await db.execute(t_stmt)).scalars().first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    # Load all students
    s_stmt = (
        select(StudentProfile)
        .options(
            selectinload(StudentProfile.skills).selectinload(StudentSkill.skill),
            selectinload(StudentProfile.availability)
        )
    )
    students = (await db.execute(s_stmt)).scalars().all()

    matches = []
    for student in students:
        match_res = matching_engine.calculate_match(
            task=t,
            student=student,
            task_skills=t.task_skills,
            student_skills=student.skills,
            student_availability=student.availability
        )
        matches.append(match_res)

    # Sort descending by overall match score
    matches.sort(key=lambda m: m.overall_score, reverse=True)
    return matches
