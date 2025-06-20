# Sistema Hospitalario Multi-Tenant

Sistema hospitalario completo desarrollado con FastAPI y PostgreSQL que permite la gestión multi-tenant de pacientes, episodios médicos y usuarios hospitalarios.

## Características Principales

- **Arquitectura Multi-Tenant**: Cada hospital tiene su propio contexto de datos
- **Autenticación JWT**: Sistema seguro de autenticación con tokens
- **API REST Completa**: Endpoints para gestión de pacientes, episodios y autenticación
- **Base de Datos PostgreSQL**: Almacenamiento robusto con SQLAlchemy ORM
- **Documentación Automática**: Swagger UI integrado en `/docs`
- **Validación de Datos**: Schemas Pydantic para validación automática

## Estructura del Proyecto

```
proyecto_hospital/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Aplicación FastAPI principal
│   ├── core/
│   │   ├── config.py          # Configuración de la aplicación
│   │   ├── database.py        # Configuración de base de datos
│   │   └── security.py        # Funciones de seguridad y JWT
│   ├── models/
│   │   ├── hospital.py        # Modelo de hospitales
│   │   ├── paciente.py        # Modelos de pacientes
│   │   ├── usuario.py         # Modelo de usuarios
│   │   └── episodio.py        # Modelo de episodios médicos
│   ├── schemas/
│   │   ├── auth.py            # Schemas de autenticación
│   │   ├── paciente.py        # Schemas de pacientes
│   │   └── episodio.py        # Schemas de episodios
│   ├── api/v1/
│   │   ├── auth.py            # Endpoints de autenticación
│   │   ├── pacientes.py       # Endpoints de pacientes
│   │   └── episodios.py       # Endpoints de episodios
│   └── services/
│       ├── auth_service.py    # Lógica de autenticación
│       └── paciente_service.py # Lógica de pacientes
├── requirements.txt
├── docker-compose.yml
├── .env.example
└── README.md
```

## Instalación y Configuración

### Prerequisitos

- Python 3.8+
- PostgreSQL 12+
- Docker y Docker Compose (opcional)

### Instalación Local

1. **Clonar y configurar el proyecto:**
```bash
cd proyecto_hospital
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. **Configurar PostgreSQL:**
   - Crear base de datos `hospital_db`
   - Actualizar `DATABASE_URL` en `.env`

4. **Ejecutar la aplicación:**
```bash
uvicorn app.main:app --reload
```

### Instalación con Docker

1. **Ejecutar con Docker Compose:**
```bash
docker-compose up -d
```

La aplicación estará disponible en `http://localhost:8000`

## Uso de la API

### Autenticación

**POST** `/auth/login`
```json
{
  "hospital_id": "HOSP001",
  "username": "usuario",
  "password": "contraseña"
}
```

Respuesta:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

### Pacientes

**GET** `/pacientes/{dni}` - Buscar paciente por DNI
**POST** `/pacientes/` - Crear nuevo paciente

```json
{
  "dni": "12345678",
  "nombre_completo": "Juan Pérez",
  "fecha_nacimiento": "1990-01-15",
  "sexo": "M",
  "tipo_sangre": "O+",
  "alergias_conocidas": "Ninguna"
}
```

### Episodios

**GET** `/episodios/lista-espera` - Lista de espera del hospital
**POST** `/episodios/` - Crear nuevo episodio

```json
{
  "paciente_id": "550e8400-e29b-41d4-a716-446655440000",
  "tipo": "consulta",
  "medico_responsable": "Dr. García",
  "diagnostico_principal": "Consulta rutinaria"
}
```

## Autenticación

Todas las rutas (excepto `/auth/login`) requieren autenticación mediante Bearer Token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/pacientes/12345678
```

## Documentación

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Estructura de Base de Datos

### Tablas Principales

- **hospitales**: Información de cada hospital
- **usuarios**: Usuarios del sistema por hospital
- **pacientes**: Datos generales de pacientes
- **pacientes_hospital**: Relación paciente-hospital específica
- **episodios**: Episodios médicos de atención

### Características Multi-Tenant

El sistema implementa multi-tenancy mediante:
- `hospital_id` en todas las consultas
- Validación automática de contexto hospitalario
- Tokens JWT que incluyen información del hospital

## Desarrollo

### Agregar Nuevos Endpoints

1. Crear schema en `schemas/`
2. Agregar lógica de negocio en `services/`
3. Implementar endpoint en `api/v1/`
4. Incluir router en `main.py`

### Testing

```bash
# Instalar dependencias de desarrollo
pip install pytest pytest-asyncio httpx

# Ejecutar tests
pytest
```

## Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración configurable
- Validación automática de permisos por hospital
- Middleware de validación de contexto

## Licencia

Este proyecto está bajo la Licencia MIT. 