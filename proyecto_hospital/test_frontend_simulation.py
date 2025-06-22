#!/usr/bin/env python3
"""
Script que simula exactamente las llamadas del frontend
para identificar por qué falla en el frontend pero funciona en el script
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def simulate_frontend_flow():
    """Simula el flujo completo del frontend"""
    print("🏥 SIMULACIÓN DEL FLUJO DEL FRONTEND")
    print("=" * 60)
    
    # 1. Login (como hace el frontend)
    print("🔐 1. LOGIN (como frontend)")
    login_data = {
        "hospital_code": "HOSP001",
        "username": "admin", 
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"📡 Login Status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ Login falló: {response.text}")
        return
    
    data = response.json()
    token = data.get("access_token")
    print(f"✅ Token obtenido: {token[:20]}...")
    
    # 2. Simular headers del frontend (como getAuthHeaders())
    print("\n🔐 2. HEADERS DEL FRONTEND")
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json", 
        "Cache-Control": "no-cache",
        "Authorization": f"Bearer {token}"
    }
    print("Headers:", json.dumps(headers, indent=2))
    
    # 3. Crear paciente (como hace el frontend)
    print("\n📝 3. CREAR PACIENTE (como frontend)")
    paciente_data = {
        "dni": "88888888",
        "nombre_completo": "Paciente Frontend Test",
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
    
    print("Datos:", json.dumps(paciente_data, indent=2))
    
    response = requests.post(
        f"{BASE_URL}/pacientes/completo",
        json=paciente_data,
        headers=headers
    )
    
    print(f"📡 Status: {response.status_code}")
    print(f"📋 Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Paciente creado exitosamente")
    else:
        print("❌ Error al crear paciente")
    
    # 4. Obtener lista sin triaje (como hace el frontend)
    print("\n📋 4. OBTENER LISTA SIN TRIAJE (como frontend)")
    response = requests.get(f"{BASE_URL}/episodios/sin-triaje", headers=headers)
    print(f"📡 Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Lista obtenida: {len(data)} elementos")
    else:
        print(f"❌ Error: {response.text}")
    
    # 5. Asignar triaje (como hace el frontend)
    print("\n🎨 5. ASIGNAR TRIAJE (como frontend)")
    if response.status_code == 200 and len(data) > 0:
        episodio_id = data[0]['id']
        triaje_data = {"color": "ROJO"}
        
        print(f"Episodio ID: {episodio_id}")
        print(f"Datos triaje: {json.dumps(triaje_data)}")
        
        response = requests.put(
            f"{BASE_URL}/episodios/{episodio_id}/triage",
            json=triaje_data,
            headers=headers
        )
        
        print(f"📡 Status: {response.status_code}")
        print(f"📋 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Triaje asignado exitosamente")
        else:
            print("❌ Error al asignar triaje")

if __name__ == "__main__":
    simulate_frontend_flow() 