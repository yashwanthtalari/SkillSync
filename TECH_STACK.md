# Skill2Pocket — Complete Tech Stack & Application Overview

This document provides a comprehensive breakdown of all frameworks, libraries, database engines, algorithms, hosting platforms, and tools used in the **Skill2Pocket (SkillSync)** full-stack micro-task marketplace.

---

## 🏗️ 1. Architecture Overview

Skill2Pocket is built using a modern **decoupled full-stack architecture**:
- **Frontend App**: Next.js 16 (React 19) single-page application hosted on **Vercel**.
- **Backend API**: FastAPI (Python 3.11+) ASGI service hosted on **Render**.
- **Database Layer**: Relational Database managed via SQLAlchemy 2.0 Async ORM (SQLite `aiosqlite` for local zero-config quickstart & PostgreSQL `asyncpg`/`psycopg2` for production cloud storage).
- **AI & Recommendation Subsystem**: Hybrid AI engine combining structured rule-based NLP extraction and a multi-signal vector-weighted matching algorithm.

```
┌─────────────────────────────────────────────────────────────┐
│                 Client Browser / Mobile UI                   │
│          Next.js 16 + React 19 + Tailwind CSS + Axios        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON API
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend Server                   │
│         Uvicorn ASGI + Pydantic v2 + PyJWT + Passlib        │
├──────────────────────────────┬──────────────────────────────┤
│    Multi-Signal AI Engine    │     Authentication & Auth    │
│  Hard Filters + 7-Factor Wt  │    JWT Tokens + Bcrypt Hash  │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────────────────────▼──────────────┐
│                  Relational Database Layer                  │
│       SQLAlchemy 2.0 Async ORM + SQLite / PostgreSQL       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 2. Frontend Technologies & Dependencies

| Category | Technology / Package | Version / Usage | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js** | `16.3.2` | App Router, Server/Client components, SSR, dynamic routing, and Turbopack bundler |
| **UI Library** | **React** | `19.0.0` | Declarative, component-driven user interface engine |
| **Language** | **TypeScript** | `^5.0.0` | End-to-end static typing for props, API responses, and state models |
| **Styling** | **Tailwind CSS** | `^4.0.0` | Utility-first CSS framework for custom responsive design tokens, glassmorphism, & dark mode |
| **State Caching** | **TanStack Query** | `@tanstack/react-query ^5.28.0` | Asynchronous server-state management, query caching, and auto-invalidation |
| **HTTP Client** | **Axios / Fetch API** | `^1.6.8` | Standardized API client (`frontend/lib/api.ts`) with request interceptors for JWT Bearer headers |
| **Icons** | **Lucide React** | `^0.359.0` | Modern SVG icons (`Sparkles`, `Clock`, `IndianRupee`, `ShieldCheck`, `MessageSquare`, `Send`, etc.) |
| **Build Tooling** | **PostCSS / Autoprefixer** | `^8.4.38` | CSS processing, browser vendor prefixing, and standard font optimization |

---

## ⚙️ 3. Backend Technologies & Dependencies

| Category | Technology / Package | Version / Requirements | Purpose |
| :--- | :--- | :--- | :--- |
| **Language** | **Python** | `3.10+` / `3.11` | High-performance asynchronous backend execution runtime |
| **Framework** | **FastAPI** | `>=0.110.0` | High-speed ASGI REST API framework with automatic Swagger/OpenAPI interactive docs |
| **Server** | **Uvicorn [standard]** | `>=0.28.0` | Lightning-fast ASGI web server implementation using `uvloop` and `httptools` |
| **WSGI Server** | **Gunicorn** | `>=21.2.0` | Process manager & worker manager for production deployment on Render |
| **Validation** | **Pydantic v2** | `>=2.6.0` | High-speed data validation & serialization (`UserRegister`, `TaskCreate`, `MatchResponse`) |
| **Email Validation** | **email-validator** | `>=2.1.0` | RFC-compliant email verification for user signup |
| **Config Loader** | **pydantic-settings** | `>=2.2.0` | Environment variable parsing and type-safe config management from `.env` |
| **Form Parsing** | **python-multipart** | `>=0.0.9` | Request payload parsing for OAuth2 password form data and multipart uploads |

---

## 🔐 4. Authentication, Security & Cryptography

| Component | Library | Specification |
| :--- | :--- | :--- |
| **Password Hashing** | `passlib[bcrypt]` & `bcrypt==4.0.1` | Salted Bcrypt key derivation for secure password storage in database |
| **JWT Generation** | `pyjwt[crypto]` `>=2.8.0` | HMAC SHA-256 (`HS256`) signed access tokens with custom claims (`sub`, `role`, `exp`) |
| **Route Protection** | FastAPI `Depends(get_current_user)` | Dependency injection validating `Authorization: Bearer <token>` on protected routes |
| **CORS Middleware** | FastAPI `CORSMiddleware` | Dynamic cross-origin resource sharing supporting local dev and Vercel domains |

---

## 🗄️ 5. Database, ORM & Storage Architecture

| Layer | Engine / Library | Usage |
| :--- | :--- | :--- |
| **ORM** | **SQLAlchemy 2.0** | `sqlalchemy.ext.asyncio` using `AsyncSession`, `selectinload` for relationship fetching |
| **Migrations** | **Alembic** | `>=1.13.1` schema versioning and database migration tracking |
| **Local Database** | **SQLite (`aiosqlite`)** | `>=0.20.0` async driver for zero-config local development (`skill2pocket.db`) |
| **Cloud Database** | **PostgreSQL (`asyncpg` / `psycopg2-binary`)** | Production cloud relational database connection (Supabase / Render PostgreSQL) |
| **Seeder Script** | `database/seed/seed_data.py` | Automated seeding of Indian university student profiles, skills, and micro-tasks |

---

## 🧠 6. AI Subsystem & Multi-Signal Matching Engine

### A. Natural Language AI Task Description Parser
Located in `backend/app/ai/task_parser.py`:
- Extracts structured task parameters from unstructured text descriptions.
- Infers budget ranges, estimated hours, work mode (`remote`, `hybrid`, `in_person`), deadline dates, and required skills with proficiency levels (`beginner`, `intermediate`, `advanced`, `expert`).

### B. Multi-Signal Recommendation Engine
Located in `backend/app/matching/engine.py`:
Combines **Hard Filtering Rules** with a **7-Factor Weighted Scoring Algorithm**:

$$\text{Match Score} = (S \times 0.35) + (A \times 0.20) + (D \times 0.15) + (C \times 0.10) + (B \times 0.05) + (R \times 0.10) + (P \times 0.05)$$

1. **Hard Filters**: Excludes unverified profiles or students missing mandatory skill sets.
2. **Skill Overlap Score ($S$)**: Weighted Jaccard index based on required vs student skill levels.
3. **Availability Schedule Score ($A$)**: Overlap of student weekly free slots vs task urgency.
4. **Deadline Feasibility Score ($D$)**: Estimated task duration vs days remaining before deadline.
5. **Complexity Score ($C$)**: Task difficulty rating vs student experience level.
6. **Budget Compatibility Score ($B$)**: Student hourly rate vs client task budget range.
7. **Reliability Score ($R$)**: Historical on-time delivery & completion rates.
8. **Rating Score ($P$)**: Cumulative 5-star review average.

---

## 🌐 7. Deployment & Hosting Infrastructure

- **Vercel**: Edge deployment of Next.js frontend (`https://skill-sync-nine-orpin.vercel.app`) with automatic Git continuous integration on push to `main`.
- **Render**: Web Service deployment of FastAPI backend (`https://skillsync-q8co.onrender.com`) running Gunicorn + Uvicorn workers.
- **GitHub**: Source code repository & version control (`github.com/yashwanthtalari/SkillSync`).

