from fastapi import FastAPI
from pydantic import BaseModel, EmailStr
from con import client
from models.user import User
from passlib.context import CryptContext
from auth import create_access_token

app=FastAPI()

db = client["immersia"]            # choose DB name
users_collection = db["users"]     # collection

pwd_context=CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(pwd:str):
    return pwd_context.hash(pwd)

@app.post("/signup")
async def create_user(user:User):
    user_dict=user.model_dump()
    user_dict["password"]=hash_password(user_dict["password"]) # hashing the password

    result=users_collection.insert_one(user_dict)

    token=create_access_token({"email":user.email})
    
    return{"access_token":token,
           "token_type": "bearer"}

