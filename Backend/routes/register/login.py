from fastapi import HTTPException, APIRouter, Request, Response
from passlib.context import CryptContext
import logging
from fastapi import HTTPException
from db import client
from models.login_model import Login_Model


router = APIRouter()

db = client["immersia"]
users_collection = db["users"]
role_emails_collection = db["role_emails"]

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")
logger = logging.getLogger("auth")


def verify_pwd(plain_pwd, hashed):
    try:
        if not hashed:
            return False
        return pwd_context.verify(plain_pwd, hashed)
    except Exception:
        logger.exception("password verification error")
        return False


async def initialize_role_emails():
    if role_emails_collection.count_documents({}) == 0:
        sample_roles = [
            {"email": "admin@immersia.com", "role": "admin", "is_verified": True},
            {"email": "hr@immersia.com", "role": "hr", "is_verified": True},
            {"email": "mentor@immersia.com", "role": "mentor", "is_verified": True},
            {"email": "newhr@company.com", "role": "hr", "is_verified": False},
        ]
        role_emails_collection.insert_many(sample_roles)


@router.post("/login")
async def login(request: Request, response: Response, user: Login_Model):
    try:
        await initialize_role_emails()

        temp_user = users_collection.find_one({"email": user.email})
        if not temp_user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not verify_pwd(user.password, temp_user.get("password")):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        role_data = role_emails_collection.find_one({
            "email": user.email,
            "is_verified": True
        })
        role = role_data["role"] if role_data else temp_user.get("role", "student")

        users_collection.update_one(
            {"email": user.email},
            {"$set": {"role": role}}
        )

        sm = request.state.session_manager
        session = sm.create_session(request, user.email, role)

        cookie_name = sm.cookie_name
        max_age = int(sm.idle_timeout.total_seconds())

        # ✅ FIX 1: samesite="Lax" allows cross-port (5173 -> 8000)
        response.set_cookie(
            cookie_name,
            session["_id"],
            httponly=True,
            secure=False,           # False for localhost dev
            samesite="Lax",         # ✅ Changed from Strict to Lax
            path="/",
            max_age=max_age
        )

        # ✅ FIX 2: Send csrf_token as a readable cookie (httponly=False)
        # so frontend JS can read it and include in x-csrf-token header
        csrf_token = session.get("csrf_token", "")
        response.set_cookie(
            "csrf_token",
            csrf_token,
            httponly=False,         # ✅ Must be False so JS can read it
            secure=False,
            samesite="Lax",         # ✅ Lax for cross-port
            path="/",
            max_age=max_age
        )

        return {
            "user": {
                "id": str(temp_user.get("_id")),
                "fullname": temp_user.get("fullname", ""),
                "email": user.email,
                "role": role,
                "is_admin": role == "admin",
                "is_hr": role == "hr",
                "is_mentor": role == "mentor"
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error during login")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/logout")
async def logout(request: Request, response: Response):
    try:
        sm = request.state.session_manager
        cookie_name = sm.cookie_name
        sid = request.cookies.get(cookie_name)
        if sid:
            sm.destroy_session(sid)
        response.delete_cookie(cookie_name, path="/", secure=False, samesite="Lax")
        response.delete_cookie("csrf_token", path="/", secure=False, samesite="Lax")
        return {"detail": "logged out"}
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/session/csrf")
async def get_csrf(request: Request):
    sm = request.state.session_manager
    sid = request.cookies.get(sm.cookie_name)
    if not sid:
        raise HTTPException(status_code=401, detail="Authentication required")
    s = sm.get_session(sid)
    if not s:
        raise HTTPException(status_code=401, detail="Authentication required")
    return {"csrf_token": s.get("csrf_token")}


@router.get("/me")
async def me(request: Request):
    s = getattr(request.state, "session", None)
    if not s:
        raise HTTPException(status_code=401, detail="Authentication required")
    user_doc = users_collection.find_one({"email": s.get("email")})
    user_id = str(user_doc.get("_id")) if user_doc and user_doc.get("_id") else None
    return {"email": s.get("email"), "role": s.get("role"), "id": user_id}