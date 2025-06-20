import requests
import json

print("🔍 TEST DIRECTO DE API - Sistema Hospitalario")
print("=" * 50)

# Base URL
BASE_URL = "http://127.0.0.1:8000"

# Test 1: Health check
print("\n1️⃣ TEST: Health Check")
try:
    response = requests.get(f"{BASE_URL}/health")
    print(f"✅ Status: {response.status_code}")
    print(f"📊 Response: {response.json()}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: Login
print("\n2️⃣ TEST: Login")
login_data = {
    "hospital_code": "HOSP001",
    "username": "admin",
    "password": "admin123"
}
try:
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"✅ Status: {response.status_code}")
    data = response.json()
    token = data.get("access_token", "")
    print(f"🔑 Token obtenido: {token[:50]}...")
except Exception as e:
    print(f"❌ Error: {e}")
    token = None

# Test 3: Lista espera (con auth)
if token:
    print("\n3️⃣ TEST: Lista Espera (con autenticación)")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{BASE_URL}/episodios/lista-espera", headers=headers)
        print(f"✅ Status: {response.status_code}")
        data = response.json()
        print(f"📊 Episodios en lista: {len(data) if isinstance(data, list) else 'Error'}")
        if isinstance(data, list) and len(data) > 0:
            print(f"📋 Primer episodio: {json.dumps(data[0], indent=2)}")
    except Exception as e:
        print(f"❌ Error: {e}")

# Test 4: Estadísticas (con auth)
if token:
    print("\n4️⃣ TEST: Estadísticas (con autenticación)")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{BASE_URL}/episodios/estadisticas", headers=headers)
        print(f"✅ Status: {response.status_code}")
        data = response.json()
        print(f"📊 Estadísticas: {json.dumps(data, indent=2)}")
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "=" * 50)
print("✅ Tests completados")
print("\n💡 Si todos los tests pasan aquí pero fallan en el navegador,")
print("   el problema es definitivamente CORS.") 