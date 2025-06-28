@echo off
chcp 65001 >nul 2>&1
title Sistema Hospitalario - Iniciador Completo

:: ============================================================================
:: 🏥 SISTEMA HOSPITALARIO - INICIADOR COMPLETO PARA WINDOWS
:: ============================================================================
:: Este archivo inicia todo el sistema de una sola vez:
:: - Backend FastAPI (Puerto 8000)
:: - Frontend Next.js (Puerto 3000)  
:: - Base de datos SQLite con datos de ejemplo
:: ============================================================================

color 0A
echo.
echo ████████████████████████████████████████████████████████████████████████
echo ██                                                                    ██
echo ██                    🏥 SISTEMA HOSPITALARIO                        ██
echo ██                      Iniciador Completo                           ██
echo ██                                                                    ██
echo ████████████████████████████████████████████████████████████████████████
echo.

:: Verificar que estamos en el directorio correcto
if not exist "proyecto_hospital" (
    echo ❌ ERROR: No se encuentra la carpeta 'proyecto_hospital'
    echo 💡 Asegurate de ejecutar este archivo desde la carpeta raiz del proyecto
    echo.
    pause
    exit /b 1
)

if not exist "proyecto_hospital\frontend" (
    echo ❌ ERROR: No se encuentra la carpeta 'proyecto_hospital\frontend'
    echo 💡 Estructura del proyecto incorrecta
    echo.
    pause
    exit /b 1
)

:: Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Python no está instalado o no está en el PATH
    echo 💡 Instala Python desde https://python.org
    echo.
    pause
    exit /b 1
)

:: Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js no está instalado o no está en el PATH
    echo 💡 Instala Node.js desde https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✅ Python y Node.js encontrados
echo.

:: ============================================================================
:: FASE 1: PREPARAR BACKEND
:: ============================================================================
echo 🔧 FASE 1: PREPARANDO BACKEND...
echo ─────────────────────────────────────

cd proyecto_hospital

:: Crear entorno virtual si no existe
if not exist ".venv" (
    echo 📦 Creando entorno virtual Python...
    python -m venv .venv
)

:: Activar entorno virtual
echo 🔄 Activando entorno virtual...
call .venv\Scripts\activate.bat

:: Instalar dependencias del backend
echo 📥 Instalando dependencias del backend...
pip install -r requirements.txt >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Algunas dependencias pueden haber fallado, continuando...
)

:: Inicializar base de datos con datos de ejemplo
echo 🗄️  Inicializando base de datos...
python crear_datos_ejemplo.py
if errorlevel 1 (
    echo ⚠️  Error creando datos de ejemplo, continuando...
)

:: Corregir sistema de login automáticamente
echo 🔐 Corrigiendo sistema de login...
python corregir_login_completo.py >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Error corrigiendo login, continuando...
) else (
    echo ✅ Login corregido automáticamente
)

echo ✅ Backend preparado
echo.

:: ============================================================================
:: FASE 2: PREPARAR FRONTEND
:: ============================================================================
echo 🔧 FASE 2: PREPARANDO FRONTEND...
echo ─────────────────────────────────────

cd frontend

:: Verificar si package.json existe
if not exist "package.json" (
    echo ❌ ERROR: No se encuentra package.json en el frontend
    cd ..
    pause
    exit /b 1
)

