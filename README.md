# 🏥 Sistema Hospitalario Completo - Nuevo Workflow

## ✅ **SISTEMA 100% FUNCIONAL** 

Sistema completo de gestión hospitalaria con **WORKFLOW REDISEÑADO** para optimizar la atención en emergencias con códigos de emergencia, triaje enfermería y atención médica integral.

---

## 🎯 **NUEVO WORKFLOW IMPLEMENTADO**

### **🚨 CÓDIGOS DE EMERGENCIA (Proceso A)**
- **7 tipos de códigos**: AZUL, ACV, IAM, TRAUMA, SEPSIS, PEDIÁTRICO, OBSTÉTRICO
- **Activación instantánea** con notificación a todo el personal
- **Bypass completo** del proceso normal de admisión
- **Registro automático** de respuestas del personal

### **📋 PROCESO NORMAL (Proceso B)**
1. **Paciente llega** → Admisión automática a lista triaje
2. **Enfermería realiza triaje** → Asigna color + signos vitales
3. **Enfermería decide**: Lista médica | Alta enfermería | Shockroom
4. **Médico toma paciente** de lista médica priorizada
5. **Atención médica completa**: Prescripciones + Procedimientos + Estudios + Evoluciones
6. **Decisión final OBLIGATORIA**: Alta | Internación | Continúa

### **🚑 TRASLADOS EXTERNOS (Proceso C)**
1. **Admisión rápida** desde hospital externo
2. **Evaluación inmediata** por enfermería/médico
3. **Decisión**: Shockroom | Lista médica | Código emergencia
4. **Integración automática** con sistema origen

---

## 🚀 **INICIO RÁPIDO**

### **❓ ¿CONFUNDIDO CON TANTOS SCRIPTS?**
**👉 LEE PRIMERO:** [`SCRIPTS_A_USAR.md`](SCRIPTS_A_USAR.md) - **Guía simple de qué scripts usar**

### **🎯 OPCIÓN 1: Nuevo Workflow (RECOMENDADO)**
```bash
INICIAR_NUEVO_WORKFLOW.bat
```
- ✅ Actualiza base de datos automáticamente
- ✅ Inicia backend con nuevo workflow
- ✅ Inicia frontend actualizado
- ✅ Configuración completa automática

### **🎯 OPCIÓN 2: Completo con Verificaciones**
```bash
SISTEMA_COMPLETO_FUNCIONANDO.bat
```
- ✅ Verifica requisitos del sistema
- ✅ Instala dependencias automáticamente
- ✅ Ideal para primera vez o problemas

### **🎯 OPCIÓN 3: Solo Frontend Actualizado**
```bash
INICIAR_FRONTEND_NUEVO_WORKFLOW.bat
```
- ✅ Solo para desarrollo frontend
- ✅ Cuando el backend ya está corriendo

---

## 🌐 **NAVEGACIÓN DEL SISTEMA**

### **🔗 URLs Principales**
- **🌐 Frontend**: http://localhost:3000
- **🔧 Backend**: http://127.0.0.1:8000
- **📖 API Docs**: http://127.0.0.1:8000/docs

### **🧭 Rutas del Nuevo Workflow**
- **`/`** - Dashboard principal con métricas
- **`/codigos-emergencia`** - Gestión de códigos de emergencia
- **`/admision`** - Admisión de pacientes
- **`/enfermeria/triaje`** - Sistema de triaje por enfermería
- **`/enfermeria/decisiones`** - Decisiones post-triaje
- **`/medicos/lista`** - Lista médica priorizada
- **`/medicos/atencion/:id`** - Atención médica completa
- **`/shockroom`** - Shockroom con 6 camas
- **`/pacientes/:id`** - Ficha completa del paciente

---

## 👥 **ROLES Y PERMISOS**

### **👨‍💼 Administrador**
- ✅ Acceso completo a todo el sistema
- ✅ Gestión de usuarios y hospitales
- ✅ Configuración de parámetros
- ✅ Reportes y estadísticas

