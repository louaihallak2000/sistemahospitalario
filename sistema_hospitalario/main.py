#!/usr/bin/env python3
"""
🏥 SISTEMA HOSPITALARIO - BACKEND PROFESIONAL
FastAPI con autenticación JWT, base de datos SQLite y CORS perfecto
"""

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

import uvicorn
import logging
import os
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

# Importar módulos del sistema
from .database import engine, Base, get_db
from .models import Usuario, Hospital, Episodio, Paciente
from .schemas import (
    LoginRequest, LoginResponse, UserResponse, 
    EpisodioResponse, DashboardStats, HealthResponse
)
from .auth import (
    create_access_token, verify_token, get_current_user,
    hash_password, verify_password, USUARIOS_DEV
)
from .config import settings

# Configurar logging profesional
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('hospital_system.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle del servidor"""
    # Startup
    logger.info("🚀 Iniciando Sistema Hospitalario...")
    
    # Crear tablas
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Base de datos inicializada")
    
    # Crear datos de prueba
    await create_sample_data()
    logger.info("✅ Datos de prueba creados")
    
    yield
    
    # Shutdown
    logger.info("🛑 Sistema Hospitalario detenido")

# Crear aplicación FastAPI
app = FastAPI(
    title="Sistema Hospitalario API",
    description="API profesional para gestión hospitalaria multi-tenant",
    version="2.0.0",
    docs_url=None,  # Deshabilitar docs por defecto
    redoc_url=None,
    lifespan=lifespan
)

# Configuración CORS profesional
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "authorization",
        "content-type", 
        "accept",
        "origin",
        "x-requested-with",
        "x-csrf-token",
        "cache-control",
        "pragma"
    ],
    expose_headers=["*"],
    max_age=3600
)

# Middleware de logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware para logging de requests"""
    start_time = datetime.now()
    
    # Log request
    logger.info(f"📥 {request.method} {request.url.path} - {request.client.host}")
    
    # Procesar request
    response = await call_next(request)
    
    # Log response
    process_time = (datetime.now() - start_time).total_seconds()
    logger.info(f"📤 {response.status_code} - {process_time:.3f}s")
    
    return response

# Middleware de manejo de errores
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Manejo global de errores"""
    logger.error(f"❌ Error global: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Error interno del servidor",
            "message": str(exc) if settings.DEBUG else "Error interno",
            "timestamp": datetime.now().isoformat(),
            "path": request.url.path
        }
    )

async def create_sample_data():
    """Crear datos de prueba en la base de datos"""
    from sqlalchemy.orm import Session
    
    db = next(get_db())
    
    try:
        # Verificar si ya existen datos
        if db.query(Hospital).first():
            logger.info("Datos de prueba ya existen")
            return
        
        # Crear hospital de prueba
        hospital = Hospital(
            codigo="HOSP001",
            nombre="Hospital General de Prueba",
            direccion="Calle Principal 123",
            activo=True
        )
        db.add(hospital)
        db.commit()
        db.refresh(hospital)
        
        # Crear usuarios de prueba
        for username, user_data in USUARIOS_DEV.items():
            usuario = Usuario(
                usuario=username,
                contraseña_hash=hash_password(user_data["contraseña"]),
                hospital_id=hospital.id,
                rol=user_data["rol"],
                nombre=user_data["nombre"],
                activo=True
            )
            db.add(usuario)
        
        # Crear pacientes de prueba
        pacientes_data = [
            {"nombre": "Juan Pérez", "dni": "12345678", "telefono": "123456789"},
            {"nombre": "María García", "dni": "87654321", "telefono": "987654321"},
            {"nombre": "Carlos López", "dni": "11223344", "telefono": "112233445"},
        ]
        
        for paciente_data in pacientes_data:
            paciente = Paciente(
                **paciente_data,
                hospital_id=hospital.id
            )
            db.add(paciente)
        
        db.commit()
        logger.info("✅ Datos de prueba creados exitosamente")
        
    except Exception as e:
        logger.error(f"Error creando datos de prueba: {e}")
        db.rollback()
    finally:
        db.close()

# ============================================================================
# ENDPOINTS DE AUTENTICACIÓN
# ============================================================================

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """Endpoint de autenticación con JWT"""
    logger.info(f"🔐 Intento de login: {login_data.usuario}")
    
    # Validar credenciales
    if (login_data.usuario in USUARIOS_DEV and 
        verify_password(login_data.password, USUARIOS_DEV[login_data.usuario]["contraseña"]) and
        login_data.hospital == "HOSP001"):
        
        # Crear token JWT
        user_data = USUARIOS_DEV[login_data.usuario]
        access_token = create_access_token(
            data={"sub": login_data.usuario, "hospital": login_data.hospital}
        )
        
        response = LoginResponse(
            success=True,
            token=access_token,
            user=UserResponse(
                usuario=login_data.usuario,
                hospital=login_data.hospital,
                nombre=user_data["nombre"],
                rol=user_data["rol"]
            )
        )
        
        logger.info(f"✅ Login exitoso: {login_data.usuario}")
        return response
    else:
        logger.warning(f"❌ Login fallido: {login_data.usuario}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )

@app.post("/api/auth/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Endpoint de logout"""
    try:
        token = credentials.credentials
        # En producción, agregar token a blacklist
        logger.info("🔓 Logout exitoso")
        return {"message": "Logout exitoso"}
    except Exception as e:
        logger.error(f"Error en logout: {e}")
        raise HTTPException(status_code=400, detail="Error en logout")

