@echo off
echo 🔍 TEST DIRECTO DE SERVICIOS
echo ==========================
echo.

echo 1. TEST BACKEND HEALTH:
curl -X GET http://127.0.0.1:8000/health
echo.
echo.

echo 2. TEST FRONTEND:
curl -I http://localhost:3000
echo.
echo.

echo 3. TEST LOGIN:
curl -X POST http://127.0.0.1:8000/auth/login -H "Content-Type: application/json" -d "{\"hospital_code\": \"HOSP001\", \"username\": \"admin\", \"password\": \"admin123\"}"
echo.
echo.

pause 