from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import User, StudentProfile, ClientProfile, UserRole, VerificationStatus
from app.schemas.schemas import UserRegister, UserLogin, Token, UserResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_user(req: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check email uniqueness
    res = await db.execute(select(User).filter(User.email == req.email.lower()))
    if res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    role_val = req.role.lower()
    if role_val not in [UserRole.STUDENT.value, UserRole.CLIENT.value]:
        role_val = UserRole.STUDENT.value

    new_user = User(
        email=req.email.lower(),
        password_hash=get_password_hash(req.password),
        role=role_val
    )
    db.add(new_user)
    await db.flush()

    profile_id = None
    if role_val == UserRole.STUDENT.value:
        student_prof = StudentProfile(
            user_id=new_user.id,
            full_name=req.full_name,
            university=req.university or "University",
            degree=req.degree or "Bachelor of Science",
            graduation_year=req.graduation_year or 2026,
            verification_status=VerificationStatus.VERIFIED.value
        )
        db.add(student_prof)
        await db.flush()
        profile_id = student_prof.id
    else:
        client_prof = ClientProfile(
            user_id=new_user.id,
            full_name=req.full_name,
            organization_name=req.organization_name or "Independent Client",
            verification_status=VerificationStatus.VERIFIED.value
        )
        db.add(client_prof)
        await db.flush()
        profile_id = client_prof.id

    await db.commit()

    token_str = create_access_token(subject=new_user.id, role=new_user.role)
    return Token(
        access_token=token_str,
        token_type="bearer",
        user_id=new_user.id,
        email=new_user.email,
        role=new_user.role,
        profile_id=profile_id,
        full_name=req.full_name
    )

@router.post("/login", response_model=Token)
async def login_user(req: UserLogin, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).filter(User.email == req.email.lower()))
    user = res.scalars().first()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    profile_id = None
    full_name = "User"

    if user.role == UserRole.STUDENT.value:
        sp_res = await db.execute(select(StudentProfile).filter(StudentProfile.user_id == user.id))
        sp = sp_res.scalars().first()
        if sp:
            profile_id = sp.id
            full_name = sp.full_name
    else:
        cp_res = await db.execute(select(ClientProfile).filter(ClientProfile.user_id == user.id))
        cp = cp_res.scalars().first()
        if cp:
            profile_id = cp.id
            full_name = cp.full_name

    token_str = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token_str,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        role=user.role,
        profile_id=profile_id,
        full_name=full_name
    )

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile_data = {}
    if current_user.role == UserRole.STUDENT.value:
        sp_res = await db.execute(select(StudentProfile).filter(StudentProfile.user_id == current_user.id))
        sp = sp_res.scalars().first()
        if sp:
            profile_data = {
                "profile_id": sp.id,
                "full_name": sp.full_name,
                "university": sp.university,
                "degree": sp.degree,
                "graduation_year": sp.graduation_year,
                "hourly_rate": sp.hourly_rate,
                "verification_status": sp.verification_status,
                "reliability_score": sp.reliability_score,
                "average_rating": sp.average_rating
            }
    else:
        cp_res = await db.execute(select(ClientProfile).filter(ClientProfile.user_id == current_user.id))
        cp = cp_res.scalars().first()
        if cp:
            profile_data = {
                "profile_id": cp.id,
                "full_name": cp.full_name,
                "organization_name": cp.organization_name,
                "verification_status": cp.verification_status
            }

    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "profile": profile_data
    }
