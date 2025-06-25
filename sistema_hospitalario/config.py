"""
⚙️ Configuración del Sistema Hospitalario
Configuración profesional para diferentes entornos
"""

import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Configuración del sistema"""
    
    # Configuración básica
    APP_NAME: str = "Sistema Hospitalario"
    VERSION: str = "2.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # Servidor
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    BASE_URL: str = "http://127.0.0.1:8000"
    
    # Base de datos
    DATABASE_URL: str = "sqlite:///./hospital_system.db"
    
    # JWT
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001"
    ]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "hospital_system.log"
    
    # Seguridad
    PASSWORD_MIN_LENGTH: int = 8
    MAX_LOGIN_ATTEMPTS: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Configuración por entorno
def get_settings() -> Settings:
    """Obtener configuración según el entorno"""
    env = os.getenv("ENVIRONMENT", "development")
    
    if env == "production":
        return Settings(
            DEBUG=False,
            ENVIRONMENT="production",
            JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY", "super-secure-production-key"),
            CORS_ORIGINS=[
                "https://tu-dominio.com",
                "https://www.tu-dominio.com"
            ],
            DATABASE_URL=os.getenv("DATABASE_URL", "postgresql://user:pass@host/db")
        )
    elif env == "testing":
        return Settings(
            DEBUG=True,
            ENVIRONMENT="testing",
            DATABASE_URL="sqlite:///./test_hospital.db",
            CORS_ORIGINS=["http://localhost:3000"]
        )
    else:
        return Settings()

# Instancia global de configuración
settings = get_settings() 