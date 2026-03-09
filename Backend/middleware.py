from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from db import client
from session import SessionManager
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("middleware")

db = client["immersia"]
sessions_collection = db["sessions"]
session_manager = SessionManager(sessions_collection)

# ============================================================================
# Routes that are FULLY PUBLIC — no session, no CSRF required
# ============================================================================
PUBLIC_PREFIXES = (
    "/login",
    "/signup",
    "/auth/google",
    "/session/csrf",          # ✅ FIX 1: CSRF endpoint must be public (no session yet)
)

# ============================================================================
# Routes that require a SESSION but skip CSRF header check
# (These are called right after login when CSRF cookie may not be read yet,
#  or are internal AI generation calls that are session-less by design)
# ============================================================================
CSRF_EXEMPT_PREFIXES = (
    "/api/generate-project",  # Gemini project generation
    "/api/generate-quiz",     # Gemini quiz generation
    "/api/quiz/submit",       # Quiz submission
    "/api/projects/",         # ✅ FIX 2: covers PATCH /api/projects/{id}/complete
    "/api/submissions/",
    "/users/me", 
)


class SessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Attach session manager for use in route handlers
        request.state.session_manager = session_manager
        cookie_name = session_manager.cookie_name

        path = request.url.path

        # ── Step 1: Resolve session from cookie ──────────────────────────────
        sid = request.cookies.get(cookie_name)
        session = None

        if sid:
            session = session_manager.validate_session(request, sid)
            if session:
                session_manager.refresh_session(sid)   # rolling expiration
                request.state.session = session
            else:
                # Invalid / expired session — but only block if the route
                # actually requires auth. Public routes pass through regardless.
                if not any(path.startswith(p) for p in PUBLIC_PREFIXES):
                    resp = JSONResponse(
                        {"detail": "Authentication required"}, status_code=401
                    )
                    resp.delete_cookie(
                        cookie_name, path="/",
                        secure=session_manager.cookie_secure, samesite="Lax"
                    )
                    return resp
                request.state.session = None
        else:
            request.state.session = None

        # ── Step 2: CSRF protection for state-changing methods ───────────────
        if request.method in ("POST", "PUT", "PATCH", "DELETE"):

            # Fully public routes — no session, no CSRF
            if any(path.startswith(p) for p in PUBLIC_PREFIXES):
                pass  # allow through

            # CSRF-exempt but may still need a session
            elif any(path.startswith(p) for p in CSRF_EXEMPT_PREFIXES):
                pass  # allow through — no CSRF header required

            # Everything else — require BOTH session AND valid CSRF token
            else:
                if not request.state.session:
                    return JSONResponse(
                        {"detail": "Authentication required"}, status_code=401
                    )
                header_token = request.headers.get("x-csrf-token") or \
                               request.headers.get("X-CSRF-Token")
                if not header_token or \
                   header_token != request.state.session.get("csrf_token"):
                    session_manager.destroy_session(sid)
                    resp = JSONResponse(
                        {"detail": "CSRF validation failed"}, status_code=401
                    )
                    resp.delete_cookie(
                        cookie_name, path="/",
                        secure=session_manager.cookie_secure, samesite="Lax"
                    )
                    logger.warning(f"CSRF validation failed for {path}")
                    return resp

        return await call_next(request)