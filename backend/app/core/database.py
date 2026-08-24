import os
import sys
import re
import ipaddress
import logging
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

def sanitize_db_url(raw_url: str) -> str:
    """
    Sanitize database URLs by stripping quotes, handling legacy postgres:// scheme,
    and removing accidental bracket placeholders like [password] or [hostname] 
    which cause Python 3.13+ urllib.parse to raise ValueError.
    """
    if not raw_url:
        return "sqlite+aiosqlite:///./skill2pocket.db"
    
    url = raw_url.strip().strip("'\"")
    
    # Replace legacy postgres:// with postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
        
    # Unbracket non-IP hostnames or passwords like [db.xxx.supabase.co] or [my_password]
    def unbracket_placeholder(match):
        val = match.group(1)
        try:
            ipaddress.ip_address(val)
            return f"[{val}]"  # Valid IPv6/IPv4 literal, keep brackets
        except ValueError:
            return val  # Remove placeholder brackets

    url = re.sub(r'\[([^\]]+)\]', unbracket_placeholder, url)
    return url

raw_url = settings.DATABASE_URL or ""
db_url = sanitize_db_url(raw_url)

try:
    # Robust parsing of async vs sync database drivers
    if "postgresql" in db_url:
        parsed = urlparse(db_url)
        query_params = parse_qs(parsed.query)
        
        # Extract sslmode if present
        sslmode = query_params.pop("sslmode", [None])[0] or query_params.pop("ssl", [None])[0]
        
        # Reconstruct clean URL without sslmode query params (which asyncpg rejects)
        new_query = urlencode(query_params, doseq=True)
        clean_db_url = urlunparse((
            parsed.scheme, parsed.netloc, parsed.path,
            parsed.params, new_query, parsed.fragment
        ))

        if "postgresql+asyncpg://" in clean_db_url:
            async_db_url = clean_db_url
            sync_db_url = clean_db_url.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
        elif "postgresql+psycopg2://" in clean_db_url:
            sync_db_url = clean_db_url
            async_db_url = clean_db_url.replace("postgresql+psycopg2://", "postgresql+asyncpg://")
        else:  # standard postgresql://
            async_db_url = clean_db_url.replace("postgresql://", "postgresql+asyncpg://")
            sync_db_url = clean_db_url.replace("postgresql://", "postgresql+psycopg2://")

        async_connect_args = {
            "statement_cache_size": 0,  # Required for Supabase / PgBouncer connection pooler
            "prepared_statement_cache_size": 0
        }
        if sslmode or "supabase.co" in db_url or "pooler.supabase.com" in db_url or "render.com" in db_url:
            if sslmode != "disable":
                async_connect_args["ssl"] = "require"

        sync_connect_args = {}
    elif "sqlite" in db_url:
        if "sqlite+aiosqlite://" in db_url:
            async_db_url = db_url
            sync_db_url = db_url.replace("sqlite+aiosqlite://", "sqlite://")
        else:  # sqlite://
            async_db_url = db_url.replace("sqlite://", "sqlite+aiosqlite://")
            sync_db_url = db_url
        async_connect_args = {"check_same_thread": False}
        sync_connect_args = {"check_same_thread": False}
    else:
        async_db_url = db_url
        sync_db_url = db_url
        async_connect_args = {}
        sync_connect_args = {}

    # Async engine for FastAPI API handlers
    async_engine = create_async_engine(
        async_db_url,
        echo=False,
        connect_args=async_connect_args
    )

    # Sync engine for migrations and seeding
    sync_engine = create_engine(
        sync_db_url,
        echo=False,
        connect_args=sync_connect_args
    )

except Exception as parse_err:
    print(f"[DB CONFIG WARN] Error parsing DATABASE_URL '{raw_url}': {parse_err}")
    print(f"[DB CONFIG WARN] Falling back to default SQLite database.")
    async_db_url = "sqlite+aiosqlite:///./skill2pocket.db"
    sync_db_url = "sqlite:///./skill2pocket.db"
    async_connect_args = {"check_same_thread": False}
    sync_connect_args = {"check_same_thread": False}
    async_engine = create_async_engine(async_db_url, echo=False, connect_args=async_connect_args)
    sync_engine = create_engine(sync_db_url, echo=False, connect_args=sync_connect_args)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

Base = declarative_base()

# Fallback engine & session maker for local SQLite if PostgreSQL network is unreachable
FALLBACK_SQLITE_URL = "sqlite+aiosqlite:///./skill2pocket.db"
fallback_async_engine = None
fallback_sessionmaker = None

def get_fallback_sessionmaker():
    global fallback_async_engine, fallback_sessionmaker
    if fallback_sessionmaker is None:
        fallback_async_engine = create_async_engine(
            FALLBACK_SQLITE_URL,
            echo=False,
            connect_args={"check_same_thread": False}
        )
        fallback_sessionmaker = async_sessionmaker(
            bind=fallback_async_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False
        )
    return fallback_sessionmaker

async def get_db():
    try:
        async with AsyncSessionLocal() as session:
            try:
                yield session
            finally:
                await session.close()
    except (OSError, Exception) as db_err:
        err_msg = str(db_err)
        if "Network is unreachable" in err_msg or "101" in err_msg or "Cannot connect" in err_msg:
            print(f"[DB ERROR] PostgreSQL connection unreachable: {db_err}")
            print(f"[DB NOTICE] Render free tier lacks IPv6. If using Supabase, switch DATABASE_URL to the IPv4 Pooler host (aws-0-xx.pooler.supabase.com:6543) or use SQLite.")
            print(f"[DB FALLBACK] Switching request session to SQLite fallback...")
            FallbackSession = get_fallback_sessionmaker()
            async with FallbackSession() as fallback_session:
                try:
                    yield fallback_session
                finally:
                    await fallback_session.close()
        else:
            raise db_err


