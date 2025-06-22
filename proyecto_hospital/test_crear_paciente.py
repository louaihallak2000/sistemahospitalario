#!/usr/bin/env python3
"""
Script de prueba para diagnosticar el error 500 al crear pacientes
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_backend_health():
    """Test 1: Verificar que el backend esté funcionando"""
    print("=" * 60)
    print("🔍 TEST 1: VERIFICAR SALUD DEL BACKEND")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"📡 Status: {response.status_code}")
        print(f"📋 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Backend está funcionando")
            return True
        else:
            print("❌ Backend no responde correctamente")
            return False
    except Exception as e:
        print(f"❌ Error conectando al backend: {e}")
        return False

def test_login():
    """Test 2: Obtener token de autenticación"""
    print("\n" + "=" * 60)
    print("🔍 TEST 2: OBTENER TOKEN DE AUTENTICACIÓN")
    print("=" * 60)
    
    login_data = {
        "hospital_code": "HOSP001",
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"📡 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print(f"✅ Token obtenido: {token[:20]}..." if token else "❌ No se recibió token")
            return token
        else:
            print(f"❌ Error en login: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error en login: {e}")
        return None

def test_crear_paciente(token):
    """Test 3: Crear paciente con token válido"""
    print("\n" + "=" * 60)
    print("🔍 TEST 3: CREAR PACIENTE CON TOKEN VÁLIDO")
    print("=" * 60)
    
    if not token:
        print("❌ No hay token válido")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    paciente_data = {
        "dni": "99999999",
        "nombre_completo": "Paciente Test Script",
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
    
    print("📝 Datos del paciente:")
    print(json.dumps(paciente_data, indent=2))
    print(f"\n🔐 Headers:")
    print(json.dumps(headers, indent=2))
    
    try:
        response = requests.post(f"{BASE_URL}/pacientes/completo", 
                               json=paciente_data, 
                               headers=headers)
        
        print(f"\n📡 Status: {response.status_code}")
        print(f"📋 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Paciente creado exitosamente")
            return True
        else:
            print("❌ Error al crear paciente")
            return False
            
    except Exception as e:
        print(f"❌ Error en la petición: {e}")
        return False

def test_endpoints_protegidos(token):
    """Test 4: Probar endpoints protegidos"""
    print("\n" + "=" * 60)
    print("🔍 TEST 4: PROBAR ENDPOINTS PROTEGIDOS")
    print("=" * 60)
    
    if not token:
        print("❌ No hay token válido")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    endpoints = [
        ("/episodios/sin-triaje", "GET"),
        ("/episodios/lista-espera", "GET"),
        ("/episodios/estadisticas", "GET")
    ]
    
    for endpoint, method in endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            else:
                response = requests.post(f"{BASE_URL}{endpoint}", headers=headers)
            
            print(f"📡 {method} {endpoint}: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"   ✅ Respuesta: {len(data)} elementos")
                else:
                    print(f"   ✅ Respuesta: {type(data).__name__}")
            else:
                print(f"   ❌ Error: {response.text[:100]}...")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")

def main():
    print("🏥 DIAGNÓSTICO DE ERROR 500 - CREACIÓN DE PACIENTES")
    print("=" * 60)
    
    # Test 1: Verificar backend
    if not test_backend_health():
        print("\n❌ El backend no está funcionando. Reinicia el servidor.")
        return
    
    # Test 2: Obtener token
    token = test_login()
    if not token:
        print("\n❌ No se pudo obtener token. Verifica credenciales.")
        return
    
    # Test 3: Crear paciente
    success = test_crear_paciente(token)
    
    # Test 4: Probar otros endpoints
    test_endpoints_protegidos(token)
    
    print("\n" + "=" * 60)
    if success:
        print("✅ TODOS LOS TESTS PASARON")
    else:
        print("❌ HAY ERRORES QUE CORREGIR")
    print("=" * 60)

if __name__ == "__main__":
    main() 