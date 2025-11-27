from pydantic import BaseModel
from datetime import datetime

class Course(BaseModel):
    title: str
    description: str
    category: str
    instructor: str
    duration: str
    lessons: int
