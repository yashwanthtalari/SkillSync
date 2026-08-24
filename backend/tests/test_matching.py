import pytest
import uuid
from datetime import datetime, timezone, timedelta
from app.models.models import StudentProfile, Task, TaskSkill, StudentSkill, Skill, StudentAvailability
from app.matching.engine import matching_engine

def test_matching_engine_formula():
    student = StudentProfile(
        id=uuid.uuid4(),
        full_name="Aarav Sharma",
        university="IIT Bombay",
        reliability_score=95.0,
        average_rating=4.9,
        hourly_rate=400.0,
        completed_tasks=10,
        verification_status="verified"
    )

    py_skill = Skill(id=uuid.uuid4(), name="Python", category="Programming")
    st_skill = StudentSkill(
        id=uuid.uuid4(),
        student_id=student.id,
        skill_id=py_skill.id,
        proficiency_level="expert",
        years_experience=3.0
    )
    st_skill.skill = py_skill

    task = Task(
        id=uuid.uuid4(),
        title="Python Scraper",
        description="Scrape data",
        category="Programming",
        budget_min=1000.0,
        budget_max=2000.0,
        deadline=datetime.now(timezone.utc) + timedelta(days=2),
        estimated_hours=3.0,
        work_mode="remote"
    )

    t_skill = TaskSkill(
        id=uuid.uuid4(),
        task_id=task.id,
        skill_id=py_skill.id,
        required_level="intermediate",
        importance="must_have"
    )
    t_skill.skill = py_skill

    avail = StudentAvailability(
        id=uuid.uuid4(),
        student_id=student.id,
        day_of_week="Monday",
        start_time="09:00",
        end_time="17:00"
    )

    res = matching_engine.calculate_match(
        task=task,
        student=student,
        task_skills=[t_skill],
        student_skills=[st_skill],
        student_availability=[avail]
    )

    assert res.overall_score > 80.0
    assert "Python" in res.matched_skills
    assert "Strong match for Python" in res.explanation
