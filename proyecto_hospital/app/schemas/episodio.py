from pydantic import BaseModel
from typing import Optional, Dict, Any, Literal
from datetime import datetime

class EpisodioBase(BaseModel):
    tipo: str
    medico_responsable: Optional[str] = None
    diagnostico_principal: Optional[str] = None
    resumen_clinico: Optional[str] = None
    datos_json: Optional[Dict[str, Any]] = None

class EpisodioCreate(EpisodioBase):
    paciente_id: str
    numero_episodio_local: Optional[str] = None

class EpisodioUpdate(BaseModel):
    fecha_cierre: Optional[datetime] = None
    estado: Optional[str] = None
    medico_responsable: Optional[str] = None
    diagnostico_principal: Optional[str] = None
    resumen_clinico: Optional[str] = None
    datos_json: Optional[Dict[str, Any]] = None

class EpisodioResponse(EpisodioBase):
    id: str
    paciente_id: str
    hospital_id: str
    numero_episodio_local: Optional[str]
    fecha_inicio: datetime
    fecha_cierre: Optional[datetime] = None
    estado: str
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class EpisodioListaEspera(BaseModel):
    id: str
    paciente_dni: str
    paciente_nombre: str
    paciente_edad: Optional[int] = None
    tipo: str
    fecha_inicio: datetime
    estado: str
    medico_responsable: Optional[str] = None
    motivo_consulta: Optional[str] = None
    color_triaje: Optional[str] = None
    tiempo_espera_minutos: Optional[int] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class EstadisticasTriaje(BaseModel):
    ROJO: int = 0
    NARANJA: int = 0
    AMARILLO: int = 0
    VERDE: int = 0
    AZUL: int = 0

class EstadisticasHospital(BaseModel):
    triageStats: EstadisticasTriaje
    alerts: list = []
    total_pacientes_espera: int = 0
    promedio_tiempo_espera: Optional[float] = None 