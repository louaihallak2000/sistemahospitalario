from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    hospital_code: str
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    hospital_id: Optional[str] = None
    username: Optional[str] = None
    user_id: Optional[str] = None 