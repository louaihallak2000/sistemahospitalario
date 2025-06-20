@echo off
echo ========================================
echo    INICIANDO SISTEMA HOSPITALARIO
echo ========================================
echo.

REM Detener procesos existentes
echo [1/4] Deteniendo procesos existentes...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

REM Iniciar Backend
echo.
echo [2/4] Iniciando Backend (Puerto 8000)...
cd proyecto_hospital
start "Backend - FastAPI" cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
cd ..

REM Esperar que el backend inicie
timeout /t 5 >nul

REM Iniciar Frontend
echo.
echo [3/4] Iniciando Frontend (Puerto 3000)...
cd proyecto_hospital\frontend
start "Frontend - Next.js" cmd /k "npm run dev"
cd ..\..

REM Esperar que el frontend inicie
timeout /t 5 >nul

REM Abrir navegador
echo.
echo [4/4] Abriendo navegador...
start chrome.exe --disable-web-security --user-data-dir="C:\temp\chrome_dev" http://localhost:3000

echo.
echo ========================================
echo    SISTEMA INICIADO CORRECTAMENTE
echo ========================================
echo.
echo URLs:
echo - Frontend: http://localhost:3000
echo - Backend:  http://127.0.0.1:8000
echo - API Docs: http://127.0.0.1:8000/docs
echo.
echo Credenciales:
echo - Usuario: admin
echo - Password: admin123
echo - Hospital: HOSP001
echo.
pause 