#!/usr/bin/env python3
"""
Test final para confirmar el formato correcto.
"""

import requests
import json

def test_final():
    """Test final del endpoint"""
    
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
            
            # El endpoint correcto es /triage, basado en el Body(..., embed=True)
            # FastAPI debe recibir el valor directamente como JSON
            url = f"{base_url}/episodios/{episode_id}/triage"
            print(f"\n🧪 Probando endpoint correcto: {url}")
            
            # Probar con valor directo (string JSON)
            response = requests.put(url, json="ROJO", headers=headers)
            print(f"Formato 'ROJO': Status {response.status_code}")
            if response.status_code == 200:
                print("✅ ¡Funciona!")
                result = response.json()
                print(f"Resultado: {result}")
            else:
                print(f"Error: {response.text}")
                
                # Si eso no funciona, intentar con el formato que esperaría el Body
                # Para Body(embed=True), a veces FastAPI espera solo el valor
                print("\n🔄 Probando con requests.put y data directa...")
                response = requests.put(
                    url, 
                    data=json.dumps("ROJO"),
                    headers=headers
                )
                print(f"Data directa: Status {response.status_code}")
                if response.status_code == 200:
                    print("✅ ¡Funciona con data directa!")
                    result = response.json()
                    print(f"Resultado: {result}")
                else:
                    print(f"Error: {response.text}")

if __name__ == "__main__":
    test_final() 