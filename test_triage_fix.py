#!/usr/bin/env python3
"""
Script para probar el endpoint con triage (inglés).
"""

import requests
import json

def test_triage_endpoint():
    """Test del endpoint con triage"""
    
    base_url = "http://127.0.0.1:8000"
    
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
    
    # Obtener episodios sin triaje
    response = requests.get(f"{base_url}/episodios/sin-triaje", headers=headers)
    if response.status_code == 200:
        episodios = response.json()
        print(f"Episodios encontrados: {len(episodios)}")
        
        if episodios:
            episode_id = episodios[0]["id"]
            print(f"Usando episodio: {episode_id}")
            
            # Probar con "triage" (inglés)
            url = f"{base_url}/episodios/{episode_id}/triage"
            print(f"\n🧪 Probando: {url}")
            
            # Probar PUT con formato correcto
            put_response = requests.put(url, json="ROJO", headers=headers)
            print(f"PUT: {put_response.status_code}")
            
            if put_response.status_code == 200:
                print("✅ ¡Funciona con 'triage'!")
                result = put_response.json()
                print(f"Resultado: {result}")
            else:
                print(f"❌ Error: {put_response.text}")
                
                # Probar también GET para ver qué métodos están disponibles
                get_response = requests.get(url, headers=headers)
                print(f"GET: {get_response.status_code} - {get_response.text}")

if __name__ == "__main__":
    test_triage_endpoint() 