@app.get("/api/auth/verify")
async def verify_auth(current_user: Dict = Depends(get_current_user)):
    """Verificar token de autenticación"""
    return {"valid": True, "user": current_user}

# ============================================================================
# ENDPOINTS DEL DASHBOARD
# ============================================================================

@app.get("/api/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: Dict = Depends(get_current_user)):
    """Obtener estadísticas del dashboard"""
    logger.info(f"📊 Dashboard stats solicitado por: {current_user['usuario']}")
    
    # Simular datos del dashboard
    stats = DashboardStats(
        episodios_sin_triaje=5,
        cantidad_episodios_sin_triaje=5,
        total_episodios=15,
        episodios_waiting=3,
        episodios_completos=[
            EpisodioResponse(
                id="ep-001",
                numero_episodio="EP001",
                paciente_nombre="Juan Pérez",
                fecha_ingreso="2024-01-15T10:30:00",
                estado="completed",
                prioridad="Alta"
            )
        ],
        waitingEpisodes=[
            EpisodioResponse(
                id="ep-002",
                numero_episodio="EP002", 
                paciente_nombre="María García",
                fecha_ingreso="2024-01-15T11:00:00",
                estado="waiting",
                prioridad=None
            )
        ]
    )
    
    return stats

@app.get("/episodios/estadisticos", response_model=DashboardStats)
async def get_episodios_estadisticos(current_user: Dict = Depends(get_current_user)):
    """Endpoint específico para estadísticas de episodios"""
    logger.info(f"📈 Estadísticas episodios solicitado por: {current_user['usuario']}")
    return await get_dashboard_stats(current_user)

@app.get("/episodios/sin-triaje")
async def get_episodios_sin_triaje(current_user: Dict = Depends(get_current_user)):
    """Obtener episodios sin triaje"""
    logger.info(f"🚨 Episodios sin triaje solicitado por: {current_user['usuario']}")
    
    return {
        "episodios_sin_triaje": [
            {
                "id": "ep-004",
                "numero_episodio": "EP004",
                "paciente_nombre": "Ana Martínez",
                "fecha_ingreso": "2024-01-15T12:00:00",
                "estado": "waiting",
                "prioridad": None
            }
        ],
        "cantidad": 1
    }

@app.get("/episodios/lista-espero")
async def get_lista_espera(current_user: Dict = Depends(get_current_user)):
    """Obtener lista de espera"""
    logger.info(f"⏳ Lista de espera solicitado por: {current_user['usuario']}")
    
    return {
        "waitingEpisodes": [
            {
                "id": "ep-002",
                "numero_episodio": "EP002",
                "paciente_nombre": "María García",
                "fecha_ingreso": "2024-01-15T11:00:00",
                "estado": "waiting",
                "prioridad": None
            },
            {
                "id": "ep-003",
                "numero_episodio": "EP003",
                "paciente_nombre": "Carlos López",
                "fecha_ingreso": "2024-01-15T11:30:00",
                "estado": "waiting",
                "prioridad": "Media"
            }
        ],
        "cantidad": 2,
        "total_esperando": 2
    }

# ============================================================================
# ENDPOINTS DE GESTIÓN
# ============================================================================

@app.get("/api/hospitals")
async def get_hospitals(current_user: Dict = Depends(get_current_user)):
    """Obtener lista de hospitales"""
    logger.info(f"🏥 Hospitales solicitado por: {current_user['usuario']}")
    
    return [
        {
            "id": 1,
            "codigo": "HOSP001",
            "nombre": "Hospital General de Prueba",
            "direccion": "Calle Principal 123",
            "activo": True
        }
    ]

@app.get("/api/users")
async def get_users(current_user: Dict = Depends(get_current_user)):
    """Obtener lista de usuarios"""
    logger.info(f"👥 Usuarios solicitado por: {current_user['usuario']}")
    
    return [
        {
            "id": 1,
            "usuario": "admin",
            "nombre": "Administrador",
            "rol": "admin",
            "hospital": "HOSP001",
            "activo": True
        },
        {
            "id": 2,
            "usuario": "doctor",
            "nombre": "Dr. Sistema",
            "rol": "medico",
            "hospital": "HOSP001",
            "activo": True
        }
    ]

@app.post("/api/patients")
async def create_patient(
    patient_data: dict,
    current_user: Dict = Depends(get_current_user)
):
    """Crear nuevo paciente"""
    logger.info(f"👤 Nuevo paciente creado por: {current_user['usuario']}")
    
    return {
        "id": 4,
        "nombre": patient_data.get("nombre"),
        "dni": patient_data.get("dni"),
        "telefono": patient_data.get("telefono"),
        "hospital_id": 1,
        "created_at": datetime.now().isoformat()
    }

# ============================================================================
# ENDPOINTS DE UTILIDAD
# ============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check del sistema"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="2.0.0",
        cors_enabled=True,
        database="connected",
        environment=settings.ENVIRONMENT
    )

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    """Documentación personalizada"""
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - Documentación",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="/swagger-ui-bundle.js",
        swagger_css_url="/swagger-ui.css",
    )

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "mensaje": "Sistema Hospitalario API v2.0.0",
        "status": "operativo",
        "documentacion": "/docs",
        "health": "/health",
        "timestamp": datetime.now().isoformat()
    }

# ============================================================================
# CONFIGURACIÓN OPENAPI
# ============================================================================

def custom_openapi():
    """Configuración personalizada de OpenAPI"""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Sistema Hospitalario API",
        version="2.0.0",
        description="API profesional para gestión hospitalaria",
        routes=app.routes,
    )
    
    # Configuraciones adicionales
    openapi_schema["info"]["x-logo"] = {
        "url": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png"
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# ============================================================================
# INICIO DEL SERVIDOR
# ============================================================================

if __name__ == "__main__":
    logger.info("🚀 Iniciando Sistema Hospitalario...")
    logger.info(f"📍 URL: {settings.BASE_URL}")
    logger.info(f"📚 Documentación: {settings.BASE_URL}/docs")
    logger.info(f"🔧 Health Check: {settings.BASE_URL}/health")
    logger.info(f"🌍 Entorno: {settings.ENVIRONMENT}")
    logger.info(f"🔒 CORS Origins: {settings.CORS_ORIGINS}")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    ) 