# 🚨 WORKFLOW DEL SHOCKROOM
## Sistema Hospitalario de Emergencias

---

### **DOCUMENTO TÉCNICO - VERSIÓN 1.0**
**Fecha:** Enero 2024  
**Sistema:** Hospital Multi-Tenant  
**Módulo:** Shockroom - Cuidados Críticos  

---

## 📋 **TABLA DE CONTENIDOS**

1. [Vías de Admisión al Shockroom](#vías-de-admisión-al-shockroom)
2. [Paneles del Shockroom](#paneles-del-shockroom)
3. [Sistema de Monitoreo](#sistema-de-monitoreo)
4. [Opciones de Salida](#opciones-de-salida-del-shockroom)
5. [Accesos por Rol](#accesos-por-rol)

---

## 🚑 **VÍAS DE ADMISIÓN AL SHOCKROOM**

### **VÍA 1: DESDE ENFERMERÍA**
```
Enfermería asigna triaje → Decide enviar a Shockroom → 
Enfermera asigna cama → Notificación inmediata al médico
```

### **VÍA 2: DESDE ATENCIÓN MÉDICA**
```
Médico en consulta → Decide enviar a Shockroom → Médico asigna cama
```

### **VÍA 3: TRASLADOS EXTERNOS**

#### **🚑 Llegada de traslado:**
- 👩‍⚕️ **Enfermería de guardia** recibe
- 📋 **Personal de admisión** registra
- 👨‍⚕️ **Médico** evalúa según complejidad

#### **📄 Información que viene:**
- 🏥 Datos del hospital origen
- 📋 Motivo del traslado
- 📋 Historia clínica previa

#### **🔄 Traspaso automático** (si hospital origen usa mismo sistema):
- 👤 Paciente completo
- 📋 Historia clínica completa
- 💊 Medicación activa
- 🔬 Estudios pendientes

#### **📋 Proceso:**
1. Admisión rápida
2. 👨‍⚕️ Evaluación rápida
3. 🚨 **Decisión:** Shockroom, lista médica, o código

---

## 🖥️ **PANELES DEL SHOCKROOM**

### **👨‍⚕️ PANEL MÉDICO**

#### **🗺️ Vista Principal:**
- **Mapeo del Shockroom** - Vista de 6 camas (SR-01 a SR-06)
- 🖱️ **Click en cama ocupada** → Abre ficha del paciente

#### **⚡ Funciones disponibles:**
- 📝 **Escribir evolución médica**
- 🔬 **Pedir estudios/laboratorio**
- 🔧 **Indicar procedimientos**
- 💊 **Prescripciones**
- 📊 **Indicaciones de monitoreo** (frecuencia de signos vitales)
- 📤 **Dar de alta**
- 🏥 **Pasar a internación**
- 📞 **Derivar a otro hospital**

### **👩‍⚕️ PANEL ENFERMERÍA**

#### **⚡ Funciones disponibles:**
- 📝 **Evoluciones de enfermería** del paciente
- 💊 **Ver prescripciones pendientes**
- 🔧 **Ver procedimientos pendientes**
- 📊 **Registro manual de signos vitales** según indicación médica
- 📤 **Dar de alta** al paciente

### **🛏️ INFORMACIÓN VISIBLE EN CADA CAMA**

| Campo | Descripción |
|-------|-------------|
| 🛏️ **Estado** | Ocupada, disponible, limpieza |
| 👤 **Paciente** | Nombre del paciente (si está ocupada) |
| 🎨 **Triaje** | Color de triaje |
| ⏰ **Tiempo** | Tiempo en Shockroom |
| 🚨 **Alertas** | Alertas activas (si las hay) |

---

## 📊 **SISTEMA DE MONITOREO**

### **👨‍⚕️ INDICACIONES MÉDICAS**
El médico define la frecuencia de control:
- *"Signos vitales cada 15 minutos"*
- *"Control de presión cada 30 minutos"*
- *"Temperatura cada 2 horas"*

### **👩‍⚕️ EJECUCIÓN POR ENFERMERÍA**
1. **Ve indicaciones** en su panel
2. **Registra manualmente** según frecuencia
3. **Aparece en** "Procedimientos pendientes"

---

## 📤 **OPCIONES DE SALIDA DEL SHOCKROOM**

| Opción | Descripción | Destino |
|--------|-------------|---------|
| 🏠 **Alta médica** | Paciente se va a casa | Domicilio |
| 📞 **Derivar** | A otro hospital | Hospital externo |
| 🏥 **Internación** | Pasar a internación | Sala de internación |

*Nota: La internación se define en módulo específico*

---

## 👥 **ACCESOS POR ROL**

### **👨‍💼 PERSONAL DE ADMISIÓN**
- **Función:** Una vez admite al paciente → **Nada más**
- **Flujo:** Pasa automáticamente a lista triaje

### **👩‍⚕️ ENFERMERÍA**
- **Vista principal:** Lista de espera de triaje
- **Funciones:** 
  - Triaje
  - Decisión post-triaje
  - Panel Shockroom
- **Panel específico:** Procedimientos y prescripciones pendientes

### **👨‍⚕️ MÉDICO**
- **Vista principal:** Pacientes ya triados (lista de atención médica)
- **Vista secundaria:** Acceso a pacientes en espera de triaje
- **Funciones:** 
  - Atención completa
  - Panel Shockroom médico

---

## 📋 **CONFIGURACIÓN DE CAMAS**

### **🛏️ LAYOUT DEL SHOCKROOM**

```
┌─────────────────────────────────────┐
│ SR-01     SR-02     SR-03           │  ← Fila 1: Camas CRÍTICAS
│ (1,1)     (3,1)     (5,1)           │
│ CRÍTICA   CRÍTICA   CRÍTICA         │
│                                     │
│                                     │
│ SR-04     SR-05     SR-06           │  ← Fila 3: Camas OBSERVACIÓN/AISLAMIENTO  
│ (1,3)     (3,3)     (5,3)           │
│ OBSERV.   OBSERV.   AISLAMIENTO     │
└─────────────────────────────────────┘
```

### **🔧 EQUIPAMIENTO POR TIPO**

| Cama | Tipo | Equipamiento |
|------|------|--------------|
| SR-01, SR-02, SR-03 | **Crítica** | Monitor multiparamétrico, Ventilador mecánico, Desfibrilador, Bomba de infusión |
| SR-04, SR-05 | **Observación** | Monitor básico, Oxígeno, Bomba de infusión |
| SR-06 | **Aislamiento** | Monitor básico, Ventilación independiente, Bomba de infusión |

---

## ⚡ **CARACTERÍSTICAS TÉCNICAS**

### **🔄 TIEMPO REAL**
- Actualización automática cada 30 segundos
- Notificaciones instantáneas
- Estado de camas en tiempo real

### **🏥 MULTI-TENANT**
- Separación completa por hospital
- Usuarios específicos por institución
- Datos completamente aislados

### **📱 INTEROPERABILIDAD**
- Traspaso automático entre hospitales con mismo sistema
- Transferencia completa de historias clínicas

---

## 📞 **SOPORTE TÉCNICO**

**Sistema Hospitalario Multi-Tenant**  
**Módulo Shockroom v1.0.0**  
**Documentación Técnica**

---

*Documento generado automáticamente - Enero 2024* 