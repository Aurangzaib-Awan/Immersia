# utils/agent_nodes/store_user_project_node.py

from typing import Dict
from pymongo.collection import Collection

def store_project(user_id: str, project: Dict, user_projects_collection: Collection) -> bool:
    """
    Stores the recommended or generated project for a user in UserProjects collection.

    Args:
        user_id: the MongoDB user ID
        project: dict representing the project
        user_projects_collection: MongoDB UserProjects collection

    Returns:
        True if inserted successfully, False otherwise
    """
    if not user_id or not project:
        return False

    doc = {
        "user_id": user_id,
        "project_id": project.get("project_id"),
        "project_title": project.get("project_title", "Untitled Project"),
        "project_description": project.get("project_description", ""),
        "skills_learned": project.get("skills_learned", []),
        "tasks": project.get("tasks", []),
        "learning_outcomes": project.get("learning_outcomes", ""),  # optional
        "status": "pending"
    }

    try:
        user_projects_collection.insert_one(doc)
        return True
    except Exception as e:
        print(f"Error storing project for user {user_id}: {e}")
        return False