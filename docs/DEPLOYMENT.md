# Skill2Pocket — Production Deployment Guide

This guide provides step-by-step instructions for deploying Skill2Pocket to production using **Docker Compose**, **Render**, **Vercel**, or **Railway + Supabase**.

---

## Deployment Option 1: Docker & Docker Compose (Recommended)

Run the entire application stack (PostgreSQL 16, FastAPI Backend, Next.js Frontend) in production containers with a single command.

### Prerequisites
- Docker Installed & Docker Compose available

### Launch Production Stack

```bash
# Navigate to the root directory
cd skill2pocket

# Build and start all containers in detached mode
docker-compose up --build -d
```

- **Frontend App**: `http://localhost:3000`
- **FastAPI API**: `http://localhost:8000/docs`
- **PostgreSQL Database**: `localhost:5432`

---

## Deployment Option 2: Render.com (1-Click Blueprint)

Skill2Pocket includes a `render.yaml` infrastructure-as-code blueprint file for zero-configuration cloud deployment.

### Steps:
1. Push `skill2pocket` repository to GitHub or GitLab.
2. Log in to [Render.com](https://render.com).
3. Click **New +** -> **Blueprints**.
4. Connect your GitHub repository. Render will automatically detect `render.yaml` and configure:
   - **skill2pocket-db**: Managed PostgreSQL instance
   - **skill2pocket-backend**: FastAPI web service
   - **skill2pocket-frontend**: Next.js web application
5. Click **Apply**. Render will automatically provision the database, seed data, build the frontend, and link service URLs!

---

## Deployment Option 3: Vercel (Frontend) + Supabase (DB) + Render (Backend)

For optimal serverless scalability:

### 1. Database Setup (Supabase)
1. Create a project on [Supabase](https://supabase.com).
2. Copy the PostgreSQL connection string:
   `postgresql+asyncpg://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`

### 2. Backend API Setup (Render or Railway)
1. Deploy `backend/` directory to Render Web Service or Railway.
2. Set Environment Variable:
   `DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`
3. Set `SECRET_KEY` to a secure random string.
4. Render will start FastAPI with Gunicorn workers.

### 3. Frontend Setup (Vercel)
1. Import `frontend/` directory into [Vercel](https://vercel.com).
2. Set Environment Variable:
   `NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com/api`
3. Click **Deploy**.

---

## Production Environment Variables Reference

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL or SQLite connection string | `postgresql+asyncpg://user:pass@db:5432/skill2pocket` |
| `SECRET_KEY` | JWT signing secret key | `super_secret_production_key_2026` |
| `AI_PROVIDER` | AI task parser provider (`ollama`, `openai`, `fallback`) | `fallback` or `openai` |
| `AI_API_KEY` | OpenAI API Key (if `AI_PROVIDER=openai`) | `sk-proj-xxxx` |
| `NEXT_PUBLIC_API_URL` | Backend REST API endpoint URL | `http://localhost:8000/api` |
