#!/usr/bin/env python3
"""
Script para probar diferentes formatos del cuerpo de la petición.
"""

import requests
import json

def test_body_formats():
    """Test diferentes formatos del cuerpo"""
    
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
            
            url = f"{base_url}/episodios/{episode_id}/triage"
            print(f"\n🧪 Probando diferentes formatos en: {url}")
            
            # Formato 1: String directo
            print("\n1️⃣ Probando formato: string directo")
            response = requests.put(url, json="ROJO", headers=headers)
            print(f"   Status: {response.status_code}")
            if response.status_code != 200:
                print(f"   Error: {response.text}")
            
            # Formato 2: Objeto con clave "color"
            print("\n2️⃣ Probando formato: {'color': 'ROJO'}")
            response = requests.put(url, json={"color": "ROJO"}, headers=headers)
            print(f"   Status: {response.status_code}")
            if response.status_code != 200:
                print(f"   Error: {response.text}")
            else:
                print("   ✅ ¡Funciona!")
                return
            
            # Formato 3: Objeto con clave diferente
            print("\n3️⃣ Probando formato: {'triageColor': 'ROJO'}")
            response = requests.put(url, json={"triageColor": "ROJO"}, headers=headers)
            print(f"   Status: {response.status_code}")
            if response.status_code != 200:
                print(f"   Error: {response.text}")
            else:
                print("   ✅ ¡Funciona!")
                return
            
            # Formato 4: Objeto con clave "color_triaje"
            print("\n4️⃣ Probando formato: {'color_triaje': 'ROJO'}")
            response = requests.put(url, json={"color_triaje": "ROJO"}, headers=headers)
            print(f"   Status: {response.status_code}")
            if response.status_code != 200:
                print(f"   Error: {response.text}")
            else:
                print("   ✅ ¡Funciona!")
                return
            
            # Formato 5: Body raw string
            print("\n5️⃣ Probando formato: body raw string")
            response = requests.put(url, data='"ROJO"', headers=headers)
            print(f"   Status: {response.status_code}")
            if response.status_code != 200:
                print(f"   Error: {response.text}")
            else:
                print("   ✅ ¡Funciona!")
                return

if __name__ == "__main__":
    test_body_formats() 