# routes/talent.py
from fastapi import APIRouter

router = APIRouter()

# Simple endpoint to check if user is HR (you can expand this later)
@router.get("/talent/check-hr/{email}")
async def check_hr_status(email: str):
    # For now, we'll use a simple check - you can replace this with database check later
    hr_emails = {
        "hr@techcompany.com",
        "talent@startup.com", 
        "recruitment@corporation.com",
        "admin@immersia.com"  # Admin can also access HR features
    }
    
    return {
        "is_hr": email in hr_emails,
        "email": email
    }