---

## 🧪 8. Testing & Quality Assurance

- **Pytest**: `pytest >= 8.0.0` test runner.
- **Pytest-Asyncio**: `pytest-asyncio >= 0.23.5` for asynchronous unit test execution.
- **HTTPX**: Async HTTP client for automated API endpoint testing (`tests/test_matching.py`, `tests/test_auth.py`).

---

## 📊 Summary Table of File Artifacts

| File Path | Description |
| :--- | :--- |
| [`backend/requirements.txt`](file:///c:/Users/Yashwanth%20Talari/Desktop/2Hack/skill2pocket/backend/requirements.txt) | Complete list of Python backend dependencies |
| [`frontend/package.json`](file:///c:/Users/Yashwanth%20Talari/Desktop/2Hack/skill2pocket/frontend/package.json) | Node.js frontend dependencies and Next.js scripts |
| [`backend/app/main.py`](file:///c:/Users/Yashwanth%20Talari/Desktop/2Hack/skill2pocket/backend/app/main.py) | FastAPI application initialization and middleware |
| [`backend/app/matching/engine.py`](file:///c:/Users/Yashwanth%20Talari/Desktop/2Hack/skill2pocket/backend/app/matching/engine.py) | Multi-signal AI student-task matching algorithm |
| [`database/seed/seed_data.py`](file:///c:/Users/Yashwanth%20Talari/Desktop/2Hack/skill2pocket/database/seed/seed_data.py) | Database schema creator and demo data seeder |
