from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId


class MentorActionRequest(BaseModel):
    """Request body for mentor actions (approve/reject submission)"""
    mentor_id: Optional[str] = None
    reason: Optional[str] = None


class MentorReview(BaseModel):
    """Schema for mentor review stored in database"""
    mentor_id: str
    status: str  # "approved" or "rejected"
    reason: Optional[str] = None
    reviewed_at: datetime
    submission_id: Optional[str] = None


class SubmissionReview(BaseModel):
    """Complete submission review information"""
    submission_id: str
    user_id: str
    project_id: str
    mentor_id: str
    status: str  # "pending", "approved", "rejected"
    reason: Optional[str] = None
    reviewed_at: Optional[datetime] = None
