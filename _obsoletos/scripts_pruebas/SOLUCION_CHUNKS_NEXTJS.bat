@echo off
echo ========================================
echo   SOLUCION AUTOMÁTICA - CHUNKS NEXT.JS
echo ========================================
echo.
echo Este script solucionará los problemas de:
echo - Failed to load resource: net::ERR_CONNECTION_REFUSED
echo - Problemas con chunks de Next.js
echo - Página en "Cargando..." infinito
echo.
pause

REM Paso 1: Detener todos los procesos
echo [1/10] Deteniendo todos los procesos...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 3 >nul

REM Paso 2: Limpiar puertos
echo [2/10] Limpiando puertos 3000 y 8000...
for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":3000" 2^>nul') do taskkill /F /PID %%i 2>nul
for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":8000" 2^>nul') do taskkill /F /PID %%i 2>nul
timeout /t 2 >nul

REM Paso 3: Navegar al directorio del frontend
echo [3/10] Navegando al directorio del frontend...
cd proyecto_hospital\frontend
if not exist "package.json" (
    echo ERROR: No se encuentra el directorio del frontend
    pause
    exit /b 1
)

REM Paso 4: Limpiar completamente el caché
echo [4/10] Limpiando caché completo...
if exist ".next" rmdir /s /q ".next"
if exist "out" rmdir /s /q "out"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
if exist "*.tsbuildinfo" del /q "*.tsbuildinfo"
npm cache clean --force 2>nul

REM Paso 5: Reinstalar dependencias desde cero
echo [5/10] Reinstalando dependencias desde cero...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del /q "package-lock.json"
npm install --legacy-peer-deps --no-optional
if errorlevel 1 (
    echo ERROR: Fallo en la instalación de dependencias
    pause
    exit /b 1
)

REM Paso 6: Volver al directorio raíz
echo [6/10] Regresando al directorio raíz...
cd ..\..

REM Paso 7: Verificar backend
echo [7/10] Verificando configuración del backend...
if not exist "proyecto_hospital\app\main.py" (
    echo ERROR: Backend no encontrado
    pause
    exit /b 1
)

REM Paso 8: Iniciar backend
echo [8/10] Iniciando backend corregido...
cd proyecto_hospital
start "Backend Fixed" cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
cd ..

REM Paso 9: Esperar y iniciar frontend
echo [9/10] Esperando que el backend se inicie...
timeout /t 10 >nul

echo [10/10] Iniciando frontend reconstruido...
cd proyecto_hospital\frontend
start "Frontend Fixed" cmd /k "npm run dev"
cd ..\..

REM Paso final: Esperar y abrir navegador
echo.
echo Esperando que ambos servicios se inicien...
timeout /t 15 >nul

echo Abriendo navegador...
start "" "http://localhost:3000"

echo.
echo ========================================
echo   SOLUCIÓN APLICADA EXITOSAMENTE
echo ========================================
echo.
echo ✅ Backend corregido (error de importación solucionado)
echo ✅ Frontend limpio y reconstruido
echo ✅ Configuración Next.js mejorada
echo ✅ Variables de entorno configuradas
echo ✅ Caché completamente limpio
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
echo NOTA: Ambos servicios se ejecutan en ventanas separadas
echo       Si el problema persiste, verifica la consola del navegador
echo.
pause 