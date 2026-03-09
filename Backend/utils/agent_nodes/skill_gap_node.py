# utils/agent_nodes/skill_gap_node.py

from typing import List, Dict, Set

def calculate_skill_gap(user_profile: Dict, completed_projects: List[Dict]) -> List[str]:
    """
    Calculate the user's target skills (skills yet to learn).
    
    Args:
        user_profile: dict with 'knownTopics' and 'unknownTopics'
        completed_projects: list of dicts, each with 'skills_learned'
    
    Returns:
        List of target skills still to learn
    """
    unknown_topics: Set[str] = set(user_profile.get("unknownTopics", []))
    
    # Collect all skills already learned from completed projects
    learned_skills: Set[str] = set()
    for proj in completed_projects:
        learned_skills.update(proj.get("skills_learned", []))
    
    # Skill gap = unknownTopics - learned_skills
    target_skills = list(unknown_topics - learned_skills)
    
    return target_skills