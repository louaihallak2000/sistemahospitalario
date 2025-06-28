@echo off
title Sistema Hospitalario Completo - Nuevo Workflow

echo ========================================
echo 🏥 SISTEMA HOSPITALARIO COMPLETO
echo 🔄 NUEVO WORKFLOW IMPLEMENTADO
echo ========================================
echo.

echo 📋 Verificando requisitos...

:: Verificar si existe Python
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Python no está instalado o no está en el PATH
    echo ℹ️  Instala Python 3.13+ desde https://python.org
    pause
    exit /b 1
)

:: Verificar si existe Node.js
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js no está instalado o no está en el PATH
    echo ℹ️  Instala Node.js 18+ desde https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Python encontrado
echo ✅ Node.js encontrado

cd /d "%~dp0proyecto_hospital"

echo.
echo 🗃️  Paso 1: Actualizando base de datos con nuevo workflow...
python actualizar_db_workflow.py
if %ERRORLEVEL% neq 0 (
    echo ❌ Error actualizando base de datos
    echo ℹ️  Verificando si existe el script de migración...
    if not exist actualizar_db_workflow.py (
        echo ⚠️  Script de migración no encontrado, usando inicialización básica...
        python init_db.py
    )
    if %ERRORLEVEL% neq 0 (
        echo ❌ Error crítico en la base de datos
        pause
        exit /b 1
    )
)

echo ✅ Base de datos actualizada correctamente

echo.
echo 🚀 Paso 2: Iniciando Backend FastAPI...
echo ℹ️  Iniciando en puerto 8000...
start "🔧 Backend Hospital - Nuevo Workflow" cmd /k "echo ========================================== && echo 🔧 BACKEND SISTEMA HOSPITALARIO && echo 🔄 Nuevo Workflow Activado && echo ========================================== && echo. && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo ⏳ Esperando que el backend se inicie...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Paso 3: Iniciando Frontend Next.js...
cd frontend

:: Verificar si existen las dependencias
if not exist node_modules (
    echo ℹ️  Instalando dependencias del frontend...
    npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ Error instalando dependencias del frontend
        pause
        exit /b 1
    )
)

echo ℹ️  Iniciando en puerto 3000...
start "🌐 Frontend Hospital - Nuevo Workflow" cmd /k "echo ========================================== && echo 🌐 FRONTEND SISTEMA HOSPITALARIO && echo 🔄 Nuevo Workflow Activado && echo ========================================== && echo. && npm run dev"

cd ..

echo.
echo ========================================
echo 🎉 SISTEMA COMPLETAMENTE INICIALIZADO
echo ========================================
echo.
echo 📋 URLs del Sistema:
echo   🌐 Frontend:  http://localhost:3000
echo   🔧 Backend:   http://127.0.0.1:8000
echo   📖 API Docs:  http://127.0.0.1:8000/docs
echo   🔍 Admin:     http://127.0.0.1:8000/admin (si está habilitado)
echo.
echo 🧭 Rutas Principales del Nuevo Workflow:
echo   📊 Dashboard:             /
echo   🚨 Códigos Emergencia:    /codigos-emergencia
echo   📋 Admisión:              /admision
echo   👩‍⚕️ Triaje Enfermería:     /enfermeria/triaje
echo   📝 Decisiones Post-Triaje: /enfermeria/decisiones
echo   👨‍⚕️ Lista Médica:          /medicos/lista
echo   🏥 Shockroom:             /shockroom
echo.
echo 👤 Credenciales de Acceso:
echo   🏥 Hospital ID: HOSP001
echo   👨‍💼 Admin:       admin / admin123
echo   👨‍⚕️ Médico:      medico1 / medico123
echo   👩‍⚕️ Enfermera:   enfermera1 / enfermera123
echo.
echo 🎯 Nuevo Workflow Implementado:
echo   ✅ 7 Códigos de Emergencia (AZUL, ACV, IAM, TRAUMA, SEPSIS, PEDIÁTRICO, OBSTÉTRICO)
echo   ✅ Triaje por Enfermería con 5 colores (ROJO, NARANJA, AMARILLO, VERDE, AZUL)
echo   ✅ Decisiones Post-Triaje (Lista Médica, Alta Enfermería, Shockroom)
echo   ✅ Lista Médica Priorizada por Triaje
echo   ✅ Atención Médica Completa (Prescripciones, Procedimientos, Estudios, Evoluciones)
echo   ✅ Shockroom con 6 Camas y 3 Vías de Admisión
echo   ✅ Decisión Final Obligatoria (Alta, Internación, Continúa)
echo   ✅ Traslados Automáticos entre Hospitales
echo.
echo 🏗️  Stack Tecnológico:
echo   🔧 Backend:  FastAPI + SQLAlchemy + SQLite + JWT
echo   🌐 Frontend: Next.js 15 + React 19 + TypeScript + Tailwind CSS
echo   📡 Real-time: WebSocket + Notificaciones automáticas
echo.
echo 🛑 Para detener el sistema:
echo   DETENER_SISTEMA_HOSPITALARIO_COMPLETO.bat
echo.
echo ⚠️  Presiona cualquier tecla para cerrar esta ventana
echo ⚠️  NO cerrar las ventanas del Backend y Frontend
echo ========================================
pause 