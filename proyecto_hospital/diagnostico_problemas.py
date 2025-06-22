#!/usr/bin/env python3
"""
Diagnóstico de problemas:
1. Pacientes no aparecen en lista de espera después de crear
2. Asignación de color de triaje no funciona
"""

import requests
import json
import sqlite3
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_crear_paciente():
    """Test 1: Crear un paciente y verificar que aparece en la lista de espera"""
    print("=" * 60)
    print("🔍 DIAGNÓSTICO 1: CREACIÓN DE PACIENTE Y LISTA DE ESPERA")
    print("=" * 60)
    
    # 1. Crear un paciente nuevo usando el endpoint completo
    paciente_data = {
        "dni": "12345678",
        "nombre_completo": "Paciente Test Diagnóstico",
        "fecha_nacimiento": "1990-01-01",
        "sexo": "M",
        "tipo_sangre": "O+",
        "alergias_conocidas": "Ninguna",
        "motivo_consulta": "Dolor de cabeza",
        "tipo_episodio": "consulta",
        "medico_responsable": "Dr. Test",
        "telefono": "123456789",
        "direccion": "Calle Test 123"
    }
    
    print("📝 Creando paciente de prueba...")
    response = requests.post(f"{BASE_URL}/pacientes/completo", json=paciente_data)
    print(f"📡 Status: {response.status_code}")
    
    if response.status_code == 200:
        paciente_creado = response.json()
        print(f"✅ Paciente creado: {paciente_creado['paciente']['nombre_completo']}")
        paciente_id = paciente_creado['paciente']['id']
        episodio_id = paciente_creado['episodio']['id']
        
        # 2. Verificar que el paciente está en la base de datos
        print("\n🔍 Verificando base de datos...")
        conn = sqlite3.connect('hospital_db.sqlite')
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, nombre_completo, dni FROM pacientes WHERE id = ?", (paciente_id,))
        paciente_db = cursor.fetchone()
        
        if paciente_db:
            print(f"✅ Paciente encontrado en BD: {paciente_db[1]} (DNI: {paciente_db[2]})")
        else:
            print("❌ Paciente NO encontrado en la base de datos")
            conn.close()
            return
        
        # 3. Verificar episodios del paciente
        cursor.execute("SELECT id, datos_json, estado FROM episodios WHERE paciente_id = ?", (paciente_id,))
        episodios = cursor.fetchall()
        
        if episodios:
            print(f"📋 Episodios encontrados: {len(episodios)}")
            for episodio in episodios:
                datos_json = episodio[1]
                color_triaje = "Sin asignar"
                if datos_json:
                    try:
                        datos = json.loads(datos_json) if isinstance(datos_json, str) else datos_json
                        color_triaje = datos.get('color_triaje', 'Sin asignar')
                    except:
                        color_triaje = "Error JSON"
                print(f"   - Episodio {episodio[0]}: Color={color_triaje}, Estado={episodio[2]}")
        else:
            print("❌ No hay episodios para este paciente")
        
        conn.close()
        
        # 4. Verificar lista de espera (episodios sin color de triaje)
        print("\n🔍 Verificando lista de espera...")
        response = requests.get(f"{BASE_URL}/episodios/sin-triaje")
        print(f"📡 Status lista espera: {response.status_code}")
        
        if response.status_code == 200:
            lista_espera = response.json()
            print(f"📋 Pacientes en espera: {len(lista_espera)}")
            
            paciente_en_espera = None
            for episodio in lista_espera:
                if episodio['id'] == episodio_id:
                    paciente_en_espera = episodio
                    break
            
            if paciente_en_espera:
                print(f"✅ Paciente encontrado en lista de espera: {paciente_en_espera['paciente_nombre']}")
            else:
                print("❌ Paciente NO aparece en lista de espera")
                print("🔍 Verificando todos los episodios...")
                
                response = requests.get(f"{BASE_URL}/episodios/")
                if response.status_code == 200:
                    todos_episodios = response.json()
                    for episodio in todos_episodios:
                        if episodio['paciente']['id'] == paciente_id:
                            color = episodio.get('datos_json', {}).get('color_triaje', 'Sin asignar')
                            print(f"   - Episodio {episodio['id']}: Color={color}")
        else:
            print(f"❌ Error al obtener lista de espera: {response.text}")
    
    else:
        print(f"❌ Error al crear paciente: {response.text}")