### **👨‍⚕️ Médico**
- ✅ Lista médica priorizada
- ✅ Atención médica completa
- ✅ Prescripciones y procedimientos
- ✅ Shockroom
- ✅ Códigos de emergencia

### **👩‍⚕️ Enfermera**
- ✅ Triaje de pacientes
- ✅ Decisiones post-triaje
- ✅ Alta de enfermería
- ✅ Shockroom
- ✅ Códigos de emergencia

---

## 🛠️ **TECNOLOGÍAS**

### **🔧 Backend**
- **FastAPI** (Python 3.13+) - API RESTful moderna
- **SQLAlchemy** - ORM con modelos actualizados
- **SQLite** → **PostgreSQL** ready
- **JWT Multi-tenant** - Autenticación por hospital
- **WebSocket** - Notificaciones en tiempo real
- **Pydantic V2** - Validación de datos

### **🌐 Frontend**
- **Next.js 15** - Framework React SSR/SSG
- **React 19** - UI moderna y reactiva
- **TypeScript** - Tipado fuerte
- **Tailwind CSS** - Styling utility-first
- **Radix UI** - Componentes accesibles
- **React Router** - Navegación por rutas

---

## 📋 **INSTALACIÓN**

### **📥 Prerrequisitos**
- Python 3.13+
- Node.js 18+
- Git

### **⚡ Instalación Automática**
```bash
git clone <repository>
cd sistema-hospitalario
INSTALAR_DEPENDENCIAS.bat
INICIAR_NUEVO_WORKFLOW.bat
```

### **🔧 Instalación Manual**
```bash
# 1. Backend
cd proyecto_hospital
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python actualizar_db_workflow.py

# 2. Frontend  
cd frontend
npm install

# 3. Ejecutar
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
npm run dev
```

---

## 🔐 **CREDENCIALES**

### **🏥 Hospital de Prueba**
- **Hospital ID**: HOSP001
- **Nombre**: Hospital General

### **👤 Usuarios de Prueba**
- **Admin**: admin / admin123
- **Médico**: medico1 / medico123  
- **Enfermera**: enfermera1 / enfermera123

---

## 📁 **ESTRUCTURA ACTUALIZADA**

```
sistema-hospitalario/
├── 🗃️ proyecto_hospital/           # Backend FastAPI
│   ├── app/
│   │   ├── api/v1/                 # APIs del nuevo workflow
│   │   │   ├── codigos_emergencia.py  # 🚨 Códigos emergencia
│   │   │   ├── episodios.py        # 📋 Workflow completo  
│   │   │   ├── admision.py         # 🏥 Admisión
│   │   │   ├── enfermeria.py       # 👩‍⚕️ Enfermería
│   │   │   └── shockroom.py        # 🚑 Shockroom
│   │   ├── models/                 # Modelos actualizados
│   │   │   ├── codigo_emergencia.py
│   │   │   ├── episodio.py         # 🔄 Nuevo workflow
│   │   │   └── shockroom.py
│   │   └── schemas/                # Esquemas Pydantic
│   ├── frontend/                   # Frontend Next.js
│   │   ├── components/
│   │   │   ├── emergency/          # 🚨 Códigos emergencia
│   │   │   ├── triage/             # 🔍 Triaje enfermería
│   │   │   ├── nursing/            # 👩‍⚕️ Decisiones enfermería  
│   │   │   ├── medical/            # 👨‍⚕️ Atención médica
│   │   │   └── shockroom/          # 🚑 Shockroom mejorado
│   │   └── app/                    # Rutas Next.js
│   └── actualizar_db_workflow.py   # 🔄 Migración DB
├── 🚀 Scripts de Iniciación
│   ├── INICIAR_NUEVO_WORKFLOW.bat           # ⭐ PRINCIPAL
│   ├── INICIAR_FRONTEND_NUEVO_WORKFLOW.bat  # 🌐 Solo frontend
│   └── SISTEMA_COMPLETO_FUNCIONANDO.bat     # 📊 Legacy
├── 🛑 Scripts de Detención  
│   ├── DETENER_SISTEMA_HOSPITALARIO_COMPLETO.bat
│   └── DETENER_SISTEMA.ps1
└── 📖 Documentación
    ├── RESUMEN_IMPLEMENTACION_NUEVO_WORKFLOW.md
    └── GUIA_RAPIDA_SISTEMA_HOSPITALARIO.md
```

