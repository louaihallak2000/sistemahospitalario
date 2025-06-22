#!/usr/bin/env python3
"""
Test para verificar si las correcciones funcionan.
"""

import requests
import json

def test_correcciones():
    """Test con las correcciones aplicadas"""
    
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
        print(f"✅ Obtenidos {len(episodios)} episodios sin triaje")
        
        if episodios:
            episode_id = episodios[0]["id"]
            print(f"🎯 Usando episodio: {episode_id}")
            
            # Probar con el formato corregido
            url = f"{base_url}/episodios/{episode_id}/triage"
            print(f"\n🧪 Probando endpoint corregido: {url}")
            
            # Formato correcto: {"color": "ROJO"}
            response = requests.put(url, json={"color": "ROJO"}, headers=headers)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ ¡FUNCIONA! Triaje actualizado exitosamente")
                result = response.json()
                print(f"📊 Resultado: {result}")
                
                # Verificar que el episodio se movió de la lista sin triaje
                print("\n🔍 Verificando que el episodio se movió...")
                
                # Verificar lista sin triaje (debería tener uno menos)
                response = requests.get(f"{base_url}/episodios/sin-triaje", headers=headers)
                episodios_sin_triaje = response.json()
                print(f"📋 Episodios sin triaje después: {len(episodios_sin_triaje)}")
                
                # Verificar lista con triaje (debería incluir el episodio)
                response = requests.get(f"{base_url}/episodios/lista-espera", headers=headers)
                episodios_con_triaje = response.json()
                print(f"📋 Episodios con triaje después: {len(episodios_con_triaje)}")
                
                # Buscar el episodio en la nueva lista
                episodio_encontrado = None
                for ep in episodios_con_triaje:
                    if ep["id"] == episode_id:
                        episodio_encontrado = ep
                        break
                
                if episodio_encontrado:
                    print(f"✅ Episodio encontrado en lista con triaje!")
                    print(f"🎨 Color asignado: {episodio_encontrado.get('color_triaje')}")
                else:
                    print("⚠️ Episodio no encontrado en lista con triaje")
                
            else:
                print(f"❌ Error: {response.text}")
        else:
            print("⚠️ No hay episodios sin triaje para probar")
    else:
        print(f"❌ Error obteniendo episodios: {response.text}")

if __name__ == "__main__":
    test_correcciones() 