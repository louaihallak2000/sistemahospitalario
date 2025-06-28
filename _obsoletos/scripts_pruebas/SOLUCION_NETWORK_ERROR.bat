@echo off
echo ========================================
echo   SOLUCION NETWORK ERROR - SISTEMA HOSPITALARIO
echo ========================================
echo.
echo Este script resolverá los problemas de:
echo - NetworkError en el frontend
echo - Errores de CORS
echo - Problemas de conexión backend-frontend
echo - Headers de cache problemáticos
echo.
pause

REM Paso 1: Detener todos los procesos
echo [1/8] Deteniendo todos los procesos...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 3 >nul

REM Paso 2: Limpiar puertos
echo [2/8] Limpiando puertos 3000, 3001 y 8000...
for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":3000" 2^>nul') do taskkill /F /PID %%i 2>nul
for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":3001" 2^>nul') do taskkill /F /PID %%i 2>nul
for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":8000" 2^>nul') do taskkill /F /PID %%i 2>nul
timeout /t 2 >nul

REM Paso 3: Verificar archivos corregidos
echo [3/8] Verificando archivos corregidos...
if not exist "proyecto_hospital\app\main.py" (
    echo ERROR: Backend no encontrado
    pause
    exit /b 1
)

if not exist "proyecto_hospital\frontend\next.config.mjs" (
    echo ERROR: Frontend no encontrado
    pause
    exit /b 1
)

echo ✅ Archivos de configuración encontrados

REM Paso 4: Limpiar caché del frontend
echo [4/8] Limpiando caché del frontend...
cd proyecto_hospital\frontend
if exist ".next" rmdir /s /q ".next"
if exist "out" rmdir /s /q "out"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
npm cache clean --force 2>nul
cd ..\..

REM Paso 5: Verificar dependencias
echo [5/8] Verificando dependencias...
cd proyecto_hospital\frontend
if not exist "node_modules" (
    echo Instalando dependencias del frontend...
    npm install --legacy-peer-deps
)
cd ..\..

REM Paso 6: Iniciar backend con configuración corregida
echo [6/8] Iniciando backend con CORS corregido...
cd proyecto_hospital
start "Backend - CORS Fixed" cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
cd ..

REM Paso 7: Esperar y verificar backend
echo [7/8] Esperando que el backend se inicie...
timeout /t 10 >nul

echo Verificando backend...
curl -s http://127.0.0.1:8000/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Backend puede estar iniciando aún...
) else (
    echo ✅ Backend respondiendo correctamente
)

REM Paso 8: Iniciar frontend con proxy corregido
echo [8/8] Iniciando frontend con proxy corregido...
cd proyecto_hospital\frontend
start "Frontend - Proxy Fixed" cmd /k "npm run dev"
cd ..\..

REM Paso final: Esperar y abrir navegador
echo.
echo Esperando que ambos servicios se inicien...
timeout /t 15 >nul

echo Abriendo navegador...
start "" "http://localhost:3000"

echo.
echo ========================================
echo   SOLUCIÓN NETWORK ERROR APLICADA
echo ========================================
echo.
echo ✅ CORS configurado para múltiples orígenes
echo ✅ Headers de cache optimizados
echo ✅ Proxy mejorado para todas las rutas
echo ✅ Backend con configuración corregida
echo ✅ Frontend con caché limpio
echo.
echo URLs:
echo - Frontend: http://localhost:3000
echo - Backend:  http://127.0.0.1:8000
echo - API Docs: http://127.0.0.1:8000/docs
echo.
echo Credenciales:
echo - Usuario: admin
echo - Password: admin123
echo - Hospital: HOSP001
echo.
echo NOTA: Si persisten errores de red:
echo 1. Verifica que no hay firewall bloqueando
echo 2. Revisa la consola del navegador (F12)
echo 3. Verifica que ambos servicios estén corriendo
echo.
pause 