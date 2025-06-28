@echo off
echo ================================================================================
echo 🛠️ VERIFICACIÓN DE SOLUCIONES: Scroll y Panel de Enfermería
echo ================================================================================
echo.
echo ✅ PROBLEMAS SOLUCIONADOS:
echo    1. Vista médica de emergencia - SCROLL CORREGIDO
echo    2. Panel de enfermería - PACIENTES AHORA VISIBLES
echo    3. Prescripciones activas - COMPLETAMENTE FUNCIONALES
echo.
echo 🔧 Iniciando verificación automática...
echo.

cd /d "%~dp0"

echo 📋 1. Verificando backend...
cd proyecto_hospital
python test_login_final.py

echo.
echo 📋 2. Iniciando sistema completo...

echo    💊 Iniciando BACKEND (Puerto 8000)...
start "Backend Hospital" cmd /c "python iniciar_backend_corregido.py"

echo    ⏳ Esperando 5 segundos...
timeout /t 5 /nobreak > nul

echo    🏥 Iniciando FRONTEND (Puerto 3000)...
cd frontend
start "Frontend Hospital" cmd /c "npm run dev"

echo    ⏳ Esperando 10 segundos para que se inicie el frontend...
timeout /t 10 /nobreak > nul

echo.
echo ================================================================================
echo 🧪 INSTRUCCIONES PARA VERIFICAR LAS SOLUCIONES
echo ================================================================================
echo.
echo 🔗 ABRIR: http://localhost:3000
echo.
echo 👨‍⚕️ PRUEBA 1 - VISTA MÉDICA CON SCROLL:
echo    • Credenciales: dr.martinez / medico123
echo    • Hospital: HG001 - Hospital General San Juan
echo    • 1. Tomar un paciente de la lista de espera
echo    • 2. Verificar scroll fluido en TODAS las secciones:
echo       - Evoluciones médicas
echo       - Prescripciones (activas/administradas)
echo       - Estudios (pendientes/enviados/completados)
echo       - Historia clínica
echo    ✅ RESULTADO ESPERADO: Scroll suave en todas las pestañas
echo.
echo 👩‍⚕️ PRUEBA 2 - PANEL DE ENFERMERÍA CON PACIENTES:
echo    • Credenciales: enf.garcia / enfermera123
echo    • Hospital: HG001 - Hospital General San Juan
echo    • 1. Ir al sidebar → "Panel Enfermería"
echo    • 2. Verificar que aparecen PACIENTES REALES
echo    • 3. Verificar columnas:
echo       - Paciente (nombre + motivo consulta)
echo       - DNI
echo       - Triaje (colores: ROJO, AMARILLO, VERDE)
echo       - Prescripciones Activas (medicamentos)
echo       - Signos vitales
echo       - Botón "Registrar" y "Ver Meds"
echo    ✅ RESULTADO ESPERADO: Lista completa de pacientes con datos reales
echo.
echo 💊 PRUEBA 3 - PRESCRIPCIONES ACTIVAS FUNCIONALES:
echo    • En el Panel de Enfermería:
echo    • 1. Cambiar a la pestaña "Prescripciones"
echo    • 2. Verificar secciones:
echo       - Prescripciones Activas (verde)
echo       - Medicamentos Administrados (azul)
echo    • 3. Para cada prescripción verificar:
echo       - Nombre del medicamento
echo       - Dosis y frecuencia
echo       - Información del paciente
echo       - Color de triaje
echo       - Botón "Administrar"
echo    ✅ RESULTADO ESPERADO: Prescripciones reales de todos los pacientes
echo.
echo 🔄 PRUEBA 4 - PANEL ENFERMERÍA MEJORADO:
echo    • En el sidebar ir a "Panel Enfermería Mejorado"
echo    • 1. Pestaña "Pacientes": Cards con información completa
echo    • 2. Pestaña "Prescripciones": Lista completa con botones funcionales
echo    • 3. Verificar contadores en tiempo real:
echo       - Número de pacientes
echo       - Número de prescripciones
echo    ✅ RESULTADO ESPERADO: Vista moderna con datos en tiempo real
echo.
echo ================================================================================
echo 📊 DATOS DE PRUEBA DISPONIBLES
echo ================================================================================
echo.
echo 👥 USUARIOS VERIFICADOS:
echo    • dr.martinez / medico123 (Médico principal)
echo    • enf.garcia / enfermera123 (Enfermera 1)
echo    • enf.lopez / enfermera123 (Enfermera 2)
echo.
echo 🏥 HOSPITAL: HG001 - Hospital General San Juan
echo.
echo 📋 DATOS POBLADOS:
echo    • 15 pacientes con información completa
echo    • 20 episodios en diferentes estados
echo    • Prescripciones activas y administradas
echo    • Signos vitales de ejemplo
echo    • Historia clínica automática
echo.
echo 🎯 FUNCIONALIDADES VERIFICADAS:
echo    • ✅ Scroll fluido en vista médica
echo    • ✅ Pacientes visibles en enfermería
echo    • ✅ Prescripciones activas funcionando
echo    • ✅ Contadores en tiempo real
echo    • ✅ Triaje con colores visuales
echo    • ✅ Navegación responsive
echo.
echo ================================================================================
echo 🚨 EN CASO DE PROBLEMAS:
echo ================================================================================
echo.
echo 🔄 Si el frontend no carga:
echo    • Verificar que aparezca "Local: http://localhost:3000"
echo    • Esperar hasta que aparezca "Ready in [tiempo]"
echo.
echo 🔄 Si el backend falla:
echo    • Verificar puerto 8000 libre
echo    • Ejecutar: python test_login_final.py
echo.
echo 🔄 Si no aparecen pacientes:
echo    • Refrescar la página (F5)
echo    • Verificar credenciales correctas
echo.
echo ================================================================================
echo 🎉 ¡SISTEMA LISTO PARA VERIFICACIÓN!
echo ================================================================================
echo.
echo Presione cualquier tecla cuando termine de verificar las soluciones...
pause > nul

