# 🚨 Sistema de Shockroom - Documentación Completa

## 📋 Descripción General

El módulo de Shockroom es una funcionalidad avanzada del sistema hospitalario que permite gestionar camas críticas con monitoreo en tiempo real, asignación inteligente de pacientes y alertas automáticas.

## ✨ Funcionalidades Principales

### 🗺️ **Mapa de Camas Interactivo**
- Visualización en tiempo real del estado de todas las camas
- Layout físico configurable del shockroom
- Códigos de color para estados:
  - 🟢 **Disponible**: Cama lista para asignar
  - 🔴 **Ocupada**: Paciente en la cama
  - 🟡 **Limpieza**: Requiere limpieza
  - 🔵 **Mantenimiento**: En reparación
  - ⚫ **Fuera de Servicio**: No disponible

### 👥 **Gestión de Pacientes Críticos**
- **Candidatos Automáticos**: Pacientes con triaje ROJO/NARANJA
- **Asignación Rápida**: Un clic para asignar cama
- **Priorización Inteligente**: Por tiempo de espera y gravedad
- **Información Completa**: DNI, edad, motivo de consulta

### 📊 **Monitoreo Continuo**
- **Signos Vitales**: Registro periódico automatizado
- **Alertas Médicas**: Notificaciones por parámetros anormales
- **Historial Completo**: Seguimiento temporal de evolución
- **Indicadores Visuales**: Colores según estado del paciente

### 🚨 **Sistema de Alertas**
- **Alertas Médicas**: Cambios críticos en pacientes
- **Alertas Técnicas**: Problemas de equipamiento
- **Alertas Administrativas**: Gestión de recursos
- **Prioridades**: Crítica, Alta, Media, Baja

### 📈 **Estadísticas y Métricas**
- **Ocupación en Tiempo Real**: Porcentajes y gráficos
- **Rotación de Camas**: Eficiencia del servicio
- **Tiempo Promedio**: Estadía por paciente
- **Alertas Activas**: Monitoreo de situaciones críticas

## 🛠️ Instalación y Configuración

### 1. **Configuración del Backend**

Los modelos y APIs ya están integrados en el sistema principal. Solo ejecute:

```bash
# Inicializar las camas del shockroom
python init_shockroom.py
```

### 2. **Configuración del Frontend**

El módulo está completamente integrado. Acceda desde el Dashboard principal usando el botón **"Shockroom"**.

### 3. **Configuración de Camas**

Por defecto se crean 6 camas:
- **SR-01, SR-02, SR-03**: Camas críticas con equipamiento completo
- **SR-04, SR-05**: Camas de observación
- **SR-06**: Cama de aislamiento

## 🎯 Casos de Uso

### **Caso 1: Paciente Crítico Llega a Emergencias**
1. Paciente recibe triaje ROJO
2. Aparece automáticamente en "Candidatos para Shockroom"
3. Personal asigna cama disponible con un clic
4. Inicia monitoreo automático
5. Se registran signos vitales periódicamente

### **Caso 2: Monitoreo de Paciente Estable**
1. Paciente asignado con estado "estable"
2. Registro de signos vitales cada 2-4 horas
3. Alertas automáticas si parámetros cambian
4. Seguimiento visual en el mapa de camas

### **Caso 3: Alta del Shockroom**
1. Médico decide dar alta del shockroom
2. Un clic libera la cama
3. Cama pasa a estado "limpieza"
4. Paciente vuelve a lista de espera normal

## 📱 Interfaz de Usuario

### **Pestañas Principales**

#### 🗺️ **Mapa de Camas**
- Vista principal con layout del shockroom
- Clic en cama para ver detalles
- Clic en cama disponible abre modal de asignación
- Información en tiempo real de cada cama

#### 📊 **Monitoreo**
- Lista de pacientes en shockroom
- Últimos signos vitales
- Botones para registrar nuevos valores
- Historial de monitorización

#### 👥 **Candidatos**
- Lista de pacientes ROJO/NARANJA
- Información de tiempo de espera
- Panel de asignación rápida
- Filtros por prioridad

#### 🚨 **Alertas**
- Lista de alertas activas
- Filtros por tipo y prioridad
- Botones para atender alertas
- Creación de nuevas alertas

#### 📈 **Estadísticas**
- Métricas en tiempo real
- Gráficos de ocupación
- Tiempo promedio de estadía
- Estado detallado por cama

## 🔧 API Endpoints

### **Camas**
- `GET /api/v1/shockroom/camas` - Lista todas las camas
- `POST /api/v1/shockroom/camas` - Crear nueva cama
- `PUT /api/v1/shockroom/camas/{id}` - Actualizar cama

### **Asignaciones**
- `POST /api/v1/shockroom/asignaciones` - Asignar paciente
- `PUT /api/v1/shockroom/asignaciones/{id}/salida` - Dar alta
- `PUT /api/v1/shockroom/asignaciones/{id}/monitorizacion` - Actualizar signos vitales

### **Alertas**
- `GET /api/v1/shockroom/alertas` - Lista alertas
- `POST /api/v1/shockroom/alertas` - Crear alerta
- `PUT /api/v1/shockroom/alertas/{id}/atender` - Marcar como atendida

### **Estadísticas**
- `GET /api/v1/shockroom/estadisticas` - Métricas generales
- `GET /api/v1/shockroom/pacientes-candidatos` - Pacientes críticos

## 🔒 Seguridad y Permisos

- **Autenticación**: Token JWT requerido
- **Autorización**: Solo personal médico autorizado
- **Contexto Hospital**: Separación por hospital
- **Logs**: Todas las acciones se registran

## 📊 Base de Datos

### **Tablas Principales**
- `shockroom_camas`: Configuración de camas
- `shockroom_asignaciones`: Pacientes asignados
- `shockroom_alertas`: Sistema de alertas

### **Relaciones**
- Camas → Hospital (1:N)
- Asignaciones → Cama, Episodio, Paciente (N:1)
- Alertas → Asignación (N:1)

## 🚀 Funcionalidades Avanzadas

### **Actualización Automática**
- Refresh cada 30 segundos
- WebSocket para notificaciones en tiempo real
- Sincronización entre múltiples usuarios

### **Responsive Design**
- Optimizado para tablets y escritorio
- Layout adaptable según tamaño de pantalla
- Touch-friendly para dispositivos móviles

### **Integración Completa**
- Sincronizado con sistema de triaje
- Integrado con historia clínica
- Compatible con módulo de enfermería

## 🆘 Resolución de Problemas

### **Problema: No aparecen candidatos**
- Verificar que hay pacientes con triaje ROJO/NARANJA
- Confirmar que no están ya asignados a shockroom
- Revisar filtros en la API

### **Problema: Camas no se actualizan**
- Verificar conexión a internet
- Confirmar autenticación válida
- Revisar logs del backend

### **Problema: Alertas no funcionan**
- Verificar permisos de usuario
- Confirmar configuración de notificaciones
- Revisar estado de asignaciones

## 📞 Soporte

Para soporte técnico o preguntas sobre el sistema de Shockroom:

1. Revisar esta documentación
2. Verificar logs del sistema
3. Contactar al administrador del sistema
4. Reportar bugs a través del sistema de tickets

---

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2024  
**Autor**: Sistema Hospitalario Multi-Tenant 