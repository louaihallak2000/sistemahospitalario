@echo off
echo ============================================
echo    SISTEMA HOSPITALARIO - INICIADOR
echo ============================================
echo.

echo [1/3] Iniciando Backend FastAPI...
start cmd /k "cd proyecto_hospital && python -m uvicorn app.main:app --reload --port 8000"

echo.
echo [2/3] Esperando que el backend inicie...
timeout /t 5 /nobreak > nul

echo.
echo [3/3] Iniciando Frontend Next.js...
start cmd /k "cd proyecto_hospital\frontend && npm run dev"

echo.
echo ============================================
echo    SISTEMA INICIADO CORRECTAMENTE!
echo ============================================
echo.
echo Backend API:  http://localhost:8000
echo Frontend:     http://localhost:3000
echo API Docs:     http://localhost:8000/docs
echo.
echo Credenciales de acceso:
echo   Hospital: HOSP001
echo   Usuario:  admin
echo   Password: admin123
echo.
echo ============================================
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul 