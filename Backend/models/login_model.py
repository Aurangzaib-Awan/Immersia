from pydantic import BaseModel,EmailStr

class Login_Model(BaseModel):
    email:EmailStr
    password:str