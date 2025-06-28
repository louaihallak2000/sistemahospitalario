@echo off
echo =====================================================
echo  PRUEBA: LISTA DE ESPERA DE TRIAJE
echo =====================================================
echo.
echo PROBLEMA REPORTADO:
echo "no puedo ver bien la lista de espera de triaje"
echo.
echo =====================================================
echo  SOLUCION IMPLEMENTADA
echo =====================================================
echo.
echo 1. ALTURA AUMENTADA: 400px → 500px para mejor visualizacion
echo 2. FILTRADO MEJORADO: Detecta mejor pacientes sin triaje
echo 3. UI MEJORADA: Iconos, badges y mejor organizacion
echo 4. LOGGING AGREGADO: Para debugging en consola
echo 5. ESTADO VACIO: Mensaje informativo cuando no hay pacientes
echo.
echo =====================================================
echo  INSTRUCCIONES DE PRUEBA
echo =====================================================
echo.
echo PASO 1 - CREAR PACIENTES SIN TRIAJE:
echo   a) Login como dr.martinez / medico123
echo   b) Hacer clic "Nuevo Paciente"
echo   c) Llenar formulario PERO NO ASIGNAR COLOR DE TRIAJE
echo   d) Registrar paciente
echo   e) Repetir 2-3 veces
echo.
echo PASO 2 - VERIFICAR LISTA DE ESPERA DE TRIAJE:
echo   a) En el dashboard, buscar seccion "En Espera de Triaje"
echo   b) Debe aparecer con:
echo      - Icono de alerta naranja
echo      - Contador de pacientes
echo      - Lista de pacientes sin triaje
echo      - Badge "Sin Triaje" para cada paciente
echo.
echo PASO 3 - PROBAR SCROLL Y VISUALIZACION:
echo   a) Si hay muchos pacientes, probar scroll vertical
echo   b) Verificar que se ve toda la informacion
echo   c) Probar botones "Evaluar" y "Ver Ficha"
echo.
echo PASO 4 - ASIGNAR TRIAJE:
echo   a) Hacer clic "Evaluar" en un paciente
echo   b) Seleccionar color de triaje (ROJO, AMARILLO, etc.)
echo   c) Confirmar asignacion
echo   d) Verificar que el paciente se mueve a "Lista de Espera" principal
echo.
echo =====================================================
echo  MEJORAS IMPLEMENTADAS
echo =====================================================
echo.
echo ✅ ALTURA SCROLL: 500px (antes 400px)
echo ✅ FILTRADO INTELIGENTE: Detecta todos los casos sin triaje
echo ✅ UI VISUAL: 
echo    - Borde naranja en tarjetas de pacientes
echo    - Icono de alerta en titulo
echo    - Badge "Sin Triaje" claramente visible
echo    - Contador en tiempo real
echo.
echo ✅ INFORMACION COMPLETA:
echo    - Nombre y apellido del paciente
echo    - DNI del paciente
echo    - Motivo de consulta
echo    - Tiempo de espera
echo    - Botones de accion (Evaluar, Ver Ficha)
echo.
echo ✅ ESTADO VACIO INFORMATIVO:
echo    - Mensaje cuando no hay pacientes esperando triaje
echo    - Informacion de debugging (total recibidos vs filtrados)
echo.
echo ✅ LOGGING EN CONSOLA:
echo    - Abrir DevTools (F12) para ver logs detallados
echo    - Buscar logs con emojis: 🎨, 📋, 🔍, 📊
echo.
echo =====================================================
echo  INICIANDO SISTEMA...
echo =====================================================

cd /d "%~dp0\proyecto_hospital"

echo Iniciando backend...
start "Backend Triaje" cmd /k "python run_backend.py"

timeout /t 3 /nobreak >nul

echo Iniciando frontend...
start "Frontend Triaje" cmd /k "cd frontend && npm run dev"

echo.
echo =====================================================
echo SISTEMA LISTO - PROBANDO LISTA ESPERA TRIAJE
echo =====================================================
echo.
echo 🔗 URL: http://localhost:3000
echo.
echo 👨‍⚕️ LOGIN: dr.martinez / medico123
echo.
echo 📋 PASOS RAPIDOS:
echo 1. Crear pacientes sin triaje
echo 2. Verificar "En Espera de Triaje"
echo 3. Probar scroll y visualizacion
echo 4. Asignar triaje a algunos pacientes
echo 5. Verificar que se mueven a lista principal
echo.
echo ⚠️  NOTA:
echo Si no ves pacientes en "En Espera de Triaje":
echo - Crear pacientes SIN asignar color de triaje
echo - Abrir DevTools (F12) para ver logs
echo - Verificar filtrado en consola
echo.
echo =====================================================

pause 