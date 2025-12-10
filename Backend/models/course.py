from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
class Resource(BaseModel):
    title: str
    url: str

class Duration(BaseModel):
    value: str  # Stored as string but validated as integer in frontend
    unit: str   # minutes, hours, days, weeks

class Lesson(BaseModel):
    title: str
    type: str  # video, reading
    description: str
    resources: List[Resource]
    learningObjectives: List[str]
    duration: Duration

class Module(BaseModel):
    title: str
    description: str
    estimatedTime: Duration
    order: int
    lessons: List[Lesson]

class Course(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    category: str
    curator: str 
    modules: List[Module]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None