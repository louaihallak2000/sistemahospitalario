# 🚨 VERIFICACIÓN SHOCKROOM - SISTEMA HOSPITALARIO

## 🔧 PASOS PARA PROBAR EL SHOCKROOM

### 1. Reiniciar Sistema (IMPORTANTE)
```powershell
# Detener servicios actuales
.\DETENER_SISTEMA.ps1

# Iniciar sistema completo
.\INICIAR_SISTEMA_COMPLETO.ps1
```

### 2. Acceder al Sistema
- **URL**: http://localhost:3000
- **Usuario**: admin
- **Contraseña**: admin123
- **Hospital**: Hospital Central San Juan

### 3. Navegar al Shockroom
1. Después del login, ir al **Dashboard**
2. Buscar el botón **"Shockroom"** 
3. Hacer clic en **"Shockroom"**
4. Debería cargar sin errores

### 4. Verificar Funcionalidades

#### 🗺️ **Pestaña "Mapa de Camas"**
- Debería mostrar 6 camas: SR-01 a SR-06
- Camas disponibles en **verde**
- Layout visual con posiciones

#### 📊 **Pestaña "Monitoreo"**
- Lista de pacientes en camas ocupadas
- Signos vitales si están disponibles
- Botones para registrar datos

#### 👥 **Pestaña "Candidatos"**
- Lista de pacientes con triaje ROJO/NARANJA
- Botón "Asignar a Cama" para cada paciente
- Filtro automático por prioridad

#### 🚨 **Pestaña "Alertas"**
- Sistema de alertas del shockroom
- Estados: activa, atendida, resuelta
- Prioridades: crítica, alta, media, baja

#### 📈 **Pestaña "Estadísticas"**
- Métricas de ocupación en tiempo real
- Tasa de ocupación
- Tiempo promedio de estancia
- Alertas activas

### 5. Probar Asignación de Paciente

1. Ir a **"Candidatos"**
2. Si hay pacientes listados, usar **"Asignar a Cama"**
3. Seleccionar cama disponible
4. Confirmar asignación
5. Verificar que aparezca en **"Monitoreo"**

### 6. Verificar Actualización Automática
- Los datos se actualizan cada **30 segundos**
- Usar botón **"Actualizar"** para refresh manual
- Verificar indicadores en header (Disponibles/Ocupadas/Alertas)

## ❌ PROBLEMAS COMUNES

### Error: "Screen no reconocida: shockroom"
**Solución**: Reiniciar frontend completamente
```powershell
.\DETENER_SISTEMA.ps1
.\INICIAR_SISTEMA_COMPLETO.ps1
```

### Error: API no responde
**Solución**: Verificar backend
```powershell
# Verificar puerto 8000
netstat -ano | findstr ":8000.*LISTENING"

# Si no responde, reiniciar sistema
.\DETENER_SISTEMA.ps1
.\INICIAR_SISTEMA_COMPLETO.ps1
```

### Error: No aparecen camas
**Solución**: Inicializar base de datos
```powershell
cd proyecto_hospital
python init_shockroom.py
```

### Botón Shockroom no aparece en Dashboard
**Solución**: Verificar que el usuario tenga permisos
- Usar usuario "admin" con contraseña "admin123"
- Verificar que esté en hospital "HOSP001"

## ✅ CARACTERÍSTICAS CONFIRMADAS

- ✅ 6 camas configuradas (SR-01 a SR-06)
- ✅ 3 tipos de cama: crítica, observación, aislamiento
- ✅ Estados: disponible, ocupada, limpieza, mantenimiento
- ✅ Asignación automática para triaje ROJO/NARANJA
- ✅ Monitoreo de signos vitales en tiempo real
- ✅ Sistema de alertas con 4 prioridades
- ✅ Estadísticas y métricas en tiempo real
- ✅ Interfaz responsive para tablet/móvil
- ✅ Actualización automática cada 30 segundos

## 🆘 SI PERSISTEN PROBLEMAS

1. **Abrir DevTools** (F12) en el navegador
2. **Ir a Console** para ver errores JavaScript
3. **Ir a Network** para ver requests fallidas
4. **Verificar logs** del backend en la terminal
5. **Reiniciar sistema completo** si es necesario

---

**🏥 Sistema Hospitalario - Módulo Shockroom v1.0** 