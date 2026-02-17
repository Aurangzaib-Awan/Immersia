from fastapi import APIRouter, HTTPException
from models.user import User
from con import client
from passlib.context import CryptContext
from auth import create_access_token


router = APIRouter()
db = client["immersia"]
users_collection = db["users"]
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

def hash_password(pwd: str):
    return pwd_context.hash(pwd)

@router.post("/signup")
async def create_user(user: User):
    try:
        # If already in database → stop
        if users_collection.find_one({"email": user.email}):
            raise HTTPException(status_code=400, detail="Email already registered")

        # Save user to DB (all users are students by default)
        user_dict = user.model_dump()
        user_dict["password"] = hash_password(user_dict["password"])

        users_collection.insert_one(user_dict)

        token = create_access_token({"email": user.email})

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "email": user.email
            }
        }

    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is (e.g., 400 for duplicate email)
    except Exception as e:
        print("Signup error:", e)
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


