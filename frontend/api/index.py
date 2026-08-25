import sys
import os

# Add backend directory to sys.path so app imports resolve properly
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app as fastapi_app

async def handler(scope, receive, send):
    if scope.get("type") == "http":
        # Ensure mandatory ASGI 3.0 keys exist for Starlette / FastAPI compatibility
        if "query_string" not in scope:
            scope["query_string"] = b""
        if "headers" not in scope:
            scope["headers"] = []

        path = scope.get("path", "")
        # Ensure path routing resolves to /api prefix expected by FastAPI router
        if not path.startswith("/api") and not path.startswith("/docs") and not path.startswith("/openapi"):
            scope["path"] = "/api" + path

    await fastapi_app(scope, receive, send)

app = handler
