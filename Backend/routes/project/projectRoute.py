from fastapi import APIRouter, HTTPException
from db import client
from models.projects import Project, UserProject, ProjectQuiz, QuizQuestion
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
import os
from dotenv import load_dotenv
import logging
from utils.serializer import serialize_doc

# Configure logger
logger = logging.getLogger(__name__)

# load environment variables (including Gemini API key)
load_dotenv()

# initialize the Google Generative AI client when needed
import subprocess, sys

# For google-generativeai 0.8.6 (old API - no Client class)
# We'll use the module-level API instead
GeminiClient = None
try:
    import google.generativeai as genai
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
        GeminiClient = genai  # Use module directly
        logger.info("Google Generative AI configured successfully")
except ImportError:
    # library not installed; we can attempt to install it on-the-fly
    try:
        logger.warning("google-generativeai not found, installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "google-generativeai"])
        import google.generativeai as genai
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            GeminiClient = genai
            logger.info("Successfully installed and configured google-generativeai")
    except Exception as install_exc:
        logger.error(f"Failed to install google-generativeai: {install_exc}")
        GeminiClient = None  # will trigger error later


router = APIRouter()
db = client["immersia"]
project_collection = db["projects"]

# collection for user-generated projects (via Gemini)
user_projects_collection = db["user_projects"]
# quizzes generated for projects
project_quizzes_collection = db["project_quizzes"]


class QuizSubmission(BaseModel):
    quiz_id: str
    user_id: str
    user_answers: List[dict]  # {question_id, selected_answer}

class GenerateQuizRequest(BaseModel):
    project_id: str
    user_id: str


class GenerateProjectRequest(BaseModel):
    user_id: str
    skills: List[str]
    difficulty: Optional[str] = None
    # additional fields can be added if needed


@router.post("/api/generate-project")
async def generate_project(request: GenerateProjectRequest):
    """Use Gemini to generate a learning project based on provided skills.

    Saves result to `user_projects` and returns the stored document (with id).
    """
    # debug log for incoming data to diagnose unprocessable entity
    logger.debug(f"Received request: {request.dict()}")
    # ensure the client is available (may have been installed at startup)
    global GeminiClient
    if GeminiClient is None:
        raise HTTPException(status_code=500, detail="google-generativeai not configured")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    # craft the prompt, optionally include requested difficulty
    prompt = (
        f"You are a project mentor. Based on these skills: {request.skills}"
        + (f" and desired difficulty: {request.difficulty}" if request.difficulty else "")
        + ", generate a detailed \n"
        "learning project for a student. Include: Project Title, Project Description, \n"
        "Tech Stack to use, Step-by-step tasks the student must complete, and \n"
        "Expected Learning Outcomes. Be specific and practical."
    )

    # attempt call to Gemini
    generated_text = None
    try:
        model = GeminiClient.GenerativeModel('gemini-2.0-flash')
        resp = model.generate_content(prompt)
        if hasattr(resp, "output_text"):
            generated_text = resp.output_text
        else:
            try:
                generated_text = resp.output[0].content[0].text
            except Exception:
                generated_text = str(resp)
    except Exception as e:
        logger.warning(f"Gemini API error: {e}")
        # fallback stub
        generated_text = (
            "Project Title: Sample Project\n"
            "Project Description: This is a stub description.\n"
            "Step-by-step Tasks:\n- Task 1\n- Task 2\n"
            "Expected Learning Outcomes:\n- Learn to stub\n"
        )

    if not generated_text:
        # still empty? use minimal stub
        generated_text = "Project Title: Stub\nProject Description: N/A"

    # simple parsing for fields
    project_title = ""
    project_description = ""
    tasks: List[str] = []
    learning_outcomes = ""

    current = None
    for line in generated_text.splitlines():
        l = line.strip()
        lower = l.lower()
        if lower.startswith("project title"):
            current = "title"
            project_title = l.split(":", 1)[1].strip() if ":" in l else ""
        elif lower.startswith("project description"):
            current = "description"
            project_description = l.split(":", 1)[1].strip() if ":" in l else ""
        elif lower.startswith("step-by-step tasks") or lower.startswith("tasks"):
            current = "tasks"
        elif lower.startswith("expected learning outcomes") or lower.startswith("learning outcomes"):
            current = "learning"
        else:
            if current == "description":
                project_description += " " + l
            elif current == "tasks" and l:
                # strip leading bullet markers
                tasks.append(l.lstrip("-*").strip())
            elif current == "learning":
                learning_outcomes += l + "\n"

    # build document
    doc = {
        "user_id": request.user_id,
        "skills": request.skills,
        "difficulty": request.difficulty,
        "project_title": project_title or generated_text[:100],
        "project_description": project_description or generated_text,
        "tasks": tasks,
        "learning_outcomes": learning_outcomes.strip(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
    }

    try:
        result = user_projects_collection.insert_one(doc)
        saved = doc.copy()
        saved["_id"] = result.inserted_id
        saved["project_id"] = str(result.inserted_id)
        return serialize_doc(saved)
    except Exception as e:
        logger.error(f"Mongo insert error: {e}")
        raise HTTPException(status_code=500, detail="Error saving project")


@router.post("/api/generate-quiz")
async def generate_quiz(request: GenerateQuizRequest):
    """Generate a multiple-choice quiz for an existing user project."""
    global GeminiClient
    if GeminiClient is None:
        raise HTTPException(status_code=500, detail="google-generativeai not configured")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    # fetch project from DB
    try:
        proj = user_projects_collection.find_one({"_id": ObjectId(request.project_id)})
    except Exception as e:
        logger.error(f"Invalid project_id format: {e}")
        raise HTTPException(status_code=400, detail="Invalid project_id")

    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    # build full details string
    details = []
    details.append(f"Title: {proj.get('project_title','')}")
    details.append(f"Description: {proj.get('project_description','')}")
    tasks = proj.get('tasks', [])
    if tasks:
        details.append("Tasks:")
        for t in tasks:
            details.append(f"- {t}")
    lo = proj.get('learning_outcomes','')
    if lo:
        details.append("Learning Outcomes:")
        details.append(lo)

    full_project_details = "\n".join(details)

    prompt = (
        f"You are a quiz examiner. Based on this project: {full_project_details}\n"
        "Generate exactly 10 multiple choice questions to test how well a student "
        "understood and implemented this project. \n"
        "For each question return ONLY valid JSON in this format:\n"
        "{\n"
        "  'questions': [\n"
        "    {\n"
        "      'id': 1,\n"
        "      'question': '...',\n"
        "      'options': ['A) ...', 'B) ...', 'C) ...', 'D) ...'],\n"
        "      'correct_answer': 'A',\n"
        "      'explanation': '...'\n"
        "    }\n"
        "  ]\n"
        "}\n"
        "Make questions practical, code-based, and specific to this exact project."
    )

    # helper to call Gemini with retries and strict prompt if needed
    import re, json
    def call_gemini(prompt_text, strict=False):
        try:
            model = GeminiClient.GenerativeModel('gemini-2.0-flash')
            resp = model.generate_content(prompt_text)
            text = resp.text if hasattr(resp, 'text') else str(resp)
        except Exception as e:
            logger.warning(f"Gemini API call error: {e}")
            return None
        if text is None:
            return None
        # strip markdown fences
        text = text.strip()
        text = re.sub(r"^```json", "", text, flags=re.IGNORECASE).strip()
        text = re.sub(r"```$", "", text, flags=re.IGNORECASE).strip()
        # extract first {...} block
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            return m.group(0)
        return text

    # first attempt
    generated = call_gemini(prompt)
    # if parsing failed, retry up to 2 more times with strict prompt
    parsed = None
    for attempt in range(3):
        if generated is None:
            # failover stub
            break
        try:
            parsed = json.loads(generated)
            break
        except Exception as e:
            logger.debug(f"JSON parse attempt {attempt+1} failed: {e}")
            if attempt < 2:
                strict_prompt = (
                    "IMPORTANT: Return ONLY raw JSON. No markdown. No explanation. No backticks."
                    " Start your response with { and end with }\n" + prompt
                )
                generated = call_gemini(strict_prompt)
    if parsed is None:
        # fallback stub data in case of persistent failure
        logger.warning("Using fallback quiz stub data")
        parsed = {
            "questions": [
                {"id": i, "question": f"Sample question {i}", "options": ["A","B","C","D"], "correct_answer": "A", "explanation": "Sample"}
                for i in range(1,11)
            ]
        }


    questions = parsed.get("questions")
    if not questions or len(questions) != 10:
        logger.warning(f"Unexpected questions count: {questions}")
        # continue but warn

    # save to DB
    quiz_doc = {
        "project_id": request.project_id,
        "user_id": request.user_id,
        "questions": questions,
        "created_at": datetime.now(timezone.utc),
        "is_completed": False,
    }
    try:
        result = project_quizzes_collection.insert_one(quiz_doc)
        quiz_id_str = str(result.inserted_id)
    except Exception as e:
        logger.error(f"Mongo insert quiz error: {e}")
        raise HTTPException(status_code=500, detail="Error saving quiz")

    # remove correct answers for frontend
    output_questions = []
    for q in questions:
        q_copy = q.copy()
        if 'correct_answer' in q_copy:
            del q_copy['correct_answer']
        output_questions.append(q_copy)

    return {"quiz_id": quiz_id_str, "questions": output_questions}


@router.get("/projects")
async def get_projects():
    try:
        projects = list(project_collection.find())
        for project in projects:
            project["id"] = str(project["_id"])
            del project["_id"]  
        return {"projects": projects}
    except Exception as e:
        logger.error(f"Get projects error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/projects")
async def create_project(project: Project):
    try:
        logger.debug(f"Received project data: {project}")
        project_dict = project.model_dump()
        
        # Set timestamps
        project_dict["created_at"] = datetime.now(timezone.utc)
        project_dict["updated_at"] = datetime.now(timezone.utc)
        
        # Validate required fields
        if not project_dict.get("curator"):
            raise HTTPException(status_code=400, detail="Curator name is required")
        
        if not project_dict.get("technologies") or len(project_dict["technologies"]) == 0:
            raise HTTPException(status_code=400, detail="At least one technology is required")
        
        result = project_collection.insert_one(project_dict)
        return {
            "id": str(result.inserted_id),
            "message": "Project Created Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Project creation error: {e}")
        logger.error(f"Error type: {type(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/projects/{project_id}")
async def update_project(project_id: str, project: Project): 
    try:
        # Check if project exists
        existing_project = project_collection.find_one({"_id": ObjectId(project_id)})
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project_dict = project.model_dump()
        
        # Preserve created_at from existing project and update updated_at
        project_dict["created_at"] = existing_project.get("created_at", datetime.now(timezone.utc))
        project_dict["updated_at"] = datetime.now(timezone.utc)
        
        # Validate required fields
        if not project_dict.get("curator"):
            raise HTTPException(status_code=400, detail="Curator name is required")
        
        if not project_dict.get("technologies") or len(project_dict["technologies"]) == 0:
            raise HTTPException(status_code=400, detail="At least one technology is required")
        
        result = project_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": project_dict}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Project not found or no changes made")
            
        return {"message": "Project updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Project update error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/projects/{project_id}") 
async def delete_project(project_id: str):
    try:
        result = project_collection.delete_one({"_id": ObjectId(project_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"message": "Project deleted successfully"}
    except Exception as e:
        logger.error(f"Delete project error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    try:
        project = project_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project["id"] = str(project["_id"])
        del project["_id"]
        return project
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get project error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/projects/category/{category}")
async def get_projects_by_category(category: str):
    try:
        projects = list(project_collection.find({"category": category}))
        for project in projects:
            project["id"] = str(project["_id"])
            del project["_id"]
        return {"projects": projects}
    except Exception as e:
        logger.error(f"Get projects by category error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# --- new endpoints for user_projects management ---


@router.post("/api/quiz/submit")
async def submit_quiz(sub: QuizSubmission):
    """Grade a submitted quiz and update the document."""
    # fetch quiz
    try:
        quiz_doc = project_quizzes_collection.find_one({"_id": ObjectId(sub.quiz_id)})
    except Exception as e:
        logger.error(f"Invalid quiz_id: {e}")
        raise HTTPException(status_code=400, detail="Invalid quiz_id")
    if not quiz_doc:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # correct answers are stored in quiz_doc['questions']
    score = 0
    results = []
    for q in quiz_doc.get("questions", []):
        qid = q.get("id")
        correct = q.get("correct_answer")
        # find user's answer
        ans = next((u for u in sub.user_answers if u.get("question_id") == qid), None)
        selected = ans.get("selected_answer") if ans else None
        is_correct = selected == correct
        if is_correct:
            score += 1
        results.append({
            "question_id": qid,
            "selected": selected,
            "correct": correct,
            "is_correct": is_correct,
            "explanation": q.get("explanation", "")
        })

    # update quiz document
    update_fields = {
        "is_completed": True,
        "score": score,
        "user_answers": sub.user_answers,
        "submitted_at": datetime.now(timezone.utc)
    }
    project_quizzes_collection.update_one(
        {"_id": ObjectId(sub.quiz_id)},
        {"$set": update_fields}
    )

    return {"score": score, "total": len(quiz_doc.get("questions", [])), "results": results}

@router.patch("/api/projects/{project_id}/complete")
async def complete_user_project(project_id: str):
    """Mark a generated project as completed."""
    try:
        result = user_projects_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}}
        )
    except Exception as e:
        logger.error(f"Invalid project_id for completion: {e}")
        raise HTTPException(status_code=400, detail="Invalid project_id")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    updated = user_projects_collection.find_one({"_id": ObjectId(project_id)})
    if updated:
        updated["project_id"] = str(updated.get("_id"))
        updated["_id"] = str(updated.get("_id"))
    return updated


@router.get("/api/projects/{user_id}")
async def get_user_projects(user_id: str):
    """Return all projects generated by a user along with status."""
    try:
        projects = list(user_projects_collection.find({"user_id": user_id}))
        for proj in projects:
            proj["project_id"] = str(proj.get("_id"))
            proj["_id"] = str(proj.get("_id"))
        return {"projects": projects}
    except Exception as e:
        logger.error(f"Error fetching user projects: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/projects/difficulty/{difficulty}")
async def get_projects_by_difficulty(difficulty: str):
    try:
        projects = list(project_collection.find({"difficulty": difficulty}))
        for project in projects:
            project["id"] = str(project["_id"])
            del project["_id"]
        return {"projects": projects}
    except Exception as e:
        logger.error(f"Get projects by difficulty error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")