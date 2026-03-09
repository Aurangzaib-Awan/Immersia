from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class User(BaseModel):
    id: Optional[str] = None

    fullname: str
    email: EmailStr
    password: str

    role: str = "student"

    selectedCareer: str

    knownTopics: List[str] = []
    unknownTopics: List[str] = []

    learningStyle: str = "project"

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None