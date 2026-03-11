# utils/agent_nodes/skill_gap_node.py

import json
import re
from groq import Groq
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

def select_target_skills(unknown_topics: List[str], known_topics: List[str], groq_client: Groq) -> List[str]:
    """
    Uses Groq to intelligently select how many and which unknown skills
    to target next based on their difficulty.
    """
    prompt = f"""
    A student knows these topics: {known_topics}
    They still need to learn: {unknown_topics}

    Your job is to select the most appropriate next skills to learn.
    Rules:
    - If the next skill is foundational or basic, select 2-3 skills
    - If the next skill is advanced or complex, select only 1 skill
    - Always pick the easiest unknown skills first
    - Return ONLY a JSON array of selected skill names, nothing else

    Example output: ["Machine Learning Basics", "Supervised Learning"]
    """

    chat = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "Return only a JSON array of skill names."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    response_text = chat.choices[0].message.content
    clean = re.sub(r"^```(?:json)?\s*|\s*```$", "", response_text.strip(), flags=re.MULTILINE).strip()

    try:
        selected = json.loads(clean)
        if isinstance(selected, list):
            return selected
    except json.JSONDecodeError:
        pass

    # Fallback: return first unknown topic only
    return unknown_topics[:1]