export type UserRole = "student" | "client" | "admin";

export type WorkMode = "remote" | "hybrid" | "on_site";

export type TaskStatus = "draft" | "open" | "assigned" | "in_progress" | "submitted" | "completed" | "cancelled";

export type ApplicationStatus = "pending" | "shortlisted" | "accepted" | "rejected" | "withdrawn";

export interface User {
  user_id: string;
  email: string;
  role: UserRole;
  profile: {
    profile_id: string;
    full_name: string;
    university?: string;
    degree?: string;
    graduation_year?: number;
    organization_name?: string;
    verification_status?: string;
    hourly_rate?: number;
    reliability_score?: number;
    average_rating?: number;
  };
}

export interface StudentSkill {
  id: string;
  skill_id: string;
  skill_name: string;
  category: string;
  proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
  years_experience: number;
}

export interface Availability {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  timezone: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  email?: string;
  full_name: string;
  university?: string;
  degree?: string;
  graduation_year?: number;
  bio?: string;
  hourly_rate: number;
  work_mode: WorkMode;
  reliability_score: number;
  completed_tasks: number;
  average_rating: number;
  verification_status: string;
  skills: StudentSkill[];
  availability: Availability[];
  created_at: string;
}

export interface ClientProfile {
  id: string;
  user_id: string;
  email?: string;
  full_name: string;
  organization_name?: string;
  bio?: string;
  verification_status: string;
  created_at: string;
}

export interface TaskSkill {
  id: string;
  skill_id: string;
  skill_name: string;
  required_level: string;
  importance: string;
}

export interface Task {
  id: string;
  client_id: string;
  client_name?: string;
  organization_name?: string;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  estimated_hours: number;
  work_mode: WorkMode;
  location?: string;
  status: TaskStatus;
  required_skills: TaskSkill[];
  created_at: string;
  updated_at: string;
  applications_count?: number;
  match_score?: number;
}

export interface TaskAnalyzeResponse {
  title: string;
  category: string;
  skills: { name: string; level: string }[];
  estimated_hours: number;
  complexity: "low" | "medium" | "high";
  deadline_days: number;
  suggested_budget_min: number;
  suggested_budget_max: number;
}

export interface MatchRecommendation {
  student_id: string;
  student_name: string;
  university: string;
  average_rating: number;
  reliability_score: number;
  overall_score: number;
  skill_score: number;
  availability_score: number;
  complexity_score: number;
  deadline_score: number;
  budget_score: number;
  explanation: string;
  matched_skills: string[];
}

export interface Application {
  id: string;
  task_id: string;
  student_id: string;
  student_name?: string;
  student_university?: string;
  student_rating?: number;
  student_reliability?: number;
  proposal: string;
  proposed_price: number;
  estimated_completion_time: string;
  status: ApplicationStatus;
  created_at: string;
  task_title?: string;
}

export interface Review {
  id: string;
  task_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}
