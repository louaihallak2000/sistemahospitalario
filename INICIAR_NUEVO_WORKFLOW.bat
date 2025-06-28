@echo off
echo ========================================
echo 🏥 SISTEMA HOSPITALARIO - NUEVO WORKFLOW
echo ========================================
echo.

cd /d "%~dp0proyecto_hospital"

echo 📊 Paso 1: Actualizando base de datos...
python actualizar_db_workflow.py
if %ERRORLEVEL% neq 0 (
    echo ❌ Error actualizando base de datos
    pause
    exit /b 1
)

echo.
echo ✅ Base de datos actualizada correctamente
echo.

echo 🚀 Paso 2: Iniciando backend...
start "Backend Hospitalario" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo.
echo 🌐 Paso 3: Iniciando frontend...
cd frontend
start "Frontend Hospitalario" cmd /k "npm run dev"

cd ..

echo.
echo ========================================
echo 🎉 SISTEMA INICIALIZADO
echo ========================================
echo.
echo 📋 URLs del sistema:
echo   Backend: http://127.0.0.1:8000
echo   Frontend: http://localhost:3000
echo   API Docs: http://127.0.0.1:8000/docs
echo.
echo 🔧 Nuevas funcionalidades implementadas:
echo   ✅ Códigos de emergencia
echo   ✅ Workflow de triaje por enfermería
echo   ✅ Decisiones post-triaje
echo   ✅ Shockroom mejorado
echo   ✅ Atención médica completa
echo   ✅ Decisión final obligatoria
echo.
echo 👤 Credenciales de prueba:
echo   Hospital ID: HOSP001
echo   Usuario: admin
echo   Contraseña: admin123
echo.
echo ⚠️  Presiona cualquier tecla para cerrar esta ventana
echo ========================================
pause 