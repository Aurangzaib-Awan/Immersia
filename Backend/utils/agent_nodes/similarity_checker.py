# utils/agent_nodes/similarity_checker.py

from difflib import SequenceMatcher
from typing import List, Dict
from pymongo.collection import Collection


def calculate_text_similarity(text1: str, text2: str) -> float:
    """
    Calculate similarity between two strings (0.0 to 1.0).
    1.0 = identical, 0.0 = completely different
    """
    if not text1 or not text2:
        return 0.0
    
    text1_lower = text1.lower().strip()
    text2_lower = text2.lower().strip()
    
    return SequenceMatcher(None, text1_lower, text2_lower).ratio()


def calculate_technologies_overlap(tech_list1: List[str], tech_list2: List[str]) -> float:
    """
    Calculate technology overlap as a percentage.
    Returns 0.0 to 1.0 based on how many technologies match.
    """
    if not tech_list1 or not tech_list2:
        return 0.0
    
    tech1_lower = {t.lower().strip() for t in tech_list1}
    tech2_lower = {t.lower().strip() for t in tech_list2}
    
    if len(tech1_lower) == 0 and len(tech2_lower) == 0:
        return 1.0
    
    intersection = len(tech1_lower & tech2_lower)
    union = len(tech1_lower | tech2_lower)
    
    return intersection / union if union > 0 else 0.0


def find_similar_projects(
    new_project: Dict,
    projects_collection: Collection,
    similarity_threshold: float = 0.75,
    recent_count: int = 20
) -> Dict:
    """
    Check if a newly generated project is too similar to existing ones.
    
    Args:
        new_project:           The newly generated project dict
        projects_collection:   MongoDB projects collection
        similarity_threshold:  Threshold above which projects are considered duplicates (0.0-1.0)
        recent_count:          Number of recent projects to check against
    
    Returns:
        {
            "is_duplicate": bool,
            "similar_project_id": str or None,
            "similarity_score": float,
            "duplicate_reason": str
        }
    """
    
    # Get recent AI-generated projects (to avoid comparing against all projects)
    recent_projects = list(
        projects_collection.find(
            {"curator": "AI Generated"},
            sort=[("created_at", -1)],
            limit=recent_count
        )
    )
    
    if not recent_projects:
        return {
            "is_duplicate": False,
            "similar_project_id": None,
            "similarity_score": 0.0,
            "duplicate_reason": None
        }
    
    new_title = new_project.get("title", "")
    new_desc = new_project.get("description", "")
    new_techs = new_project.get("technologies", [])
    
    highest_similarity = 0.0
    most_similar_project = None
    duplicate_reason = None
    
    for existing_project in recent_projects:
        existing_title = existing_project.get("title", "")
        existing_desc = existing_project.get("description", "")
        existing_techs = existing_project.get("technologies", [])
        
        # Calculate different similarity metrics
        title_sim = calculate_text_similarity(new_title, existing_title)
        desc_sim = calculate_text_similarity(new_desc, existing_desc)
        tech_sim = calculate_technologies_overlap(new_techs, existing_techs)
        
        # Weighted average: title (40%) + description (40%) + technologies (20%)
        combined_similarity = (title_sim * 0.4) + (desc_sim * 0.4) + (tech_sim * 0.2)
        
        # Track the most similar project
        if combined_similarity > highest_similarity:
            highest_similarity = combined_similarity
            most_similar_project = existing_project
            
            # Determine the reason if it's a duplicate
            if highest_similarity >= similarity_threshold:
                if title_sim > 0.8:
                    duplicate_reason = f"Similar title ({title_sim:.2f} match)"
                elif desc_sim > 0.8:
                    duplicate_reason = f"Similar description ({desc_sim:.2f} match)"
                elif tech_sim > 0.8:
                    duplicate_reason = f"Similar technologies ({tech_sim:.2f} match)"
                else:
                    duplicate_reason = f"Overall similarity ({highest_similarity:.2f})"
    
    return {
        "is_duplicate": highest_similarity >= similarity_threshold,
        "similar_project_id": str(most_similar_project["_id"]) if most_similar_project else None,
        "similarity_score": highest_similarity,
        "duplicate_reason": duplicate_reason
    }
