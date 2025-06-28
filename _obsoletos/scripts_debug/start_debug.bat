@echo off
echo 🔧 INICIANDO SISTEMA HOSPITALARIO - DEBUG MODE
echo ============================================
echo.

echo 🛑 DETENIENDO PROCESOS EXISTENTES...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo 🐍 INICIANDO BACKEND (Puerto 8000)...
cd proyecto_hospital
start cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level debug"

echo.
echo ⏳ Esperando que el backend inicie...
timeout /t 5 >nul

echo.
echo 🌐 INICIANDO FRONTEND (Puerto 3000)...
cd frontend
start cmd /k "npm run dev"

echo.
echo ⏳ Esperando que el frontend inicie...
timeout /t 5 >nul

echo.
echo ✅ SISTEMA INICIADO EN MODO DEBUG
echo.
echo 📋 VERIFICANDO SERVICIOS...
echo.
netstat -ano | findstr ":8000 :3000" | findstr "LISTENING"

echo.
echo 🌐 URLS:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://127.0.0.1:8000
echo   - API Docs: http://127.0.0.1:8000/docs
echo   - Debug Test: file:///C:/Users/louaii/Desktop/sistema%%20hopitalario%%20definitivo/debug_network_error.html
echo.
echo 🔍 DEBUGGING:
echo   1. Abre el archivo debug_network_error.html en tu navegador
echo   2. Revisa la consola del navegador (F12)
echo   3. Revisa las ventanas CMD para ver logs
echo.
pause 