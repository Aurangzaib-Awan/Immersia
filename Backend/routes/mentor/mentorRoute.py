from fastapi import APIRouter, HTTPException, Request
from db import client
from models.mentor import MentorActionRequest
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId
import logging
from utils.serializer import serialize_doc
from utils.agent_nodes.update_knowledge_node import update_user_knowledge

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["mentor"])
db = client["immersia"]
submissions_collection = db["project_submissions"]
user_projects_collection = db["user_projects"]
project_quizzes_collection = db["project_quizzes"]
certificates_collection = db["certificates"]
users_collection = db["users"]


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def maybe_issue_certificate(user_id: str, project_id: str):
    """
    Issue a certificate if both quiz is completed AND submission is approved.
    
    Requirements:
    1. Submission must have status="approved"
    2. Quiz must have is_completed=True
    
    Returns:
        dict with certificate details or None if conditions not met
    """
    try:
        logger.info(f"🔍 Certificate check — user: {user_id}, project: {project_id}")

        # ── CONDITION 1: Submission must be approved ──────────────────────────
        submission = submissions_collection.find_one({
            "user_id": user_id, "project_id": project_id, "status": "approved"
        })
        submission_approved = submission is not None
        logger.info(f"  ↳ Submission approved: {submission_approved}")

        # ── CONDITION 2: Quiz must be completed ───────────────────────────────
        quiz = project_quizzes_collection.find_one({
            "user_id": user_id, "project_id": project_id, "is_completed": True
        })
        quiz_completed = quiz is not None
        logger.info(f"  ↳ Quiz completed: {quiz_completed}")

        # ── STRICT GATE: Both must be true ────────────────────────────────────
        if not submission_approved and not quiz_completed:
            logger.warning(f"  ⛔ BLOCKED — submission not approved AND quiz not completed")
            return None

        if not submission_approved:
            logger.warning(f"  ⛔ BLOCKED — quiz passed but submission not yet approved by mentor")
            return None

        if not quiz_completed:
            logger.warning(f"  ⛔ BLOCKED — submission approved but quiz not yet completed")
            return None

        # ── Issue certificate ──────────────────────────────────────────────────
        project = user_projects_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            logger.warning(f"  ⛔ Project {project_id} not found")
            return None

        project_title = project.get("title", project.get("project_title", "Project"))
        technologies = project.get("technologies", [])
        category = project.get("category", "")

        # Check if certificate already exists
        existing_cert = certificates_collection.find_one({
            "user_id": user_id, "project_id": project_id
        })
        if existing_cert:
            logger.info(f"  ↳ Certificate already exists: {existing_cert.get('certificate_id')}")
            return serialize_doc(existing_cert)

        # Create and insert new certificate
        cert_id = f"IMMERSIA-{datetime.now().strftime('%Y%m%d')}-{ObjectId()}"
        cert_doc = {
            "user_id": user_id,
            "project_id": project_id,
            "project_title": project_title,
            "category": category,
            "technologies": technologies,
            "quiz_score": quiz.get("score", 0),
            "issued_at": datetime.now(timezone.utc),
            "certificate_id": cert_id,
        }

        result = certificates_collection.insert_one(cert_doc)
        cert_doc["_id"] = result.inserted_id
        
        logger.info(f"  ✅ Certificate issued: {cert_id}")
        return serialize_doc(cert_doc)

    except Exception as e:
        logger.error(f"❌ Certificate issuance error: {e}", exc_info=True)
        return None


# ============================================================================
# MENTOR ENDPOINTS
# ============================================================================

@router.post("/submissions/{submission_id}/reject")
async def reject_submission(submission_id: str, body: MentorActionRequest):
    """
    Reject a project submission.
    
    - Marks submission as "rejected"
    - Records mentor_id and reason
    - Sets reviewed_at timestamp
    
    Args:
        submission_id: MongoDB ObjectId of the submission
        body: MentorActionRequest with mentor_id and reason
    
    Returns:
        {"message": "Submission rejected"}
    """
    try:
        doc = submissions_collection.find_one({"_id": ObjectId(submission_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid submission_id")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Submission not found")

    submissions_collection.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": {
            "status": "rejected",
            "reviewed_at": datetime.now(timezone.utc),
            "mentor_id": body.mentor_id,
            "reason": body.reason,
        }}
    )
    
    logger.info(f"Submission {submission_id} rejected by mentor {body.mentor_id}")
    return {"message": "Submission rejected"}


