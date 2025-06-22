#!/usr/bin/env python3
"""
Script simple para verificar el endpoint de triaje.
"""

import requests
import json

def test_endpoint():
    """Test simple del endpoint"""
    
    base_url = "http://127.0.0.1:8000"
    
    # Verificar que el servidor funcione
    try:
        response = requests.get(f"{base_url}/docs")
        print("✅ Servidor funcionando")
    except:
        print("❌ Servidor no funciona")
        return
    
    # Login
    print("🔐 Haciendo login...")
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
    
    # Verificar endpoints disponibles
    print("\n📋 Verificando endpoints disponibles...")
    
    # Probar GET sin triaje
    response = requests.get(f"{base_url}/episodios/sin-triaje", headers=headers)
    print(f"GET /episodios/sin-triaje: {response.status_code}")
    
    if response.status_code == 200:
        episodios = response.json()
        print(f"Episodios encontrados: {len(episodios)}")
        
        if episodios:
            episode_id = episodios[0]["id"]
            print(f"Usando episodio: {episode_id}")
            
            # Probar el endpoint de triaje - verificar diferentes URLs
            test_urls = [
                f"{base_url}/episodios/{episode_id}/triaje",
                f"{base_url}/episodios/{episode_id}/triaje/",
            ]
            
            for url in test_urls:
                print(f"\n🧪 Probando: {url}")
                
                # Primero verificar con GET si el endpoint existe
                test_response = requests.get(url, headers=headers)
                print(f"   GET: {test_response.status_code} - {test_response.text[:100]}")
                
                # Luego probar PUT
                put_response = requests.put(url, json="ROJO", headers=headers)
                print(f"   PUT: {put_response.status_code} - {put_response.text[:100]}")
    
    # También verificar el schema de OpenAPI
    print(f"\n📖 Verificando OpenAPI schema...")
    response = requests.get(f"{base_url}/openapi.json")
    if response.status_code == 200:
        openapi = response.json()
        paths = openapi.get("paths", {})
        
        triaje_endpoints = [path for path in paths.keys() if "triaje" in path]
        print(f"Endpoints con 'triaje': {triaje_endpoints}")
        
        # Buscar específicamente el endpoint
        target_pattern = "/episodios/{episodio_id}/triaje"
        if target_pattern in paths:
            print(f"✅ Endpoint encontrado: {target_pattern}")
            methods = list(paths[target_pattern].keys())
            print(f"   Métodos disponibles: {methods}")
        else:
            print(f"❌ Endpoint {target_pattern} no encontrado")
            print("Endpoints disponibles en /episodios:")
            episodios_endpoints = [path for path in paths.keys() if path.startswith("/episodios")]
            for ep in episodios_endpoints:
                print(f"   {ep}")

if __name__ == "__main__":
    test_endpoint() 