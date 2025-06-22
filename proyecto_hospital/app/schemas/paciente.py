from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Literal, Union, List
from datetime import date, datetime
from enum import Enum

class TriageColor(str, Enum):
    ROJO = "ROJO"
    NARANJA = "NARANJA"
    AMARILLO = "AMARILLO"
    VERDE = "VERDE"
    AZUL = "AZUL"

class PacienteBase(BaseModel):
    dni: str = Field(..., example="12345678A")
    nombre_completo: str
    fecha_nacimiento: Optional[date] = None
    sexo: Optional[str] = None
    tipo_sangre: Optional[str] = Field(None, example="O+")
    alergias_conocidas: Optional[str] = Field(None, example="Penicilina, Polen")
    numero_afiliado: Optional[str] = Field(None, example="987654321")

class PacienteCreate(PacienteBase):
    pass

class PacienteUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    sexo: Optional[str] = None
    tipo_sangre: Optional[str] = None
    alergias_conocidas: Optional[str] = None

class PacienteResponse(PacienteBase):
    id: str
    fecha_creacion: datetime
    fecha_ultima_actualizacion: datetime
    
    class Config:
        from_attributes = True

class PacienteHospitalBase(BaseModel):
    numero_historia_local: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    contacto_emergencia: Optional[str] = None
    obra_social: Optional[str] = None
    numero_afiliado: Optional[str] = None
    notas_administrativas: Optional[str] = None

class PacienteHospitalCreate(PacienteHospitalBase):
    paciente_id: str

class PacienteHospitalResponse(PacienteHospitalBase):
    id: str
    paciente_id: str
    hospital_id: str
    fecha_primera_atencion: Optional[datetime] = None
    fecha_ultima_atencion: Optional[datetime] = None
    paciente: PacienteResponse
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

# Nuevo schema para creación completa de paciente con episodio
class PacienteCompletoCreate(PacienteBase):
    # Campos del episodio
    motivo_consulta: str = Field(..., example="Dolor de pecho")
    color_triaje: Optional[TriageColor] = Field(None, example="AMARILLO") # Campo es ahora opcional
    tipo_episodio: Optional[str] = Field("consulta", example="consulta")
    medico_responsable: Optional[str] = Field(None, example="Dr. Alan Grant")
    
    # Campos de contacto (PacienteHospital)
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    contacto_emergencia: Optional[str] = None
    obra_social: Optional[str] = None
    # numero_afiliado ya está en PacienteBase
    
    class Config:
        json_encoders = {
            date: lambda v: v.isoformat() if v else None
        }

class PacienteCompletoResponse(BaseModel):
    paciente: PacienteResponse
    episodio: Dict[str, Any]
    
    class Config:
        from_attributes = True 