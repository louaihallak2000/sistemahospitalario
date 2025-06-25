@echo off
echo ========================================
echo   INSTALANDO DEPENDENCIAS BACKEND
echo   SISTEMA HOSPITALARIO
echo ========================================
echo.

REM Verificar Python
echo [1/4] Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no esta instalado
    echo Instala Python desde https://python.org
    pause
    exit /b 1
)

echo ✅ Python encontrado

REM Crear directorio backend si no existe
echo [2/4] Preparando directorio backend...
if not exist "backend" (
    mkdir backend
    echo Directorio backend creado
)

REM Instalar dependencias
echo [3/4] Instalando dependencias...
cd backend

echo Instalando FastAPI...
pip install fastapi==0.104.1

echo Instalando Uvicorn...
pip install uvicorn[standard]==0.24.0

echo Instalando dependencias adicionales...
pip install python-multipart==0.0.6
pip install pydantic==2.9.2
pip install python-jose[cryptography]==3.3.0
pip install passlib[bcrypt]==1.7.4
pip install python-dotenv==1.0.0

cd ..

REM Verificar instalación
echo [4/4] Verificando instalacion...
python -c "import fastapi, uvicorn, pydantic; print('✅ Todas las dependencias instaladas correctamente')" 2>nul
if errorlevel 1 (
    echo ❌ Error verificando dependencias
    pause
    exit /b 1
)

echo.
echo ========================================
echo   DEPENDENCIAS INSTALADAS EXITOSAMENTE
echo ========================================
echo.
echo ✅ FastAPI instalado
echo ✅ Uvicorn instalado
echo ✅ Pydantic instalado
echo ✅ Todas las dependencias listas
echo.
echo Ahora puedes ejecutar:
echo - SOLUCION_NETWORK_ERROR_COMPLETA.bat
echo - O manualmente: cd backend ^&^& python main.py
echo.
pause 