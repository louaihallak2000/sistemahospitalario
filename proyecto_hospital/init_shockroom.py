#!/usr/bin/env python3
"""
Script para inicializar las camas del shockroom en la base de datos
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.shockroom import ShockroomCama
from app.models.hospital import Hospital
import json

def init_shockroom_beds():
    """Inicializar camas del shockroom"""
    db = SessionLocal()
    
    try:
        # Obtener el primer hospital (o crear uno por defecto)
        hospital = db.query(Hospital).first()
        if not hospital:
            print("❌ No se encontró ningún hospital. Ejecute primero init_db.py")
            return False
        
        print(f"🏥 Inicializando shockroom para hospital: {hospital.nombre}")
        
        # Verificar si ya existen camas
        existing_beds = db.query(ShockroomCama).filter(
            ShockroomCama.hospital_id == hospital.id
        ).count()
        
        if existing_beds > 0:
            print(f"⚠️ Ya existen {existing_beds} camas en el shockroom. ¿Desea continuar? (s/N)")
            response = input().lower()
            if response != 's':
                print("❌ Operación cancelada")
                return False
            
            # Eliminar camas existentes
            db.query(ShockroomCama).filter(
                ShockroomCama.hospital_id == hospital.id
            ).delete()
            db.commit()
            print("🗑️ Camas existentes eliminadas")
        
        # Configuración de camas del shockroom
        beds_config = [
            {
                "numero_cama": "SR-01",
                "posicion_x": 1,
                "posicion_y": 1,
                "tipo_cama": "critica",
                "equipamiento": ["Monitor multiparamétrico", "Ventilador mecánico", "Desfibrilador", "Bomba de infusión"]
            },
            {
                "numero_cama": "SR-02", 
                "posicion_x": 3,
                "posicion_y": 1,
                "tipo_cama": "critica",
                "equipamiento": ["Monitor multiparamétrico", "Ventilador mecánico", "Desfibrilador", "Bomba de infusión"]
            },
            {
                "numero_cama": "SR-03",
                "posicion_x": 5,
                "posicion_y": 1,
                "tipo_cama": "critica",
                "equipamiento": ["Monitor multiparamétrico", "Ventilador mecánico", "Desfibrilador"]
            },
            {
                "numero_cama": "SR-04",
                "posicion_x": 1,
                "posicion_y": 3,
                "tipo_cama": "observacion",
                "equipamiento": ["Monitor básico", "Oxígeno", "Bomba de infusión"]
            },
            {
                "numero_cama": "SR-05",
                "posicion_x": 3,
                "posicion_y": 3,
                "tipo_cama": "observacion",
                "equipamiento": ["Monitor básico", "Oxígeno", "Bomba de infusión"]
            },
            {
                "numero_cama": "SR-06",
                "posicion_x": 5,
                "posicion_y": 3,
                "tipo_cama": "aislamiento",
                "equipamiento": ["Monitor básico", "Ventilación independiente", "Bomba de infusión"]
            }
        ]
        
        # Crear las camas
        created_beds = []
        for bed_config in beds_config:
            cama = ShockroomCama(
                hospital_id=hospital.id,
                numero_cama=bed_config["numero_cama"],
                posicion_x=bed_config["posicion_x"],
                posicion_y=bed_config["posicion_y"],
                tipo_cama=bed_config["tipo_cama"],
                equipamiento=json.dumps(bed_config["equipamiento"]),
                observaciones=f"Cama {bed_config['tipo_cama']} del shockroom"
            )
            db.add(cama)
            created_beds.append(cama)
        
        # Confirmar cambios
        db.commit()
        
        print(f"✅ Se crearon {len(created_beds)} camas en el shockroom:")
        for cama in created_beds:
            equipos = json.loads(cama.equipamiento) if cama.equipamiento else []
            print(f"   🛏️ {cama.numero_cama} ({cama.tipo_cama}) - {len(equipos)} equipos")
        
        return True
        
    except Exception as e:
        print(f"❌ Error inicializando shockroom: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def main():
    """Función principal"""
    print("🚨 Inicializando Shockroom del Hospital")
    print("=" * 50)
    
    if init_shockroom_beds():
        print("\n🎉 Shockroom inicializado exitosamente!")
        print("\nPuede acceder al shockroom desde el dashboard principal.")
    else:
        print("\n❌ Error en la inicialización del shockroom")
        sys.exit(1)

if __name__ == "__main__":
    main() 