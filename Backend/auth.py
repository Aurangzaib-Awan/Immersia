from datetime import datetime,timedelta,timezone
from jose import jwt

SECRET_KEY="n3f9j2f9@#FJ23f923f923fj2f9j2FJ23f9!@#FJ23f9j2f9"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60

def create_access_token(data:dict , expires_delta:timedelta|None = None):
    to_encode=data.copy()
    expire=datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) # main encoding happens here
    return encoded_jwt