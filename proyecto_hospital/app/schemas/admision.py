from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class RegistroAdmisionBase(BaseModel):
    tipo_admision: str = Field(..., example="Guardia")
    motivo_consulta: str = Field(..., example="Dolor abdominal intenso")
    acompanante_nombre: Optional[str] = Field(None, example="María García")
    acompanante_telefono: Optional[str] = Field(None, example="11-1234-5678")
    acompanante_parentesco: Optional[str] = Field(None, example="Madre")
    observaciones_admision: Optional[str] = Field(None, example="Paciente llega consciente y orientado")

class RegistroAdmisionCreate(RegistroAdmisionBase):
    paciente_id: str = Field(..., example="123e4567-e89b-12d3-a456-426614174000")
    episodio_id: str = Field(..., example="123e4567-e89b-12d3-a456-426614174001")

class RegistroAdmisionUpdate(BaseModel):
    tipo_admision: Optional[str] = None
    motivo_consulta: Optional[str] = None
    estado_admision: Optional[str] = None
    acompanante_nombre: Optional[str] = None
    acompanante_telefono: Optional[str] = None
    acompanante_parentesco: Optional[str] = None
    observaciones_admision: Optional[str] = None

class RegistroAdmisionResponse(RegistroAdmisionBase):
    id: str
    paciente_id: str
    episodio_id: str
    hospital_id: str
    fecha_admision: datetime
    estado_admision: str
    usuario_admision: Optional[str]
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

# Schema para datos extendidos de paciente en admisión
class PacienteAdmisionExtendido(BaseModel):
    documento_tipo: Optional[str] = Field(None, example="DNI")
    contacto_emergencia_nombre: Optional[str] = Field(None, example="Juan Pérez")
    contacto_emergencia_telefono: Optional[str] = Field(None, example="11-9876-5432")
    contacto_emergencia_parentesco: Optional[str] = Field(None, example="Esposo")

class PacienteAdmisionUpdate(PacienteAdmisionExtendido):
    pass

class RegistroAdmisionCompleto(RegistroAdmisionResponse):
    """Schema completo que incluye datos del paciente y episodio"""
    paciente_nombre: Optional[str] = None
    paciente_dni: Optional[str] = None
    episodio_numero: Optional[str] = None 