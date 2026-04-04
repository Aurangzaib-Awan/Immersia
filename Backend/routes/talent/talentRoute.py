# routes/talent/talentRoute.py
from fastapi import APIRouter, HTTPException
from db import client
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
db = client["immersia"]

certificates_collection  = db["certificates"]
users_collection         = db["users"]
user_projects_collection = db["user_projects"]


def _get_user_doc(user_id: str):
    """Try every possible way to find the user document."""
    # Try ObjectId lookup
    try:
        doc = users_collection.find_one({"_id": ObjectId(user_id)})
        if doc:
            logger.info(f"✅ Found user by ObjectId: {user_id}")
            return doc
    except Exception:
        pass

    # Try string _id
    doc = users_collection.find_one({"_id": user_id})
    if doc:
        logger.info(f"✅ Found user by string _id: {user_id}")
        return doc

    # Try email field (in case user_id is stored as email)
    doc = users_collection.find_one({"email": user_id})
    if doc:
        logger.info(f"✅ Found user by email: {user_id}")
        return doc

    logger.warning(f"❌ User not found for user_id: {user_id}")
    return None


def _get_name(user_doc: dict) -> str:
    """Extract the best available name from user document."""
    if not user_doc:
        return "Anonymous"
    # ✅ Try every possible field name — fullname is what your User model stores
    name = (
        user_doc.get("fullname") or
        user_doc.get("full_name") or
        user_doc.get("name") or
        user_doc.get("username") or
        ""
    )
    logger.info(f"Name resolved: '{name}' from fields: fullname={user_doc.get('fullname')}, name={user_doc.get('name')}")
    return name if name.strip() else "Anonymous"


def _infer_title(skills: list[str]) -> str:
    skills_lower = [s.lower() for s in skills]
    if any(s in skills_lower for s in ["tensorflow", "pytorch", "scikit-learn", "pandas", "machine learning"]):
        return "Machine Learning Engineer"
    if any(s in skills_lower for s in ["react", "vue", "angular", "next.js", "frontend"]):
        if any(s in skills_lower for s in ["node.js", "django", "fastapi", "express", "backend"]):
            return "Full Stack Developer"
        return "Frontend Developer"
    if any(s in skills_lower for s in ["node.js", "django", "fastapi", "flask", "express"]):
        return "Backend Developer"
    if any(s in skills_lower for s in ["aws", "azure", "gcp", "docker", "kubernetes"]):
        return "Cloud / DevOps Engineer"
    if any(s in skills_lower for s in ["figma", "ux", "ui", "design"]):
        return "UX/UI Designer"
    if any(s in skills_lower for s in ["python", "sql", "data"]):
        return "Data Scientist"
    return "Software Developer"


# ============================================================================
# GET /api/talent
# ============================================================================
@router.get("/api/talent")
async def get_certified_talent():
    try:
        all_certs = list(certificates_collection.find())

        # Group certificates by user_id
        cert_map: dict[str, list] = {}
        for cert in all_certs:
            uid = cert.get("user_id", "")
            if not uid:
                continue
            if uid not in cert_map:
                cert_map[uid] = []
            cert_map[uid].append({
                "certificate_id": cert.get("certificate_id", ""),
                "project_title":  cert.get("project_title", ""),
                "category":       cert.get("category", ""),
                "technologies":   cert.get("technologies", []),
                "quiz_score":     cert.get("quiz_score", 0),
                "issued_at":      cert.get("issued_at", "").isoformat()
                                  if hasattr(cert.get("issued_at", ""), "isoformat")
                                  else str(cert.get("issued_at", "")),
            })

        if not cert_map:
            return {"talent": []}

        talent_list = []
        for user_id, certs in cert_map.items():
            user_doc = _get_user_doc(user_id)

            all_skills = set()
            for cert in certs:
                for tech in cert.get("technologies", []):
                    all_skills.add(tech)

            name = _get_name(user_doc)
            logger.info(f"Talent entry — user_id: {user_id}, resolved name: '{name}'")

            talent_list.append({
                "user_id":         user_id,
                "name":            name,
                "email":           user_doc.get("email", "") if user_doc else "",
                "bio":             (user_doc.get("bio") if user_doc else None) or
                                   f"Certified professional with {len(certs)} verified project{'s' if len(certs) > 1 else ''}.",
                "skills":          list(all_skills),
                "location":        user_doc.get("location", "") if user_doc else "",
                "phone":           user_doc.get("phone", "") if user_doc else "",
                "availability":    user_doc.get("availability", "Open to opportunities") if user_doc else "Open to opportunities",
                "expected_salary": user_doc.get("expected_salary", "") if user_doc else "",
                "education":       user_doc.get("education", "") if user_doc else "",
                "experience":      user_doc.get("experience", []) if user_doc else [],
                "certifications":  certs,
                "cert_count":      len(certs),
                "is_verified":     True,
            })

        talent_list.sort(key=lambda x: x["cert_count"], reverse=True)
        return {"talent": talent_list}

    except Exception as e:
        logger.error(f"get_certified_talent error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


# ============================================================================
# GET /api/talent/{user_id}
# ============================================================================
@router.get("/api/talent/{user_id}")
async def get_talent_profile(user_id: str):
    try:
        certs = list(certificates_collection.find({"user_id": user_id}))
        if not certs:
            raise HTTPException(status_code=404, detail="Talent not found or has no certificates")

        user_doc = _get_user_doc(user_id)

        all_skills = set()
        serialized_certs = []
        for cert in certs:
            for tech in cert.get("technologies", []):
                all_skills.add(tech)
            serialized_certs.append({
                "certificate_id": cert.get("certificate_id", ""),
                "project_title":  cert.get("project_title", ""),
                "category":       cert.get("category", ""),
                "technologies":   cert.get("technologies", []),
                "quiz_score":     cert.get("quiz_score", 0),
                "issued_at":      cert.get("issued_at", "").isoformat()
                                  if hasattr(cert.get("issued_at", ""), "isoformat")
                                  else str(cert.get("issued_at", "")),
            })

        name = _get_name(user_doc)
        logger.info(f"Profile — user_id: {user_id}, resolved name: '{name}'")

        return {
            "user_id":         user_id,
            "name":            name,
            "email":           user_doc.get("email", "") if user_doc else "",
            "bio":             (user_doc.get("bio") if user_doc else None) or
                               f"Certified professional with {len(certs)} verified project{'s' if len(certs) > 1 else ''}.",
            "skills":          list(all_skills),
            "location":        user_doc.get("location", "") if user_doc else "",
            "phone":           user_doc.get("phone", "") if user_doc else "",
            "availability":    user_doc.get("availability", "Open to opportunities") if user_doc else "Open to opportunities",
            "expected_salary": user_doc.get("expected_salary", "") if user_doc else "",
            "education":       user_doc.get("education", "") if user_doc else "",
            "experience":      user_doc.get("experience", []) if user_doc else [],
            "certifications":  serialized_certs,
            "cert_count":      len(serialized_certs),
            "is_verified":     True,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"get_talent_profile error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")