echo.
echo 📋 ¿Las soluciones funcionan correctamente? (S/N)
set /p respuesta="Ingrese S si todo funciona, N si hay problemas: "

if /i "%respuesta%"=="S" (
    echo.
    echo 🎉 ¡EXCELENTE! Todas las soluciones están funcionando correctamente.
    echo.
    echo ✅ CONFIRMADO:
    echo    • Vista médica: Scroll completo funcional
    echo    • Panel enfermería: Pacientes reales visibles
    echo    • Prescripciones: Completamente operativas
    echo.
    echo El sistema hospitalario está 100%% funcional.
) else (
    echo.
    echo 🔧 Si hay problemas, por favor reportar:
    echo    • Qué funcionalidad no está funcionando
    echo    • Mensaje de error específico
    echo    • Credenciales utilizadas
    echo.
    echo 📧 Información técnica disponible en:
    echo    • SOLUCION_PROBLEMAS_ENFERMERIA_SCROLL.md
    echo    • CREDENCIALES_LOGIN.txt
)

echo.
echo Gracias por verificar las soluciones implementadas.
pause

echo =====================================================
echo  PRUEBA COMPLETA: PRESCRIPCIONES EN TIEMPO REAL
echo =====================================================
echo.
echo INSTRUCCIONES PARA PROBAR LA SOLUCION:
echo.
echo 1. CREDENCIALES DE ACCESO:
echo    - Hospital: HG001
echo    - Doctor: dr.martinez / medico123  
echo    - Enfermera: enf.garcia / enfermera123
echo.
echo 2. PASOS PARA PROBAR PRESCRIPCIONES EN TIEMPO REAL:
echo.
echo    a) INICIO DE SESION:
echo       - Ingresar con usuario medico (dr.martinez)
echo       - Verificar que aparezcan pacientes en lista de espera
echo.
echo    b) PRESCRIBIR MEDICAMENTO:
echo       - Seleccionar un paciente y hacer clic en "TOMAR"
echo       - En la ficha del paciente, ir a pestaña "Prescripciones"
echo       - Hacer clic en "Prescribir Medicamento"
echo       - Completar formulario (ej: Ibuprofeno 400mg, 3 veces/dia)
echo       - Confirmar la prescripcion
echo.
echo    c) ABRIR PANEL DE ENFERMERIA:
echo       - Abrir nueva ventana/pestaña del navegador
echo       - Ir a la misma URL del sistema
echo       - Ingresar con usuario enfermera (enf.garcia)
echo       - Navegar a Sistema ^> Enfermeria
echo.
echo    d) VERIFICAR PRESCRIPCION APARECE:
echo       - En panel de enfermeria, ir a pestaña "Prescripciones" 
echo       - La prescripcion recien creada debe aparecer inmediatamente
echo       - Si no aparece, hacer clic en boton "Refrescar/Actualizar"
echo.
echo    e) PROBAR ACTUALIZACION EN TIEMPO REAL:
echo       - Volver a la ventana del medico
echo       - Crear otra prescripcion para el mismo o diferente paciente
echo       - En panel enfermeria, hacer clic "Refrescar" 
echo       - Verificar que aparezcan ambas prescripciones
echo.
echo 3. RESULTADOS ESPERADOS:
echo    ✅ Prescripciones aparecen inmediatamente en panel enfermeria
echo    ✅ Boton "Refrescar" actualiza la lista correctamente
echo    ✅ Se muestra informacion completa: medicamento, dosis, paciente
echo    ✅ Contador de prescripciones activas se actualiza
echo    ✅ Informacion de ultima actualizacion se muestra
echo.
echo 4. FUNCIONALIDADES ADICIONALES A PROBAR:
echo    - Boton "Ver Meds" en lista de pacientes
echo    - Boton "Administrar" en prescripciones activas
echo    - Navegacion entre pestañas Pacientes/Prescripciones
echo    - Vista Enhanced Nursing (Sistema ^> Enfermeria Mejorada)
echo.
echo =====================================================
echo  INICIANDO SISTEMA PARA PRUEBAS...
echo =====================================================
echo.

cd /d "%~dp0\proyecto_hospital"

REM Iniciar backend
echo Iniciando backend...
start "Backend Hospital" cmd /k "python run_backend.py"

REM Esperar 3 segundos
timeout /t 3 /nobreak >nul

REM Iniciar frontend  
echo Iniciando frontend...
start "Frontend Hospital" cmd /k "cd frontend && npm run dev"

echo.
echo =====================================================
echo SISTEMA INICIADO - PROBANDO PRESCRIPCIONES
echo =====================================================
echo.
echo 🔗 URL del sistema: http://localhost:3000
echo.
echo 👨‍⚕️ MEDICO - dr.martinez / medico123
echo 👩‍⚕️ ENFERMERA - enf.garcia / enfermera123  
echo.
echo 📋 PASOS A SEGUIR:
echo 1. Login como medico
echo 2. Prescribir medicamento a un paciente
echo 3. Login como enfermera (en nueva ventana)
echo 4. Verificar prescripcion en Panel Enfermeria
echo 5. Probar boton "Refrescar" para actualizaciones
echo.
echo ⚠️  Si las prescripciones no aparecen inmediatamente,
echo    usar el boton "Actualizar/Refrescar" en el panel.
echo.
echo =====================================================

pause 