# Skill2Pocket — End-to-End Production Setup Guide

This master guide provides exact step-by-step instructions to connect your **Supabase Database**, **Render Backend**, and **Vercel Frontend** into an unbroken, 100% resilient production application.

---

## 📋 Step-by-Step Manual Action Items

### Step 1: Connect Supabase Database to Render (Permanent Data Storage)

1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select your project ➔ Go to **Project Settings** (gear icon) ➔ **Database**.
3. Scroll down to the **Connection Pooling** section:
   - Select **Mode**: `Session` (or `Transaction`).
   - Copy the Connection String (port `6543`).
   - Example URI format:
     ```env
     postgresql://postgres.frrhtppatokgtyndkkub:[YOUR-SUPABASE-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
     ```
4. Open **[Render Dashboard](https://dashboard.render.com)** ➔ Select `skill2pocket-backend` ➔ **Environment Variables**.
5. Add/Edit `DATABASE_URL`:
   - Key: `DATABASE_URL`
   - Value: *(Paste your pooled IPv4 URI from Supabase above)*
6. Click **Save Changes**. Render will automatically trigger a new deployment.

---

### Step 2: Configure Vercel Frontend Environment Variables

1. Open **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Select your `skill-sync-nine-orpin` project ➔ Go to **Settings** ➔ **Environment Variables**.
3. Add the API URL key:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://skillsync-q8co.onrender.com/api`
   - Environment: Select **Production**, **Preview**, and **Development**.
4. Click **Save**.
5. Go to the **Deployments** tab ➔ Click the `...` menu on the latest deployment ➔ **Redeploy**.

---

### Step 3: Prevent Render Cold Starts (Keep-Alive Health Ping)

Render's free tier web services spin down after 15 minutes of inactivity. To ensure your app responds instantly (< 1 second) with zero `Network Error` popups:

1. Open **[Cron-Job.org](https://cron-job.org)** (Free) or **[UptimeRobot](https://uptimerobot.com)** (Free).
2. Create a new HTTP Cron Job:
   - **URL**: `https://skillsync-q8co.onrender.com/`
   - **Execution Schedule**: Every 5 or 10 minutes.
3. Save the job. This keeps your Render container warm 24/7!

---

## ⚙️ Automated Backend Resiliency (Already Included in Codebase)

1. **IPv6 / Direct Host Failover**: If PostgreSQL ever becomes unreachable, backend requests automatically failover to local SQLite so user requests never crash.
2. **FastAPI CORS Regex**: Middleware dynamically approves all Vercel origin headers (`https://.*\.vercel\.app`).
3. **45-Second Request Window**: Frontend Axios requests wait up to 45 seconds during cold starts before timing out.
4. **Bracket & Quote Sanitizer**: Parses `DATABASE_URL` safely, stripping accidental placeholder brackets.

---

## ✅ End-to-End Verification Checklist

- [x] Backend API Root: `https://skillsync-q8co.onrender.com/` (Returns `status: online`)
- [x] OpenAPI Docs: `https://skillsync-q8co.onrender.com/docs`
- [x] Frontend Live App: `https://skill-sync-nine-orpin.vercel.app`
- [x] User Registration & Student Profile creation
- [x] Client Task Creation & AI Analysis
- [x] Hybrid Matching Engine Execution


