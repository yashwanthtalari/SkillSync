import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import async_engine, Base
from app.api import auth, students, clients, skills, tasks, applications, reviews, notifications

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables if running in SQLite or quickstart mode
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[DB SUCCESS] Database schema verified.")
    except Exception as e:
        print(f"[DB WARN] Primary DB schema creation skipped/failed: {e}")
        try:
            from app.core.database import get_fallback_sessionmaker
            fallback_maker = get_fallback_sessionmaker()
            async with fallback_maker.kw['bind'].begin() as fconn:
                await fconn.run_sync(Base.metadata.create_all)
            print("[DB FALLBACK] Fallback SQLite database schema initialized.")
        except Exception as fe:
            if "already exists" in str(fe):
                pass  # Schema already created by another concurrent worker process
            else:
                print(f"[DB WARN] Fallback DB setup failed: {fe}")
    yield



app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Skill2Pocket Micro-Task Marketplace API for Students & Clients",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS Configuration supporting localhost and Vercel domains
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "https://skill-sync-nine-orpin.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom Exception Handler for Clean Errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log exception internally, don't expose raw stack traces
    print(f"Unhandled Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected server error occurred."}}
    )

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(students.router, prefix=settings.API_V1_STR)
app.include_router(clients.router, prefix=settings.API_V1_STR)
app.include_router(skills.router, prefix=settings.API_V1_STR)
app.include_router(tasks.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }
