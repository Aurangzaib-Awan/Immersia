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


class SessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Attach session manager and cookie name for use in handlers
        request.state.session_manager = session_manager
        cookie_name = session_manager.cookie_name

        sid = request.cookies.get(cookie_name)
        session = None
        if sid:
            session = session_manager.validate_session(request, sid)
            if session:
                # rolling expiration
                session_manager.refresh_session(sid)
                request.state.session = session
            else:
                # invalid session -> clear cookie in response
                resp = JSONResponse({"detail": "Authentication required"}, status_code=401)
                resp.delete_cookie(cookie_name, path="/", secure=session_manager.cookie_secure, samesite="Strict")
                return resp
        else:
            request.state.session = None

        # CSRF protection: enforce for state-changing methods when session exists
        if request.method in ("POST", "PUT", "PATCH", "DELETE"):
            # allow login/signup/oauth endpoints without CSRF (they don't have session yet)
            path = request.url.path
            if not path.startswith(("/login", "/signup", "/auth/google", "/api/quiz/submit", "/api/generate-project", "/api/generate-quiz")):
                # require session and csrf
                if not request.state.session:
                    resp = JSONResponse({"detail": "Authentication required"}, status_code=401)
                    return resp
                header_token = request.headers.get("x-csrf-token")
                if not header_token or header_token != request.state.session.get("csrf_token"):
                    # Invalidate session on CSRF failure
                    session_manager.destroy_session(sid)
                    resp = JSONResponse({"detail": "Authentication required"}, status_code=401)
                    resp.delete_cookie(cookie_name, path="/", secure=session_manager.cookie_secure, samesite="Strict")
                    logger.warning("CSRF validation failed")
                    return resp

        response = await call_next(request)
        return response
