from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime, timedelta
import random
from jose import jwt
import sqlite3
import os

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title="Sistema Hospitalario API",
    description="API para sistema hospitalario multi-tenant",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuración CORS específica para resolver NetworkError
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "authorization",
        "content-type",
        "accept",
        "origin",
        "x-requested-with",
        "x-csrf-token",
        "cache-control"
    ],
    expose_headers=["*"],
    max_age=3600
)

# Modelos Pydantic
class User(BaseModel):
    username: str
    password: str
    hospital: str
    role: str = "admin"

class LoginRequest(BaseModel):
    usuario: str
    password: str
    hospital: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: str
    hospital: str
    role: str

class EpisodioEstadistico(BaseModel):
    id: str
    numero_episodio: str
    paciente_nombre: str
    fecha_ingreso: str
    estado: str
    prioridad: Optional[str] = None

class EstadisticasResponse(BaseModel):
    episodios_sin_triaje: int
    cantidad_episodios_sin_triaje: int
    total_episodios: int
    episodios_waiting: int
    episodios_completos: List[EpisodioEstadistico]
    waitingEpisodes: List[EpisodioEstadistico]

# Datos simulados para el sistema hospitalario
def generar_episodios_simulados():
    """Genera datos simulados de episodios hospitalarios"""
    pacientes = [
        "Juan Pérez", "María García", "Carlos López", "Ana Martínez",
        "Luis Rodríguez", "Carmen Sánchez", "Pedro Fernández", "Isabel Torres"
    ]
    
    episodios = []
    for i in range(15):
        episodio = EpisodioEstadistico(
            id=f"ep-{i+1:03d}",
            numero_episodio=f"EP{i+1:03d}",
            paciente_nombre=random.choice(pacientes),
            fecha_ingreso=(datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
            estado=random.choice(["waiting", "triaged", "completed", "cancelled"]),
            prioridad=random.choice(["Alta", "Media", "Baja"]) if random.random() > 0.3 else None
        )
        episodios.append(episodio)
    
    return episodios

# Endpoint raíz
@app.get("/")
async def root():
    """Endpoint raíz del sistema hospitalario"""
    logger.info("Acceso al endpoint raíz")
    return {
        "mensaje": "Sistema Hospitalario API",
        "version": "1.0.0",
        "documentación": "/docs",
        "estado": "operativo",
        "timestamp": datetime.now().isoformat(),
        "endpoints_disponibles": [
            "/episodios/estadisticos",
            "/api/auth/login",
            "/health",
            "/test/episodios"
        ]
    }

# Endpoint de salud
@app.get("/health")
async def health_check():
    """Endpoint para verificar el estado del sistema"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "cors_enabled": True,
        "endpoints": ["/episodios/estadisticos", "/api/auth/login"],
        "frontend_url": "http://localhost:3000",
        "backend_url": "http://127.0.0.1:8000"
    }

# Endpoint específico que está causando NetworkError
@app.get("/episodios/estadisticos", response_model=EstadisticasResponse)
async def obtener_estadisticos_episodios():
    """Endpoint específico para estadísticas de episodios - SOLUCIONA NETWORKERROR"""
    logger.info("Acceso al endpoint /episodios/estadisticos")
    
    try:
        # Generar datos simulados
        episodios = generar_episodios_simulados()
        
        # Calcular estadísticas
        episodios_sin_triaje = len([e for e in episodios if e.prioridad is None])
        episodios_waiting = len([e for e in episodios if e.estado == "waiting"])
        total_episodios = len(episodios)
        
        # Separar episodios completos y en espera
        episodios_completos = [e for e in episodios if e.estado == "completed"]
        waiting_episodes = [e for e in episodios if e.estado == "waiting"]
        
        response = EstadisticasResponse(
            episodios_sin_triaje=episodios_sin_triaje,
            cantidad_episodios_sin_triaje=episodios_sin_triaje,
            total_episodios=total_episodios,
            episodios_waiting=episodios_waiting,
            episodios_completos=episodios_completos,
            waitingEpisodes=waiting_episodes
        )
        
        logger.info(f"Estadísticas generadas: {total_episodios} episodios totales")
        return response
        
    except Exception as e:
        logger.error(f"Error generando estadísticas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

# Endpoint de autenticación
@app.post("/api/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """Endpoint de autenticación"""
    logger.info(f"Intento de login para usuario: {login_data.usuario}")
    
    # Validar credenciales (simulado)
    if (login_data.usuario == "admin" and 
        login_data.password == "admin123" and 
        login_data.hospital == "HOSP001"):
        
        response = LoginResponse(
            access_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaG9zcGl0YWwiOiJIT1NQMDAxIiwiaWF0IjoxNzM1MDAwMDAwfQ.fake-signature",
            token_type="bearer",
            usuario="admin",
            hospital="HOSP001",
            role="admin"
        )
        
        logger.info("Login exitoso")
        return response
    else:
        logger.warning("Login fallido - credenciales incorrectas")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )

# Endpoint de prueba para verificar CORS
@app.get("/test/episodios")
async def test_episodios():
    """Endpoint de prueba para verificar CORS"""
    return {
        "status": "endpoint working",
        "cors": "enabled",
        "timestamp": datetime.now().isoformat(),
        "message": "CORS está funcionando correctamente"
    }

# Endpoint para verificar conectividad
@app.get("/test/connectivity")
async def test_connectivity():
    """Endpoint para verificar conectividad desde frontend"""
    return {
        "status": "connected",
        "backend_url": "http://127.0.0.1:8000",
        "frontend_url": "http://localhost:3000",
        "cors_enabled": True,
        "timestamp": datetime.now().isoformat()
    }

# Middleware para logging de requests
@app.middleware("http")
async def log_requests(request, call_next):
    """Middleware para loguear todas las requests"""
    start_time = datetime.now()
    
    # Log de la request entrante
    logger.info(f"📥 {request.method} {request.url.path}")
    
    # Procesar la request
    response = await call_next(request)
    
    # Log del response
    process_time = (datetime.now() - start_time).total_seconds()
    logger.info(f"📤 Status: {response.status_code} - Time: {process_time:.3f}s")
    
    return response

# Manejar errores globalmente
@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.error(f"Error global: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor",
            "type": type(exc).__name__,
            "message": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

# --- Inicializar BD y usuario de prueba ---
def init_db():
    conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), "hospital.db"))
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        hospital TEXT,
        role TEXT
    )
    """)
    # Usuario de prueba
    c.execute("SELECT * FROM users WHERE username=?", ("admin",))
    if not c.fetchone():
        c.execute("INSERT INTO users (username, password, hospital, role) VALUES (?, ?, ?, ?)",
                  ("admin", "admin123", "HOSP001", "admin"))
    conn.commit()
    conn.close()

init_db()

def authenticate_user(username: str, password: str, hospital: str):
    conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), "hospital.db"))
    c = conn.cursor()
    c.execute("SELECT username, password, hospital, role FROM users WHERE username=?", (username,))
    row = c.fetchone()
    conn.close()
    if row and row[1] == password and row[2] == hospital:
        return User(username=row[0], password=row[1], hospital=row[2], role=row[3])
    return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=60))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, "hospital-secret-key", algorithm="HS256")

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Iniciando servidor FastAPI...")
    logger.info("📍 URL: http://127.0.0.1:8000")
    logger.info("📚 Documentación: http://127.0.0.1:8000/docs")
    logger.info("🔧 Health Check: http://127.0.0.1:8000/health")
    logger.info("🎯 Endpoint crítico: http://127.0.0.1:8000/episodios/estadisticos")
    
    uvicorn.run(
        "main:app", 
        host="127.0.0.1", 
        port=8000, 
        log_level="info",
        reload=False
    ) 