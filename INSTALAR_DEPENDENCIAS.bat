@echo off
echo ========================================
echo   INSTALANDO DEPENDENCIAS DEL SISTEMA
echo ========================================
echo.

REM Verificar Python
echo [1/4] Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no está instalado o no está en el PATH
    echo Instala Python 3.8+ desde https://python.org
    pause
    exit /b 1
)

REM Verificar Node.js
echo [2/4] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no está instalado o no está en el PATH
    echo Instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

REM Instalar dependencias de Python (Backend)
echo.
echo [3/4] Instalando dependencias de Python...
if exist "requirements.txt" (
    pip install -r requirements.txt
) else if exist "proyecto_hospital\requirements.txt" (
    pip install -r proyecto_hospital\requirements.txt
) else (
    echo Instalando dependencias básicas del backend...
    pip install fastapi uvicorn sqlalchemy sqlite3 python-jose[cryptography] passlib[bcrypt] python-multipart
)

REM Instalar dependencias de Node.js (Frontend)
echo.
echo [4/4] Instalando dependencias de Node.js...
cd proyecto_hospital\frontend
if exist "package.json" (
    echo Instalando dependencias del frontend...
    npm install
    if errorlevel 1 (
        echo ERROR: Fallo en la instalación de dependencias del frontend
        pause
        exit /b 1
    )
) else (
    echo ERROR: No se encuentra package.json en proyecto_hospital\frontend
    pause
    exit /b 1
)
cd ..\..

echo.
echo ========================================
echo   DEPENDENCIAS INSTALADAS CORRECTAMENTE
echo ========================================
echo.
echo Ahora puedes ejecutar: INICIAR_SISTEMA_CORREGIDO.bat
echo.
pause 