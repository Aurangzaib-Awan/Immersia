# utils/agent_nodes/update_knowledge_node.py

from typing import List
from pymongo.collection import Collection

def update_user_knowledge(user_id: str, skills_learned: List[str], users_collection: Collection) -> bool:
    """
    Updates user's knownTopics and unknownTopics after completing a project.

    Args:
        user_id: MongoDB user ID
        skills_learned: list of skills learned in the completed project
        users_collection: MongoDB Users collection

    Returns:
        True if update succeeded, False otherwise
    """
    if not user_id or not skills_learned:
        return False

    try:
        # Add new skills to knownTopics
        users_collection.update_one(
            {"_id": user_id},
            {"$addToSet": {"knownTopics": {"$each": skills_learned}}}
        )

        # Remove learned skills from unknownTopics
        users_collection.update_one(
            {"_id": user_id},
            {"$pull": {"unknownTopics": {"$in": skills_learned}}}
        )

        return True
    except Exception as e:
        print(f"Error updating knowledge for user {user_id}: {e}")
        return False