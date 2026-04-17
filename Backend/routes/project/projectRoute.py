from fastapi import APIRouter, HTTPException, Request
from db import client
from models.projects import Project, UserProject, ProjectQuiz, QuizQuestion
from models.mentor import MentorActionRequest
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
import os
from dotenv import load_dotenv
import logging
from utils.serializer import serialize_doc
import re, json
import random
from utils.agent_nodes.update_knowledge_node import update_user_knowledge

logger = logging.getLogger(__name__)

# AUTHORIZATION HELPER
def get_authenticated_user(request: Request) -> str:
    try:
        session = getattr(request.state, 'session', None)
        if not session:
            logger.warning("No session found on request")
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        # Session stores email as identifier
        email = session.get("email")
        if not email:
            logger.warning("No email in session")
            raise HTTPException(status_code=401, detail="Invalid session")
        
        logger.info(f"Authenticated user: {email}")
        return email
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session retrieval error: {e}")
        raise HTTPException(status_code=401, detail="Authentication error")

def get_user_id_from_email(email: str) -> str:
    """
    Convert email to user_id by querying the database.
    Returns the MongoDB _id field as string.
    """
    try:
        user = users_collection.find_one({"email": email})
        if not user:
            logger.warning(f"⚠️ User not found for email: {email}")
            raise HTTPException(status_code=404, detail="User not found")
        user_id = str(user.get("_id", email))
        logger.info(f"Found user_id: {user_id} for email: {email}")
        return user_id
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error looking up user: {e}")
        # Fallback: use email as user_id if lookup fails
        return email

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if GROQ_API_KEY:
    logger.info("Groq API key loaded successfully")
else:
    logger.error("GROQ_API_KEY not found in .env — get a free key at console.groq.com")


router = APIRouter()
db = client["immersia"]
project_collection          = db["projects"]
user_projects_collection    = db["user_projects"]
project_quizzes_collection  = db["project_quizzes"]
submissions_collection      = db["project_submissions"]
certificates_collection     = db["certificates"]
users_collection            = db["users"]
quiz_freeze_collection      = db["quiz_freeze_history"]

# MODELS
class QuizSubmission(BaseModel):
    quiz_id: str
    user_id: str
    user_answers: List[dict]

class QuizAttemptRequest(BaseModel):
    user_id: str
    quiz_id: str
    passed: bool = False

class GenerateQuizRequest(BaseModel):
    project_id: str
    user_id: str

class GenerateProjectRequest(BaseModel):
    user_id: str
    skills: List[str]
    difficulty: Optional[str] = None

class CreateUserProjectRequest(BaseModel):
    user_id: str
    title: str
    description: str = ""
    category: str = "Web Development"
    difficulty: str = "Intermediate"
    duration: str = "1 month"
    technologies: List[str] = []
    prerequisites: List[str] = []
    project_description: str = ""
    tasks: List[str] = []
    learning_outcomes: str = ""
    status: str = "pending"

class ProjectSubmissionRequest(BaseModel):
    user_id: str
    project_id: str
    description: str
    github_url: str
    live_demo_url: str
    challenges: str
    learnings: str


# CERTIFICATE HELPER
def maybe_issue_certificate(user_id: str, project_id: str):
    try:
        logger.info(f"🔍 Certificate check — user: {user_id}, project: {project_id}")

        # ── CONDITION 1: Submission must be approved ──────────────────────────
        submission = submissions_collection.find_one({
            "user_id": user_id, "project_id": project_id, "status": "approved"
        })
        submission_approved = submission is not None
        logger.info(f"  ↳ Submission approved: {submission_approved}")

        # ── CONDITION 2: Quiz must be completed ───────────────────────────────
        quiz = project_quizzes_collection.find_one({
            "user_id": user_id, "project_id": project_id, "is_completed": True
        })
        quiz_completed = quiz is not None
        logger.info(f"  ↳ Quiz completed: {quiz_completed}")

        # ── STRICT GATE: Both must be true ────────────────────────────────────
        if not submission_approved and not quiz_completed:
            logger.warning(f"  ⛔ BLOCKED — submission not approved AND quiz not completed")
            return None

        if not submission_approved:
            logger.warning(f"  ⛔ BLOCKED — quiz passed but submission not yet approved by mentor")
            return None

        if not quiz_completed:
            logger.warning(f"  ⛔ BLOCKED — submission approved but quiz not yet completed")
            return None

        # ── Both conditions met — now validate quiz score ─────────────────────
        total      = len(quiz.get("questions", []))
        score      = quiz.get("score", 0)
        percentage = round((score / total) * 100) if total > 0 else 0
        logger.info(f"  ↳ Quiz score: {score}/{total} = {percentage}%")

        if percentage < 70:
            logger.warning(f"  ⛔ BLOCKED — score {percentage}% is below 70% threshold")
            return None

        logger.info(f"  ✅ Both conditions met — proceeding to issue certificate")

        # ── Already issued? Return existing ──────────────────────────────────
        existing = certificates_collection.find_one({
            "user_id": user_id, "project_id": project_id
        })
        if existing:
            logger.info(f"  ↳ Certificate already exists: {existing.get('certificate_id')}")
            return serialize_doc(existing)

        # ── Fetch project details ─────────────────────────────────────────────
        project = None
        try:
            project = user_projects_collection.find_one({"_id": ObjectId(project_id)})
        except Exception as e:
            logger.debug(f"Failed to find in user_projects: {e}")

        if not project:
            try:
                project = project_collection.find_one({"_id": ObjectId(project_id)})
            except Exception as e:
                logger.debug(f"Failed to find in project_collection: {e}")

        if not project:
            logger.warning(f"  ⚠️ Project not found for {project_id} — using defaults")
            project_title = "Project"
            technologies  = []
            category      = ""
        else:
            project_title = project.get("title") or project.get("project_title", "Project")
            technologies  = project.get("technologies", [])
            category      = project.get("category", "")
            logger.info(f"  ↳ Project: {project_title}")

        # ── Issue certificate ─────────────────────────────────────────────────
        cert_doc = {
            "user_id":        user_id,
            "project_id":     project_id,
            "project_title":  project_title,
            "category":       category,
            "technologies":   technologies,
            "quiz_score":     percentage,
            "issued_at":      datetime.now(timezone.utc),
            "certificate_id": f"IMMERSIA-{user_id[-6:].upper()}-{project_id[-6:].upper()}",
        }

        result = certificates_collection.insert_one(cert_doc)
        cert_doc["_id"] = result.inserted_id
        logger.info(f"✅ Certificate ISSUED: {cert_doc['certificate_id']} (score: {percentage}%)")

        verify = certificates_collection.find_one({"_id": result.inserted_id})
        if verify:
            logger.info(f"✅ Certificate VERIFIED in DB: {verify['_id']}")
        else:
            logger.error(f"❌ Certificate NOT FOUND after insert — DB write may have failed")

        return serialize_doc(cert_doc)

    except Exception as e:
        logger.error(f"❌ Certificate issuance error: {e}", exc_info=True)
        return None

