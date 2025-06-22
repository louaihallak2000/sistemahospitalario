#!/usr/bin/env python3
"""
Script para diagnosticar NetworkError - Verificación de conexión al backend
"""

import requests
import time

def test_backend_connection():
    """Test completo de conectividad del backend"""
    
    print("🔍 DIAGNÓSTICO DE NETWORK ERROR")
    print("=" * 50)
    
    # 1. Test básico de conectividad
    print("\n1️⃣ Verificando si el backend está activo...")
    try:
        response = requests.get("http://127.0.0.1:8000/docs", timeout=5)
        print(f"✅ Backend responde en puerto 8000: Status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Backend NO está corriendo en puerto 8000")
        print("💡 Solución: Ejecuta en proyecto_hospital/:")
        print("   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        return False
    except requests.exceptions.Timeout:
        print("❌ Backend responde muy lento (timeout)")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False
    
    # 2. Test de endpoint específico
    print("\n2️⃣ Verificando endpoint raíz...")
    try:
        response = requests.get("http://127.0.0.1:8000/", timeout=5)
        print(f"✅ Endpoint raíz funciona: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Error en endpoint raíz: {e}")
    
    # 3. Test de CORS - Simulando petición desde frontend
    print("\n3️⃣ Verificando CORS desde frontend...")
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "PUT",
        "Access-Control-Request-Headers": "authorization,content-type"
    }
    
    try:
        # Preflight request
        response = requests.options("http://127.0.0.1:8000/episodios/test/triage", 
                                  headers=headers, timeout=5)
        print(f"✅ CORS preflight: Status {response.status_code}")
        
        # Verificar headers CORS
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
            "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers")
        }
        
        print("📋 Headers CORS recibidos:")
        for header, value in cors_headers.items():
            print(f"   {header}: {value}")
            
    except Exception as e:
        print(f"❌ Error en test CORS: {e}")
    
    # 4. Test de login (endpoint que usa el frontend)
    print("\n4️⃣ Verificando endpoint de login...")
    login_data = {
        "hospital_code": "HOSP001",
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post("http://127.0.0.1:8000/auth/login", 
                               json=login_data, timeout=5)
        print(f"✅ Login endpoint funciona: Status {response.status_code}")
        
        if response.status_code == 200:
            token = response.json().get("access_token")
            print(f"✅ Token obtenido: {token[:20]}...")
            
            # 5. Test de endpoint de triaje con token
            print("\n5️⃣ Verificando endpoint de triaje...")
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Obtener episodios sin triaje
            response = requests.get("http://127.0.0.1:8000/episodios/sin-triaje", 
                                  headers=headers, timeout=5)
            print(f"✅ Episodios sin triaje: Status {response.status_code}")
            
            if response.status_code == 200:
                episodios = response.json()
                print(f"📊 Encontrados {len(episodios)} episodios sin triaje")
                
                if episodios:
                    episode_id = episodios[0]["id"]
                    
                    # Test del endpoint de triaje que está fallando
                    print(f"\n6️⃣ Probando endpoint de triaje específico...")
                    url = f"http://127.0.0.1:8000/episodios/{episode_id}/triage"
                    data = {"color": "ROJO"}
                    
                    response = requests.put(url, json=data, headers=headers, timeout=5)
                    print(f"✅ Endpoint triaje: Status {response.status_code}")
                    
                    if response.status_code != 200:
                        print(f"❌ Error en triaje: {response.text}")
        
    except Exception as e:
        print(f"❌ Error en test de login: {e}")
    
    # 7. Información adicional
    print(f"\n7️⃣ Información adicional...")
    print(f"   URL base esperada por frontend: http://127.0.0.1:8000")
    print(f"   Puerto frontend: 3000")
    print(f"   Puerto backend: 8000")
    
    print(f"\n" + "=" * 50)
    print("🏁 Diagnóstico completado")
    
    return True

if __name__ == "__main__":
    test_backend_connection() 