---

## ✨ **FUNCIONALIDADES IMPLEMENTADAS**

### **🚨 Códigos de Emergencia**
- ✅ 7 tipos de códigos definidos
- ✅ Activación con notificación automática
- ✅ Seguimiento de respuestas del personal
- ✅ Historial completo de eventos
- ✅ Bypass del flujo normal

### **👩‍⚕️ Sistema de Enfermería**
- ✅ Triaje con 5 colores (ROJO, NARANJA, AMARILLO, VERDE, AZUL)
- ✅ Registro de signos vitales completos
- ✅ Decisiones post-triaje: Lista médica | Alta | Shockroom
- ✅ Tiempo de atención objetivos por color

### **👨‍⚕️ Sistema Médico**
- ✅ Lista priorizada por color de triaje
- ✅ Atención médica integral
- ✅ Prescripciones de medicamentos
- ✅ Indicación de procedimientos
- ✅ Órdenes de estudios/laboratorio
- ✅ Evoluciones médicas
- ✅ Decisión final obligatoria

### **🚑 Shockroom Avanzado**
- ✅ 6 camas con monitoreo individual
- ✅ 3 vías de admisión
- ✅ Panel diferenciado por rol
- ✅ Indicaciones de enfermería
- ✅ Traslados automáticos

### **📊 Dashboard y Reportes**
- ✅ Métricas en tiempo real
- ✅ Estados del workflow
- ✅ Tiempos de atención
- ✅ Estadísticas por triaje
- ✅ Códigos activos

---

## 🔄 **MIGRACIÓN DE DATOS**

El sistema incluye migración automática de datos existentes:

```bash
python actualizar_db_workflow.py
```

- ✅ Preserva pacientes existentes
- ✅ Migra episodios al nuevo formato
- ✅ Mantiene historiales médicos
- ✅ Actualiza esquema de base de datos

---

## 🛑 **DETENER EL SISTEMA**

```bash
# Opción 1: Script completo
DETENER_SISTEMA_HOSPITALARIO_COMPLETO.bat

# Opción 2: PowerShell
DETENER_SISTEMA.ps1

# Opción 3: Manual
Ctrl+C en cada terminal
```

---

## 🤝 **CONTRIBUIR**

1. Fork el repositorio
2. Crea rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

## 📞 **SOPORTE**

### **📧 Contacto**
- **Desarrollador**: Louai Hallak
- **GitHub**: [@louaihallak2000](https://github.com/louaihallak2000)

### **🐛 Reporte de Errores**
- Crear issue en GitHub con:
  - Descripción del problema
  - Pasos para reproducir
  - Logs del sistema
  - Capturas de pantalla

### **💡 Solicitudes de Funcionalidades**
- Crear issue con etiqueta "enhancement"
- Describir la funcionalidad deseada
- Justificar el caso de uso

---

## 📜 **LICENCIA**

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para más detalles.

---

## 🏆 **RECONOCIMIENTOS**

- **FastAPI** - Framework web moderno
- **Next.js** - Framework React con SSR
- **Radix UI** - Componentes accesibles
- **Tailwind CSS** - Framework CSS utility-first

---

⭐ **¡Si este proyecto te fue útil, considera darle una estrella!** ⭐

---

**📈 Sistema en constante evolución - Última actualización: Workflow completo implementado** 