@router.post("/submissions/{submission_id}/approve")
async def approve_submission(submission_id: str, body: MentorActionRequest):
    """
    Approve a project submission.
    
    Steps:
    1. Mark submission as "approved"
    2. Update user_project status to "approved"
    3. Promote learned skills from unknownTopics → knownTopics
    4. Issue certificate if quiz also passed
    
    Args:
        submission_id: MongoDB ObjectId of the submission
        body: MentorActionRequest with mentor_id and optional reason
    
    Returns:
        {
            "message": "Submission approved",
            "certificate": <certificate_doc or None>
        }
    """
    try:
        doc = submissions_collection.find_one({"_id": ObjectId(submission_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid submission_id")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Submission not found")

    user_id = doc.get("user_id", "")
    project_id = doc.get("project_id", "")

    logger.info(f"Approving submission {submission_id}: user={user_id}, project={project_id}")

    # 1. Mark submission as approved
    submissions_collection.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": {
            "status": "approved",
            "reviewed_at": datetime.now(timezone.utc),
            "mentor_id": body.mentor_id,
            "reason": body.reason,
        }}
    )

    # 2. Mark the user_project as APPROVED
    try:
        update_result = user_projects_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": {
                "status": "approved",
                "submission_id": doc.get("_id"),
                "submission_approved": True,
                "submission_approved_at": datetime.now(timezone.utc),
                "mentor_id": body.mentor_id,
            }}
        )
        if update_result.matched_count > 0:
            logger.info(f"✅ Project {project_id} status updated to APPROVED")
        else:
            logger.warning(f"⚠️ Project {project_id} not found for update")
    except Exception as e:
        logger.error(f"❌ Failed to update user_project {project_id}: {e}")

    # 3. Move targeted skills from unknownTopics → knownTopics
    try:
        user_proj = user_projects_collection.find_one({"_id": ObjectId(project_id)})
        if user_proj:
            skills_to_promote = user_proj.get("skills", [])
            if skills_to_promote:
                update_user_knowledge(user_id, skills_to_promote, users_collection)
                logger.info(f"Updated knowledge for user {user_id}")
    except Exception as e:
        logger.warning(f"Could not update knowledge for user {user_id}: {e}")

    # 4. Issue certificate if quiz also passed
    certificate = maybe_issue_certificate(user_id, project_id)

    logger.info(f"✅ Submission {submission_id} approved successfully")
    return {"message": "Submission approved", "certificate": certificate}


@router.get("/submissions")
async def get_all_submissions(
    status: Optional[str] = None,
    user_id: Optional[str] = None,
    project_id: Optional[str] = None,
    limit: int = 50
):
    """
    Fetch submissions with optional filtering.
    
    Query Parameters:
        status: Filter by status (pending, approved, rejected)
        user_id: Filter by user_id
        project_id: Filter by project_id
        limit: Maximum number of results (default: 50)
    
    Returns:
        {"submissions": [<submission_docs>]}
    """
    try:
        query = {}
        if status:
            query["status"] = status
        if user_id:
            query["user_id"] = user_id
        if project_id:
            query["project_id"] = project_id

        submissions = list(submissions_collection.find(query).limit(limit))

        def serialize_for_json(doc):
            if isinstance(doc, dict):
                return {k: serialize_for_json(v) for k, v in doc.items()}
            elif isinstance(doc, list):
                return [serialize_for_json(item) for item in doc]
            elif isinstance(doc, ObjectId):
                return str(doc)
            else:
                return doc

        submissions = [serialize_for_json(s) for s in submissions]
        logger.info(f"Found {len(submissions)} submissions")
        return {"submissions": submissions}

    except Exception as e:
        logger.error(f"Error fetching submissions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/submissions/{submission_id}")
async def get_submission_details(submission_id: str):
    """
    Fetch details of a specific submission.
    
    Returns:
        <submission_doc with full details>
    """
    try:
        submission = submissions_collection.find_one({"_id": ObjectId(submission_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid submission_id")

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    def serialize_for_json(doc):
        if isinstance(doc, dict):
            return {k: serialize_for_json(v) for k, v in doc.items()}
        elif isinstance(doc, list):
            return [serialize_for_json(item) for item in doc]
        elif isinstance(doc, ObjectId):
            return str(doc)
        else:
            return doc

    return serialize_for_json(submission)