def test_asignar_triaje():
    """Test 2: Verificar asignación de color de triaje"""
    print("\n" + "=" * 60)
    print("🔍 DIAGNÓSTICO 2: ASIGNACIÓN DE COLOR DE TRIAJE")
    print("=" * 60)
    
    # 1. Obtener lista de espera
    print("📋 Obteniendo lista de espera...")
    response = requests.get(f"{BASE_URL}/episodios/sin-triaje")
    print(f"📡 Status: {response.status_code}")
    
    if response.status_code == 200:
        lista_espera = response.json()
        print(f"📋 Pacientes en espera: {len(lista_espera)}")
        
        if lista_espera:
            # Tomar el primer paciente para probar
            episodio = lista_espera[0]
            episodio_id = episodio['id']
            paciente_nombre = episodio['paciente_nombre']
            
            print(f"\n🎯 Probando asignación de triaje para: {paciente_nombre}")
            print(f"   Episodio ID: {episodio_id}")
            
            # 2. Probar asignación de color rojo
            color_data = {"color": "ROJO"}
            print(f"\n🔴 Asignando color ROJO...")
            
            response = requests.put(f"{BASE_URL}/episodios/{episodio_id}/triage", json=color_data)
            print(f"📡 Status: {response.status_code}")
            
            if response.status_code == 200:
                resultado = response.json()
                color_asignado = resultado.get('datos_json', {}).get('color_triaje', 'No encontrado')
                print(f"✅ Color asignado exitosamente: {color_asignado}")
                
                # 3. Verificar que ya no aparece en lista de espera
                print("\n🔍 Verificando que ya no aparece en lista de espera...")
                response = requests.get(f"{BASE_URL}/episodios/sin-triaje")
                if response.status_code == 200:
                    nueva_lista = response.json()
                    print(f"📋 Pacientes en espera después: {len(nueva_lista)}")
                    
                    # Buscar si el paciente sigue en la lista
                    sigue_en_espera = False
                    for ep in nueva_lista:
                        if ep['id'] == episodio_id:
                            sigue_en_espera = True
                            break
                    
                    if sigue_en_espera:
                        print("❌ El paciente sigue apareciendo en lista de espera")
                    else:
                        print("✅ El paciente ya no aparece en lista de espera (correcto)")
                
            else:
                print(f"❌ Error al asignar color: {response.text}")
        else:
            print("⚠️  No hay pacientes en espera para probar asignación de triaje")
    else:
        print(f"❌ Error al obtener lista de espera: {response.text}")

def verificar_estado_actual():
    """Verificar el estado actual de la base de datos"""
    print("\n" + "=" * 60)
    print("🔍 ESTADO ACTUAL DE LA BASE DE DATOS")
    print("=" * 60)
    
    conn = sqlite3.connect('hospital_db.sqlite')
    cursor = conn.cursor()
    
    # Contar pacientes
    cursor.execute("SELECT COUNT(*) FROM pacientes")
    total_pacientes = cursor.fetchone()[0]
    print(f"👥 Total pacientes: {total_pacientes}")
    
    # Contar episodios
    cursor.execute("SELECT COUNT(*) FROM episodios")
    total_episodios = cursor.fetchone()[0]
    print(f"📋 Total episodios: {total_episodios}")
    
    # Episodios por color de triaje (desde datos_json)
    cursor.execute("SELECT datos_json FROM episodios")
    episodios = cursor.fetchall()
    
    colores_count = {}
    en_espera = 0
    
    for episodio in episodios:
        datos_json = episodio[0]
        color = "Sin asignar"
        
        if datos_json:
            try:
                datos = json.loads(datos_json) if isinstance(datos_json, str) else datos_json
                color = datos.get('color_triaje', 'Sin asignar')
            except:
                color = "Error JSON"
        
        if color == "Sin asignar":
            en_espera += 1
        
        colores_count[color] = colores_count.get(color, 0) + 1
    
    print(f"🎨 Distribución por color:")
    for color, count in colores_count.items():
        print(f"   - {color}: {count}")
    
    print(f"⏳ En espera de triaje: {en_espera}")
    
    conn.close()

if __name__ == "__main__":
    print("🏥 DIAGNÓSTICO DEL SISTEMA HOSPITALARIO")
    print("=" * 60)
    
    verificar_estado_actual()
    test_crear_paciente()
    test_asignar_triaje()
    
    print("\n" + "=" * 60)
    print("🏁 DIAGNÓSTICO COMPLETADO")
    print("=" * 60) 