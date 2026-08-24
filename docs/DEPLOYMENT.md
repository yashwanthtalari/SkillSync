# Skill2Pocket — Production Deployment Guide

This guide provides step-by-step instructions for deploying Skill2Pocket to production using **Vercel**, **Render**, and **Supabase**.

---

## 📌 Repository Root Note
The GitHub repository `github.com/yashwanthtalari/SkillSync` contains `backend/`, `frontend/`, and `database/` directly at the root level.

---

## 🐍 Render Setup (FastAPI Backend API)

1. Go to [Render Settings](https://dashboard.render.com).
2. Select your `skill2pocket-backend` Web Service ➔ **Settings**.
3. Set **Root Directory**: **Leave Empty / BLANK** (Do NOT type `skill2pocket`).
4. Set **Build Command**:
   ```bash
   cd backend && pip install -r requirements.txt
   ```
5. Set **Start Command**:
   ```bash
   cd backend && python ../database/seed/seed_data.py && gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
   ```
6. Click **Save Changes** and click **Manual Deploy** ➔ **Deploy latest commit**.

---

## ⚡ Vercel Setup (Next.js Frontend)

1. Go to [Vercel Settings](https://vercel.com/dashboard).
2. Select your project ➔ **Settings** ➔ **General**.
3. Set **Root Directory**: `frontend` (Do NOT type `skill2pocket/frontend`).
4. Click **Save** and trigger a redeploy!
