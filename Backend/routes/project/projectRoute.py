from fastapi import APIRouter, HTTPException
from con import client
from models.projects import Project
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter()
db = client["immersia"]
project_collection = db["projects"]

@router.get("/projects")
async def get_projects():
    try:
        projects = list(project_collection.find())
        for project in projects:
            project["id"] = str(project["_id"])
            del project["_id"]  
        return {"projects": projects}
    except Exception as e:
        print("Get projects error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/projects")
async def create_project(project: Project):
    try:
        print("Received project data:", project)
        project_dict = project.model_dump()
        
        # Set timestamps
        project_dict["created_at"] = datetime.now(timezone.utc)
        project_dict["updated_at"] = datetime.now(timezone.utc)
        
        # Validate required fields
        if not project_dict.get("curator"):
            raise HTTPException(status_code=400, detail="Curator name is required")
        
        if not project_dict.get("technologies") or len(project_dict["technologies"]) == 0:
            raise HTTPException(status_code=400, detail="At least one technology is required")
        
        result = project_collection.insert_one(project_dict)
        return {
            "id": str(result.inserted_id),
            "message": "Project Created Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print("Project creation error:", e)
        print("Error type:", type(e)) 
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/projects/{project_id}")
async def update_project(project_id: str, project: Project): 
    try:
        # Check if project exists
        existing_project = project_collection.find_one({"_id": ObjectId(project_id)})
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project_dict = project.model_dump()
        
        # Preserve created_at from existing project and update updated_at
        project_dict["created_at"] = existing_project.get("created_at", datetime.now(timezone.utc))
        project_dict["updated_at"] = datetime.now(timezone.utc)
        
        # Validate required fields
        if not project_dict.get("curator"):
            raise HTTPException(status_code=400, detail="Curator name is required")
        
        if not project_dict.get("technologies") or len(project_dict["technologies"]) == 0:
            raise HTTPException(status_code=400, detail="At least one technology is required")
        
        result = project_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": project_dict}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Project not found or no changes made")
            
        return {"message": "Project updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print("Project update error:", e)  
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/projects/{project_id}") 
async def delete_project(project_id: str):
    try:
        result = project_collection.delete_one({"_id": ObjectId(project_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"message": "Project deleted successfully"}
    except Exception as e:
        print("Delete project error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    try:
        project = project_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project["id"] = str(project["_id"])
        del project["_id"]
        return project
    except HTTPException:
        raise
    except Exception as e:
        print("Get project error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/projects/category/{category}")
async def get_projects_by_category(category: str):
    try:
        projects = list(project_collection.find({"category": category}))
        for project in projects:
            project["id"] = str(project["_id"])
            del project["_id"]
        return {"projects": projects}
    except Exception as e:
        print("Get projects by category error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/projects/difficulty/{difficulty}")
async def get_projects_by_difficulty(difficulty: str):
    try:
        projects = list(project_collection.find({"difficulty": difficulty}))
        for project in projects:
            project["id"] = str(project["_id"])
            del project["_id"]
        return {"projects": projects}
    except Exception as e:
        print("Get projects by difficulty error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")