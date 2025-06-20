@echo off
setlocal enabledelayedexpansion

echo.
echo ===============================================
echo       SISTEMA HOSPITALARIO - INICIO ROBUSTO
echo ===============================================
echo.

:: Verificar si estamos en el directorio correcto
if not exist "app\main.py" (
    echo ❌ Error: No se encuentra app\main.py
    echo    Asegurate de ejecutar este script desde proyecto_hospital\
    pause
    exit /b 1
)

:: Verificar si Python está disponible
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python no está instalado o no está en PATH
    pause
    exit /b 1
)

:: Verificar si la base de datos existe, si no, crearla
if not exist "hospital_db.sqlite" (
    echo 📦 Inicializando base de datos...
    python init_db.py
    if errorlevel 1 (
        echo ❌ Error al inicializar la base de datos
        pause
        exit /b 1
    )
) else (
    echo ✅ Base de datos encontrada
)

:: Instalar dependencias básicas si es necesario
echo 📦 Verificando dependencias...
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart >nul 2>&1

:: Terminar procesos existentes en los puertos
echo 🧹 Limpiando procesos existentes...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":8000"') do (
    taskkill /F /PID %%p >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3000"') do (
    taskkill /F /PID %%p >nul 2>&1
)

:: Esperar un momento para que los puertos se liberen
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Iniciando Backend (Puerto 8000)...
start "Backend FastAPI - Sistema Hospitalario" cmd /c "echo Iniciando Backend... && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 && pause"

:: Esperar a que el backend se inicie
echo ⏳ Esperando que el backend se inicie...
set "backend_ready=false"
for /l %%i in (1,1,30) do (
    timeout /t 1 /nobreak >nul
    curl -s http://127.0.0.1:8000/health >nul 2>&1
    if not errorlevel 1 (
        set "backend_ready=true"
        goto :backend_ready
    )
    echo    Intento %%i/30...
)

:backend_ready
if "%backend_ready%"=="true" (
    echo ✅ Backend iniciado correctamente en http://127.0.0.1:8000
) else (
    echo ⚠️  Backend podría tardar en iniciar, pero continuando...
)

echo.
echo 🌐 Iniciando Frontend (Puerto 3000)...
if exist "frontend\package.json" (
    cd frontend
    start "Frontend Next.js - Sistema Hospitalario" cmd /c "echo Iniciando Frontend... && npm run dev && pause"
    cd ..
) else (
    echo ⚠️  Frontend no encontrado en frontend\package.json
)

echo.
echo ===============================================
echo           SISTEMA INICIADO
echo ===============================================
echo.
echo 🌐 URLs del Sistema:
echo    Frontend:  http://localhost:3000
echo    Backend:   http://127.0.0.1:8000
echo    API Docs:  http://127.0.0.1:8000/docs
echo.
echo 🔐 Credenciales de Prueba:
echo    Usuario:     admin
echo    Contraseña:  admin123  
echo    Hospital:    HOSP001
echo.
echo 📱 Otros usuarios de prueba:
echo    medico1/medico123 (HOSP001)
echo    enfermera1/enfermera123 (HOSP001)
echo    admin2/admin456 (HOSP002)
echo.
echo ⚡ NAVEGACIÓN AUTOMÁTICA IMPLEMENTADA:
echo    ✅ Al dar de alta → regresa automáticamente al dashboard
echo    ✅ Al internar paciente → regresa automáticamente al dashboard
echo    ✅ Lista de espera se actualiza automáticamente
echo.
echo ===============================================
echo Presiona cualquier tecla para cerrar...
pause >nul 