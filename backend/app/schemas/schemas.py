from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# Auth & User
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = Field(..., description="student or client")
    university: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    organization_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: UUID
    email: str
    role: str
    profile_id: Optional[UUID] = None
    full_name: Optional[str] = "User"

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    role: str
    created_at: datetime
    profile_id: Optional[UUID] = None

# Skill
class SkillBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID

class StudentSkillCreate(BaseModel):
    skill_name: str
    category: Optional[str] = "General"
    proficiency_level: str = "intermediate" # beginner, intermediate, advanced, expert
    years_experience: float = 1.0

class StudentSkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    skill_id: UUID
    skill_name: str
    category: str
    proficiency_level: str
    years_experience: float

# Student Availability
class AvailabilityCreate(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str
    timezone: Optional[str] = "IST"

class AvailabilityResponse(AvailabilityCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID

# Student Profile
class StudentProfileBase(BaseModel):
    full_name: str
    university: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    bio: Optional[str] = None
    hourly_rate: float = 0.0
    work_mode: str = "remote"

class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    university: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    bio: Optional[str] = None
    hourly_rate: Optional[float] = None
    work_mode: Optional[str] = None

class StudentProfileResponse(StudentProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    email: Optional[str] = None
    reliability_score: float
    completed_tasks: int
    average_rating: float
    verification_status: str
    skills: List[StudentSkillResponse] = []
    availability: List[AvailabilityResponse] = []
    created_at: datetime

# Client Profile
class ClientProfileBase(BaseModel):
    full_name: str
    organization_name: Optional[str] = None
    bio: Optional[str] = None

class ClientProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    organization_name: Optional[str] = None
    bio: Optional[str] = None

class ClientProfileResponse(ClientProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    email: Optional[str] = None
    verification_status: str
    created_at: datetime

# Task Skills
class TaskSkillItem(BaseModel):
    name: str
    required_level: str = "intermediate"
    importance: str = "must_have"

class TaskSkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    skill_id: UUID
    skill_name: str
    required_level: str
    importance: str

# Task
class TaskCreate(BaseModel):
    title: str
    description: str
    category: str
    budget_min: float
    budget_max: float
    deadline: datetime
    estimated_hours: float
    work_mode: str = "remote"
    location: Optional[str] = None
    skills: List[TaskSkillItem] = []

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    deadline: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    work_mode: Optional[str] = None
    status: Optional[str] = None

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    client_id: UUID
    client_name: Optional[str] = None
    organization_name: Optional[str] = None
    title: str
    description: str
    category: str
    budget_min: float
    budget_max: float
    deadline: datetime
    estimated_hours: float
    work_mode: str
    location: Optional[str] = None
    status: str
    required_skills: List[TaskSkillResponse] = []
    created_at: datetime
    updated_at: datetime
    applications_count: Optional[int] = 0
    match_score: Optional[float] = None

# AI Task Parser
class TaskAnalyzeRequest(BaseModel):
    description: str

class AnalyzedSkillItem(BaseModel):
    name: str
    level: str = "intermediate"

class TaskAnalyzeResponse(BaseModel):
    title: str
    category: str
    skills: List[AnalyzedSkillItem]
    estimated_hours: float
    complexity: str # low, medium, high
    deadline_days: int
    suggested_budget_min: float
    suggested_budget_max: float

# Application
class ApplicationCreate(BaseModel):
    proposal: str
    proposed_price: float
    estimated_completion_time: str

class ApplicationUpdateStatus(BaseModel):
    status: str # shortlisted, accepted, rejected, withdrawn

class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    task_id: UUID
    student_id: UUID
    student_name: Optional[str] = None
    student_university: Optional[str] = None
    student_rating: Optional[float] = None
    student_reliability: Optional[float] = None
    proposal: str
    proposed_price: float
    estimated_completion_time: str
    status: str
    created_at: datetime
    task_title: Optional[str] = None

# Deliverable
class DeliverableCreate(BaseModel):
    submission_url: str
    description: str

class DeliverableResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    task_id: UUID
    student_id: UUID
    submission_url: str
    description: str
    submitted_at: datetime
    status: str

# Review
class ReviewCreate(BaseModel):
    task_id: UUID
    reviewee_id: UUID
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    task_id: UUID
    reviewer_id: UUID
    reviewer_name: Optional[str] = None
    reviewee_id: UUID
    rating: float
    comment: Optional[str] = None
    created_at: datetime

# Matching
class MatchResponse(BaseModel):
    student_id: UUID
    student_name: str
    university: str
    average_rating: float
    reliability_score: float
    overall_score: float
    skill_score: float
    availability_score: float
    complexity_score: float
    deadline_score: float
    budget_score: float
    explanation: str
    matched_skills: List[str] = []

# Notifications
class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    message: str
    type: str
    read: bool
    created_at: datetime
