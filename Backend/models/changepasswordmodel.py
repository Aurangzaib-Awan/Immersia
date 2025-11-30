from pydantic import BaseModel

class ChangePasswordModel(BaseModel):
    current_password: str
    new_password: str