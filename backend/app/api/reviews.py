from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.models import Review, User, StudentProfile, Task
from app.schemas.schemas import ReviewCreate, ReviewResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    req: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify task exists
    t_res = await db.execute(select(Task).filter(Task.id == req.task_id))
    t = t_res.scalars().first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    new_rev = Review(
        task_id=req.task_id,
        reviewer_id=current_user.id,
        reviewee_id=req.reviewee_id,
        rating=req.rating,
        comment=req.comment
    )
    db.add(new_rev)
    await db.flush()

    # Recalculate reviewee rating if student
    s_res = await db.execute(select(StudentProfile).filter(StudentProfile.user_id == req.reviewee_id))
    student = s_res.scalars().first()
    if student:
        # Calculate average
        all_revs = (await db.execute(select(Review).filter(Review.reviewee_id == req.reviewee_id))).scalars().all()
        ratings = [r.rating for r in all_revs]
        student.average_rating = round(sum(ratings) / len(ratings), 2)

    await db.commit()

    return ReviewResponse(
        id=new_rev.id,
        task_id=new_rev.task_id,
        reviewer_id=new_rev.reviewer_id,
        reviewer_name=current_user.email,
        reviewee_id=new_rev.reviewee_id,
        rating=new_rev.rating,
        comment=new_rev.comment,
        created_at=new_rev.created_at
    )

@router.get("/user/{user_id}", response_model=List[ReviewResponse])
async def get_user_reviews(user_id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Review).filter(Review.reviewee_id == user_id).order_by(Review.created_at.desc())
    revs = (await db.execute(stmt)).scalars().all()
    return [
        ReviewResponse(
            id=r.id,
            task_id=r.task_id,
            reviewer_id=r.reviewer_id,
            reviewee_id=r.reviewee_id,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at
        ) for r in revs
    ]
