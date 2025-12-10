from fastapi import APIRouter, HTTPException
from models.user import User,GoogleUser
from con import client
from passlib.context import CryptContext
from auth import create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter()
db = client["immersia"]
users_collection = db["users"]
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

    except Exception as e:
        print("Signup error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/google-signup")
async def google_signup(google_user: GoogleUser):
    try:
        # Verify token
        try:
            idinfo = id_token.verify_oauth2_token(
                google_user.token,
                google_requests.Request(),
                "296570820980-c9l8rqlu3rr8eecc2cpi91ltgnk35va5.apps.googleusercontent.com"
            )
        except Exception as e:
            print("Google token verification failed:", e)
            raise HTTPException(status_code=400, detail="Invalid Google token")

        email = idinfo.get("email")
        fullname = idinfo.get("name", "")

        if not email:
            raise HTTPException(status_code=400, detail="Email not found in token")

        # If user exists → login
        existing_user = users_collection.find_one({"email": email})
        if existing_user:

            safe_user = {
                "email": existing_user.get("email"),
                "fullname": existing_user.get("fullname", "")
            }

            token = create_access_token({"email": email})
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": safe_user
            }

        # Else → signup (create new user)
        user_dict = {
            "email": email,
            "fullname": fullname,
            "password": None
        }
        users_collection.insert_one(user_dict)

        token = create_access_token({"email": email})

        safe_user = {
            "email": email,
            "fullname": fullname
        }

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": safe_user
        }

    except Exception as e:
        print("Google signup error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")