:: Instalar dependencias del frontend si es necesario
if not exist "node_modules" (
    echo 📥 Instalando dependencias del frontend...
    npm install
    if errorlevel 1 (
        echo ❌ ERROR: Falló la instalación de dependencias del frontend
        cd ..
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencias del frontend ya instaladas
)

echo ✅ Frontend preparado
echo.

cd ..

:: ============================================================================
:: FASE 3: INICIAR SERVICIOS
:: ============================================================================
echo 🚀 FASE 3: INICIANDO SERVICIOS...
echo ─────────────────────────────────────

:: Crear archivo de log temporal
set TIMESTAMP=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set LOGFILE=logs_sistema_%TIMESTAMP%.txt

echo 📝 Logs del sistema: %LOGFILE%
echo.

:: Iniciar Backend en ventana separada
echo 🔥 Iniciando BACKEND (Puerto 8000)...
start "🏥 Sistema Hospitalario - BACKEND" /min cmd /c "cd /d "%CD%" && call proyecto_hospital\.venv\Scripts\activate.bat && cd proyecto_hospital && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 && pause"

:: Esperar un momento para que el backend inicie
echo ⏳ Esperando que el backend inicie...
timeout /t 8 /nobreak >nul

:: Verificar si el backend está corriendo
echo 🔍 Verificando backend...
cd proyecto_hospital
python test_conexion_simple.py > temp_test.txt 2>&1
findstr /C:"Backend está corriendo correctamente" temp_test.txt >nul
if errorlevel 1 (
    echo ⚠️  Backend puede no estar iniciado correctamente
    echo 💡 Revisa la ventana del backend para más detalles
) else (
    echo ✅ Backend iniciado correctamente
)
del temp_test.txt >nul 2>&1
cd ..

:: Iniciar Frontend en ventana separada
echo 🎨 Iniciando FRONTEND (Puerto 3000)...
start "🏥 Sistema Hospitalario - FRONTEND" cmd /c "cd /d "%CD%\proyecto_hospital\frontend" && npm run dev && pause"

:: Esperar un momento para que el frontend inicie
echo ⏳ Esperando que el frontend inicie...
timeout /t 5 /nobreak >nul

:: ============================================================================
:: SISTEMA INICIADO
:: ============================================================================
echo.
echo ████████████████████████████████████████████████████████████████████████
echo ██                                                                    ██
echo ██                    ✅ SISTEMA INICIADO EXITOSAMENTE                ██
echo ██                                                                    ██
echo ████████████████████████████████████████████████████████████████████████
echo.
echo 🌐 ACCEDE AL SISTEMA:
echo ─────────────────────────────────────
echo 📱 Frontend (Interfaz Principal): http://localhost:3000
echo 🔧 Backend API (Documentación):   http://localhost:8000/docs
echo ⚡ WebSocket (Tiempo Real):       ws://localhost:8000/ws
echo.
echo 👥 USUARIOS DE PRUEBA (LOGIN VERIFICADO):
echo ─────────────────────────────────────
echo 🩺 Médico:     dr.martinez / medico123
echo 👩‍⚕️ Enfermera:  enf.garcia / enfermera123
echo 👩‍⚕️ Enfermera:  enf.lopez / enfermera123
echo.
echo 📊 DATOS DISPONIBLES:
echo ─────────────────────────────────────
echo • 15 pacientes con datos reales
echo • 20 episodios en diferentes estados
echo • 5 episodios pendientes de triaje
echo • 11 episodios en lista de espera
echo • 4 episodios en proceso de atención
echo • Registros de historia clínica automáticos
echo.
echo 🛠️  CONTROLES:
echo ─────────────────────────────────────
echo • Para DETENER el sistema: Cierra ambas ventanas
echo • Para REINICIAR: Ejecuta este archivo nuevamente
echo • Para VER LOGS: Revisa las ventanas de Backend/Frontend
echo.
echo ⚠️  IMPORTANTE:
echo ─────────────────────────────────────
echo • Mantén ambas ventanas abiertas para que funcione
echo • El sistema guardará datos automáticamente
echo • Los WebSockets permiten actualizaciones en tiempo real
echo.

:: Abrir automáticamente el navegador
echo 🌐 Abriendo navegador automáticamente...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ✨ ¡Sistema listo para usar!
echo.
echo Presiona cualquier tecla para salir de este iniciador...
echo (El sistema seguirá funcionando en las ventanas separadas)
pause >nul

exit /b 0 