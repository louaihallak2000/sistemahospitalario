from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import time
import logging

from app.api.v1 import auth, pacientes, episodios
from app.core.database import engine, Base

# Importar todos los modelos para que SQLAlchemy los reconozca
from app.models import hospital, usuario, paciente, episodio

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Crear aplicación FastAPI
app = FastAPI(
    title="Sistema Hospitalario",
    description="Sistema hospitalario multi-tenant para gestión de pacientes y episodios médicos",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS con configuración específica
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Middleware para asegurar headers CORS en todas las respuestas
@app.middleware("http")
async def ensure_cors_headers(request: Request, call_next):
    """Middleware para asegurar headers CORS en todas las respuestas"""
    response = await call_next(request)
    
    # Agregar headers CORS manualmente si no están presentes
    origin = request.headers.get("origin")
    if origin in ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"]:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Expose-Headers"] = "*"
    
    return response

# Middleware para validar hospital_id en requests autenticadas
@app.middleware("http")
async def validate_hospital_context(request: Request, call_next):
    """Middleware para validar el contexto del hospital en requests autenticadas"""
    start_time = time.time()
    
    # Excluir rutas que no requieren validación de hospital
    excluded_paths = ["/docs", "/redoc", "/openapi.json", "/auth/login", "/"]
    
    if request.url.path in excluded_paths or request.url.path.startswith("/docs"):
        response = await call_next(request)
    else:
        # Para rutas protegidas, la validación se hace en los dependencies
        response = await call_next(request)
    
    # Log de tiempo de procesamiento
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
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

# Endpoint raíz
@app.get("/")
async def root():
    """Endpoint raíz del sistema hospitalario"""
    return {
        "mensaje": "Sistema Hospitalario Multi-Tenant",
        "version": "1.0.0",
        "documentación": "/docs"
    }

# Endpoint de salud
@app.get("/health")
async def health_check():
    """Endpoint para verificar el estado del sistema"""
    return {
        "status": "healthy",
        "timestamp": time.time()
    }

# Manejar requests OPTIONS para CORS preflight
@app.options("/{path:path}")
async def options_handler(request: Request):
    """Manejar requests OPTIONS para CORS preflight"""
    return {
        "status": "ok"
    }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 