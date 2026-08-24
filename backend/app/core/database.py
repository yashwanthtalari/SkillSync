import os
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

db_url = settings.DATABASE_URL

# Convert postgresql:// to postgresql+asyncpg:// if async requested, or handle sync engine
if db_url.startswith("postgresql://"):
    async_db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
    sync_db_url = db_url.replace("postgresql://", "postgresql+psycopg2://")
elif db_url.startswith("sqlite://"):
    async_db_url = db_url.replace("sqlite://", "sqlite+aiosqlite://")
    sync_db_url = db_url
elif db_url.startswith("sqlite+aiosqlite://"):
    async_db_url = db_url
    sync_db_url = db_url.replace("sqlite+aiosqlite://", "sqlite://")
else:
    async_db_url = db_url
    sync_db_url = db_url

connect_args = {"check_same_thread": False} if "sqlite" in async_db_url else {}

# Async engine for FastAPI API handlers
async_engine = create_async_engine(
    async_db_url,
    echo=False,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Sync engine for migrations and seeding
sync_engine = create_engine(
    sync_db_url,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in sync_db_url else {}
)
SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
