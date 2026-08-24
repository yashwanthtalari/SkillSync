from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.models import Task, Application, StudentProfile, ClientProfile, TaskStatus, ApplicationStatus, TaskDeliverable, DeliverableStatus, Notification
from app.schemas.schemas import ApplicationCreate, ApplicationResponse, ApplicationUpdateStatus, DeliverableCreate, DeliverableResponse
from app.api.deps import get_current_user, get_current_student, get_current_client

router = APIRouter(tags=["Applications & Execution"])

@router.post("/tasks/{task_id}/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    task_id: UUID,
    req: ApplicationCreate,
    current_student: StudentProfile = Depends(get_current_student),
    db: AsyncSession = Depends(get_db)
):
    # Check task exists and is open
    t_stmt = select(Task).filter(Task.id == task_id)
    t = (await db.execute(t_stmt)).scalars().first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    if t.status != TaskStatus.OPEN.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This task is no longer accepting applications.")

    # Check student has not already applied
    existing_stmt = select(Application).filter(
        Application.task_id == task_id,
        Application.student_id == current_student.id
    )
    if (await db.execute(existing_stmt)).scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted an application for this task."
        )

    new_app = Application(
        task_id=task_id,
        student_id=current_student.id,
        proposal=req.proposal,
        proposed_price=req.proposed_price,
        estimated_completion_time=req.estimated_completion_time,
        status=ApplicationStatus.PENDING.value
    )
    db.add(new_app)
    await db.flush()

    # Create notification for Client
    notif = Notification(
        user_id=(await db.execute(select(ClientProfile.user_id).filter(ClientProfile.id == t.client_id))).scalars().first(),
        type="new_application",
        title="New Application Received",
        message=f"{current_student.full_name} applied for '{t.title}'."
    )
    db.add(notif)

    await db.commit()

    return ApplicationResponse(
        id=new_app.id,
        task_id=new_app.task_id,
        student_id=new_app.student_id,
        student_name=current_student.full_name,
        student_university=current_student.university,
        student_rating=current_student.average_rating,
        student_reliability=current_student.reliability_score,
        proposal=new_app.proposal,
        proposed_price=new_app.proposed_price,
        estimated_completion_time=new_app.estimated_completion_time,
        status=new_app.status,
        created_at=new_app.created_at,
        task_title=t.title
    )

@router.get("/tasks/{task_id}/applications", response_model=List[ApplicationResponse])
async def list_task_applications(
    task_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Application)
        .options(selectinload(Application.student), selectinload(Application.task))
        .filter(Application.task_id == task_id)
        .order_by(Application.created_at.desc())
    )
    apps = (await db.execute(stmt)).scalars().all()

    formatted = []
    for app in apps:
        formatted.append(ApplicationResponse(
            id=app.id,
            task_id=app.task_id,
            student_id=app.student_id,
            student_name=app.student.full_name if app.student else "Student",
            student_university=app.student.university if app.student else "University",
            student_rating=app.student.average_rating if app.student else 5.0,
            student_reliability=app.student.reliability_score if app.student else 95.0,
            proposal=app.proposal,
            proposed_price=app.proposed_price,
            estimated_completion_time=app.estimated_completion_time,
            status=app.status,
            created_at=app.created_at,
            task_title=app.task.title if app.task else "Task"
        ))
    return formatted

@router.get("/students/{student_id}/applications", response_model=List[ApplicationResponse])
async def list_student_applications(
    student_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Application)
        .options(selectinload(Application.student), selectinload(Application.task))
        .filter(Application.student_id == student_id)
        .order_by(Application.created_at.desc())
    )
    apps = (await db.execute(stmt)).scalars().all()

    formatted = []
    for app in apps:
        formatted.append(ApplicationResponse(
            id=app.id,
            task_id=app.task_id,
            student_id=app.student_id,
            student_name=app.student.full_name if app.student else "Student",
            student_university=app.student.university if app.student else "University",
            student_rating=app.student.average_rating if app.student else 5.0,
            student_reliability=app.student.reliability_score if app.student else 95.0,
            proposal=app.proposal,
            proposed_price=app.proposed_price,
            estimated_completion_time=app.estimated_completion_time,
            status=app.status,
            created_at=app.created_at,
            task_title=app.task.title if app.task else "Task"
        ))
    return formatted

@router.put("/applications/{application_id}", response_model=ApplicationResponse)
async def update_application_status(
    application_id: UUID,
    req: ApplicationUpdateStatus,
    current_client: ClientProfile = Depends(get_current_client),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Application).options(selectinload(Application.task), selectinload(Application.student)).filter(Application.id == application_id)
    app = (await db.execute(stmt)).scalars().first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if app.task.client_id != current_client.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to update applications for this task.")

    new_status = req.status.lower()
    app.status = new_status

    if new_status == ApplicationStatus.ACCEPTED.value:
        # Mark task as assigned / in_progress
        app.task.status = TaskStatus.ASSIGNED.value
        
        # Reject other pending applications for this task
        other_apps = (await db.execute(
            select(Application).filter(
                Application.task_id == app.task_id,
                Application.id != app.id,
                Application.status == ApplicationStatus.PENDING.value
            )
        )).scalars().all()
        for other in other_apps:
            other.status = ApplicationStatus.REJECTED.value

        # Create notification for Student
        notif = Notification(
            user_id=app.student.user_id,
            type="application_accepted",
            title="Application Accepted! 🎉",
            message=f"Congratulations! Your application for '{app.task.title}' was accepted."
        )
        db.add(notif)

    await db.commit()

    return ApplicationResponse(
        id=app.id,
        task_id=app.task_id,
        student_id=app.student_id,
        student_name=app.student.full_name if app.student else "Student",
        student_university=app.student.university if app.student else "University",
        student_rating=app.student.average_rating if app.student else 5.0,
        student_reliability=app.student.reliability_score if app.student else 95.0,
        proposal=app.proposal,
        proposed_price=app.proposed_price,
        estimated_completion_time=app.estimated_completion_time,
        status=app.status,
        created_at=app.created_at,
        task_title=app.task.title if app.task else "Task"
    )

@router.post("/tasks/{task_id}/submit", response_model=DeliverableResponse)
async def submit_task_deliverable(
    task_id: UUID,
    req: DeliverableCreate,
    current_student: StudentProfile = Depends(get_current_student),
    db: AsyncSession = Depends(get_db)
):
    t_stmt = select(Task).filter(Task.id == task_id)
    t = (await db.execute(t_stmt)).scalars().first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    new_deliv = TaskDeliverable(
        task_id=task_id,
        student_id=current_student.id,
        submission_url=req.submission_url,
        description=req.description,
        status=DeliverableStatus.PENDING.value
    )
    db.add(new_deliv)

    t.status = TaskStatus.SUBMITTED.value

    # Notify Client
    c_user_id = (await db.execute(select(ClientProfile.user_id).filter(ClientProfile.id == t.client_id))).scalars().first()
    notif = Notification(
        user_id=c_user_id,
        type="work_submitted",
        title="Deliverable Submitted",
        message=f"{current_student.full_name} submitted work for '{t.title}'."
    )
    db.add(notif)

    await db.commit()
    await db.refresh(new_deliv)

    return DeliverableResponse(
        id=new_deliv.id,
        task_id=new_deliv.task_id,
        student_id=new_deliv.student_id,
        submission_url=new_deliv.submission_url,
        description=new_deliv.description,
        submitted_at=new_deliv.submitted_at,
        status=new_deliv.status
    )

@router.post("/tasks/{task_id}/approve")
async def approve_task_deliverable(
    task_id: UUID,
    current_client: ClientProfile = Depends(get_current_client),
    db: AsyncSession = Depends(get_db)
):
    t_stmt = select(Task).filter(Task.id == task_id)
    t = (await db.execute(t_stmt)).scalars().first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    if t.client_id != current_client.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to approve deliverables for this task.")

    t.status = TaskStatus.COMPLETED.value

    # Find accepted application & student profile to increment completed_tasks count
    app_stmt = select(Application).filter(
        Application.task_id == task_id,
        Application.status == ApplicationStatus.ACCEPTED.value
    )
    accepted_app = (await db.execute(app_stmt)).scalars().first()
    if accepted_app:
        s_stmt = select(StudentProfile).filter(StudentProfile.id == accepted_app.student_id)
        student = (await db.execute(s_stmt)).scalars().first()
        if student:
            student.completed_tasks = (student.completed_tasks or 0) + 1

            notif = Notification(
                user_id=student.user_id,
                type="task_completed",
                title="Task Approved & Completed! 🏆",
                message=f"Your submission for '{t.title}' has been approved by the client."
            )
            db.add(notif)

    await db.commit()
    return {"message": "Task approved and marked as completed.", "status": TaskStatus.COMPLETED.value}
