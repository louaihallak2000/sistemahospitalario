#!/usr/bin/env python3
"""
🔧 TEST SCROLL PROBLEMA - Sistema Hospitalario
Crear múltiples pacientes para probar el scroll en la lista de espera
"""

import requests
import json
import time
from datetime import datetime, timedelta
import random

BASE_URL = "http://127.0.0.1:8000"

def login():
    """Login y obtener token"""
    print("🔐 Haciendo login...")
    
    login_data = {
        "hospital_code": "HG001",
        "username": "dr.martinez", 
        "password": "medico123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print(f"✅ Login exitoso - Token: {token[:30]}...")
            return token
        else:
            print(f"❌ Login fallido: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error en login: {e}")
        return None

def crear_paciente_test(token, numero):
    """Crear un paciente de prueba"""
    
    nombres = ["Juan", "María", "Carlos", "Ana", "Luis", "Carmen", "Pedro", "Isabel", "José", "Rosa"]
    apellidos = ["García", "Martínez", "López", "Sánchez", "Pérez", "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández"]
    motivos = [
        "Dolor abdominal agudo",
        "Fiebre alta",
        "Dolor de pecho",
        "Dificultad respiratoria",
        "Traumatismo",
        "Vómitos y diarrea",
        "Dolor de cabeza intenso",
        "Lesión en extremidad",
        "Reacción alérgica",
        "Control post-operatorio"
    ]
    colores = ["ROJO", "NARANJA", "AMARILLO", "VERDE", "AZUL"]
    
    # Generar datos aleatorios
    nombre = random.choice(nombres)
    apellido = random.choice(apellidos)
    dni = f"12345{numero:03d}"
    motivo = random.choice(motivos)
    color = random.choice(colores)
    
    paciente_data = {
        "dni": dni,
        "nombre_completo": f"{nombre} {apellido}",
        "fecha_nacimiento": "1990-01-01",
        "sexo": random.choice(["M", "F"]),
        "telefono": f"1234567{numero:03d}",
        "direccion": f"Calle Test {numero}",
        "motivo_consulta": motivo,
        "color_triaje": color,
        "tipo_episodio": "consulta"
    }
    
    print(f"👤 Creando paciente {numero}: {nombre} {apellido} ({color})")
    
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{BASE_URL}/pacientes/completo",
            json=paciente_data,
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Paciente {numero} creado exitosamente")
            return True
        else:
            print(f"❌ Error creando paciente {numero}: {response.status_code} - {response.text[:100]}")
            return False
            
    except Exception as e:
        print(f"❌ Error en request paciente {numero}: {e}")
        return False

def verificar_lista_espera(token):
    """Verificar la lista de espera"""
    print("\n📋 Verificando lista de espera...")
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Lista con triaje
        response = requests.get(f"{BASE_URL}/episodios/lista-espera", headers=headers)
        if response.status_code == 200:
            lista_con_triaje = response.json()
            print(f"✅ Pacientes con triaje: {len(lista_con_triaje)}")
        else:
            print(f"❌ Error obteniendo lista con triaje: {response.status_code}")
            lista_con_triaje = []
        
        # Lista sin triaje
        response = requests.get(f"{BASE_URL}/episodios/sin-triaje", headers=headers)
        if response.status_code == 200:
            lista_sin_triaje = response.json()
            print(f"✅ Pacientes sin triaje: {len(lista_sin_triaje)}")
        else:
            print(f"❌ Error obteniendo lista sin triaje: {response.status_code}")
            lista_sin_triaje = []
        
        total = len(lista_con_triaje) + len(lista_sin_triaje)
        print(f"📊 Total pacientes en espera: {total}")
        
        if total >= 15:
            print("🎯 ¡PERFECTO! Hay suficientes pacientes para probar el scroll")
            print("💡 Instrucciones:")
            print("   1. Abrir http://localhost:3000")
            print("   2. Login con dr.martinez / medico123")
            print("   3. Verificar que se puede hacer scroll en la Lista de Espera")
            print("   4. Debería mostrar una barra de scroll si hay más de 6-7 pacientes")
        else:
            print("⚠️ Pocos pacientes para probar scroll efectivamente")
            
    except Exception as e:
        print(f"❌ Error verificando listas: {e}")

def main():
    print("=" * 60)
    print("🧪 TEST SCROLL PROBLEMA - CREAR MÚLTIPLES PACIENTES")
    print(f"⏰ Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # 1. Login
    token = login()
    if not token:
        print("❌ No se pudo hacer login")
        return
    
    # 2. Crear múltiples pacientes (15 para garantizar scroll)
    print(f"\n👥 Creando 15 pacientes de prueba...")
    exitosos = 0
    
    for i in range(1, 16):
        if crear_paciente_test(token, i):
            exitosos += 1
        time.sleep(0.5)  # Pausa pequeña entre requests
    
    print(f"\n📊 Resumen: {exitosos}/15 pacientes creados exitosamente")
    
    # 3. Verificar listas
    verificar_lista_espera(token)
    
    # 4. Instrucciones finales
    print("\n" + "=" * 60)
    print("🎯 INSTRUCCIONES PARA PROBAR SCROLL:")
    print("=" * 60)
    print("1. 🌐 Abrir navegador en: http://localhost:3000")
    print("2. 🔑 Login: dr.martinez / medico123")
    print("3. 📋 En el Dashboard, verificar la Lista de Espera")
    print("4. 🖱️ Intentar hacer scroll hacia abajo en la lista")
    print("5. ✅ Debe aparecer barra de scroll y permitir deslizar")
    print("6. 📱 Probar también en dispositivos móviles")
    print("=" * 60)
    
    if exitosos >= 10:
        print("🎉 ¡LISTO PARA PROBAR! Hay suficientes pacientes")
    else:
        print("⚠️ Pocos pacientes creados, ejecutar de nuevo")

if __name__ == "__main__":
    main() 