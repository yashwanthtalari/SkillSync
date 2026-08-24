import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.types import CHAR, TypeDecorator
import enum
from app.core.database import Base

class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses CHAR(36).
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            from sqlalchemy.dialects.postgresql import UUID
            return dialect.type_descriptor(UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if isinstance(value, uuid.UUID):
                return str(value)
            return str(uuid.UUID(value))

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            return value

class UserRole(str, enum.Enum):
    STUDENT = "student"
    CLIENT = "client"
    ADMIN = "admin"

class WorkMode(str, enum.Enum):
    REMOTE = "remote"
    HYBRID = "hybrid"
    ON_SITE = "on_site"

class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    PENDING = "pending"
    VERIFIED = "verified"

class TaskStatus(str, enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ProficiencyLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    SHORTLISTED = "shortlisted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class DeliverableStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REVISION_REQUESTED = "revision_requested"

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default=UserRole.STUDENT.value)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    client_profile = relationship("ClientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    university = Column(String(255), nullable=True)
    degree = Column(String(255), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    bio = Column(Text, nullable=True)
    hourly_rate = Column(Float, default=0.0)
    work_mode = Column(String(50), default=WorkMode.REMOTE.value)
    reliability_score = Column(Float, default=95.0)
    completed_tasks = Column(Integer, default=0)
    average_rating = Column(Float, default=5.0)
    verification_status = Column(String(50), default=VerificationStatus.VERIFIED.value)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="student_profile")
    skills = relationship("StudentSkill", back_populates="student", cascade="all, delete-orphan")
    availability = relationship("StudentAvailability", back_populates="student", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
    task_matches = relationship("TaskMatch", back_populates="student", cascade="all, delete-orphan")

class ClientProfile(Base):
    __tablename__ = "client_profiles"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    organization_name = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    verification_status = Column(String(50), default=VerificationStatus.VERIFIED.value)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="client_profile")
    tasks = relationship("Task", back_populates="client", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)

    student_skills = relationship("StudentSkill", back_populates="skill")
    task_skills = relationship("TaskSkill", back_populates="skill")

class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    student_id = Column(GUID(), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(GUID(), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    proficiency_level = Column(String(50), default=ProficiencyLevel.INTERMEDIATE.value)
    years_experience = Column(Float, default=1.0)

    student = relationship("StudentProfile", back_populates="skills")
    skill = relationship("Skill", back_populates="student_skills")

class StudentAvailability(Base):
    __tablename__ = "student_availability"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    student_id = Column(GUID(), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(String(20), nullable=False) # e.g., Monday, Tuesday
    start_time = Column(String(10), nullable=False) # e.g., "09:00"
    end_time = Column(String(10), nullable=False)   # e.g., "17:00"
    timezone = Column(String(50), default="IST")

    student = relationship("StudentProfile", back_populates="availability")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    client_id = Column(GUID(), ForeignKey("client_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    budget_min = Column(Float, nullable=False)
    budget_max = Column(Float, nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=False, index=True)
    estimated_hours = Column(Float, nullable=False)
    work_mode = Column(String(50), default=WorkMode.REMOTE.value)
    location = Column(String(255), nullable=True)
    status = Column(String(50), default=TaskStatus.OPEN.value, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    client = relationship("ClientProfile", back_populates="tasks")
    task_skills = relationship("TaskSkill", back_populates="task", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="task", cascade="all, delete-orphan")
    matches = relationship("TaskMatch", back_populates="task", cascade="all, delete-orphan")
    deliverables = relationship("TaskDeliverable", back_populates="task", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="task", cascade="all, delete-orphan")

class TaskSkill(Base):
    __tablename__ = "task_skills"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    task_id = Column(GUID(), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(GUID(), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    required_level = Column(String(50), default=ProficiencyLevel.INTERMEDIATE.value)
    importance = Column(String(50), default="must_have") # must_have, nice_to_have

    task = relationship("Task", back_populates="task_skills")
    skill = relationship("Skill", back_populates="task_skills")

class Application(Base):
    __tablename__ = "applications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    task_id = Column(GUID(), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(GUID(), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    proposal = Column(Text, nullable=False)
    proposed_price = Column(Float, nullable=False)
    estimated_completion_time = Column(String(100), nullable=False)
    status = Column(String(50), default=ApplicationStatus.PENDING.value, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    task = relationship("Task", back_populates="applications")
    student = relationship("StudentProfile", back_populates="applications")

class TaskMatch(Base):
    __tablename__ = "task_matches"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    task_id = Column(GUID(), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(GUID(), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    overall_score = Column(Float, nullable=False)
    skill_score = Column(Float, nullable=False)
    availability_score = Column(Float, nullable=False)
    complexity_score = Column(Float, nullable=False)
    deadline_score = Column(Float, nullable=False)
    budget_score = Column(Float, nullable=False)
    reliability_score = Column(Float, nullable=False)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    task = relationship("Task", back_populates="matches")
    student = relationship("StudentProfile", back_populates="task_matches")

class TaskDeliverable(Base):
    __tablename__ = "task_deliverables"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    task_id = Column(GUID(), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(GUID(), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    submission_url = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    submitted_at = Column(DateTime(timezone=True), default=utc_now)
    status = Column(String(50), default=DeliverableStatus.PENDING.value)

    task = relationship("Task", back_populates="deliverables")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    task_id = Column(GUID(), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewee_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Float, nullable=False) # 1.0 to 5.0
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    task = relationship("Task", back_populates="reviews")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="notifications")
