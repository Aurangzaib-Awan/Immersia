from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Project(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    category: str
    curator: str
    technologies: List[str]
    difficulty: str
    duration: str
    prerequisites: List[str]
    project_description: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserProject(BaseModel):
    project_id: Optional[str] = None
    user_id: str
    skills: List[str]
    project_title: str
    project_description: str
    tasks: List[str]
    learning_outcomes: str
    status: str = "pending"
    created_at: Optional[datetime] = None


class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    # correct_answer omitted when returning to frontend
    correct_answer: Optional[str] = None
    explanation: str


class ProjectQuiz(BaseModel):
    project_id: str
    user_id: str
    questions: List[QuizQuestion]
    created_at: Optional[datetime] = None
    is_completed: bool = False