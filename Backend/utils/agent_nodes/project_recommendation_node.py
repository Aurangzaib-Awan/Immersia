# utils/agent_nodes/project_recommendation_node.py

import os
import json
import re
from groq import Groq
from dotenv import load_dotenv
from typing import List, Dict
from pymongo.collection import Collection
from datetime import datetime, timezone

load_dotenv()


def recommend_project(
    target_skills: List[str],
    user_profile: Dict,
    projects_collection: Collection,
    client=None
) -> Dict:
    """
    Recommend a project based on target skills.

    Returns strictly raw facts:
        - MongoDB project doc fields
        - Or Groq-generated raw fields
    """

    # Edge case: no target skills
    if not target_skills:
        return {"message": "No skills to learn."}

    # 1️⃣ Try matching existing projects in MongoDB
    query = {
        "$or": [
            {"technologies": {"$in": target_skills}},
            {"prerequisites": {"$in": target_skills}}
        ]
    }

    matched_project = projects_collection.find_one(query)

    if matched_project:
        raw_project = dict(matched_project)
        raw_project["_id"] = str(raw_project.get("_id", ""))
        return raw_project

    # 2️⃣ If no match, generate project with Groq
    if client:

        prompt = f"""
        Generate a software project idea.

        Known topics: {user_profile.get("knownTopics", [])}
        Skills to learn: {target_skills}
        Career path: {user_profile.get("selectedCareer", "")}

        Return ONLY valid JSON with this structure:

        {{
          "title": "Project title",
          "description": "Short description",
          "technologies": ["tech1", "tech2"],
          "tasks": ["task1", "task2", "task3"]
        }}
        """

        chat = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Return only JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4
        )
        # Inside project_recommendation_node after chat completion
        generated_text = chat.choices[0].message.content

        # Remove markdown code blocks
        clean_text = re.sub(r"^```(?:json)?\s*|\s*```$", "", generated_text.strip(), flags=re.MULTILINE).strip()
        # Parse JSON safely
        try:
            generated_project = json.loads(clean_text)
            project_doc = {
            "title": generated_project.get("title"),
            "description": generated_project.get("description"),
            "project_description": generated_project.get("description"),
            "technologies": generated_project.get("technologies", []),
            "tasks": generated_project.get("tasks", []),
            "category": user_profile.get("selectedCareer", "General"),
            "curator": "AI Generated",
            "difficulty": "Beginner",
            "duration": "2-4 weeks",
            "prerequisites": target_skills,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        
            inserted = projects_collection.insert_one(project_doc)
            generated_project["_id"] = str(inserted.inserted_id)

            return generated_project
        
        except json.JSONDecodeError:
            # fallback in case LLM returns invalid JSON
            generated_project = {
                "title": "Generated Project",
                "description": clean_text,
                "technologies": target_skills,
                "tasks": [],
                "_id": None
            }

        return generated_project

    # 3️⃣ Fallback if Groq client unavailable
    return {
        "title": None,
        "description": None,
        "technologies": target_skills,
        "tasks": [],
        "_id": None
    }