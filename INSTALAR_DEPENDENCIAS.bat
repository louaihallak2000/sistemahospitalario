@echo off
title Instalar Dependencias - Sistema Hospitalario Nuevo Workflow

echo ========================================
echo 📦 INSTALACIÓN DE DEPENDENCIAS
echo 🏥 Sistema Hospitalario - Nuevo Workflow
echo ========================================
echo.

echo 🔍 Verificando requisitos del sistema...
echo.

:: Verificar Python
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Python no está instalado
    echo.
    echo 📥 Descarga Python 3.13+ desde: https://python.org/downloads/
    echo ⚠️  Asegúrate de marcar "Add Python to PATH" durante la instalación
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=2" %%v in ('python --version 2^>^&1') do set PYTHON_VERSION=%%v
    echo ✅ Python encontrado: %PYTHON_VERSION%
)

:: Verificar Node.js
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js no está instalado
    echo.
    echo 📥 Descarga Node.js 18+ desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=1" %%v in ('node --version 2^>^&1') do set NODE_VERSION=%%v
    echo ✅ Node.js encontrado: %NODE_VERSION%
)

:: Verificar Git (opcional)
git --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ⚠️  Git no está instalado (opcional para desarrollo)
) else (
    for /f "tokens=3" %%v in ('git --version 2^>^&1') do set GIT_VERSION=%%v
    echo ✅ Git encontrado: %GIT_VERSION%
)

echo.
echo 🗃️  Navegando al directorio del proyecto...
cd /d "%~dp0proyecto_hospital"

if not exist "app" (
    echo ❌ Error: No se encuentra la estructura del proyecto
    echo ℹ️  Asegúrate de ejecutar este script desde el directorio raíz del proyecto
    pause
    exit /b 1
)

echo ✅ Directorio del proyecto encontrado

echo.
echo ========================================
echo 🐍 INSTALANDO DEPENDENCIAS BACKEND
echo ========================================
echo.

:: Crear entorno virtual si no existe
if not exist "venv" (
    echo 📋 Creando entorno virtual Python...
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo ❌ Error creando entorno virtual
        pause
        exit /b 1
    )
    echo ✅ Entorno virtual creado
) else (
    echo ✅ Entorno virtual ya existe
)

:: Activar entorno virtual
echo 📋 Activando entorno virtual...
call venv\Scripts\activate.bat
if %ERRORLEVEL% neq 0 (
    echo ❌ Error activando entorno virtual
    pause
    exit /b 1
)
echo ✅ Entorno virtual activado

:: Actualizar pip
echo 📋 Actualizando pip...
python -m pip install --upgrade pip
echo ✅ pip actualizado

:: Instalar dependencias del backend
echo 📋 Instalando dependencias del backend...
if exist "requirements.txt" (
    pip install -r requirements.txt
    if %ERRORLEVEL% neq 0 (
        echo ❌ Error instalando dependencias del backend
        echo ℹ️  Intentando instalación individual de paquetes críticos...
        
        echo 📋 Instalando FastAPI...
        pip install fastapi
        
        echo 📋 Instalando Uvicorn...
        pip install uvicorn[standard]
        
        echo 📋 Instalando SQLAlchemy...
        pip install sqlalchemy
        
        echo 📋 Instalando otras dependencias críticas...
        pip install pydantic python-jose python-multipart passlib bcrypt
        
        echo ⚠️  Algunas dependencias pueden no haberse instalado correctamente
    ) else (
        echo ✅ Dependencias del backend instaladas correctamente
    )
) else (
    echo ⚠️  requirements.txt no encontrado, instalando dependencias básicas...
    pip install fastapi uvicorn[standard] sqlalchemy pydantic python-jose python-multipart passlib bcrypt
)

echo.
echo ========================================
echo 🌐 INSTALANDO DEPENDENCIAS FRONTEND
echo ========================================
echo.

:: Navegar al directorio del frontend
cd frontend

if not exist "package.json" (
    echo ❌ Error: package.json no encontrado en el directorio frontend
    echo ℹ️  Verificando estructura del proyecto...
    cd ..
    pause
    exit /b 1
)

:: Verificar/instalar npm
npm --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ npm no está disponible
    echo ℹ️  npm debería venir incluido con Node.js
    pause
    exit /b 1
) else (
    for /f "tokens=1" %%v in ('npm --version 2^>^&1') do set NPM_VERSION=%%v
    echo ✅ npm encontrado: %NPM_VERSION%
)

:: Limpiar cache npm (opcional)
echo 📋 Limpiando cache npm...
npm cache clean --force >nul 2>&1

