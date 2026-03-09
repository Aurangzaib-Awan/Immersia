# utils/agent_nodes/user_profile_node.py

from typing import Optional, Dict
from pymongo.collection import Collection
from bson import ObjectId

# Function to fetch user profile
def get_user_profile(user_id: str, users_collection: Collection) -> Optional[Dict]:
    """
    Fetches user profile from MongoDB Users collection.

    Returns:
        dict with keys: 'knownTopics', 'unknownTopics', 'learningStyle', 'selectedCareer'
        or None if user not found.
    """
    if not ObjectId.is_valid(user_id):
        # Invalid ObjectId
        return None

    user_doc = users_collection.find_one({"_id": ObjectId(user_id)})

    if not user_doc:
        # User not found
        return None

    # Ensure all keys exist, fallback to defaults
    user_profile = {
        "knownTopics": user_doc.get("knownTopics", []),
        "unknownTopics": user_doc.get("unknownTopics", []),
        "learningStyle": user_doc.get("learningStyle", "project"),
        "selectedCareer": user_doc.get("selectedCareer", None)
    }

    # Edge case: if unknownTopics empty but knownTopics also empty, warn (optional)
    if not user_profile["knownTopics"] and not user_profile["unknownTopics"]:
        print(f"Warning: User {user_id} has no topics defined.")

    return user_profile