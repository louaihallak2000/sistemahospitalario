@echo off
echo ========================================
echo 🌐 FRONTEND - NUEVO WORKFLOW HOSPITALARIO
echo ========================================
echo.

cd /d "%~dp0proyecto_hospital"

echo 🗃️  Paso 1: Actualizando base de datos para nuevo workflow...
python actualizar_db_workflow.py
if %ERRORLEVEL% neq 0 (
    echo ❌ Error actualizando base de datos
    echo Continuando con el frontend...
)

echo.
echo 🚀 Paso 2: Iniciando backend...
start "Backend Hospital" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo.
echo 🌐 Paso 3: Iniciando frontend...
cd frontend
start "Frontend Hospital" cmd /k "npm run dev"

cd ..

echo.
echo ========================================
echo ✅ SISTEMA CON NUEVO WORKFLOW INICIADO
echo ========================================
echo.
echo 📋 URLs del sistema:
echo   🌐 Frontend: http://localhost:3000
echo   🔧 Backend:  http://127.0.0.1:8000
echo   📖 API Docs: http://127.0.0.1:8000/docs
echo.
echo 🏥 NUEVO WORKFLOW IMPLEMENTADO:
echo   ✅ Códigos de emergencia
echo   ✅ Triaje por enfermería  
echo   ✅ Decisiones post-triaje
echo   ✅ Lista médica priorizada
echo   ✅ Atención médica completa
echo   ✅ Shockroom mejorado
echo   ✅ Decisión final obligatoria
echo.
echo 🧭 NAVEGACIÓN:
echo   📊 Dashboard: Visión general
echo   🚨 Códigos: /codigos-emergencia
echo   📋 Admisión: /admision
echo   👩‍⚕️ Triaje: /enfermeria/triaje
echo   📝 Decisiones: /enfermeria/decisiones
echo   👨‍⚕️ Lista Médica: /medicos/lista
echo   🏥 Shockroom: /shockroom
echo.
echo 👤 ROLES IMPLEMENTADOS:
echo   - Admin: Acceso completo
echo   - Médico: Lista médica, atención, shockroom
echo   - Enfermera: Triaje, decisiones, shockroom
echo.
echo ⚠️  Presiona cualquier tecla para cerrar...
echo ========================================
pause 