# utils/agent_nodes/completed_projects_node.py

from typing import List, Dict
from pymongo.collection import Collection


def get_completed_projects(user_id: str, user_projects_collection: Collection) -> List[Dict]:
    """
    Fetches all COMPLETED projects for a user from the UserProjects collection.

    Returns:
        List of dicts with keys: project_id, skills, skillsLearned, status,
        project_title, project_description
    """
    if not user_id:
        return []

    # ✅ Only fetch completed projects — pending ones haven't been learned yet
    cursor = user_projects_collection.find({
        "user_id": user_id,
        "status":  "completed"
    })

    projects = []
    for proj in cursor:
        projects.append({
            "project_id":          str(proj.get("_id", "")),
            "skills":              proj.get("skills", []),          # targeted skills
            "skillsLearned":       proj.get("skillsLearned", []),   # ✅ correct key
            "status":              proj.get("status", "pending"),
            "project_title":       proj.get("project_title", ""),
            "project_description": proj.get("project_description", ""),
        })

    return projects