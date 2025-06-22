#!/usr/bin/env python3
"""
Test del endpoint de triaje para verificar que funcione correctamente.
"""

import requests
import json

def test_triaje_endpoint():
    """Test completo del endpoint de triaje"""
    
    base_url = "http://127.0.0.1:8000"
    
    print("🧪 Iniciando test del endpoint de triaje...")
    
    # 1. Verificar que el servidor esté funcionando
    try:
        response = requests.get(f"{base_url}/docs")
        if response.status_code == 200:
            print("✅ Servidor FastAPI funcionando")
        else:
            print(f"❌ Servidor no responde: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error conectando al servidor: {e}")
        print("💡 Asegúrate de que el servidor esté ejecutándose en puerto 8000")
        return
    
    # 2. Login para obtener token
    print("\n🔐 Realizando login...")
    login_data = {
        "hospital_code": "HOSP001",
        "username": "admin",
        "password": "admin123"
    }
    
    try:
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
    
    # 3. Configurar headers de autorización
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 4. Obtener episodios sin triaje
    print("\n📋 Obteniendo episodios sin triaje...")
    try:
        response = requests.get(f"{base_url}/episodios/sin-triaje", headers=headers)
        if response.status_code == 200:
            episodios = response.json()
            print(f"✅ Obtenidos {len(episodios)} episodios sin triaje")
            
            if episodios:
                episode_id = episodios[0]["id"]
                print(f"🎯 Usando episodio ID: {episode_id}")
                
                # 5. Test del endpoint de triaje
                print(f"\n🧪 Probando endpoint de triaje...")
                url = f"{base_url}/episodios/{episode_id}/triage"
                data = {"color": "ROJO"}
                
                print(f"📤 PUT {url}")
                print(f"📄 Data: {data}")
                
                response = requests.put(url, json=data, headers=headers)
                print(f"📊 Status: {response.status_code}")
                
                if response.status_code == 200:
                    print("✅ ¡ÉXITO! Triaje actualizado correctamente")
                    result = response.json()
                    print(f"📋 Respuesta del servidor:")
                    print(json.dumps(result, indent=2, ensure_ascii=False))
                    
                    # 6. Verificar que el episodio se movió
                    print(f"\n🔍 Verificando que el episodio se movió a lista con triaje...")
                    
                    # Verificar lista sin triaje (debería tener uno menos)
                    response = requests.get(f"{base_url}/episodios/sin-triaje", headers=headers)
                    nuevos_sin_triaje = response.json()
                    print(f"📋 Episodios sin triaje después: {len(nuevos_sin_triaje)}")
                    
                    # Verificar lista con triaje (debería incluir el episodio)
                    response = requests.get(f"{base_url}/episodios/lista-espera", headers=headers)
                    con_triaje = response.json()
                    print(f"📋 Episodios con triaje después: {len(con_triaje)}")
                    
                    # Buscar el episodio específico
                    episodio_encontrado = False
                    for ep in con_triaje:
                        if ep["id"] == episode_id:
                            episodio_encontrado = True
                            print(f"✅ Episodio encontrado en lista con triaje")
                            print(f"🎨 Color asignado: {ep.get('color_triaje')}")
                            break
                    
                    if not episodio_encontrado:
                        print("⚠️ Episodio no encontrado en lista con triaje")
                        
                else:
                    print(f"❌ Error en endpoint: {response.text}")
                    
                    # Información adicional para debugging
                    print(f"\n🔍 Información de debugging:")
                    print(f"   URL completa: {url}")
                    print(f"   Headers: {headers}")
                    print(f"   Data enviada: {data}")
                    
            else:
                print("⚠️ No hay episodios sin triaje para probar")
                print("💡 Registra un paciente sin color de triaje primero")
                
        else:
            print(f"❌ Error obteniendo episodios: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Error en test: {e}")
    
    print(f"\n🏁 Test completado")

if __name__ == "__main__":
    test_triaje_endpoint() 