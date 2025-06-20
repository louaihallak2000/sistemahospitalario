from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.usuario import Usuario
from app.core.security import verify_password, create_access_token
from app.schemas.auth import LoginRequest, Token
from datetime import timedelta, datetime

class AuthService:
    @staticmethod
    def authenticate_user(db: Session, login_data: LoginRequest) -> Token:
        """Autentica un usuario y retorna un token JWT"""
        user = db.query(Usuario).filter(
            Usuario.username == login_data.username,
            Usuario.hospital_id == login_data.hospital_code,
            Usuario.activo == True
        ).first()
        
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Actualizar último acceso
        user.ultimo_acceso = datetime.utcnow()
        db.commit()
        
        # Crear token con información del usuario
        access_token_expires = timedelta(minutes=480)
        access_token = create_access_token(
            data={
                "sub": user.username,
                "hospital_id": user.hospital_id,
                "user_id": str(user.id),
                "rol": user.rol
            },
            expires_delta=access_token_expires
        )
        
        return Token(access_token=access_token, token_type="bearer")
    
    @staticmethod
    def get_current_user(db: Session, token_data: dict) -> Usuario:
        """Obtiene el usuario actual basado en el token"""
        user = db.query(Usuario).filter(
            Usuario.id == token_data.get("user_id"),  # No convertir a int, es un UUID
            Usuario.hospital_id == token_data.get("hospital_id"),
            Usuario.activo == True
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user 