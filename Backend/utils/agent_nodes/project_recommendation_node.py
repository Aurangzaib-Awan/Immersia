# utils/agent_nodes/project_recommendation_node.py

import json
import re
from typing import List, Dict
from pymongo.collection import Collection
from datetime import datetime, timezone
from dotenv import load_dotenv
from utils.agent_nodes.similarity_checker import find_similar_projects

load_dotenv()


def recommend_project(
    target_skills: List[str],
    user_profile: Dict,
    projects_collection: Collection,
    client=None
) -> Dict:
    """
    Generates a project using Groq based on target skills.
    Saves it to the projects collection and returns it.
    """

    if not target_skills:
        return {"message": "No skills to learn."}

    # Always generate with Groq — no MongoDB lookup
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
          "tasks": ["task1", "task2", "task3", "task4", "task5"]
        }}
        """

        chat = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Return only JSON. No markdown, no explanation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8
        )

        generated_text = chat.choices[0].message.content
        clean_text = re.sub(
            r"^```(?:json)?\s*|\s*```$", "", generated_text.strip(), flags=re.MULTILINE
        ).strip()

        try:
            parsed = json.loads(clean_text)
        except json.JSONDecodeError:
            return {
                "title": "Generated Project",
                "description": clean_text,
                "technologies": target_skills,
                "tasks": [],
                "_id": None
            }

        project_doc = {
            "title":               parsed.get("title"),
            "description":         parsed.get("description"),
            "technologies":        parsed.get("technologies", []),
            "tasks":               parsed.get("tasks", []),
            "category":            user_profile.get("selectedCareer", "General"),
            "curator":             "AI Generated",
            "difficulty":          "Beginner",
            "duration":            "2-4 weeks",
            "prerequisites":       target_skills,
            "created_at":          datetime.now(timezone.utc),
            "updated_at":          datetime.now(timezone.utc),
        }

        # Check for similarity with recent projects
        similarity_result = find_similar_projects(
            project_doc,
            projects_collection,
            similarity_threshold=0.75,
            recent_count=20
        )

        # If too similar to existing project, reuse the existing one instead
        if similarity_result["is_duplicate"]:
            print(f"[DUPLICATE DETECTED] {similarity_result['duplicate_reason']} "
                  f"(score: {similarity_result['similarity_score']:.2f})")
            
            existing_project = projects_collection.find_one(
                {"_id": similarity_result["similar_project_id"]}
            )
            if existing_project:
                existing_project["_id"] = str(existing_project["_id"])
                return existing_project
        
        # Only save if unique
        inserted = projects_collection.insert_one(project_doc)
        project_doc["_id"] = str(inserted.inserted_id)

        return project_doc

    # Fallback if no Groq client
    return {
        "title": None,
        "description": None,
        "technologies": target_skills,
        "tasks": [],
        "_id": None
    }