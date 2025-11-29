from fastapi import APIRouter, HTTPException
from con import client
from bson import ObjectId
import traceback

router = APIRouter()

db = client["immersia"]
users_collection = db["users"]
courses_collection = db["courses"]
projects_collection = db["projects"]

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

# ADD THIS DELETE ENDPOINT FOR USER DELETION
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
            print(f"✅ User {user_id} deleted successfully")
            return {"message": "User deleted successfully"}
        else:
            print(f"❌ Failed to delete user {user_id}")
            raise HTTPException(status_code=500, detail="Failed to delete user")
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"❌ Error deleting user {user_id}: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")