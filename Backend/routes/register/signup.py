from fastapi import APIRouter, HTTPException, Request, Response
from models.user import User
from db import client
from passlib.context import CryptContext
 


router = APIRouter()
db = client["immersia"]
users_collection = db["users"]
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

def hash_password(pwd: str):
    return pwd_context.hash(pwd)

@router.post("/signup")
async def create_user(request: Request, response: Response, user: User):
    try:
        # If already in database → stop
        if users_collection.find_one({"email": user.email}):
            raise HTTPException(status_code=400, detail="Email already registered")

        # Save user to DB (all users are students by default)
        user_dict = user.model_dump()
        user_dict["password"] = hash_password(user_dict["password"])

        result = users_collection.insert_one(user_dict)
        new_id = str(result.inserted_id)

        # Create server-managed session (cookie-based)
        sm = request.state.session_manager
        session = sm.create_session(request, user.email, "student")
        cookie_name = sm.cookie_name
        max_age = int(sm.idle_timeout.total_seconds())
        response.set_cookie(cookie_name, session["_id"], httponly=True, secure=sm.cookie_secure, samesite="Strict", path='/', max_age=max_age)

        return {
            "user": {
                "id": new_id,
                "fullname": user_dict["fullname"],
                "email": user_dict["email"],
                "role": "student",
                "is_admin": False,
                "is_hr": False,
                "is_mentor": False
            }
        }

    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is (e.g., 400 for duplicate email)
    except Exception as e:
        print("Signup error:", e)
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


