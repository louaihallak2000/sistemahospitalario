@echo off
echo ========================================
echo    INICIANDO SISTEMA HOSPITALARIO
echo    (VERSION CORREGIDA)
echo ========================================
echo.

REM Detener procesos existentes
echo [1/6] Deteniendo procesos existentes...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

REM Verificar estructura del proyecto
echo [2/6] Verificando estructura del proyecto...
if not exist "proyecto_hospital\app\main.py" (
    echo ERROR: No se encuentra el backend en proyecto_hospital\app\main.py
    echo Verifica que la estructura del proyecto sea correcta.
    pause
    exit /b 1
)

if not exist "proyecto_hospital\frontend\package.json" (
    echo ERROR: No se encuentra el frontend en proyecto_hospital\frontend
    echo Verifica que la estructura del proyecto sea correcta.
    pause
    exit /b 1
)

REM Instalar dependencias del frontend si es necesario
echo [3/6] Verificando dependencias del frontend...
cd proyecto_hospital\frontend
if not exist "node_modules" (
    echo Instalando dependencias del frontend...
    npm install
    if errorlevel 1 (
        echo ERROR: Fallo en la instalación de dependencias
        pause
        exit /b 1
    )
)
cd ..\..

REM Iniciar Backend desde el directorio correcto
echo.
echo [4/6] Iniciando Backend FastAPI (Puerto 8000)...
cd proyecto_hospital
start "Backend - FastAPI" cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
cd ..

REM Esperar que el backend inicie
echo Esperando que el backend se inicie...
timeout /t 8 >nul

REM Iniciar Frontend desde el directorio correcto
echo.
echo [5/6] Iniciando Frontend Next.js (Puerto 3000)...
cd proyecto_hospital\frontend
start "Frontend - Next.js" cmd /k "npm run dev"
cd ..\..

REM Esperar que el frontend inicie
echo Esperando que el frontend se inicie...
timeout /t 10 >nul

REM Abrir navegador
echo.
echo [6/6] Abriendo navegador...
start "" "http://localhost:3000"

echo.
echo ========================================
echo    SISTEMA INICIADO CORRECTAMENTE
echo ========================================
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
echo       Cierra las ventanas para detener los servicios
echo.
pause 