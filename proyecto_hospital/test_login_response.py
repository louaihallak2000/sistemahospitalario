#!/usr/bin/env python3
"""
Script para verificar exactamente qué devuelve el endpoint de login
"""

import requests
import json

def test_login_response():
    print("🔍 TEST LOGIN RESPONSE")
    print("=" * 50)
    
    login_data = {
        "hospital_code": "HOSP001",
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post("http://127.0.0.1:8000/auth/login", json=login_data)
        print(f"📡 Status: {response.status_code}")
        print(f"📡 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📡 Response JSON: {json.dumps(data, indent=2)}")
            
            # Verificar estructura
            if "access_token" in data:
                print(f"✅ access_token presente: {data['access_token'][:20]}...")
            else:
                print("❌ access_token NO presente")
                
            if "token_type" in data:
                print(f"✅ token_type presente: {data['token_type']}")
            else:
                print("❌ token_type NO presente")
                
            # Verificar que el token es válido
            token = data.get("access_token")
            if token:
                print(f"✅ Token válido: {len(token)} caracteres")
            else:
                print("❌ Token inválido o vacío")
                
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_login_response() 