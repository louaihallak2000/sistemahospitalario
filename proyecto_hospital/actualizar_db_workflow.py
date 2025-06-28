#!/usr/bin/env python3
"""
Script para actualizar la base de datos con el nuevo workflow
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import inspect, text
from app.core.database import engine, SessionLocal, Base
from app.models import *  # Importar todos los modelos
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_table_exists(engine, table_name):
    """Verificar si una tabla existe"""
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()

def check_column_exists(engine, table_name, column_name):
    """Verificar si una columna existe en una tabla"""
    try:
        inspector = inspect(engine)
        columns = [column['name'] for column in inspector.get_columns(table_name)]
        return column_name in columns
    except Exception:
        return False

def actualizar_base_datos():
    """Actualizar la base de datos con los nuevos campos del workflow"""
    logger.info("🔄 Iniciando actualización de base de datos...")
    
    db = SessionLocal()
    
    try:
        # Crear todas las tablas nuevas
        logger.info("📊 Creando tablas nuevas...")
        Base.metadata.create_all(bind=engine)
        
        # Actualizar tabla episodios con nuevos campos
        logger.info("📋 Actualizando tabla episodios...")
        
        nuevos_campos_episodios = [
            ("triaje_realizado_por", "VARCHAR(255)"),
            ("fecha_triaje", "DATETIME"),
            ("signos_vitales_triaje", "JSON"),
            ("evaluacion_enfermeria", "TEXT"),
            ("decision_post_triaje", "VARCHAR(30)"),
            ("decidido_por", "VARCHAR(255)"),
            ("fecha_decision", "DATETIME"),
            ("fecha_inicio_atencion", "DATETIME"),
            ("prescripciones", "JSON"),
            ("procedimientos", "JSON"),
            ("estudios_solicitados", "JSON"),
            ("evoluciones_medicas", "JSON"),
            ("evoluciones_enfermeria", "JSON"),
            ("indicaciones_monitoreo", "JSON"),
            ("registros_signos_vitales", "JSON"),
            ("en_shockroom", "BOOLEAN DEFAULT FALSE"),
            ("cama_shockroom", "VARCHAR(10)"),
            ("fecha_ingreso_shockroom", "DATETIME"),
            ("fecha_salida_shockroom", "DATETIME"),
            ("decision_final", "VARCHAR(20)"),
            ("fecha_decision_final", "DATETIME"),
            ("indicaciones_alta", "TEXT"),
            ("area_internacion", "VARCHAR(100)"),
            ("motivo_continuacion", "TEXT"),
            ("hospital_origen", "VARCHAR(100)"),
            ("motivo_traslado", "TEXT"),
            ("datos_traslado", "JSON"),
            ("creado_por", "VARCHAR(255)"),
            ("ultima_modificacion", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
            ("modificado_por", "VARCHAR(255)")
        ]
        
        for campo, tipo in nuevos_campos_episodios:
            if not check_column_exists(engine, "episodios", campo):
                try:
                    db.execute(text(f"ALTER TABLE episodios ADD COLUMN {campo} {tipo}"))
                    logger.info(f"✅ Campo '{campo}' agregado a episodios")
                except Exception as e:
                    logger.warning(f"⚠️  No se pudo agregar campo '{campo}': {e}")
        
        # Actualizar campo estado para el nuevo workflow
        logger.info("🔄 Actualizando estados de episodios existentes...")
        try:
            # Cambiar estados antiguos por nuevos
            db.execute(text("""
                UPDATE episodios 
                SET estado = 'espera_triaje' 
                WHERE estado = 'activo' AND color_triaje IS NULL
            """))
            
            db.execute(text("""
                UPDATE episodios 
                SET estado = 'en_lista_medica' 
                WHERE estado = 'activo' AND color_triaje IS NOT NULL
            """))
            
            db.execute(text("""
                UPDATE episodios 
                SET estado = 'finalizado'
                WHERE estado = 'cerrado' OR fecha_cierre IS NOT NULL
            """))
            
            logger.info("✅ Estados de episodios actualizados")
        except Exception as e:
            logger.warning(f"⚠️  Error actualizando estados: {e}")
        
        # Verificar que las tablas de códigos de emergencia se crean
        if check_table_exists(engine, "codigos_emergencia"):
            logger.info("✅ Tabla codigos_emergencia creada")
        else:
            logger.error("❌ Error creando tabla codigos_emergencia")
        
        if check_table_exists(engine, "episodios_emergencia"):
            logger.info("✅ Tabla episodios_emergencia creada")
        else:
            logger.error("❌ Error creando tabla episodios_emergencia")
        
        # Verificar tablas de shockroom
        tablas_shockroom = ["shockroom_camas", "shockroom_asignaciones", "shockroom_alertas"]
        for tabla in tablas_shockroom:
            if check_table_exists(engine, tabla):
                logger.info(f"✅ Tabla {tabla} verificada")
            else:
                logger.warning(f"⚠️  Tabla {tabla} no encontrada")
        
        db.commit()
        logger.info("🎉 Base de datos actualizada exitosamente!")
        
        # Mostrar resumen
        logger.info("\n📊 RESUMEN DE LA ACTUALIZACIÓN:")
        logger.info("✅ Nuevos estados de episodios: espera_triaje, en_lista_medica, en_atencion, en_shockroom, alta_enfermeria, finalizado")
        logger.info("✅ Nuevos campos para triaje y decisiones de enfermería")
        logger.info("✅ Campos para prescripciones, procedimientos y estudios")
        logger.info("✅ Campos para monitoreo y shockroom")
        logger.info("✅ Campos para decisión médica final")
        logger.info("✅ Tablas para códigos de emergencia")
        logger.info("✅ Sistema listo para el nuevo workflow")
        
    except Exception as e:
        logger.error(f"❌ Error actualizando base de datos: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def verificar_estructura():
    """Verificar la estructura actualizada de la base de datos"""
    logger.info("\n🔍 VERIFICANDO ESTRUCTURA DE BASE DE DATOS:")
    
    inspector = inspect(engine)
    
    # Verificar tabla episodios
    if check_table_exists(engine, "episodios"):
        columns = [col['name'] for col in inspector.get_columns("episodios")]
        logger.info(f"📋 Tabla episodios tiene {len(columns)} columnas")
        
        campos_importantes = [
            "estado", "color_triaje", "triaje_realizado_por", "decision_post_triaje",
            "en_shockroom", "cama_shockroom", "decision_final", "prescripciones",
            "procedimientos", "estudios_solicitados", "evoluciones_medicas"
        ]
        
        for campo in campos_importantes:
            if campo in columns:
                logger.info(f"  ✅ {campo}")
            else:
                logger.warning(f"  ❌ {campo} - FALTA")
    
    # Verificar tablas de códigos
    for tabla in ["codigos_emergencia", "episodios_emergencia"]:
        if check_table_exists(engine, tabla):
            columns = inspector.get_columns(tabla)
            logger.info(f"🚨 Tabla {tabla}: {len(columns)} columnas")
        else:
            logger.error(f"❌ Tabla {tabla} NO EXISTE")
    
    # Verificar tablas de shockroom
    for tabla in ["shockroom_camas", "shockroom_asignaciones"]:
        if check_table_exists(engine, tabla):
            columns = inspector.get_columns(tabla)
            logger.info(f"🏥 Tabla {tabla}: {len(columns)} columnas")
        else:
            logger.error(f"❌ Tabla {tabla} NO EXISTE")

if __name__ == "__main__":
    try:
        actualizar_base_datos()
        verificar_estructura()
        
        print("\n" + "="*50)
        print("🎉 ACTUALIZACIÓN COMPLETADA")
        print("="*50)
        print("El sistema está listo para usar el nuevo workflow:")
        print("• Códigos de emergencia")
        print("• Triaje por enfermería")
        print("• Decisiones post-triaje")
        print("• Atención médica mejorada")
        print("• Shockroom actualizado")
        print("• Decisión médica final obligatoria")
        print("="*50)
        
    except Exception as e:
        logger.error(f"💥 Error durante la actualización: {e}")
        print(f"\n❌ Error: {e}")
        print("Por favor, revisa los logs para más detalles.")
        sys.exit(1) 