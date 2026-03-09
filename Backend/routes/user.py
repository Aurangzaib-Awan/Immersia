from fastapi import APIRouter, Request, HTTPException
from db import client
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()
db = client["immersia"]
users_collection = db["users"]
role_emails_collection = db["role_emails"]

class OnboardingUpdate(BaseModel):
    selectedCareer: Optional[str] = None
    knownTopics: Optional[List[str]] = None
    unknownTopics: Optional[List[str]] = None
    learningStyle: Optional[str] = None

@router.patch("/me")
async def update_onboarding(request: Request, payload: OnboardingUpdate):
    session = request.state.session
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")

    email = session.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid session")

    update_fields = payload.model_dump(exclude_none=True)
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = users_collection.update_one(
        {"email": email},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Onboarding data saved successfully"}

@router.get("/me")
async def get_current_user(request: Request):
    # Get session from middleware
    session = request.state.session
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    email = session.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get role from session (already validated by login)
    role = session.get("role", "student")
    
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
