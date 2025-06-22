#!/usr/bin/env python3
"""
Script de prueba para verificar que el endpoint de triaje funcione correctamente.
"""

import requests
import json
import time

def test_triaje_endpoint():
    """Prueba básica del endpoint de triaje"""
    
    # Configuración
    base_url = "http://127.0.0.1:8000"
    
    print("🧪 Iniciando pruebas del endpoint de triaje...")
    
    # Esperar un poco para que el servidor se inicie
    print("⏳ Esperando que el servidor se inicie...")
    time.sleep(3)
    
    # Verificar que el servidor esté funcionando
    try:
        response = requests.get(f"{base_url}/docs")
        if response.status_code == 200:
            print("✅ Servidor FastAPI funcionando correctamente")
        else:
            print(f"❌ Servidor no responde: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error conectando al servidor: {e}")
        return
    
    # Probar login primero (necesario para obtener token)
    print("\n🔐 Probando login...")
    try:
        login_data = {
            "hospital_code": "HOSP001",
            "username": "admin",
            "password": "admin123"
        }
        
        response = requests.post(f"{base_url}/auth/login", json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get("access_token")
            print("✅ Login exitoso")
        else:
            print(f"❌ Error en login: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"❌ Error en login: {e}")
        return
    
    # Headers para las peticiones autenticadas
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Obtener lista de episodios sin triaje
    print("\n📋 Obteniendo episodios sin triaje...")
    try:
        response = requests.get(f"{base_url}/episodios/sin-triaje", headers=headers)
        if response.status_code == 200:
            episodes = response.json()
            print(f"✅ Obtenidos {len(episodes)} episodios sin triaje")
            
            if episodes:
                episode_id = episodes[0]["id"]
                print(f"🎯 Usando episodio ID: {episode_id}")
                
                # Probar actualización de triaje
                print("\n🎨 Probando actualización de triaje...")
                
                # Formato correcto para Body(..., embed=True)
                triaje_data = "ROJO"  # Esto se convertirá en JSON como "ROJO"
                
                response = requests.put(
                    f"{base_url}/episodios/{episode_id}/triaje",
                    json=triaje_data,  # requests.json() maneja la serialización
                    headers=headers
                )
                
                if response.status_code == 200:
                    print("✅ Triaje actualizado exitosamente")
                    result = response.json()
                    print(f"📊 Resultado: {result}")
                else:
                    print(f"❌ Error actualizando triaje: {response.status_code}")
                    print(f"📄 Respuesta: {response.text}")
                    
                    # Intentar con formato alternativo
                    print("\n🔄 Probando formato alternativo...")
                    response = requests.put(
                        f"{base_url}/episodios/{episode_id}/triaje",
                        json={"color": "NARANJA"},
                        headers=headers
                    )
                    if response.status_code == 200:
                        print("✅ Formato alternativo funcionó")
                    else:
                        print(f"❌ Formato alternativo también falló: {response.status_code}")
                        print(f"📄 Respuesta: {response.text}")
            else:
                print("⚠️ No hay episodios sin triaje para probar")
        else:
            print(f"❌ Error obteniendo episodios: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error en prueba: {e}")

if __name__ == "__main__":
    test_triaje_endpoint() 