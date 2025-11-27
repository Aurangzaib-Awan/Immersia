from fastapi import APIRouter, HTTPException
from con import client
from models.course import Course
from datetime import datetime, timezone
from bson import ObjectId
from typing import List

router = APIRouter()
db = client["immersia"]
course_collection = db["courses"]

@router.get("/courses")
async def get_courses():
    try:
        courses = list(course_collection.find())
        for course in courses:
            course["id"] = str(course["_id"])
            del course["_id"]  
        return {"courses": courses}
    except Exception as e:
        print("Get courses error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/courses")
async def create_course(course: Course):
    try:
        print("Received data:", course)
        course_dict = course.model_dump()
        
        # Set timestamps
        course_dict["created_at"] = datetime.now(timezone.utc)
        course_dict["updated_at"] = datetime.now(timezone.utc)
        
        # Ensure all required fields are present
        if not course_dict.get("curator"):
            raise HTTPException(status_code=400, detail="Curator name is required")
        
        # Validate module structure
        if not course_dict.get("modules") or len(course_dict["modules"]) == 0:
            raise HTTPException(status_code=400, detail="At least one module is required")
        
        result = course_collection.insert_one(course_dict)
        return {
            "id": str(result.inserted_id),
            "message": "Course Created Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print("Course creation error:", e)
        print("Error type:", type(e)) 
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/courses/{course_id}")
async def update_course(course_id: str, course: Course): 
    try:
        # Check if course exists
        existing_course = course_collection.find_one({"_id": ObjectId(course_id)})
        if not existing_course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        course_dict = course.model_dump()
        
        # Preserve created_at from existing course and update updated_at
        course_dict["created_at"] = existing_course.get("created_at", datetime.now(timezone.utc))
        course_dict["updated_at"] = datetime.now(timezone.utc)
        
        # Validate required fields
        if not course_dict.get("curator"):
            raise HTTPException(status_code=400, detail="Curator name is required")
        
        if not course_dict.get("modules") or len(course_dict["modules"]) == 0:
            raise HTTPException(status_code=400, detail="At least one module is required")
        
        result = course_collection.update_one(
            {"_id": ObjectId(course_id)},
            {"$set": course_dict}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Course not found or no changes made")
            
        return {"message": "Course updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print("Course update error:", e)  
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/courses/{course_id}") 
async def delete_course(course_id: str):
    try:
        result = course_collection.delete_one({"_id": ObjectId(course_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        return {"message": "Course deleted successfully"}
    except Exception as e:
        print("Delete course error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

# Additional endpoint to get a single course by ID
@router.get("/courses/{course_id}")
async def get_course(course_id: str):
    try:
        course = course_collection.find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        course["id"] = str(course["_id"])
        del course["_id"]
        return course
    except HTTPException:
        raise
    except Exception as e:
        print("Get course error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

# Endpoint to get courses by category
@router.get("/courses/category/{category}")
async def get_courses_by_category(category: str):
    try:
        courses = list(course_collection.find({"category": category}))
        for course in courses:
            course["id"] = str(course["_id"])
            del course["_id"]
        return {"courses": courses}
    except Exception as e:
        print("Get courses by category error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

# Endpoint to get courses by curator
@router.get("/courses/curator/{curator}")
async def get_courses_by_curator(curator: str):
    try:
        courses = list(course_collection.find({"curator": curator}))
        for course in courses:
            course["id"] = str(course["_id"])
            del course["_id"]
        return {"courses": courses}
    except Exception as e:
        print("Get courses by curator error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")