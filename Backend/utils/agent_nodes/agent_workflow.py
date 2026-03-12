# utils/agent_nodes/agent_workflow.py

import os
from db import client as mongo_client
from groq import Groq
from dotenv import load_dotenv

from utils.agent_nodes.skill_gap_node import select_target_skills
from utils.agent_nodes import (
    state,
    user_profile_node,
    completed_projects_node,
    skill_gap_node,
    project_recommendation_node,
    store_user_project_node,
)

load_dotenv()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

db                       = mongo_client["immersia"]
users_collection         = db["users"]
user_projects_collection = db["user_projects"]
projects_collection      = db["projects"]


def run_learning_cycle(user_id: str):
    """
    Executes a full learning cycle for a single user:
        1. Fetch profile
        2. Fetch completed projects
        3. Calculate skill gap
        4. Select target skills
        5. Recommend a project
        6. Store project with correct target skills
    """

    state.clear_state()

    # 1. Fetch user profile
    user_profile = user_profile_node.get_user_profile(user_id, users_collection)
    if not user_profile:
        print(f"User {user_id} not found.")
        return None

    state.set_state("user_profile", user_profile)

    # 2. Fetch completed projects (status=completed only)
    completed_projects = completed_projects_node.get_completed_projects(user_id, user_projects_collection)
    state.set_state("completed_projects", completed_projects)

    # 3. Calculate skill gap
    target_skills = skill_gap_node.calculate_skill_gap(user_profile, completed_projects)
    state.set_state("target_skills", target_skills)

    if not target_skills:
        print("User has no skills left to learn. Learning path complete.")
        return None

    # 4. Select which skills to target next
    selected_skills = select_target_skills(
        target_skills,
        user_profile.get("knownTopics", []),
        groq_client
    )
    state.set_state("selected_skills", selected_skills)

    # 5. Recommend a project for those skills
    recommended_project = project_recommendation_node.recommend_project(
        selected_skills,
        user_profile,
        projects_collection,
        groq_client
    )
    state.set_state("recommended_project", recommended_project)

    # 6. Store project — pass selected_skills so user_projects.skills is correct
    stored = store_user_project_node.store_project(
        user_id,
        recommended_project,
        user_projects_collection,
        target_skills=selected_skills   # ✅ was missing — caused skills to store as technologies
    )

    if stored:
        print(f"Project stored successfully for user {user_id}.")
    else:
        print(f"Failed to store project for user {user_id}.")

    return recommended_project