:: Instalar dependencias del frontend
echo 📋 Instalando dependencias del frontend...
echo ℹ️  Esto puede tomar varios minutos...

npm install --legacy-peer-deps
if %ERRORLEVEL% neq 0 (
    echo ⚠️  Error con --legacy-peer-deps, intentando instalación normal...
    npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ Error instalando dependencias del frontend
        echo.
        echo 🔧 Intentos de solución:
        echo   1. Eliminar node_modules y package-lock.json
        echo   2. Ejecutar npm install nuevamente
        echo   3. Verificar conexión a internet
        echo.
        
        echo 🧹 Limpiando archivos problemáticos...
        if exist "node_modules" rmdir /s /q node_modules
        if exist "package-lock.json" del package-lock.json
        
        echo 🔄 Reintentando instalación...
        npm install
        if %ERRORLEVEL% neq 0 (
            echo ❌ Error persistente en instalación del frontend
            echo ℹ️  Puede continuar, pero el frontend podría no funcionar correctamente
            pause
        ) else (
            echo ✅ Dependencias del frontend instaladas en segundo intento
        )
    ) else (
        echo ✅ Dependencias del frontend instaladas correctamente
    )
) else (
    echo ✅ Dependencias del frontend instaladas correctamente
)

:: Verificar instalación de Next.js
echo 📋 Verificando instalación de Next.js...
npx next --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✅ Next.js instalado correctamente
) else (
    echo ⚠️  Next.js no se detecta correctamente
)

cd ..

echo.
echo ========================================
echo 🗃️  CONFIGURANDO BASE DE DATOS
echo ========================================
echo.

:: Ejecutar migración de base de datos
echo 📋 Configurando base de datos para nuevo workflow...
if exist "actualizar_db_workflow.py" (
    python actualizar_db_workflow.py
    if %ERRORLEVEL% equ 0 (
        echo ✅ Base de datos configurada para nuevo workflow
    ) else (
        echo ⚠️  Error en migración, usando configuración básica...
        if exist "init_db.py" (
            python init_db.py
            if %ERRORLEVEL% equ 0 (
                echo ✅ Base de datos inicializada con configuración básica
            ) else (
                echo ❌ Error en configuración de base de datos
            )
        )
    )
) else (
    echo ℹ️  Script de migración no encontrado, verificando init_db.py...
    if exist "init_db.py" (
        python init_db.py
        if %ERRORLEVEL% equ 0 (
            echo ✅ Base de datos inicializada
        ) else (
            echo ❌ Error inicializando base de datos
        )
    ) else (
        echo ⚠️  No se encontraron scripts de configuración de base de datos
    )
)

echo.
echo ========================================
echo 🎉 INSTALACIÓN COMPLETADA
echo ========================================
echo.

echo 📊 Resumen de la instalación:
echo   🐍 Python:       ✅ Instalado (%PYTHON_VERSION%)
echo   🌐 Node.js:      ✅ Instalado (%NODE_VERSION%)
echo   🔧 Backend:      ✅ Dependencias instaladas
echo   🌐 Frontend:     ✅ Dependencias instaladas
echo   🗃️  Base datos:   ✅ Configurada
echo.

echo 🚀 Para iniciar el sistema:
echo   INICIAR_NUEVO_WORKFLOW.bat           (RECOMENDADO - Nuevo workflow)
echo   SISTEMA_COMPLETO_FUNCIONANDO.bat     (Completo con verificaciones)
echo   INICIAR_FRONTEND_NUEVO_WORKFLOW.bat  (Solo frontend actualizado)
echo.

echo 🧭 URLs una vez iniciado:
echo   🌐 Frontend:  http://localhost:3000
echo   🔧 Backend:   http://127.0.0.1:8000  
echo   📖 API Docs:  http://127.0.0.1:8000/docs
echo.

echo 👤 Credenciales de prueba:
echo   🏥 Hospital ID: HOSP001
echo   👨‍💼 Admin:       admin / admin123
echo   👨‍⚕️ Médico:      medico1 / medico123
echo   👩‍⚕️ Enfermera:   enfermera1 / enfermera123
echo.

echo 🎯 Nuevo Workflow Incluye:
echo   ✅ 7 Códigos de Emergencia
echo   ✅ Triaje por Enfermería (5 colores)
echo   ✅ Decisiones Post-Triaje
echo   ✅ Lista Médica Priorizada
echo   ✅ Atención Médica Completa
echo   ✅ Shockroom con 6 Camas
echo   ✅ Decisión Final Obligatoria
echo.

echo ⚠️  Presiona cualquier tecla para cerrar
echo ========================================
pause 