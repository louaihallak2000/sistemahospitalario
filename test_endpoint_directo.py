#!/usr/bin/env python3
"""
Test directo del endpoint para verificar que el servidor tenga los cambios.
"""

import requests
import json
import time

def test_endpoint_directo():
    """Test directo del endpoint"""
    
    base_url = "http://127.0.0.1:8000"
    
    # Verificar que el servidor esté actualizado
    print("📖 Verificando OpenAPI schema para confirmar cambios...")
    response = requests.get(f"{base_url}/openapi.json")
    if response.status_code == 200:
        openapi = response.json()
        paths = openapi.get("paths", {})
        
        endpoint = "/episodios/{episodio_id}/triage"
        if endpoint in paths:
            put_info = paths[endpoint].get("put", {})
            print(f"✅ Endpoint encontrado")
            print(f"   Descripción: {put_info.get('summary', 'N/A')}")
            print(f"   Request Body: {put_info.get('requestBody', 'N/A')}")
        else:
            print(f"❌ Endpoint {endpoint} no encontrado")
            return
    
    # Login
    print("\n🔐 Haciendo login...")
    login_data = {
        "hospital_code": "HOSP001",
        "username": "admin", 
        "password": "admin123"
    }
    
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"❌ Login falló: {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Probar con un ID de episodio real
    response = requests.get(f"{base_url}/episodios/sin-triaje", headers=headers)
    if response.status_code == 200:
        episodios = response.json()
        print(f"✅ Obtenidos {len(episodios)} episodios sin triaje")
        
        if episodios:
            episode_id = episodios[0]["id"]
            print(f"🎯 Usando episodio real: {episode_id}")
            
            url = f"{base_url}/episodios/{episode_id}/triage"
            print(f"\n🧪 Enviando PUT a: {url}")
            print(f"📄 Datos: {{'color': 'ROJO'}}")
            
            # Hacer la petición y medir tiempo
            start_time = time.time()
            response = requests.put(url, json={"color": "ROJO"}, headers=headers)
            end_time = time.time()
            
            print(f"⏱️ Tiempo de respuesta: {end_time - start_time:.3f}s")
            print(f"📊 Status Code: {response.status_code}")
            print(f"📄 Response Headers: {dict(response.headers)}")
            print(f"📝 Response Body: {response.text}")
            
            if response.status_code == 200:
                print("✅ ¡ÉXITO! El endpoint funciona correctamente")
            else:
                print("❌ Error en la petición")
                
                # Si hay un error, intentar hacer un GET para ver si el endpoint existe
                print("\n🔍 Verificando si el endpoint responde a GET...")
                get_response = requests.get(url, headers=headers)
                print(f"GET Status: {get_response.status_code}")
                print(f"GET Response: {get_response.text}")
        else:
            print("⚠️ No hay episodios sin triaje para probar")

if __name__ == "__main__":
    test_endpoint_directo() 