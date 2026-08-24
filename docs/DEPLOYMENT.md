# Skill2Pocket — Production Deployment Guide

This guide provides step-by-step instructions for deploying Skill2Pocket to production using **Vercel**, **Render**, and **Supabase**.

---

## 📌 Repository Root Note
The GitHub repository contains `backend/`, `frontend/`, and `database/` at the root level.

---

## 🐍 Render Setup (FastAPI Backend API)

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Select your `skill2pocket-backend` Web Service ➔ **Settings**.
3. Set **Root Directory**: **Leave Empty / BLANK**.
4. Set **Build Command**:
   ```bash
   cd backend && pip install -r requirements.txt
   ```
5. Set **Start Command**:
   ```bash
   cd backend && python ../database/seed/seed_data.py && gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
   ```
6. Click **Save Changes** and trigger **Manual Deploy** ➔ **Deploy latest commit**.

---

## 🛠️ Database Connection & Troubleshooting (`[Errno 101] Network is unreachable`)

### Why `Errno 101 Network is unreachable` Happens on Render:
Render free web services operate on IPv4-only network interfaces. Supabase direct database hostnames (`db.ref.supabase.co:5432`) resolve to **IPv6** addresses by default. When asyncpg or psycopg2 attempts to connect to an IPv6 address on Render, Linux returns `OSError: [Errno 101] Network is unreachable`.

### Solution 1: Use Supabase IPv4 Connection Pooler (Recommended for PostgreSQL)
1. In your Supabase Dashboard ➔ **Project Settings** ➔ **Database**.
2. Under **Connection Pooling**, copy the pooled connection string (port `6543` or `5432`).
3. Set the `DATABASE_URL` environment variable in Render to the pooled IPv4 URI:
   ```env
   DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   *(Note: The backend automatically handles `statement_cache_size=0` and SSL mode for Supabase Pooler).*

### Solution 2: Use Zero-Config SQLite (100% Free & Automatic Fallback)
- If `DATABASE_URL` is omitted from Render Environment Variables, the backend defaults to SQLite (`sqlite+aiosqlite:///./skill2pocket.db`).
- The backend features automatic resilient fallback: if PostgreSQL is unreachable during deployment, requests automatically failover to local SQLite so your service stays 100% online.

---

## ⚡ Vercel Setup (Next.js Frontend)

1. Go to [Vercel Settings](https://vercel.com/dashboard).
2. Select your project ➔ **Settings** ➔ **General**.
3. Set **Root Directory**: `frontend`.
4. Click **Save** and trigger a redeploy!

