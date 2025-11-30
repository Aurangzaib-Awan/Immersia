from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from con import client
from bson import ObjectId
import bcrypt
from jose import JWTError, jwt
from typing import Optional
from auth import SECRET_KEY, ALGORITHM

router = APIRouter()

db = client["immersia"]
users_collection = db["users"]
courses_collection = db["courses"]
projects_collection = db["projects"]

class ChangePasswordModel(BaseModel):
    current_password: str
    new_password: str

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error decoding token: {str(e)}")

@router.post("/change-password")
async def change_password(
    password_data: ChangePasswordModel, 
    current_user: dict = Depends(get_current_user)
):
    try:
        current_password_bytes = password_data.current_password.encode('utf-8')
        stored_password_bytes = current_user['password'].encode('utf-8')
        
        if not bcrypt.checkpw(current_password_bytes, stored_password_bytes):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        hashed_new_password = bcrypt.hashpw(
            password_data.new_password.encode('utf-8'), 
            bcrypt.gensalt()
        ).decode('utf-8')
        
        result = users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"password": hashed_new_password}}
        )
        
        if result.modified_count == 1:
            return {"message": "Password changed successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update password")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/admin/users")
async def get_all_users():
    try:
        users = users_collection.find({}, {"password": 0})
        users_list = list(users)
        
        for user in users_list:
            if "_id" in user:
                user["_id"] = str(user["_id"])
                
        return {"users": users_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/admin/stats")
async def get_dashboard_stats():
    try:
        users_count = users_collection.count_documents({})
        courses_count = courses_collection.count_documents({})
        projects_count = projects_collection.count_documents({})
        
        return {
            "totalUsers": users_count,
            "totalCourses": courses_count,
            "totalProjects": projects_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/admin/users/{user_id}")
def delete_user(user_id: str):
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        result = users_collection.delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count == 1:
            return {"message": "User deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete user")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")