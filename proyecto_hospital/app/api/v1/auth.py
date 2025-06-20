from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.schemas.auth import LoginRequest, Token, TokenData
from app.services.auth_service import AuthService

router = APIRouter()
security = HTTPBearer()

@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Endpoint para autenticación de usuarios"""
    return AuthService.authenticate_user(db, login_data)

async def get_current_user_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Dependency para obtener el usuario actual desde el token"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = AuthService.get_current_user(db, payload)
    return {"user": user, "token_data": payload, "username": payload.get("sub")}

async def get_hospital_id(
    auth_data: dict = Depends(get_current_user_token)
):
    """Dependency para extraer el hospital_id del token"""
    return auth_data["token_data"]["hospital_id"] 