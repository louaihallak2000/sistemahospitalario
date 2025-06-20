@echo off
echo ===========================================
echo    SISTEMA HOSPITALARIO - INICIANDO
echo ===========================================
echo.

echo 1. Activando entorno virtual...
call "..\..\.venv\Scripts\activate.bat" 2>nul || (
    echo ⚠️  Entorno virtual no encontrado
    echo    Ejecutando sin entorno virtual...
)

echo.
echo 2. Iniciando Backend (Puerto 8000)...
start "Backend - FastAPI" cmd /k "uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo.
echo 3. Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo.
echo 4. Iniciando Frontend (Puerto 3000)...
cd frontend
start "Frontend - Next.js" cmd /k "npm run dev"

echo.
echo ===========================================
echo    SISTEMA INICIADO CORRECTAMENTE
echo ===========================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://127.0.0.1:8000
echo 📚 API Docs: http://127.0.0.1:8000/docs
echo.
echo 🔐 Credenciales de prueba:
echo    Usuario: admin
echo    Contraseña: admin123
echo    Hospital: HOSP001
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul 