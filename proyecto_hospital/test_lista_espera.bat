@echo off
echo.
echo ====================================================
echo   🏥 SISTEMA HOSPITALARIO - TEST LISTA DE ESPERA
echo ====================================================
echo.
echo 🔧 INICIANDO SISTEMAS...
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python no está instalado o no está en PATH
    pause
    exit /b 1
)

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado o no está en PATH
    pause
    exit /b 1
)

echo ✅ Python y Node.js detectados
echo.

REM Iniciar Backend
echo 🚀 Iniciando Backend FastAPI (Puerto 8000)...
start "Backend FastAPI" cmd /k "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Esperar un poco para que el backend inicie
timeout /t 3 /nobreak >nul

REM Iniciar Frontend
echo 🚀 Iniciando Frontend Next.js (Puerto 3000)...
start "Frontend Next.js" cmd /k "cd frontend && npm run dev"

REM Esperar un poco más
timeout /t 5 /nobreak >nul

echo.
echo ================================================
echo   🎯 INSTRUCCIONES DE PRUEBA
echo ================================================
echo.
echo 1. 🌐 Abrir navegador en: http://localhost:3000
echo 2. 🔑 Login: admin / admin123 (Hospital: HOSP001)
echo 3. 🔍 Abrir Consola del Navegador (F12)
echo 4. ➕ Crear un nuevo paciente:
echo    - Clic en "Nuevo Paciente"
echo    - Completar formulario
echo    - Seleccionar color de triaje
echo    - Guardar
echo 5. 📋 Verificar Lista de Espera:
echo    - El paciente debe aparecer INMEDIATAMENTE
echo    - Verificar logs en consola con emojis 🔍📊✅
echo    - Comprobar que los botones funcionen
echo.
echo ================================================
echo   🐛 DEBUGGING
echo ================================================
echo.
echo Si hay problemas, revisar en la consola:
echo - 🔍 "Llamando al endpoint /episodios/lista-espera..."
echo - 📊 "Datos recibidos del backend: [...]"  
echo - ✅ "Episodios mapeados para frontend: [...]"
echo - 🎨 "getTriageColor - valor recibido: [...]"
echo.
echo ❌ Si aparece error "triageColors undefined":
echo    - Verificar que getTriageColor() funcione
echo    - Revisar que triageColor tenga un valor válido
echo.
echo ================================================
echo   ⚙️ SERVIDORES ACTIVOS
echo ================================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo API Docs: http://127.0.0.1:8000/docs
echo.
echo Para cerrar servidores: Cerrar las ventanas CMD
echo.
pause
echo.
echo 🚀 ¡Listo para probar! Abriendo navegador...
start http://localhost:3000 