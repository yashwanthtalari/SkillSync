# Skill2Pocket — Full-Stack Micro-Task Marketplace MVP

Skill2Pocket is a micro-task marketplace designed specifically for university students. It connects students with clients based not only on technical skills, but also on weekly availability schedules, proficiency levels, task complexity, deadline feasibility, budget constraints, reliability scores, and work-mode preferences.

---

## Tech Stack

### Backend
- **Python 3.13** & **FastAPI**
- **SQLAlchemy 2.0** (ORM) & **Alembic** (Migrations)
- **Pydantic v2** & **pydantic-settings**
- **PyJWT & Passlib (Bcrypt)** for authentication
- **Pytest & pytest-asyncio** for backend unit & integration tests
- **PostgreSQL / Supabase** + **SQLite (aiosqlite)** for zero-config quickstart

### Frontend
- **Next.js 14+ (App Router)** & **React 18**
- **TypeScript** & **Tailwind CSS**
- **TanStack Query (@tanstack/react-query)** for server state caching
- **Axios** with JWT auth interceptors
- **Lucide Icons**

### AI Engine
- **AI Service Abstraction** supporting **Ollama** local models, **OpenAI-compatible endpoints**, and a **Structured Rule-Based NLP Extractor** fallback.

---

## Directory Structure

```
skill2pocket/
├── frontend/                     # Next.js 14 App Router Frontend
│   ├── app/                      # Next.js Pages & Layouts
│   │   ├── client/               # Client Dashboard, Task Creator, Task Manager
│   │   ├── student/              # Student Dashboard, Marketplace, Task Details, Applications, Profile
│   │   ├── login/                # Auth Login page with 1-click Demo Account fill
│   │   ├── register/             # Auth Registration page (Student vs Client selector)
│   │   ├── layout.tsx
│   │   └── page.tsx              # Landing Page
│   ├── components/               # UI Components (Navbar, Footer, TaskCard, MatchBadge, SkillBadge)
│   ├── lib/                      # API client, Auth Context, Types
│   ├── public/
│   └── package.json
├── backend/                      # Python FastAPI Backend
│   ├── app/
│   │   ├── api/                  # REST API endpoints (Auth, Students, Clients, Skills, Tasks, Applications, Reviews)
│   │   ├── ai/                   # AI Task Parser Service & Fallback NLP Extractor
│   │   ├── matching/             # Hybrid Matching Engine (Hard filters + Multi-weighted scoring formula)
│   │   ├── core/                 # Config, Security, Database engine
│   │   ├── models/               # SQLAlchemy ORM Models
│   │   ├── schemas/              # Pydantic v2 validation schemas
│   │   └── main.py               # FastAPI entrypoint
│   ├── tests/                    # Pytest suite (Matching engine, AI parser, Auth)
│   └── requirements.txt
├── database/
│   └── seed/                     # Seed script populating Indian student/client micro-tasks
├── docs/                         # Documentation & Diagrams
├── .env.example                  # Environment configuration template
└── README.md
```

---

## Test Credentials for Seeded Accounts

The database seed script initializes 10 student accounts and 5 client accounts. Password for all seeded accounts is `password123`.

### 1. Student Accounts
- **Aarav Sharma (IIT Bombay - CSE)**: `aarav.student@skill2pocket.com` | Password: `password123`
- **Priya Patel (BITS Pilani - CS)**: `priya.student@skill2pocket.com` | Password: `password123`
- **Rohan Mehta (DTU - IT)**: `rohan.student@skill2pocket.com` | Password: `password123`

### 2. Client Accounts
- **Rajesh Agarwal (TechVerse Solutions)**: `client.rajesh@techverse.in` | Password: `password123`
- **Anita Roy (CreativeMinds Agency)**: `client.anita@creativeminds.io` | Password: `password123`

---

## Quickstart Setup & Run Instructions

### Prerequisites
- **Node.js**: v18+ or v20+
- **Python**: 3.10+

### 1. Backend Setup & Run

```bash
# Navigate to backend directory
cd skill2pocket/backend

# Create virtual environment & activate
python -m venv venv
# On Windows PowerShell/CMD:
venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Seed the database
python ../database/seed/seed_data.py

# Run unit tests
pytest

# Start FastAPI backend server
uvicorn app.main:app --reload --port 8000
```

FastAPI OpenAPI Documentation is available at: `http://localhost:8000/docs`

### 2. Frontend Setup & Run

```bash
# Navigate to frontend directory
cd skill2pocket/frontend

# Install node dependencies
npm install

# Start Next.js development server
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## Implemented Features

1. **Authentication & Roles**: Real JWT auth with student and client registration, profile creation, and protected routes.
2. **AI Task Parser**: Natural-language description parsing into structured JSON (Title, Category, Skills, Required Level, Estimated Hours, Budget range). Includes graceful fallback.
3. **Hybrid Student Matching Engine**:
   - Hard filters (verification status, required skills presence, deadline feasibility).
   - Multi-weighted score formula:
     `overall_score = skill_score * 0.35 + availability_score * 0.20 + deadline_score * 0.15 + complexity_score * 0.10 + budget_score * 0.05 + reliability_score * 0.10 + rating_score * 0.05`
   - Natural-language match explanation generator ("Strong match for Python, available before deadline").
4. **Student Flow**: Browse marketplace, search & filter tasks, submit proposals with proposed price & completion time, deliverable submission.
5. **Client Flow**: Post task with AI analysis, review AI recommendations, accept student application, approve deliverables, rate and review students.
6. **No Mock Data**: Real CRUD operations persisted in database.

---

## Recommended Next Steps

1. **Escrow Payment Integration**: Integrate Razorpay / Stripe for client task funds lock & automated release upon deliverable approval.
2. **University Email Domain Auto-Verification**: Verify student `.edu` or `.ac.in` email domains.
3. **In-App Messaging**: Real-time WebSocket chat between student and client once task is assigned.
4. **pgvector Embedding Ranker**: Add pgvector embeddings for semantic similarity search on portfolio descriptions.
