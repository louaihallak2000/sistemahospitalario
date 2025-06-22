#!/usr/bin/env python3
"""
Test de diagnóstico simple.
"""

import requests
import json

def test_debug():
    """Test de diagnóstico"""
    
    base_url = "http://127.0.0.1:8000"
    
    # Verificar OpenAPI schema actualizado
    print("📖 Verificando schema actualizado...")
    response = requests.get(f"{base_url}/openapi.json")
    if response.status_code == 200:
        openapi = response.json()
        paths = openapi.get("paths", {})
        
        # Buscar endpoints de triaje/triage
        triage_endpoints = []
        for path in paths.keys():
            if "triage" in path or "triaje" in path:
                triage_endpoints.append(path)
        
        print(f"Endpoints de triaje encontrados: {triage_endpoints}")
        
        # Verificar específicamente nuestro endpoint
        target = "/episodios/{episodio_id}/triage"
        if target in paths:
            print(f"✅ Endpoint {target} encontrado")
            methods = list(paths[target].keys())
            print(f"   Métodos: {methods}")
            
            if "put" in methods:
                put_spec = paths[target]["put"]
                print(f"   Esquema PUT: {put_spec.get('requestBody', 'No body defined')}")
        else:
            print(f"❌ Endpoint {target} NO encontrado")
    
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
    
    # Probar diferentes URLs
    test_urls = [
        f"{base_url}/episodios/test-id/triage",
        f"{base_url}/episodios/test-id/triaje"
    ]
    
    for url in test_urls:
        print(f"\n🧪 Probando URL: {url}")
        
        # Probar GET primero para ver si existe
        response = requests.get(url, headers=headers)
        print(f"   GET: {response.status_code} - {response.text[:100]}")
        
        # Probar PUT
        response = requests.put(url, json={"color": "ROJO"}, headers=headers)
        print(f"   PUT: {response.status_code} - {response.text[:100]}")

if __name__ == "__main__":
    test_debug() 