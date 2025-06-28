from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# Schemas para Camas
class ShockroomCamaBase(BaseModel):
    numero_cama: str
    posicion_x: int
    posicion_y: int
    estado: str = "disponible"
    tipo_cama: str = "critica"
    equipamiento: Optional[List[str]] = []
    observaciones: Optional[str] = None

class ShockroomCamaCreate(ShockroomCamaBase):
    hospital_id: str

class ShockroomCamaUpdate(BaseModel):
    estado: Optional[str] = None
    equipamiento: Optional[List[str]] = None
    observaciones: Optional[str] = None

class ShockroomCama(ShockroomCamaBase):
    id: str
    hospital_id: str
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    class Config:
        from_attributes = True

# Schemas para Asignaciones
class ShockroomAsignacionBase(BaseModel):
    motivo_ingreso: Optional[str] = None
    estado_paciente: str = "estable"
    prioridad: str = "alta"
    monitoreo_continuo: bool = True
    equipos_utilizados: Optional[List[str]] = []
    observaciones: Optional[str] = None

class ShockroomAsignacionCreate(ShockroomAsignacionBase):
    cama_id: str
    episodio_id: str
    paciente_id: str
    medico_responsable: Optional[str] = None
    enfermera_asignada: Optional[str] = None

class ShockroomAsignacionUpdate(BaseModel):
    estado_paciente: Optional[str] = None
    prioridad: Optional[str] = None
    monitoreo_continuo: Optional[bool] = None
    equipos_utilizados: Optional[List[str]] = None
    observaciones: Optional[str] = None
    datos_monitorizacion: Optional[Dict[str, Any]] = None

class ShockroomAsignacion(ShockroomAsignacionBase):
    id: str
    cama_id: str
    episodio_id: str
    paciente_id: str
    medico_responsable: Optional[str] = None
    enfermera_asignada: Optional[str] = None
    fecha_ingreso: datetime
    fecha_salida: Optional[datetime] = None
    datos_monitorizacion: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

# Schemas para Alertas
class ShockroomAlertaBase(BaseModel):
    tipo_alerta: str
    prioridad: str = "media"
    titulo: str
    descripcion: Optional[str] = None

class ShockroomAlertaCreate(ShockroomAlertaBase):
    asignacion_id: str
    creada_por: Optional[str] = None

class ShockroomAlertaUpdate(BaseModel):
    estado: Optional[str] = None
    atendida_por: Optional[str] = None

class ShockroomAlerta(ShockroomAlertaBase):
    id: str
    asignacion_id: str
    estado: str = "activa"
    creada_por: Optional[str] = None
    atendida_por: Optional[str] = None
    fecha_creacion: datetime
    fecha_atencion: Optional[datetime] = None
    fecha_cierre: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schemas compuestos para vistas completas
class ShockroomCamaDetallada(ShockroomCama):
    asignacion_actual: Optional[ShockroomAsignacion] = None
    paciente_nombre: Optional[str] = None
    tiempo_ocupacion: Optional[int] = None  # en minutos
    alertas_activas: List[ShockroomAlerta] = []

class ShockroomEstadisticas(BaseModel):
    total_camas: int
    camas_disponibles: int
    camas_ocupadas: int
    camas_mantenimiento: int
    camas_limpieza: int
    tasa_ocupacion: float
    tiempo_promedio_estancia: Optional[float] = None  # en horas
    alertas_activas: int
    pacientes_criticos: int

class ShockroomPacienteInfo(BaseModel):
    episodio_id: str
    paciente_id: str
    paciente_nombre: str
    paciente_dni: str
    edad: Optional[int] = None
    triaje_color: Optional[str] = None
    motivo_consulta: Optional[str] = None
    tiempo_espera: Optional[int] = None  # en minutos
    puede_asignar_shockroom: bool = True

class MonitorizacionDatos(BaseModel):
    presion_arterial_sistolica: Optional[int] = None
    presion_arterial_diastolica: Optional[int] = None
    frecuencia_cardiaca: Optional[int] = None
    frecuencia_respiratoria: Optional[int] = None
    temperatura: Optional[float] = None
    saturacion_oxigeno: Optional[int] = None
    escala_dolor: Optional[int] = None
    estado_conciencia: Optional[str] = None
    timestamp: datetime 