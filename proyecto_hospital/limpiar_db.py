from app.core.database import SessionLocal, engine, Base
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def limpiar_base_datos():
    """Limpiar y recrear todas las tablas"""
    logger.info("🗑️ Limpiando base de datos...")
    
    # Eliminar todas las tablas
    Base.metadata.drop_all(bind=engine)
    logger.info("✅ Tablas eliminadas")
    
    # Recrear todas las tablas
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Tablas recreadas")

if __name__ == "__main__":
    limpiar_base_datos() 