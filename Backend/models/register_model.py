from pydantic import BaseModel, EmailStr

class Register_Model(BaseModel):
    fullname: str
    email: EmailStr
    password: str

