#!/usr/bin/env python3
"""
Test final del endpoint de triaje - Confirmación de funcionamiento.
"""

import requests
import json

def test_triaje_final():
    """Test final para confirmar que todo funciona"""
    
    base_url = "http://127.0.0.1:8000"
    
    print("🎯 TEST FINAL - Endpoint de Triaje")
    print("=" * 50)
    
    # Login
    login_data = {"hospital_code": "HOSP001", "username": "admin", "password": "admin123"}
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    
    if response.status_code != 200:
        print(f"❌ Login falló: {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # Obtener episodio sin triaje
    response = requests.get(f"{base_url}/episodios/sin-triaje", headers=headers)
    episodios = response.json()
    
    if not episodios:
        print("⚠️ No hay episodios sin triaje para probar")
        return
    
    episode_id = episodios[0]["id"]
    print(f"📋 Episodio a evaluar: {episode_id}")
    
    # Test del endpoint
    url = f"{base_url}/episodios/{episode_id}/triage"
    data = {"color": "ROJO"}
    
    print(f"\n🧪 Enviando petición:")
    print(f"   URL: {url}")
    print(f"   Method: PUT")
    print(f"   Data: {data}")
    
    response = requests.put(url, json=data, headers=headers)
    
    print(f"\n📊 Resultado:")
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ ¡ÉXITO! El endpoint funciona correctamente")
        print(f"   Response: {response.json()}")
        
        # Verificar que el episodio se movió
        print(f"\n🔍 Verificando movimiento del episodio...")
        
        # Lista sin triaje
        response = requests.get(f"{base_url}/episodios/sin-triaje", headers=headers)
        sin_triaje = response.json()
        
        # Lista con triaje  
        response = requests.get(f"{base_url}/episodios/lista-espera", headers=headers)
        con_triaje = response.json()
        
        # Buscar el episodio
        encontrado_en_triaje = any(ep["id"] == episode_id for ep in con_triaje)
        encontrado_sin_triaje = any(ep["id"] == episode_id for ep in sin_triaje)
        
        if encontrado_en_triaje and not encontrado_sin_triaje:
            print("✅ Episodio movido correctamente a lista con triaje")
        else:
            print("⚠️ Episodio no se movió como esperado")
            
        print(f"   Episodios sin triaje: {len(sin_triaje)}")
        print(f"   Episodios con triaje: {len(con_triaje)}")
        
    else:
        print(f"❌ Error: {response.text}")
    
    print(f"\n" + "=" * 50)
    print("🏁 Test completado")

if __name__ == "__main__":
    test_triaje_final() 