# Models in fallback order - all free on Groq
GROQ_MODELS = [
    "llama-3.3-70b-versatile",    # primary   - best quality, 70B
    "llama-3.1-8b-instant",       # fallback1 - fast, 8B
    "mixtral-8x7b-32768",         # fallback2 - 32k context
    "gemma2-9b-it",               # fallback3 - Google Gemma
]

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

def call_gemini_json(prompt_text: str) -> Optional[str]:
    """
    Calls Groq API using the groq Python SDK.
    Groq is free with no billing required - get key at console.groq.com
    Named call_gemini_json to avoid changing all call sites.
    """
    if not GROQ_API_KEY:
        logger.error("GROQ_API_KEY not set - cannot call Groq API")
        return None

    try:
        from groq import Groq
    except ImportError:
        try:
            import subprocess, sys
            logger.info("Installing groq SDK...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "groq"], stdout=subprocess.DEVNULL)
            from groq import Groq
        except Exception as e:
            logger.error(f"Failed to install groq SDK: {e}")
            return None

    client = Groq(api_key=GROQ_API_KEY)

    for model_name in GROQ_MODELS:
        try:
            logger.info(f"Trying Groq model: {model_name}")

            chat = client.chat.completions.create(
                model=model_name,
                messages=[
                    {
                        "role":    "system",
                        "content": "You are a helpful assistant. Respond ONLY with valid JSON. No markdown, no explanations, no text outside the JSON object."
                    },
                    {
                        "role":    "user",
                        "content": prompt_text
                    }
                ],
                max_tokens=3000,
                temperature=0.7,
            )

            text = chat.choices[0].message.content or ""

            if not text.strip():
                logger.warning(f"{model_name} returned empty content")
                continue

            text = text.strip()
            logger.debug(f"{model_name} response (first 300): {text[:300]}")

            # Strip markdown fences if model added them
            text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE).strip()
            text = re.sub(r"\s*```\s*$",       "", text, flags=re.IGNORECASE).strip()

            # Skip leading prose before JSON
            brace_idx = text.find("{")
            if brace_idx > 0:
                text = text[brace_idx:]

            extracted = _extract_json_object(text)
            if extracted:
                logger.info(f"✅ Groq/{model_name} succeeded")
                return extracted

            logger.warning(f"{model_name} response had no valid JSON")
            continue

        except Exception as e:
            err = str(e)
            if "rate_limit" in err.lower() or "429" in err:
                logger.warning(f"{model_name} rate limited - trying next model")
                continue
            if "model_not_found" in err.lower() or "404" in err:
                logger.warning(f"{model_name} not found - trying next model")
                continue
            logger.warning(f"{model_name} error: {e}")
            continue

    logger.error("All Groq models failed")
    return None


def _extract_json_object(text: str) -> Optional[str]:
    """
    Extract the outermost JSON object by counting braces.
    More reliable than a greedy regex for nested structures.
    """
    if not text or text[0] != "{":
        return None
    depth   = 0
    in_str  = False
    escape  = False
    for i, ch in enumerate(text):
        if escape:
            escape = False
            continue
        if ch == "\\" and in_str:
            escape = True
            continue
        if ch == '"':
            in_str = not in_str
            continue
        if in_str:
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[:i + 1]
    return None  


# ============================================================================
# PROJECT GENERATION
# ============================================================================
APP_DOMAINS = [
    "a SaaS productivity tool", "a marketplace platform", "a social networking app",
    "a real-time collaboration tool", "a dashboard and analytics platform",
    "a booking and scheduling system", "an e-commerce storefront",
    "a task and project management app", "a food delivery or restaurant ordering system",
    "a job board and recruitment platform", "a learning management system (LMS)",
    "a personal finance tracker", "a health and fitness tracking app",
    "a real estate listing platform", "a news aggregator and reader",
    "a customer support ticketing system", "an inventory management system",
    "a ride-sharing or logistics tracker", "a subscription billing platform",
    "a social media content scheduler", "a URL shortener with analytics",
    "an event management and ticketing platform", "a blogging and content publishing platform",
    "a chatbot-powered customer service tool", "a code snippet sharing platform",
    "a weather dashboard with alerts", "a quiz and assessment platform",
    "a hotel or accommodation booking app", "a gym membership management system",
    "a document collaboration and version control tool",
]


