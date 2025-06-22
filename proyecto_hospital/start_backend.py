"""
Script para iniciar el backend del sistema hospitalario
Ejecutar con: python start_backend.py
"""

import os
import sys
import subprocess
import time
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_dependencies():
    """Verificar que todas las dependencias estén instaladas"""
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import passlib
        import jose
        import pydantic
        import pydantic_settings
        import httpx
        logger.info("✅ Todas las dependencias están instaladas")
        return True
    except ImportError as e:
        logger.error(f"❌ Falta instalar dependencias: {e}")
        logger.info("Ejecuta: pip install -r requirements.txt")
        return False

def check_database():
    """Verificar que la base de datos exista"""
    db_path = os.path.join(os.path.dirname(__file__), "hospital_db.sqlite")
    if not os.path.exists(db_path):
        logger.warning("⚠️ Base de datos no encontrada. Creando...")
        try:
            subprocess.run([sys.executable, "init_db.py"], check=True)
            logger.info("✅ Base de datos creada exitosamente")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Error creando base de datos: {e}")
            return False
    else:
        logger.info("✅ Base de datos encontrada")
        return True

def check_env_file():
    """Verificar que exista el archivo .env"""
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        logger.warning("⚠️ Archivo .env no encontrado. Creando con valores por defecto...")
        with open(env_path, "w") as f:
            f.write("DATABASE_URL=sqlite:///./hospital_db.sqlite\n")
            f.write("SECRET_KEY=your-super-secret-key-here-123456789\n")
            f.write("ALGORITHM=HS256\n")
            f.write("ACCESS_TOKEN_EXPIRE_MINUTES=480\n")
        logger.info("✅ Archivo .env creado")
    else:
        logger.info("✅ Archivo .env encontrado")
    return True

def start_backend():
    """Iniciar el servidor FastAPI"""
    logger.info("🚀 Iniciando servidor FastAPI...")
    
    try:
        # Cambiar al directorio del proyecto
        os.chdir(os.path.dirname(__file__))
        
        # Comando para iniciar uvicorn
        cmd = [
            sys.executable,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload",
            "--log-level", "debug"
        ]
        
        logger.info("Ejecutando: " + " ".join(cmd))
        logger.info("-" * 50)
        logger.info("Servidor iniciado en:")
        logger.info("  🌐 API: http://localhost:8000")
        logger.info("  📚 Docs: http://localhost:8000/docs")
        logger.info("  🔧 ReDoc: http://localhost:8000/redoc")
        logger.info("-" * 50)
        logger.info("Presiona Ctrl+C para detener el servidor")
        
        # Ejecutar uvicorn
        subprocess.run(cmd)
        
    except KeyboardInterrupt:
        logger.info("\n⏹️ Servidor detenido por el usuario")
    except Exception as e:
        logger.error(f"❌ Error al iniciar el servidor: {e}")
        return False
    
    return True

def main():
    """Función principal"""
    logger.info("🏥 Sistema Hospitalario - Iniciando Backend")
    logger.info("=" * 50)
    
    # 1. Verificar dependencias
    if not check_dependencies():
        return
    
    # 2. Verificar archivo .env
    if not check_env_file():
        return
    
    # 3. Verificar base de datos
    if not check_database():
        return
    
    # 4. Iniciar backend
    start_backend()

if __name__ == "__main__":
    main() 