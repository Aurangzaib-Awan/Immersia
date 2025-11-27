from fastapi import APIRouter, HTTPException
from con import client
from models.course import Course
from datetime import datetime, timezone
from bson import ObjectId

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
async def create_courses(course: Course):
    try:
        print("Received data:", course)
        course_dict = course.model_dump()
        course_dict["created_at"] = datetime.now(timezone.utc)
        result = course_collection.insert_one(course_dict)
        return {
            "id": str(result.inserted_id),
            "message": "Course Created Successfully"
        }
    except Exception as e:
        print("Course creation error:", e)
        print("Error type:", type(e)) 
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/courses/{course_id}")
async def update_course(course_id: str, course: Course): 
    try:
        course_dict = course.model_dump()
        course_dict["updated_at"] = datetime.now(timezone.utc)  
        result = course_collection.update_one(
            {"_id": ObjectId(course_id)},
            {"$set": course_dict}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        return {"message": "Course updated successfully"}
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