@router.post("/api/generate-project")
async def generate_project(request: GenerateProjectRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set. Get a free key at console.groq.com and add to .env")

    difficulty = request.difficulty or "Intermediate"
    skills_str = ", ".join(request.skills)
    domain     = random.choice(APP_DOMAINS)

    master_prompt = f"""You are a senior software engineer. Generate a specific, named portfolio project.

Student skills: {skills_str}
Difficulty: {difficulty}
Domain: {domain}

Rules:
- Title must be a SPECIFIC app name (e.g. "ShiftMate — Employee Shift Scheduler")
- NEVER write generic titles like "A web application using X"
- technologies must be a JSON array of real package names
- tasks must be a JSON array of exactly 10 strings
- category must be exactly one of: Web Development | Mobile Development | Data Science | Machine Learning | Cloud Computing | DevOps | Cyber Security | Artificial Intelligence | Blockchain | Game Development
- duration must be exactly one of: 1 week | 2 weeks | 3 weeks | 1 month | 2 months | 3 months | 6 months

Return ONLY this JSON with no extra text:

{{
  "title": "AppName — one-line what it does",
  "description": "2-3 sentences: real problem it solves, who uses it, what makes it valuable",
  "category": "Web Development",
  "difficulty": "{difficulty}",
  "duration": "1 month",
  "technologies": ["{skills_str.split(',')[0].strip()}", "add 3-7 more real packages needed"],
  "prerequisites": ["prerequisite 1", "prerequisite 2", "prerequisite 3"],
  "project_description": "## What You're Building\\n3-4 sentences.\\n\\n## Core Features\\n- Feature 1\\n- Feature 2\\n- Feature 3\\n- Feature 4\\n- Feature 5\\n\\n## Technical Architecture\\n- Frontend: ...\\n- Backend: ...\\n- Database: ...\\n- Auth: ...",
  "tasks": [
    "Initialize project and install dependencies",
    "Design database schema",
    "Build authentication system",
    "Implement core feature 1",
    "Implement core feature 2",
    "Implement core feature 3",
    "Build frontend UI",
    "Add validation and error handling",
    "Write tests",
    "Deploy and write README"
  ],
  "learning_outcomes": "After completing this you will:\\n- outcome 1\\n- outcome 2\\n- outcome 3"
}}"""

    generated = call_gemini_json(master_prompt)
    parsed    = None

    for attempt in range(3):
        if generated is None:
            logger.warning(f"Project generation attempt {attempt + 1}: Gemini returned None")
            break
        try:
            parsed = json.loads(generated)
            if parsed.get("title") and parsed.get("tasks") and parsed.get("description"):
                logger.info(f"✅ Project generated successfully on attempt {attempt + 1}: {parsed.get('title')}")
                break
            raise ValueError(f"Missing required fields: title={bool(parsed.get('title'))}, tasks={bool(parsed.get('tasks'))}")
        except json.JSONDecodeError as e:
            logger.warning(f"Project JSON parse attempt {attempt + 1} failed: {e}")
            logger.debug(f"Raw text that failed parsing: {generated[:500] if generated else 'None'}")
            parsed = None
            if attempt < 2:
                generated = call_gemini_json(
                    "Return ONLY valid JSON, nothing else. No markdown. No explanation.\n\n" + master_prompt
                )
        except ValueError as e:
            logger.warning(f"Project validation attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                generated = call_gemini_json(master_prompt)

    if parsed is None:
        logger.warning("All Gemini attempts failed — using structured fallback")
        skill0 = request.skills[0] if request.skills else "Python"
        parsed = {
            "title": "TaskFlow — Team Task & Project Management Tool",
            "description": f"TaskFlow helps small teams organize work by creating projects, assigning tasks, tracking deadlines, and visualizing progress on a Kanban board. Built using {skills_str}.",
            "category": "Web Development",
            "difficulty": difficulty,
            "duration": "1 month",
            "technologies": request.skills + ["JWT", "bcrypt", "Axios"],
            "prerequisites": [
                f"Working knowledge of {skill0}",
                "Understanding of HTTP and REST APIs",
                "Basic experience with Git and version control"
            ],
            "project_description": (
                "## What You're Building\nTaskFlow is a team task management web app.\n\n"
                "## Core Features\n- Workspace Management\n- Task CRUD\n- Kanban Board\n- Activity Feed\n- Dashboard\n\n"
                "## Technical Architecture\n- Frontend: React\n- Backend: REST API\n- Database: MongoDB\n- Auth: JWT"
            ),
            "tasks": [
                f"Initialize project: create repo, set up {skills_str} structure, install dependencies",
                "Design database schema: users, workspaces, tasks, assignments, activity_log",
                "Build auth system: registration, login, bcrypt, JWT, middleware",
                "Implement workspace management: create, invite members, list workspaces",
                "Implement task CRUD: create, assign, prioritize, due dates, update status",
                "Build Kanban board UI: three-column layout, drag-and-drop cards",
                "Build dashboard and activity feed: overdue, upcoming, completed counts",
                "Add validation: required fields, date checks, membership authorization",
                "Write tests: unit tests for auth helpers, integration tests for task endpoints",
                "Deploy to Railway or Render, configure environment variables, write README"
            ],
            "learning_outcomes": (
                f"After completing this project you will:\n- Know how to build a multi-user SaaS tool using {skills_str}\n"
                "- Understand role-based access control and JWT authentication\n"
                "- Have a deployed, working app for your portfolio"
            )
        }

    ALLOWED_CATEGORIES = [
        'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
        'Cloud Computing', 'DevOps', 'Cyber Security', 'Artificial Intelligence',
        'Blockchain', 'Game Development'
    ]
    ALLOWED_DURATIONS = ['1 week', '2 weeks', '3 weeks', '1 month', '2 months', '3 months', '6 months']

    category = parsed.get("category", "Web Development")
    if category not in ALLOWED_CATEGORIES:
        category = "Web Development"

    duration = parsed.get("duration", "1 month")
    if duration not in ALLOWED_DURATIONS:
        duration = "1 month"

    technologies = parsed.get("technologies", request.skills)
    if not isinstance(technologies, list):
        technologies = request.skills
    technologies = [str(t) for t in technologies if str(t).strip()]

    prerequisites = parsed.get("prerequisites", [])
    if not isinstance(prerequisites, list):
        prerequisites = []
    prerequisites = [str(p) for p in prerequisites if str(p).strip()]
    if not prerequisites:
        prerequisites = [
            f"Working knowledge of {request.skills[0] if request.skills else 'programming'}",
            "Understanding of REST APIs and HTTP",
            "Basic Git and version control experience"
        ]

    tasks = parsed.get("tasks", [])
    if not isinstance(tasks, list):
        tasks = []
    tasks = [str(t) for t in tasks if str(t).strip()]

    title             = parsed.get("title", "")
    description       = parsed.get("description", "")
    project_desc      = parsed.get("project_description", "")
    learning_outcomes = parsed.get("learning_outcomes", "")
    now               = datetime.now(timezone.utc)

    user_doc = {
        "user_id":             request.user_id,
        "skills":              request.skills,
        "title":               title,
        "description":         description,
        "category":            category,
        "difficulty":          parsed.get("difficulty", difficulty),
        "duration":            duration,
        "technologies":        technologies,
        "prerequisites":       prerequisites,
        "project_title":       title,
        "project_description": project_desc,
        "tasks":               tasks,
        "learning_outcomes":   learning_outcomes,
        "status":              "pending",
        "created_at":          now,
    }

    try:
        user_result            = user_projects_collection.insert_one(user_doc)
        user_doc["_id"]        = user_result.inserted_id
        user_doc["project_id"] = str(user_result.inserted_id)
    except Exception as e:
        logger.error(f"user_projects insert error: {e}")
        raise HTTPException(status_code=500, detail="Error saving project")

    curated_doc = {
        "title":               title,
        "description":         description,
        "category":            category,
        "curator":             "AI Generated",
        "technologies":        technologies,
        "difficulty":          parsed.get("difficulty", difficulty),
        "duration":            duration,
        "prerequisites":       prerequisites,
        "project_description": project_desc,
        "created_at":          now,
        "updated_at":          now,
        "tasks":               tasks,
        "learning_outcomes":   learning_outcomes,
        "generated_by_user":   request.user_id,
        "user_project_id":     str(user_result.inserted_id),
    }
    try:
        project_collection.insert_one(curated_doc)
    except Exception as e:
        logger.warning(f"projects collection insert failed (non-fatal): {e}")

    return serialize_doc(user_doc)


# ============================================================================
# QUIZ GENERATION
# ============================================================================
@router.post("/api/generate-quiz")
async def generate_quiz(request: GenerateQuizRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set. Get a free key at console.groq.com and add to .env")

    proj = None
    try:
        obj_id = ObjectId(request.project_id)
        proj   = user_projects_collection.find_one({"_id": obj_id})
        if not proj:
            curated = project_collection.find_one({"_id": obj_id})
            if curated:
                user_proj_id = curated.get("user_project_id")
                if user_proj_id:
                    try:
                        proj = user_projects_collection.find_one({"_id": ObjectId(user_proj_id)})
                    except Exception:
                        pass
                if not proj:
                    proj = curated
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project_id")

    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    # ✅ CHECK IF QUIZ ALREADY PASSED - Don't allow retaking
    quiz_passed = proj.get("quiz_passed", False)
    if quiz_passed:
        logger.info(f"❌ Quiz already passed for user {request.user_id}, project {request.project_id}")
        raise HTTPException(status_code=403, detail="You have already passed this quiz. Cannot retake.")

    title        = proj.get('title', proj.get('project_title', 'Unknown Project'))
    technologies = proj.get('technologies', proj.get('skills', []))
    tasks        = proj.get('tasks', [])
    difficulty   = proj.get('difficulty', 'Intermediate')
    tech_str     = ', '.join(technologies) if isinstance(technologies, list) else str(technologies)
    proj_desc    = proj.get('project_description', '')
    description  = proj.get('description', '')

    # ── Concise context to avoid truncation ─────────────────────────────────
    task_lines = "\n".join(f"  {i+1}. {t}" for i, t in enumerate(tasks[:10]))
    context = f"""Project: {title}
Difficulty: {difficulty}
Technologies: {tech_str}
Description: {description}
Tasks:
{task_lines}"""

    quiz_prompt = f"""You are a technical instructor. Write exactly 7 multiple-choice quiz questions about this project.

{context}

Rules:
- Every question must reference "{title}" or its specific features/tasks
- correct_answer must be exactly one of: "A", "B", "C", "D"
- Each option starts with its letter: "A) ...", "B) ..."
- Include explanation for why correct answer is right

Return ONLY this JSON:

{{
  "questions": [
    {{
      "id": 1,
      "question": "question text about {title}?",
      "options": ["A) option", "B) option", "C) option", "D) option"],
      "correct_answer": "A",
      "explanation": "A is correct because..."
    }}
  ]
}}

Write all 7 questions now. Cover: setup, core features, {tech_str} usage, error handling, deployment."""

    generated = call_gemini_json(quiz_prompt)
    parsed    = None

    for attempt in range(3):
        if generated is None:
            logger.warning(f"Quiz generation attempt {attempt + 1}: Gemini returned None")
            break
        try:
            parsed = json.loads(generated)
            if "questions" in parsed and len(parsed["questions"]) >= 5:
                logger.info(f"✅ Quiz generated on attempt {attempt + 1}: {len(parsed['questions'])} questions for '{title}'")
                break
            raise ValueError(f"Only {len(parsed.get('questions', []))} questions")
        except json.JSONDecodeError as e:
            logger.warning(f"Quiz JSON parse attempt {attempt + 1} failed: {e}")
            logger.debug(f"Raw text: {generated[:300] if generated else 'None'}")
            parsed = None
            if attempt < 2:
                generated = call_gemini_json(
                    "Return ONLY valid JSON, nothing else.\n\n" + quiz_prompt
                )
        except ValueError as e:
            logger.warning(f"Quiz validation attempt {attempt + 1}: {e}")
            if attempt < 2:
                generated = call_gemini_json(quiz_prompt)

    if parsed is None or "questions" not in parsed:
        logger.warning(f"Quiz fallback used for project: {title}")
        tech_list = technologies if isinstance(technologies, list) else [str(technologies)]
        t0 = tech_list[0] if tech_list else "the primary technology"
        parsed = {"questions": [
            {"id":1,"question":f"In {title}, what is the primary responsibility of {t0}?","options":["A) Managing application state and rendering the UI","B) Handling file uploads to cloud storage","C) Sending transactional emails to users","D) Running scheduled background jobs"],"correct_answer":"A","explanation":f"{t0} manages state and rendering. Others are separate services."},
            {"id":2,"question":f"Which setup step is required before running {title} locally?","options":["A) Run directly without configuration","B) Copy .env.example to .env and fill in values","C) Hard-code credentials in source files","D) Disable authentication"],"correct_answer":"B","explanation":"Environment variables must be configured first."},
            {"id":3,"question":f"How are passwords stored in {title}?","options":["A) Plain text","B) Base64 encoded","C) Hashed with bcrypt and a salt","D) AES-256 encrypted"],"correct_answer":"C","explanation":"bcrypt with salt is the industry standard."},
            {"id":4,"question":f"What status code does {title} return for a missing resource?","options":["A) 200 OK","B) 400 Bad Request","C) 404 Not Found","D) 500 Internal Server Error"],"correct_answer":"C","explanation":"404 is the correct semantic status for missing resources."},
            {"id":5,"question":f"How does {title} protect routes for authenticated users only?","options":["A) Hardcoded username check","B) JWT token validation via middleware","C) Password stored in session cookie","D) Re-enter credentials every request"],"correct_answer":"B","explanation":"JWT middleware validates tokens on protected routes."},
            {"id":6,"question":f"What happens in {title} when required fields are missing?","options":["A) Server crashes","B) Saved with null values","C) 400 Bad Request with error message","D) Redirected to login"],"correct_answer":"C","explanation":"Proper validation returns 400 with descriptive errors."},
            {"id":7,"question":f"What is the correct repository structure for {title}?","options":["A) All files in root","B) Separate folders for routes, models, middleware","C) One file per feature","D) Frontend and backend mixed"],"correct_answer":"B","explanation":"Separation of concerns makes the codebase maintainable."},
        ]}

    questions = parsed.get("questions", [])
    validated = []
    for i, q in enumerate(questions[:7], 1):
        correct = str(q.get("correct_answer", "A")).strip()
        if len(correct) > 1:
            correct = correct[0].upper()
        if correct not in ["A", "B", "C", "D"]:
            correct = "A"
        validated.append({
            "id":             q.get("id", i),
            "question":       q.get("question", f"Question {i} about {title}"),
            "options":        q.get("options", ["A) Option A", "B) Option B", "C) Option C", "D) Option D"]),
            "correct_answer": correct,
            "explanation":    q.get("explanation", f"Refer to the {title} documentation.")
        })

    while len(validated) < 7:
        i = len(validated) + 1
        validated.append({
            "id": i,
            "question": f"What is best practice for handling errors in the {title} API?",
            "options": ["A) Descriptive errors with correct HTTP status codes","B) Always return 200 OK","C) Crash the server","D) Return empty responses"],
            "correct_answer": "A",
            "explanation": "Descriptive errors with correct status codes help clients handle failures gracefully."
        })

    quiz_doc = {
        "project_id":   request.project_id,
        "user_id":      request.user_id,
        "questions":    validated,
        "created_at":   datetime.now(timezone.utc),
        "is_completed": False,
    }
    try:
        result      = project_quizzes_collection.insert_one(quiz_doc)
        quiz_id_str = str(result.inserted_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error saving quiz")

    output = [{k: v for k, v in q.items() if k != "correct_answer"} for q in validated]
    return {"quiz_id": quiz_id_str, "questions": output}


# ============================================================================
# STANDARD PROJECT ROUTES
# ============================================================================
@router.get("/projects")
async def get_projects():
    try:
        projects = list(project_collection.find())
        
        # Serialize all ObjectId fields (including nested)
        def serialize_for_json(doc):
            if isinstance(doc, dict):
                return {k: serialize_for_json(v) for k, v in doc.items()}
            elif isinstance(doc, list):
                return [serialize_for_json(item) for item in doc]
            elif isinstance(doc, ObjectId):
                return str(doc)
            else:
                return doc
        
        projects = [serialize_for_json(p) for p in projects]
        
        # Ensure 'id' field exists for frontend compatibility
        for p in projects:
            if "_id" in p and "id" not in p:
                p["id"] = p["_id"]
        
        return {"projects": projects}
    except Exception as e:
        logger.error(f"Error fetching projects: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/projects")
async def create_project(project: Project):
    try:
        project_dict = project.model_dump()
        project_dict["created_at"] = datetime.now(timezone.utc)
        project_dict["updated_at"] = datetime.now(timezone.utc)
        if not project_dict.get("curator"):
            raise HTTPException(status_code=400, detail="Curator name is required")
        if not project_dict.get("technologies") or len(project_dict["technologies"]) == 0:
            raise HTTPException(status_code=400, detail="At least one technology is required")
        result = project_collection.insert_one(project_dict)
        return {"id": str(result.inserted_id), "message": "Project Created Successfully"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/projects/{project_id}")
async def update_project(project_id: str, project: Project):
    try:
        existing = project_collection.find_one({"_id": ObjectId(project_id)})
        if not existing:
            raise HTTPException(status_code=404, detail="Project not found")
        project_dict = project.model_dump()
        project_dict["created_at"] = existing.get("created_at", datetime.now(timezone.utc))
        project_dict["updated_at"] = datetime.now(timezone.utc)
        if not project_dict.get("curator"):
            raise HTTPException(status_code=400, detail="Curator name is required")
        if not project_dict.get("technologies") or len(project_dict["technologies"]) == 0:
            raise HTTPException(status_code=400, detail="At least one technology is required")
        result = project_collection.update_one({"_id": ObjectId(project_id)}, {"$set": project_dict})
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Project not found or no changes made")
        return {"message": "Project updated successfully"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    try:
        result = project_collection.delete_one({"_id": ObjectId(project_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"message": "Project deleted successfully"}
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    try:
        project = project_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Serialize all ObjectId fields (including nested)
        def serialize_for_json(doc):
            if isinstance(doc, dict):
                return {k: serialize_for_json(v) for k, v in doc.items()}
            elif isinstance(doc, list):
                return [serialize_for_json(item) for item in doc]
            elif isinstance(doc, ObjectId):
                return str(doc)
            else:
                return doc
        
        project = serialize_for_json(project)
        
        # Ensure 'id' field exists for frontend compatibility
        if "_id" in project and "id" not in project:
            project["id"] = project["_id"]
        
        return project
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching project: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/projects/category/{category}")
async def get_projects_by_category(category: str):
    try:
        projects = list(project_collection.find({"category": category}))
        
        # Serialize all ObjectId fields (including nested)
        def serialize_for_json(doc):
            if isinstance(doc, dict):
                return {k: serialize_for_json(v) for k, v in doc.items()}
            elif isinstance(doc, list):
                return [serialize_for_json(item) for item in doc]
            elif isinstance(doc, ObjectId):
                return str(doc)
            else:
                return doc
        
        projects = [serialize_for_json(p) for p in projects]
        
        # Ensure 'id' field exists for frontend compatibility
        for p in projects:
            if "_id" in p and "id" not in p:
                p["id"] = p["_id"]
        
        return {"projects": projects}
    except Exception as e:
        logger.error(f"Error fetching projects by category: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/projects/difficulty/{difficulty}")
async def get_projects_by_difficulty(difficulty: str):
    try:
        projects = list(project_collection.find({"difficulty": difficulty}))
        
        # Serialize all ObjectId fields (including nested)
        def serialize_for_json(doc):
            if isinstance(doc, dict):
                return {k: serialize_for_json(v) for k, v in doc.items()}
            elif isinstance(doc, list):
                return [serialize_for_json(item) for item in doc]
            elif isinstance(doc, ObjectId):
                return str(doc)
            else:
                return doc
        
        projects = [serialize_for_json(p) for p in projects]
        
        # Ensure 'id' field exists for frontend compatibility
        for p in projects:
            if "_id" in p and "id" not in p:
                p["id"] = p["_id"]
        
        return {"projects": projects}
    except Exception as e:
        logger.error(f"Error fetching projects by difficulty: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# ============================================================================
# QUIZ FREEZE HELPERS
# ============================================================================
def check_quiz_frozen(user_id: str, project_id: str) -> tuple[bool, Optional[datetime]]:
    """
    Check if a quiz is frozen for this user on this project.
    Returns: (is_frozen, frozen_until_time)
    """
    freeze_record = quiz_freeze_collection.find_one({
        "user_id": user_id,
        "project_id": project_id
    })
    
    if not freeze_record:
        return False, None
    
    frozen_until = freeze_record.get("frozen_until")
    if isinstance(frozen_until, str):
        frozen_until = datetime.fromisoformat(frozen_until)
    
    # Ensure frozen_until is timezone-aware
    if frozen_until and frozen_until.tzinfo is None:
        frozen_until = frozen_until.replace(tzinfo=timezone.utc)
    
    now = datetime.now(timezone.utc)
    
    # If freeze period has expired, remove the freeze record
    if frozen_until and frozen_until < now:
        quiz_freeze_collection.delete_one({
            "user_id": user_id,
            "project_id": project_id
        })
        return False, None
    
    return True, frozen_until

def track_quiz_attempt(user_id: str, project_id: str, passed: bool):
    """
    Track a quiz attempt per project. If 3 failures in a row, freeze for 6 hours.
    """
    logger.info(f"🔄 TRACKING QUIZ ATTEMPT - user_id: {user_id}, project_id: {project_id}, passed: {passed}")
    
    freeze_record = quiz_freeze_collection.find_one({
        "user_id": user_id,
        "project_id": project_id
    })
    
    if not freeze_record:
        logger.info(f"   → First attempt for this user/project combination")
        freeze_record = {
            "user_id": user_id,
            "project_id": project_id,
            "failed_attempts": 0,
            "last_attempt": None,
            "frozen_until": None,
            "created_at": datetime.now(timezone.utc)
        }
    else:
        logger.info(f"   → Existing record found: failed_attempts={freeze_record.get('failed_attempts')}")
    
    now = datetime.now(timezone.utc)
    
    if passed:
        # Reset on pass
        quiz_freeze_collection.update_one(
            {"user_id": user_id, "project_id": project_id},
            {"$set": {
                "failed_attempts": 0,
                "last_attempt": now,
                "frozen_until": None
            }},
            upsert=True
        )
        logger.info(f"✅ Quiz attempt recorded as PASS - freeze reset for user {user_id}")
    else:
        # Increment failures
        new_failed_count = freeze_record.get("failed_attempts", 0) + 1
        update_data = {
            "failed_attempts": new_failed_count,
            "last_attempt": now
        }
        
        logger.info(f"   → Failure count incremented: {new_failed_count}/3")
        
        # If 3 failures, freeze for 6 hours
        if new_failed_count >= 3:
            from datetime import timedelta
            frozen_until = now + timedelta(hours=6)
            update_data["frozen_until"] = frozen_until
            logger.warning(f"❌ 🔒 PROJECT FROZEN for user {user_id}: 3 failed attempts reached! Frozen until {frozen_until}")
        
        quiz_freeze_collection.update_one(
            {"user_id": user_id, "project_id": project_id},
            {"$set": update_data},
            upsert=True
        )
        if new_failed_count >= 3:
            logger.warning(f"   → FREEZE RECORD CREATED IN DATABASE")
        else:
            logger.info(f"❌ Quiz attempt recorded as FAIL - attempts: {new_failed_count}/3 for user {user_id}")

# ============================================================================
@router.post("/api/quiz/submit")
async def submit_quiz(sub: QuizSubmission):
    try:
        quiz_doc = project_quizzes_collection.find_one({"_id": ObjectId(sub.quiz_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid quiz_id")
    if not quiz_doc:
        raise HTTPException(status_code=404, detail="Quiz not found")

    score   = 0
    results = []
    for q in quiz_doc.get("questions", []):
        qid      = q.get("id")
        correct  = q.get("correct_answer")
        ans      = next((u for u in sub.user_answers if u.get("question_id") == qid), None)
        selected = ans.get("selected_answer") if ans else None
        is_correct = selected == correct
        if is_correct:
            score += 1
        results.append({
            "question_id": qid, "selected": selected,
            "correct": correct, "is_correct": is_correct,
            "explanation": q.get("explanation", "")
        })

    # Mark quiz as completed
    quiz_update = project_quizzes_collection.update_one(
        {"_id": ObjectId(sub.quiz_id)},
        {"$set": {
            "is_completed": True,
            "score": score,
            "user_answers": sub.user_answers,
            "submitted_at": datetime.now(timezone.utc)
        }}
    )
    logger.info(f"Quiz {sub.quiz_id} updated: is_completed=True, score={score}, docs_modified={quiz_update.modified_count}")

    project_id     = quiz_doc.get("project_id", "")
    # Prefer the user_id from submission (more reliable) over quiz document
    effective_user_id = sub.user_id or quiz_doc.get("user_id", "UNKNOWN")
    
    logger.info(f"📝 Quiz submission - quiz_id: {sub.quiz_id}, user_id: {effective_user_id}, project_id: {project_id}")
    logger.info(f"   → Submitted by: {sub.user_id}, Quiz doc user_id: {quiz_doc.get('user_id', 'N/A')}")

    total_questions = len(quiz_doc.get("questions", []))
    passing_score   = (total_questions * 70 + 99) // 100  # ceil(70%)

    if score >= passing_score:
        logger.info(f"✅ Quiz PASSED! Score: {score}/{total_questions} (≥ {passing_score} required)")
        # Track successful attempt (per project)
        track_quiz_attempt(effective_user_id, project_id, passed=True)
        try:
            proj_result = user_projects_collection.update_one(
                {"_id": ObjectId(project_id)},
                {"$set": {
                    "status": "completed",
                    "completed_at": datetime.now(timezone.utc),
                    "quiz_passed": True,
                    "quiz_score": score
                }}
            )
            logger.info(f"Project {project_id} marked completed: {proj_result.modified_count} docs modified")

        except Exception as e:
            logger.error(f"Failed to update project status: {e}", exc_info=True)
    else:
        logger.info(f"❌ Quiz FAILED! Score: {score}/{total_questions} (need ≥ {passing_score} to pass)")
        # Track failed attempt (per project)
        track_quiz_attempt(effective_user_id, project_id, passed=False)

    logger.info(f"📋 Issuing certificate for user_id='{effective_user_id}', project_id='{project_id}'")
    certificate = maybe_issue_certificate(effective_user_id, project_id)
    logger.info(f"📋 Certificate result: {certificate}")

    return {
        "score":         score,
        "total":         total_questions,
        "passing_score": passing_score,
        "passed":        score >= passing_score,
        "results":       results,
        "certificate":   certificate,
    }

# ============================================================================
# TRACK QUIZ ATTEMPT (for terminations/violations)
# ============================================================================
@router.post("/api/quiz/attempt")
async def track_quiz_attempt_endpoint(data: QuizAttemptRequest):
    """
    Track a quiz attempt when it's terminated due to violations.
    Body: {user_id, quiz_id, passed: bool}
    Note: quiz_id is used to resolve project_id; tracking is per project
    """
    user_id = data.user_id
    quiz_id = data.quiz_id
    passed = data.passed
    
    # Resolve project_id from quiz document
    try:
        quiz_doc = project_quizzes_collection.find_one({"_id": ObjectId(quiz_id)})
        if not quiz_doc:
            raise HTTPException(status_code=404, detail="Quiz not found")
        project_id = quiz_doc.get("project_id", "")
    except Exception as e:
        logger.error(f"Failed to resolve project_id from quiz_id: {e}")
        raise HTTPException(status_code=400, detail="Invalid quiz_id")
    
    logger.info(f"📊 Tracking quiz attempt via endpoint: user_id={user_id}, project_id={project_id}, passed={passed}")
    track_quiz_attempt(user_id, project_id, passed)
    
    is_frozen, frozen_until = check_quiz_frozen(user_id, project_id)
    
    return {
        "success": True,
        "is_frozen": is_frozen,
        "frozen_until": frozen_until.isoformat() if frozen_until else None,
        "message": "Quiz attempt tracked"
    }

# ============================================================================
# CHECK QUIZ FREEZE STATUS
# ============================================================================
@router.get("/api/quiz/check-freeze/{project_id}/{user_id}")
async def check_quiz_freeze_status(project_id: str, user_id: str):
    """
    Check if a project's quiz is frozen for a user.
    Returns freeze status and remaining time if frozen.
    """
    try:
        is_frozen, frozen_until = check_quiz_frozen(user_id, project_id)
        
        if is_frozen and frozen_until:
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc)
            remaining_seconds = int((frozen_until - now).total_seconds())
            remaining_minutes = remaining_seconds // 60
            remaining_hours = remaining_minutes // 60
            remaining_mins = remaining_minutes % 60
            
            logger.info(f"PROJECT {project_id} is frozen for user {user_id}. Remaining: {remaining_hours}h {remaining_mins}m")
            
            return {
                "is_frozen": True,
                "frozen_until": frozen_until.isoformat(),
                "remaining_seconds": max(0, remaining_seconds),
                "remaining_time": f"{remaining_hours}h {remaining_mins}m",
                "message": f"Quiz is frozen. You can retry in {remaining_hours}h {remaining_mins}m"
            }
        else:
            return {
                "is_frozen": False,
                "frozen_until": None,
                "remaining_seconds": 0,
                "remaining_time": None,
                "message": "Quiz is available"
            }
    except Exception as e:
        logger.error(f"Error checking quiz freeze status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error checking freeze status")

# ============================================================================
# PROJECT SUBMISSION
# ============================================================================
@router.post("/api/projects/submit")
async def submit_project(request: ProjectSubmissionRequest):
    # Check if already submitted with pending or approved status
    # ✅ Allow resubmission if previous was REJECTED
    existing = submissions_collection.find_one({
        "user_id":    request.user_id,
        "project_id": request.project_id,
        "status":     {"$in": ["pending", "approved"]}
    })
    if existing:
        raise HTTPException(status_code=409, detail="You have already submitted this project.")

    # ✅ If there's a rejected submission, update it instead of inserting new one
    rejected = submissions_collection.find_one({
        "user_id":    request.user_id,
        "project_id": request.project_id,
        "status":     "rejected"
    })

    now = datetime.now(timezone.utc)

    if rejected:
        # Resubmission — update the existing rejected doc back to pending
        submissions_collection.update_one(
            {"_id": rejected["_id"]},
            {"$set": {
                "description":   request.description,
                "github_url":    request.github_url,
                "live_demo_url": request.live_demo_url,
                "challenges":    request.challenges,
                "learnings":     request.learnings,
                "status":        "pending",
                "submitted_at":  now,
                "reviewed_at":   None,
                "mentor_id":     None,
                "reason":        None,
            }}
        )
        submission_id = str(rejected["_id"])
        logger.info(f"✅ Resubmission — updated rejected submission {submission_id} back to PENDING")

        # Also reset user_project status back to submitted
        try:
            user_projects_collection.update_one(
                {"_id": ObjectId(request.project_id)},
                {"$set": {
                    "status":        "submitted",
                    "submission_id": submission_id,
                }}
            )
            logger.info(f"✅ Project {request.project_id} status reset to SUBMITTED")
        except Exception as e:
            logger.warning(f"Failed to reset project status: {e}")

        updated_doc = submissions_collection.find_one({"_id": rejected["_id"]})
        updated_doc["submission_id"] = submission_id
        return serialize_doc(updated_doc)

    # Fresh first-time submission
    doc = {
        "user_id":       request.user_id,
        "project_id":    request.project_id,
        "description":   request.description,
        "github_url":    request.github_url,
        "live_demo_url": request.live_demo_url,
        "challenges":    request.challenges,
        "learnings":     request.learnings,
        "status":        "pending",
        "submitted_at":  now,
    }
    try:
        result               = submissions_collection.insert_one(doc)
        doc["_id"]           = result.inserted_id
        doc["submission_id"] = str(result.inserted_id)

        try:
            user_projects_collection.update_one(
                {"_id": ObjectId(request.project_id)},
                {"$set": {
                    "submission_id": str(result.inserted_id),
                    "status":        "submitted"
                }}
            )
            logger.info(f"✅ Project {request.project_id} status changed to SUBMITTED")
        except Exception as e:
            logger.warning(f"Failed to link submission: {e}")

    except Exception as e:
        logger.error(f"Submission insert error: {e}")
        raise HTTPException(status_code=500, detail="Error saving submission")

    return serialize_doc(doc)


# ============================================================================
# GET ALL SUBMISSIONS
# ============================================================================
@router.get("/api/submissions")
async def get_all_submissions():
    try:
        docs = list(submissions_collection.find())
        
        # Serialize all ObjectId fields (including nested)
        def serialize_for_json(doc):
            if isinstance(doc, dict):
                return {k: serialize_for_json(v) for k, v in doc.items()}
            elif isinstance(doc, list):
                return [serialize_for_json(item) for item in doc]
            elif isinstance(doc, ObjectId):
                return str(doc)
            else:
                return doc
        
        docs = [serialize_for_json(d) for d in docs]
        
        # Ensure 'submission_id' field exists for frontend compatibility
        for d in docs:
            if "_id" in d and "submission_id" not in d:
                d["submission_id"] = d["_id"]
        
        return {"submissions": docs}
    except Exception as e:
        logger.error(f"Error fetching submissions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


# Mentor-related endpoints have been moved to routes/mentor/mentorRoute.py
# See: /api/submissions/{submission_id}/reject
#      /api/submissions/{submission_id}/approve
#      /api/submissions


@router.get("/api/certificates/{user_id}")
async def get_user_certificates(user_id: str, request: Request):
    try:
        authenticated_email = get_authenticated_user(request)
        logger.info(f"Fetching certs for user_id: {user_id}, session email: {authenticated_email}")

        # Query by both formats — ObjectId string and email
        certs = list(certificates_collection.find({
            "$or": [
                {"user_id": user_id},
                {"user_id": authenticated_email}
            ]
        }))

        logger.info(f"Found {len(certs)} certificates")

        def serialize_for_json(doc):
            if isinstance(doc, dict):
                return {k: serialize_for_json(v) for k, v in doc.items()}
            elif isinstance(doc, list):
                return [serialize_for_json(item) for item in doc]
            elif isinstance(doc, ObjectId):
                return str(doc)
            else:
                return doc

        certs = [serialize_for_json(c) for c in certs]
        return {"certificates": certs}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Certificate retrieval error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error") 

# ============================================================================
# USER PROJECT ROUTES
# ============================================================================

# Certificate reconciliation endpoint - for manual fixing if needed
@router.post("/api/projects/{project_id}/reconcile-certificate")
async def reconcile_certificate(project_id: str):
    """
    Check if a project should have a certificate and issue one if missing.
    Called when quiz is passed but certificate wasn't created.
    """
    try:
        project = user_projects_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        user_id = project.get("user_id", "")
        if not user_id:
            raise HTTPException(status_code=400, detail="Project has no user_id")
        
        logger.info(f"Reconciling certificate for {user_id}/{project_id}")
        
        # Check if quiz passed
        quiz = project_quizzes_collection.find_one({
            "user_id": user_id, "project_id": project_id, "is_completed": True
        })
        if not quiz:
            candidate = project_quizzes_collection.find_one({
                "project_id": project_id, "is_completed": True
                })
            if candidate and str(candidate.get("user_id", "")).lower() in [user_id.lower(), user_id]:
                quiz = candidate
                logger.info(f"Found quiz via fallback for project {project_id}")
        
        total = len(quiz.get("questions", []))
        score = quiz.get("score", 0)
        percentage = round((score / total) * 100) if total > 0 else 0
        
        if percentage < 70:
            raise HTTPException(status_code=400, detail=f"Quiz score {percentage}% is below 70%")
        
        # Check if certificate already exists
        existing = certificates_collection.find_one({"user_id": user_id, "project_id": project_id})
        if existing:
            logger.info(f"Certificate already exists for {project_id}")
            return {"message": "Certificate already exists", "certificate_id": existing.get("certificate_id")}
        
        # Issue certificate
        project_title = project.get("title", project.get("project_title", "Project"))
        technologies = project.get("technologies", [])
        category = project.get("category", "")
        
        cert_doc = {
            "user_id": user_id,
            "project_id": project_id,
            "project_title": project_title,
            "category": category,
            "technologies": technologies,
            "quiz_score": percentage,
            "issued_at": datetime.now(timezone.utc),
            "certificate_id": f"IMMERSIA-{user_id[-6:].upper()}-{project_id[-6:].upper()}",
        }
        result = certificates_collection.insert_one(cert_doc)
        logger.info(f"✅ Certificate reconciled: {cert_doc['certificate_id']}")
        return {"message": "Certificate issued", "certificate_id": cert_doc["certificate_id"]}
    
    except ObjectId.InvalidObjectId:
        raise HTTPException(status_code=400, detail="Invalid project_id format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Certificate reconciliation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.patch("/api/projects/{project_id}/start")
async def start_user_project(project_id: str):
    try:
        logger.info(f"Starting project with _id: {project_id}")
        result = user_projects_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": {"status": "in-progress"}}
        )
        logger.info(f"Update result - matched: {result.matched_count}, modified: {result.modified_count}")
    except Exception as e:
        logger.error(f"Error updating project: {e}")
        raise HTTPException(status_code=400, detail="Invalid project_id")
    if result.matched_count == 0:
        logger.warning(f"Project not found for _id: {project_id}")
        raise HTTPException(status_code=404, detail="Project not found")
    updated = user_projects_collection.find_one({"_id": ObjectId(project_id)})
    if updated:
        logger.info(f"✅ Project {project_id} status changed to IN-PROGRESS")
    return serialize_doc(updated) if updated else {}

@router.patch("/api/projects/{project_id}/complete")
async def complete_user_project(project_id: str):
    try:
        result = user_projects_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project_id")
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    updated = user_projects_collection.find_one({"_id": ObjectId(project_id)})
    return serialize_doc(updated) if updated else {}

@router.post("/api/user-projects")
async def create_user_project(request: CreateUserProjectRequest):
    """Create a user project from marketplace template or other source.
    
    ✅ Prevents duplicates by checking if user already has this project
    """
    try:
        now = datetime.now(timezone.utc)
        
        # 🔍 CHECK FOR DUPLICATES: Does user already have a project with this title?
        existing = user_projects_collection.find_one({
            "user_id": request.user_id,
            "title": request.title
        })
        
        if existing:
            logger.info(f"User {request.user_id} already has project '{request.title}'")
            existing['_id'] = str(existing.get('_id'))
            existing['project_id'] = str(existing.get('_id'))
            return serialize_doc(existing)  # Return existing, don't duplicate
        
        user_project = {
            "user_id": request.user_id,
            "title": request.title,
            "description": request.description,
            "category": request.category,
            "difficulty": request.difficulty,
            "duration": request.duration,
            "technologies": request.technologies,
            "prerequisites": request.prerequisites,
            "project_description": request.project_description,
            "tasks": request.tasks,
            "learning_outcomes": request.learning_outcomes,
            "status": request.status,
            "created_at": now,
            "submission_id": None,  # Will be set when submitted
            "quiz_id": None,  # Will be set when quiz created
        }
        
        logger.info(f"Creating NEW user project for user {request.user_id}: {request.title}")
        result = user_projects_collection.insert_one(user_project)
        user_project['_id'] = result.inserted_id
        user_project['project_id'] = str(result.inserted_id)
        
        logger.info(f"User project created successfully: {result.inserted_id}")
        return serialize_doc(user_project)
    except Exception as e:
        logger.error(f"Error creating user project: {e}")
        raise HTTPException(status_code=500, detail="Failed to create project")

@router.get("/api/projects/{user_id}")
async def get_user_projects(user_id: str, request: Request):
    try:
        authenticated_email = get_authenticated_user(request)
        logger.info(f"Fetching projects for user_id: {user_id}, session email: {authenticated_email}")

        # Query by both the passed user_id AND the session email
        # Covers cases where projects were saved with either format
        projects = list(user_projects_collection.find({
            "$or": [
                {"user_id": user_id},
                {"user_id": authenticated_email}
            ]
        }))

        logger.info(f"Found {len(projects)} projects")

        def serialize_for_json(doc):
            if isinstance(doc, dict):
                return {k: serialize_for_json(v) for k, v in doc.items()}
            elif isinstance(doc, list):
                return [serialize_for_json(item) for item in doc]
            elif isinstance(doc, ObjectId):
                return str(doc)
            else:
                return doc

        projects = [serialize_for_json(p) for p in projects]
        for p in projects:
            if "_id" in p and "id" not in p:
                p["id"] = p["_id"]
            if "_id" in p and "project_id" not in p:
                p["project_id"] = p["_id"]

        return {"projects": projects}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching projects: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# GET SINGLE USER PROJECT BY PROJECT ID (for status updates)
# ============================================================================
@router.get("/api/user-projects/{project_id}")
async def get_user_project(project_id: str):
    """Fetch a single user project by its ID (not user_id)"""
    try:
        try:
            obj_id = ObjectId(project_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid project_id format")
        
        project = user_projects_collection.find_one({"_id": obj_id})
        if not project:
            raise HTTPException(status_code=404, detail="User project not found")
        
        # Proper serialization: convert ALL ObjectId fields to strings
        def serialize_for_json(doc):
            """Recursively convert ObjectId fields to strings"""
            if isinstance(doc, dict):
                return {k: serialize_for_json(v) for k, v in doc.items()}
            elif isinstance(doc, list):
                return [serialize_for_json(item) for item in doc]
            elif isinstance(doc, ObjectId):
                return str(doc)
            else:
                return doc
        
        project = serialize_for_json(project)
        logger.info(f"Fetched user_project {project_id}: status={project.get('status')}, quiz_passed={project.get('quiz_passed')}")
        return project
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user project: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
    

# Mentor approval endpoints have been moved to routes/mentor/mentorRoute.py
# See: /api/submissions/{submission_id}/approve
