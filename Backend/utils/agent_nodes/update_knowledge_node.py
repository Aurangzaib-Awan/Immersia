# utils/agent_nodes/update_knowledge_node.py

from typing import List
from pymongo.collection import Collection
from bson import ObjectId


def update_user_knowledge(user_id: str, skills: List[str], users_collection: Collection) -> bool:
    """
    After mentor approves a project, moves the project's targeted skills
    from unknownTopics → knownTopics on the User doc.

    Args:
        user_id: MongoDB user ID (string)
        skills:  skills from user_projects.skills (the targeted skills)
        users_collection: MongoDB Users collection

    Returns:
        True if update succeeded, False otherwise
    """
    if not user_id or not skills:
        return False

    try:
        object_id = ObjectId(user_id)

        # Add skills to knownTopics (no duplicates)
        users_collection.update_one(
            {"_id": object_id},
            {"$addToSet": {"knownTopics": {"$each": skills}}}
        )

        # Remove those skills from unknownTopics
        users_collection.update_one(
            {"_id": object_id},
            {"$pullAll": {"unknownTopics": skills}}  # ✅ $pullAll, not $pull with $in
        )

        return True

    except Exception as e:
        print(f"Error updating knowledge for user {user_id}: {e}")
        return False