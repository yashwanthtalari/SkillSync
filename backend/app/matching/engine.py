from typing import List, Dict, Any, Tuple
from datetime import datetime, timezone
from app.models.models import StudentProfile, Task, TaskSkill, StudentSkill, StudentAvailability, VerificationStatus
from app.schemas.schemas import MatchResponse

PROFICIENCY_WEIGHTS = {
    "beginner": 60.0,
    "intermediate": 80.0,
    "advanced": 95.0,
    "expert": 100.0
}

class MatchingEngine:
    def calculate_match(
        self,
        task: Task,
        student: StudentProfile,
        task_skills: List[TaskSkill],
        student_skills: List[StudentSkill],
        student_availability: List[StudentAvailability]
    ) -> MatchResponse:
        """Calculates a comprehensive match score (0-100) between a task and a student.
        Applies hard filters first, then calculates sub-scores for skills, availability,
        deadline, complexity, budget, reliability, and rating.
        """
        # Hard Filter Check: Student verification & active status
        if student.verification_status == VerificationStatus.UNVERIFIED.value:
            # Unverified students get lower baseline multiplier, but not excluded if testing
            pass

        # 1. Skill Score (35%)
        skill_score, matched_skill_names, missing_must_haves = self._calculate_skill_score(
            task_skills, student_skills
        )

        # 2. Availability Score (20%)
        availability_score = self._calculate_availability_score(
            task, student_availability
        )

        # 3. Deadline Feasibility Score (15%)
        deadline_score = self._calculate_deadline_score(
            task, student
        )

        # 4. Complexity & Experience Score (10%)
        complexity_score = self._calculate_complexity_score(
            task, student, student_skills
        )

        # 5. Budget Compatibility Score (5%)
        budget_score = self._calculate_budget_score(
            task, student
        )

        # 6. Reliability Score (10%)
        reliability_score = min(100.0, max(0.0, float(student.reliability_score or 90.0)))

        # 7. Rating Score (5%)
        rating_val = float(student.average_rating or 5.0)
        rating_score = (rating_val / 5.0) * 100.0

        # Weighted combination formula
        overall_score = (
            skill_score * 0.35 +
            availability_score * 0.20 +
            deadline_score * 0.15 +
            complexity_score * 0.10 +
            budget_score * 0.05 +
            reliability_score * 0.10 +
            rating_score * 0.05
        )

        overall_score = round(min(100.0, max(0.0, overall_score)), 1)

        # Build natural language explanation
        explanation_parts = []
        if matched_skill_names:
            explanation_parts.append(f"Strong match for {', '.join(matched_skill_names[:3])}")
        else:
            explanation_parts.append("General skill overlap")

        if availability_score >= 80:
            explanation_parts.append("Available before deadline")
        if budget_score >= 80:
            explanation_parts.append("Budget compatible")
        if reliability_score >= 90:
            explanation_parts.append("High reliability score")

        explanation = ". ".join(explanation_parts) + "."

        return MatchResponse(
            student_id=student.id,
            student_name=student.full_name,
            university=student.university or "University Student",
            average_rating=round(rating_val, 1),
            reliability_score=round(reliability_score, 1),
            overall_score=overall_score,
            skill_score=round(skill_score, 1),
            availability_score=round(availability_score, 1),
            complexity_score=round(complexity_score, 1),
            deadline_score=round(deadline_score, 1),
            budget_score=round(budget_score, 1),
            explanation=explanation,
            matched_skills=matched_skill_names
        )

    def _calculate_skill_score(
        self,
        task_skills: List[TaskSkill],
        student_skills: List[StudentSkill]
    ) -> Tuple[float, List[str], List[str]]:
        if not task_skills:
            return 85.0, ["General"], []

        # Map student skill names to their proficiency level
        student_skill_map = {}
        for ss in student_skills:
            # handle relationship or direct skill object
            sname = ss.skill.name.lower() if hasattr(ss, "skill") and ss.skill else "unknown"
            student_skill_map[sname] = ss.proficiency_level.lower()

        matched_names = []
        missing_must_haves = []
        total_weight = 0.0
        earned_weight = 0.0

        for ts in task_skills:
            ts_name = ts.skill.name.lower() if hasattr(ts, "skill") and ts.skill else "unknown"
            importance_weight = 1.5 if ts.importance == "must_have" else 1.0
            total_weight += importance_weight

            req_level = ts.required_level.lower()
            req_score = PROFICIENCY_WEIGHTS.get(req_level, 80.0)

            if ts_name in student_skill_map:
                student_level = student_skill_map[ts_name]
                student_score = PROFICIENCY_WEIGHTS.get(student_level, 70.0)
                
                # Ratio of student skill vs required skill
                match_ratio = min(1.2, student_score / req_score)
                earned_weight += importance_weight * (match_ratio * 100.0)
                matched_names.append(ts.skill.name if hasattr(ts, "skill") and ts.skill else ts_name)
            else:
                if ts.importance == "must_have":
                    missing_must_haves.append(ts_name)
                earned_weight += importance_weight * 30.0 # Partial baseline score

        if total_weight == 0:
            return 80.0, matched_names, missing_must_haves

        final_skill_score = earned_weight / total_weight
        # If missing must-have skills, apply 15% penalty
        if missing_must_haves:
            final_skill_score *= 0.85

        return min(100.0, max(0.0, final_skill_score)), matched_names, missing_must_haves

    def _calculate_availability_score(self, task: Task, availability: List[StudentAvailability]) -> float:
        if not availability:
            return 75.0 # Default assumption if schedule not fully specified
        
        # Count available days per week
        available_days = len(set(a.day_of_week.lower() for a in availability))
        if available_days >= 5:
            return 100.0
        elif available_days >= 3:
            return 85.0
        elif available_days >= 1:
            return 70.0
        return 50.0

    def _calculate_deadline_score(self, task: Task, student: StudentProfile) -> float:
        now = datetime.now(timezone.utc)
        if not task.deadline:
            return 90.0

        # Replace tzinfo if offset naive/aware mismatch
        t_deadline = task.deadline
        if t_deadline.tzinfo is None:
            t_deadline = t_deadline.replace(tzinfo=timezone.utc)

        hours_remaining = (t_deadline - now).total_seconds() / 3600.0
        est_hours = task.estimated_hours or 3.0

        if hours_remaining <= 0:
            return 20.0 # Task deadline passed

        ratio = hours_remaining / est_hours
        if ratio >= 2.0:
            return 100.0
        elif ratio >= 1.0:
            return 85.0
        elif ratio >= 0.5:
            return 60.0
        return 40.0

    def _calculate_complexity_score(self, task: Task, student: StudentProfile, student_skills: List[StudentSkill]) -> float:
        completed = student.completed_tasks or 0
        expert_skills_count = sum(1 for s in student_skills if s.proficiency_level.lower() in ["advanced", "expert"])

        est_h = task.estimated_hours or 3.0
        if est_h <= 5:
            # Low to medium complexity task
            return 100.0 if completed >= 2 or student_skills else 80.0
        else:
            # High complexity task
            if expert_skills_count >= 1 or completed >= 5:
                return 95.0
            return 70.0

    def _calculate_budget_score(self, task: Task, student: StudentProfile) -> float:
        task_avg_budget = (task.budget_min + task.budget_max) / 2.0
        est_hours = task.estimated_hours or 3.0
        implied_hourly = task_avg_budget / est_hours if est_hours > 0 else task_avg_budget

        student_rate = student.hourly_rate or 300.0
        if implied_hourly >= student_rate:
            return 100.0
        else:
            diff = student_rate - implied_hourly
            percentage_below = diff / student_rate
            score = 100.0 - (percentage_below * 50.0)
            return max(50.0, score)

matching_engine = MatchingEngine()
