from fastapi import HTTPException,APIRouter
from passlib.context import CryptContext
from auth import create_access_token
from con import client
from models.login_model import Login_Model

router=APIRouter()

db=client["immersia"]
users_collection=db["users"]

pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")

def verify_pwd(plain_pwd,hashed):
    return pwd_context.verify(plain_pwd,hashed)

@router.post("/login")
async def login(user:Login_Model):
    try:
        temp_user=users_collection.find_one({"email":user.email}) #bringing the user that has the same email

        if not temp_user:
            raise HTTPException(status_code=400, detail="User not found")
    
        if not verify_pwd(user.password,temp_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid password")
    
        token=create_access_token({"email":user.email})
        return {
        "token":token,
        "token_type":"bearer"
        }
    except Exception as e:
        print("login error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")