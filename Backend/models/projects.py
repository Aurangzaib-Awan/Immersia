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