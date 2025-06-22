#!/usr/bin/env python3
"""
Script para debuggear episodios y verificar IDs existentes.
"""

import sys
import os
sys.path.append('proyecto_hospital')

from proyecto_hospital.app.core.database import SessionLocal
from proyecto_hospital.app.models.episodio import Episodio
from proyecto_hospital.app.models.paciente import Paciente
import json

def debug_episodios():
    """Debug de episodios en la base de datos"""
    
    print("🔍 Debuggeando episodios en la base de datos...")
    
    db = SessionLocal()
    try:
        # Obtener todos los episodios
        episodios = db.query(Episodio).all()
        print(f"📊 Total episodios en DB: {len(episodios)}")
        
        # Mostrar información de cada episodio
        for i, episodio in enumerate(episodios, 1):
            print(f"\n📋 Episodio {i}:")
            print(f"   ID: {episodio.id}")
            print(f"   Paciente ID: {episodio.paciente_id}")
            print(f"   Hospital ID: {episodio.hospital_id}")
            print(f"   Estado: {episodio.estado}")
            print(f"   Fecha inicio: {episodio.fecha_inicio}")
            
            # Verificar datos_json
            if episodio.datos_json:
                try:
                    datos = json.loads(episodio.datos_json) if isinstance(episodio.datos_json, str) else episodio.datos_json
                    color_triaje = datos.get('color_triaje')
                    print(f"   Color triaje: {color_triaje}")
                    print(f"   Motivo consulta: {datos.get('motivo_consulta', 'N/A')}")
                except Exception as e:
                    print(f"   ❌ Error parseando datos_json: {e}")
                    print(f"   Raw datos_json: {episodio.datos_json}")
            else:
                print(f"   ⚠️ Sin datos_json")
            
            # Obtener información del paciente
            try:
                paciente = db.query(Paciente).filter(Paciente.id == episodio.paciente_id).first()
                if paciente:
                    print(f"   Paciente: {paciente.nombre_completo} (DNI: {paciente.dni})")
                else:
                    print(f"   ❌ Paciente no encontrado")
            except Exception as e:
                print(f"   ❌ Error obteniendo paciente: {e}")
        
        # Filtrar episodios sin triaje
        print(f"\n🎨 Filtrando episodios sin triaje...")
        episodios_sin_triaje = []
        
        for episodio in episodios:
            if episodio.datos_json:
                try:
                    datos = json.loads(episodio.datos_json) if isinstance(episodio.datos_json, str) else episodio.datos_json
                    color_triaje = datos.get('color_triaje')
                    if not color_triaje:
                        episodios_sin_triaje.append(episodio)
                except:
                    episodios_sin_triaje.append(episodio)  # Si hay error parseando, asumir sin triaje
            else:
                episodios_sin_triaje.append(episodio)  # Sin datos_json = sin triaje
        
        print(f"📊 Episodios sin triaje: {len(episodios_sin_triaje)}")
        
        if episodios_sin_triaje:
            episodio_prueba = episodios_sin_triaje[0]
            print(f"\n🎯 Episodio para prueba de triaje:")
            print(f"   ID: {episodio_prueba.id}")
            print(f"   Hospital ID: {episodio_prueba.hospital_id}")
            print(f"   Estado: {episodio_prueba.estado}")
            
            # Test de actualización de triaje
            print(f"\n🧪 Simulando actualización de triaje...")
            try:
                datos = {}
                if episodio_prueba.datos_json:
                    datos = json.loads(episodio_prueba.datos_json) if isinstance(episodio_prueba.datos_json, str) else episodio_prueba.datos_json
                
                datos['color_triaje'] = 'ROJO'
                episodio_prueba.datos_json = json.dumps(datos)
                
                db.commit()
                print(f"✅ Triaje actualizado exitosamente")
                
                # Verificar cambio
                db.refresh(episodio_prueba)
                nuevos_datos = json.loads(episodio_prueba.datos_json)
                print(f"✅ Verificación: color_triaje = {nuevos_datos.get('color_triaje')}")
                
            except Exception as e:
                print(f"❌ Error actualizando triaje: {e}")
                db.rollback()
        
    except Exception as e:
        print(f"❌ Error general: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_episodios() 