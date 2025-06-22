#!/usr/bin/env python3
"""
Script simple para verificar si el problema está en el frontend
"""

import requests

def test_simple():
    print("🔍 TEST SIMPLE - Verificar problema frontend/backend")
    print("=" * 50)
    
    # 1. Verificar que el backend responde
    try:
        response = requests.get("http://127.0.0.1:8000/health")
        print(f"✅ Backend responde: {response.status_code}")
    except Exception as e:
        print(f"❌ Backend no responde: {e}")
        return
    
    # 2. Login simple
    try:
        response = requests.post("http://127.0.0.1:8000/auth/login", 
                               json={"hospital_code": "HOSP001", "username": "admin", "password": "admin123"})
        print(f"✅ Login: {response.status_code}")
        
        if response.status_code == 200:
            token = response.json().get("access_token")
            print(f"✅ Token obtenido: {token[:20]}...")
            
            # 3. Crear paciente simple
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            data = {
                "dni": "77777777",
                "nombre_completo": "Test Simple",
                "motivo_consulta": "Test"
            }
            
            response = requests.post("http://127.0.0.1:8000/pacientes/completo", 
                                   json=data, headers=headers)
            print(f"✅ Crear paciente: {response.status_code}")
            
            if response.status_code != 200:
                print(f"❌ Error: {response.text}")
            else:
                print("✅ Todo funciona correctamente")
                
        else:
            print(f"❌ Login falló: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_simple() 