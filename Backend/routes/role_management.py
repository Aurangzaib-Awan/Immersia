from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from con import client
from bson import ObjectId
from datetime import datetime
from typing import Optional

router = APIRouter()

db = client["immersia"]
role_emails_collection = db["role_emails"]

class RoleEmailModel(BaseModel):
    email: str
    role: str  # "admin", "hr", "mentor"
    is_verified: bool = True

class UpdateRoleEmailModel(BaseModel):
    is_verified: Optional[bool] = None
    role: Optional[str] = None

# Get all role emails (admin only)
@router.get("/admin/role-emails")
async def get_all_role_emails(role: Optional[str] = None, verified_only: bool = False):
    try:
        query = {}
        if role:
            query["role"] = role
        if verified_only:
            query["is_verified"] = True
            
        role_emails = role_emails_collection.find(query).sort("email", 1)
        emails_list = []
        
        for email in role_emails:
            email["_id"] = str(email["_id"])
            emails_list.append(email)
            
        return {
            "role_emails": emails_list,
            "total": len(emails_list)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching role emails: {str(e)}")

# Add new role email (admin only)
@router.post("/admin/role-emails")
async def add_role_email(role_email: RoleEmailModel):
    try:
        # Check if email already exists
        existing_email = role_emails_collection.find_one({"email": role_email.email})
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists in role system")
        
        email_document = {
            "email": role_email.email,
            "role": role_email.role,
            "is_verified": role_email.is_verified,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = role_emails_collection.insert_one(email_document)
        
        return {
            "message": "Role email added successfully",
            "email_id": str(result.inserted_id),
            "email": role_email.email,
            "role": role_email.role,
            "is_verified": role_email.is_verified
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding role email: {str(e)}")

# Update role email (admin only)
@router.put("/admin/role-emails/{email}")
async def update_role_email(email: str, update_data: UpdateRoleEmailModel):
    try:
        # Find role email
        role_email = role_emails_collection.find_one({"email": email})
        if not role_email:
            raise HTTPException(status_code=404, detail="Role email not found")
        
        update_fields = {"updated_at": datetime.utcnow()}
        if update_data.is_verified is not None:
            update_fields["is_verified"] = update_data.is_verified
        if update_data.role:
            update_fields["role"] = update_data.role
        
        result = role_emails_collection.update_one(
            {"email": email},
            {"$set": update_fields}
        )
        
        if result.modified_count == 1:
            return {"message": "Role email updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update role email")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating role email: {str(e)}")

# Delete role email (admin only)
@router.delete("/admin/role-emails/{email}")
async def delete_role_email(email: str):
    try:
        result = role_emails_collection.delete_one({"email": email})
        
        if result.deleted_count == 1:
            return {"message": "Role email deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Role email not found")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting role email: {str(e)}")

# Check user role (public endpoint)
@router.get("/check-role/{email}")
async def check_user_role(email: str):
    try:
        role_data = role_emails_collection.find_one({
            "email": email,
            "is_verified": True
        })
        
        if role_data:
            return {
                "has_special_role": True,
                "role": role_data["role"],
                "email": email,
                "is_verified": True
            }
        else:
            return {
                "has_special_role": False,
                "role": "student",
                "email": email,
                "is_verified": False
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking user role: {str(e)}")