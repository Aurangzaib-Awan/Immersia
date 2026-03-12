# utils/agent_nodes/skill_gap_node.py

import json
import re
from typing import List, Dict, Set


def calculate_skill_gap(user_profile: Dict, completed_projects: List[Dict]) -> List[str]:
    """
    Calculate the user's target skills (skills yet to learn).

    Args:
        user_profile: dict with 'knownTopics' and 'unknownTopics'
        completed_projects: list of UserProject dicts with status == "completed"

    Returns:
        List of target skills still to learn
    """
    unknown_topics: Set[str] = set(user_profile.get("unknownTopics", []))

    covered_skills: Set[str] = set()
    for proj in completed_projects:
        # Use 'skills' (targeted) as source of truth — skillsLearned is never populated
        covered_skills.update(proj.get("skills", []))

    return list(unknown_topics - covered_skills)


def select_target_skills(
    unknown_topics: List[str],
    known_topics: List[str],
    groq_client  # avoid hard Groq import just for type hint
) -> List[str]:
    """
    Uses Groq to select which unknown skills to target next,
    based on difficulty and what the user already knows.
    """
    if not unknown_topics:
        return []

    prompt = f"""
    A student knows these topics: {known_topics}
    They still need to learn: {unknown_topics}

    Your job is to select the most appropriate next skills to learn.
    Rules:
    - If the next skill is foundational or basic, select 2-3 skills
    - If the next skill is advanced or complex, select only 1 skill
    - Always pick the easiest unknown skills first
    - Only return skills from the "still need to learn" list — do not invent new ones
    - Return ONLY a JSON array of selected skill names, nothing else

    Example output: ["Machine Learning Basics", "Supervised Learning"]
    """

    chat = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "Return only a JSON array of skill names. No markdown, no explanation."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    response_text = chat.choices[0].message.content
    clean = re.sub(
        r"^```(?:json)?\s*|\s*```$", "", response_text.strip(), flags=re.MULTILINE
    ).strip()

    try:
        selected = json.loads(clean)
        if isinstance(selected, list):
            # Filter out any hallucinated skills not in the original list
            valid = [s for s in selected if s in unknown_topics]
            return valid if valid else unknown_topics[:1]
    except json.JSONDecodeError:
        # Groq returned non-JSON — fall back to first unknown topic
        pass

    return unknown_topics[:1]