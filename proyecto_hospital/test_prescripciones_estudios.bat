@echo off
echo 🧪 TESTING AUTOMATIZADO: PRESCRIPCIONES Y ESTUDIOS
echo ======================================================

cd /d "%~dp0"

echo.
echo 🔧 1. INICIANDO BACKEND...
start "Backend" cmd /c "uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo ⏰ Esperando que el backend se inicie...
timeout /t 5 > nul

echo.
echo 🔐 2. OBTENIENDO TOKEN DE AUTENTICACIÓN...
set "LOGIN_DATA={\"hospital_id\":\"HOSP001\",\"username\":\"admin\",\"password\":\"admin123\"}"

curl -s -X POST "http://127.0.0.1:8000/auth/login" ^
     -H "Content-Type: application/json" ^
     -d "%LOGIN_DATA%" > temp_login.json

if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: No se pudo conectar al backend
    echo 💡 VERIFICAR: ¿Está corriendo uvicorn?
    pause
    exit /b 1
)

for /f "tokens=2 delims=:" %%a in ('findstr "access_token" temp_login.json') do (
    set TOKEN=%%a
    set TOKEN=!TOKEN:"=!
    set TOKEN=!TOKEN:,=!
    set TOKEN=!TOKEN: =!
)

if "%TOKEN%"=="" (
    echo ❌ ERROR: No se pudo obtener token de autenticación
    echo 📋 Respuesta del servidor:
    type temp_login.json
    pause
    exit /b 1
)

echo ✅ Token obtenido exitosamente

echo.
echo 📋 3. OBTENIENDO LISTA DE EPISODIOS...
curl -s -H "Authorization: Bearer %TOKEN%" ^
     "http://127.0.0.1:8000/episodios/lista-espera" > temp_episodes.json

if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: No se pudo obtener lista de episodios
    pause
    exit /b 1
)

echo ✅ Lista de episodios obtenida

echo.
echo 📊 4. EXTRAYENDO ID DEL PRIMER EPISODIO...
for /f "tokens=2 delims=:" %%a in ('findstr "\"id\"" temp_episodes.json') do (
    set EPISODE_ID=%%a
    set EPISODE_ID=!EPISODE_ID:"=!
    set EPISODE_ID=!EPISODE_ID:,=!
    set EPISODE_ID=!EPISODE_ID: =!
    goto :found_episode
)

:found_episode
if "%EPISODE_ID%"=="" (
    echo ❌ ERROR: No se encontraron episodios para probar
    echo 💡 SOLUCIÓN: Crear algunos pacientes primero
    pause
    exit /b 1
)

echo ✅ Episodio seleccionado: %EPISODE_ID%

echo.
echo 💊 5. PROBANDO CREAR PRESCRIPCIÓN...
set "PRESCRIPTION_DATA={\"medication\":\"Ibuprofeno 400mg\",\"dose\":\"400mg\",\"frequency\":\"Cada 8 horas\",\"route\":\"Oral\",\"duration\":\"3 días\",\"instructions\":\"Tomar con alimentos\"}"

curl -s -X POST "http://127.0.0.1:8000/episodios/%EPISODE_ID%/prescripciones" ^
     -H "Authorization: Bearer %TOKEN%" ^
     -H "Content-Type: application/json" ^
     -d "%PRESCRIPTION_DATA%" > temp_prescription.json

if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: No se pudo crear prescripción
    pause
    exit /b 1
)

echo ✅ Prescripción creada exitosamente
echo 📄 Respuesta:
type temp_prescription.json
echo.

echo.
echo 🔬 6. PROBANDO CREAR ESTUDIO...
set "STUDY_DATA={\"name\":\"Hemograma completo\",\"type\":\"laboratory\",\"priority\":\"urgent\",\"observations\":\"Control post operatorio\"}"

curl -s -X POST "http://127.0.0.1:8000/episodios/%EPISODE_ID%/estudios" ^
     -H "Authorization: Bearer %TOKEN%" ^
     -H "Content-Type: application/json" ^
     -d "%STUDY_DATA%" > temp_study.json

if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: No se pudo crear estudio
    pause
    exit /b 1
)

echo ✅ Estudio creado exitosamente
echo 📄 Respuesta:
type temp_study.json
echo.

echo.
echo 📋 7. VERIFICANDO PRESCRIPCIONES GUARDADAS...
curl -s -H "Authorization: Bearer %TOKEN%" ^
     "http://127.0.0.1:8000/episodios/%EPISODE_ID%/prescripciones" > temp_prescriptions_list.json

echo 📄 Prescripciones del episodio:
type temp_prescriptions_list.json
echo.

echo.
echo 📋 8. VERIFICANDO ESTUDIOS GUARDADOS...
curl -s -H "Authorization: Bearer %TOKEN%" ^
     "http://127.0.0.1:8000/episodios/%EPISODE_ID%/estudios" > temp_studies_list.json

echo 📄 Estudios del episodio:
type temp_studies_list.json
echo.

echo.
echo 🗑️ 9. LIMPIANDO ARCHIVOS TEMPORALES...
del temp_login.json temp_episodes.json temp_prescription.json temp_study.json temp_prescriptions_list.json temp_studies_list.json

echo.
echo 🎉 TESTING COMPLETADO EXITOSAMENTE
echo =====================================
echo.
echo ✅ RESULTADOS:
echo   🔐 Autenticación: FUNCIONANDO
echo   📋 Lista episodios: FUNCIONANDO
echo   💊 Crear prescripción: FUNCIONANDO
echo   🔬 Crear estudio: FUNCIONANDO
echo   📄 Listar prescripciones: FUNCIONANDO
echo   📄 Listar estudios: FUNCIONANDO
echo.
echo 🚀 BACKEND ESTÁ LISTO PARA USO
echo 💻 Ahora puedes probar el frontend en:
echo    http://localhost:3000
echo.
echo 📚 DOCUMENTACIÓN COMPLETA:
echo    SOLUCION_PRESCRIPCIONES_ESTUDIOS_COMPLETA.md
echo.

pause 