# utils/agent_nodes/completed_projects_node.py

from typing import List, Dict, Optional
from pymongo.collection import Collection

def get_completed_projects(user_id: str, user_projects_collection: Collection) -> List[Dict]:
    """
    Fetches all projects for a user from UserProjects collection.

    Returns:
        List of dicts with keys: 'project_id', 'skills_learned', 'status', 'project_title', 'project_description'
        Empty list if no projects found.
    """
    if not user_id:
        # Edge case: empty user_id
        return []

    user_projects_cursor = user_projects_collection.find({"user_id": user_id})

    projects = []
    for proj in user_projects_cursor:
        projects.append({
            "project_id": str(proj.get("project_id", "")),
            "skills_learned": proj.get("skills_learned", []),
            "status": proj.get("status", "pending"),
            "project_title": proj.get("project_title", ""),
            "project_description": proj.get("project_description", "")
        })

    return projects