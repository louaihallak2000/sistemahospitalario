#!/usr/bin/env python3
"""
Script para agregar la columna ultima_modificacion faltante
"""

import sqlite3
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_ultima_modificacion():
    """Agregar la columna ultima_modificacion a la tabla episodios"""
    try:
        # Conectar a la base de datos
        conn = sqlite3.connect('hospital_db.sqlite')
        cursor = conn.cursor()
        
        # Verificar si la columna ya existe
        cursor.execute("PRAGMA table_info(episodios)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'ultima_modificacion' not in columns:
            logger.info("📋 Agregando columna ultima_modificacion...")
            
            # Agregar la columna sin DEFAULT
            cursor.execute("ALTER TABLE episodios ADD COLUMN ultima_modificacion DATETIME")
            
            # Actualizar todos los registros existentes con la fecha actual
            cursor.execute("""
                UPDATE episodios 
                SET ultima_modificacion = CURRENT_TIMESTAMP 
                WHERE ultima_modificacion IS NULL
            """)
            
            conn.commit()
            logger.info("✅ Columna ultima_modificacion agregada exitosamente")
        else:
            logger.info("✅ Columna ultima_modificacion ya existe")
        
        # Verificar el resultado
        cursor.execute("PRAGMA table_info(episodios)")
        columns = [column[1] for column in cursor.fetchall()]
        logger.info(f"📊 Tabla episodios ahora tiene {len(columns)} columnas")
        
        conn.close()
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise

if __name__ == "__main__":
    fix_ultima_modificacion()
    print("🎉 Columna ultima_modificacion agregada correctamente") 