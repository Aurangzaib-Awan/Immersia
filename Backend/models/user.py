from pydantic import BaseModel
from pydantic import EmailStr

class User(BaseModel):
    fullname:str
    email:EmailStr
    password:str