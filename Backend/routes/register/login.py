from fastapi import HTTPException, APIRouter
from passlib.context import CryptContext
from auth import create_access_token
from con import client
from models.login_model import Login_Model

router = APIRouter()

db = client["immersia"]
users_collection = db["users"]
role_emails_collection = db["role_emails"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_pwd(plain_pwd, hashed):
    return pwd_context.verify(plain_pwd, hashed)

# Initialize role emails collection with sample data
async def initialize_role_emails():
    # Check if collection is empty, then insert sample data
    if role_emails_collection.count_documents({}) == 0:
        sample_roles = [
            # Admin emails
            {"email": "admin@immersia.com", "role": "admin", "is_verified": True},
            
            # HR emails (verified)
            {"email": "hr@immersia.com", "role": "hr", "is_verified": True},
            
            # Mentor emails (verified)
            {"email": "mentor@immersia.com", "role": "mentor", "is_verified": True},
            
            # Pending verification HR emails
            {"email": "newhr@company.com", "role": "hr", "is_verified": False},
        ]
        role_emails_collection.insert_many(sample_roles)

@router.post("/login")
async def login(user: Login_Model):
    try:
        # Initialize role emails if collection is empty
        await initialize_role_emails()
        
        temp_user = users_collection.find_one({"email": user.email})

        if not temp_user:
            raise HTTPException(status_code=400, detail="User not found")
    
        if not verify_pwd(user.password, temp_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid password")
        
        # Check role from role_emails collection
        role_data = role_emails_collection.find_one({
            "email": user.email,
            "is_verified": True  # Only consider verified role emails
        })
        
        if role_data:
            # User has a special role (admin, hr, mentor)
            role = role_data["role"]
        else:
            # Regular user - check existing role or default to "student"
            role = temp_user.get("role", "student")
        
        # Update user role in users collection to keep it consistent
        users_collection.update_one(
            {"email": user.email},
            {"$set": {"role": role}}
        )
        
        # Create token with role information
        token_payload = {
            "email": user.email, 
            "role": role,
            "is_admin": role == "admin",
            "is_hr": role == "hr",
            "is_mentor": role == "mentor"
        }
        
        token = create_access_token(token_payload)
        
        return {
            "token": token,
            "token_type": "bearer",
            "user": {
                "email": user.email,
                "role": role,
                "is_admin": role == "admin",
                "is_hr": role == "hr",
                "is_mentor": role == "mentor"
            }
        }
        
    except Exception as e:
        print("login error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")