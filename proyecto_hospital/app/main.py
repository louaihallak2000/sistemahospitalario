from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time
import logging
from datetime import datetime

from app.api.v1 import auth, pacientes, episodios, enfermeria, websocket
from app.api.v1 import admision as admision_api
from app.core.database import engine, Base

# Importar todos los modelos para que SQLAlchemy los reconozca
from app.models import hospital, usuario, paciente, episodio, admision, enfermeria as enfermeria_model, historia_clinica

# Configurar logging detallado
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)
logger.info("✅ Base de datos inicializada")

# Crear aplicación FastAPI
app = FastAPI(
    title="Sistema Hospitalario",
    description="Sistema hospitalario multi-tenant para gestión de pacientes y episodios médicos",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS con configuración mejorada para resolver NetworkError
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://192.168.0.25:3000",
        "http://192.168.0.25:3001"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "authorization", 
        "content-type", 
        "cache-control",
        "accept",
        "origin",
        "x-requested-with",
        "x-csrf-token"
    ],
    expose_headers=["*"],
    max_age=3600
)

# Middleware para logging de requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware para loguear todas las requests"""
    start_time = time.time()
    
    # Log de la request entrante
    logger.debug(f"📥 {request.method} {request.url.path}")
    logger.debug(f"Headers: {dict(request.headers)}")
    
    # Procesar la request
    response = await call_next(request)
    
    # Log del response
    process_time = time.time() - start_time
    logger.debug(f"📤 Status: {response.status_code} - Time: {process_time:.3f}s")
    
    return response

# Middleware para asegurar headers CORS en todas las respuestas
@app.middleware("http")
async def ensure_cors_headers(request: Request, call_next):
    """Middleware para asegurar headers CORS en todas las respuestas"""
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:3001",
        "http://192.168.0.25:3000",
        "http://192.168.0.25:3001"
    ]
    allowed_headers = "authorization, content-type, cache-control, accept, origin, x-requested-with, x-csrf-token"
    allowed_methods = "GET, POST, PUT, DELETE, OPTIONS, PATCH"

    # Manejar preflight OPTIONS
    if request.method == "OPTIONS":
        response = JSONResponse(content={"status": "ok"})
        origin = request.headers.get("origin")
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = allowed_methods
            response.headers["Access-Control-Allow-Headers"] = allowed_headers
            response.headers["Access-Control-Max-Age"] = "3600"
        return response

    response = await call_next(request)

    # Agregar headers CORS manualmente si no están presentes
    origin = request.headers.get("origin")
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = allowed_methods
        response.headers["Access-Control-Allow-Headers"] = allowed_headers
        response.headers["Access-Control-Expose-Headers"] = "*"
        response.headers["Access-Control-Max-Age"] = "3600"

    return response

# Middleware para validar hospital_id en requests autenticadas
@app.middleware("http")
async def validate_hospital_context(request: Request, call_next):
    """Middleware para validar el contexto del hospital en requests autenticadas"""
    # Excluir rutas que no requieren validación de hospital
    excluded_paths = ["/docs", "/redoc", "/openapi.json", "/auth/login", "/", "/health"]
    
    if request.url.path in excluded_paths or request.url.path.startswith("/docs"):
        response = await call_next(request)
    else:
        # Para rutas protegidas, la validación se hace en los dependencies
        response = await call_next(request)
    
    # Agregar header de tiempo de procesamiento
    response.headers["X-Process-Time"] = str(time.time())
    
    return response

# Incluir routers
app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Autenticación"]
)

app.include_router(
    pacientes.router,
    prefix="/pacientes",
    tags=["Pacientes"]
)

app.include_router(
    episodios.router,
    prefix="/episodios", 
    tags=["Episodios"]
)

app.include_router(
    admision_api.router,
    prefix="/admision",
    tags=["Admisión"]
)

app.include_router(
    enfermeria.router,
    prefix="/enfermeria",
    tags=["Enfermería"]
)

app.include_router(
    websocket.router,
    prefix="/realtime",
    tags=["WebSocket y Notificaciones"]
)

# Endpoint raíz
@app.get("/")
async def root():
    """Endpoint raíz del sistema hospitalario"""
    logger.info("Acceso al endpoint raíz")
    return {
        "mensaje": "Sistema Hospitalario Multi-Tenant",
        "version": "1.0.0",
        "documentación": "/docs",
        "estado": "operativo",
        "timestamp": datetime.now().isoformat()
    }

# Endpoint de salud mejorado
@app.get("/health")
async def health_check():
    """Endpoint para verificar el estado del sistema"""
    try:
        # Verificar conexión a la base de datos
        from app.core.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Error en health check de DB: {e}")
        db_status = "unhealthy"
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": db_status,
        "version": "1.0.0"
    }

# Manejar errores globalmente
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error global: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor",
            "type": type(exc).__name__,
            "message": str(exc)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug") 