from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user_token, decode_token
from con import client

router = APIRouter()
db = client["immersia"]
users_collection = db["users"]
role_emails_collection = db["role_emails"]

@router.get("/me")
async def get_current_user(token: str = Depends(get_current_user_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Determine role (similar logic to login)
    role = user.get("role", "student")
    
    # Check if role needs update from role_emails (optional but good for consistency)
    role_data = role_emails_collection.find_one({"email": email, "is_verified": True})
    if role_data:
        role = role_data["role"]

    return {
        "email": user["email"],
        "name": user.get("name", ""),
        "role": role,
        "is_admin": role == "admin",
        "is_hr": role == "hr",
        "is_mentor": role == "mentor",
        "auth_provider": user.get("auth_provider", "local")
    }
