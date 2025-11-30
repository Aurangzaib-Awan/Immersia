from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from con import client
from bson import ObjectId
import traceback
import bcrypt

router = APIRouter()

db = client["immersia"]
users_collection = db["users"]
courses_collection = db["courses"]
projects_collection = db["projects"]

# Add the ChangePasswordModel
class ChangePasswordModel(BaseModel):
    current_password: str
    new_password: str

# Simple function to get current user
async def get_current_user():
    # For now, we'll use the admin email directly
    # You might want to get this from the JWT token in a real implementation
    return {"email": "admin@immersia.com"}

@router.post("/change-password")
async def change_password(password_data: ChangePasswordModel, current_user: dict = Depends(get_current_user)):
    try:
        print(f"🔄 Changing password for user: {current_user['email']}")
        
        # Find the user
        user = users_collection.find_one({"email": current_user['email']})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        print(f"🔍 Found user: {user['email']}")
        
        # Verify current password
        current_password_bytes = password_data.current_password.encode('utf-8')
        stored_password_bytes = user['password'].encode('utf-8')
        
        if not bcrypt.checkpw(current_password_bytes, stored_password_bytes):
            print("❌ Current password is incorrect")
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Hash new password
        hashed_new_password = bcrypt.hashpw(password_data.new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Update password in database
        result = users_collection.update_one(
            {"email": current_user['email']},
            {"$set": {"password": hashed_new_password}}
        )
        
        if result.modified_count == 1:
            print("✅ Password updated successfully")
            return {"message": "Password changed successfully"}
        else:
            print("❌ Failed to update password in database")
            raise HTTPException(status_code=500, detail="Failed to update password")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error changing password: {str(e)}")
        print(f"📋 Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/admin/users")
async def get_all_users():
    try:
        users = users_collection.find({}, {"password": 0})
        users_list = list(users)
        print(f"✅ Found {len(users_list)} users")
        
        # Debug: Print the first user's structure
        if users_list:
            print("📋 First user structure:", users_list[0])
        
        # Convert ObjectId to string for JSON serialization
        for user in users_list:
            if "_id" in user:
                user["_id"] = str(user["_id"])
                
        return {"users": users_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/admin/stats")
async def get_dashboard_stats():
    try:
        # Get counts from all collections
        users_count = users_collection.count_documents({})
        courses_count = courses_collection.count_documents({})
        projects_count = projects_collection.count_documents({})
        
        return {
            "totalUsers": users_count,
            "totalCourses": courses_count,
            "totalProjects": projects_count
        }
    except Exception as e:
        print("Error fetching stats:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

# DELETE endpoint for user deletion
@router.delete("/admin/users/{user_id}")
def delete_user(user_id: str):
    try:
        print(f"🔍 Attempting to delete user with ID: {user_id}")
        
        # Check if user_id is a valid ObjectId
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        # Check if user exists
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete user
        result = users_collection.delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count == 1:
            print(f"User {user_id} deleted successfully")
            return {"message": "User deleted successfully"}
        else:
            print(f"Failed to delete user {user_id}")
            raise HTTPException(status_code=500, detail="Failed to delete user")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"error deleting user {user_id}: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")