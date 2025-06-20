from pydantic import BaseModel
from typing import Optional, Dict, Any, Literal
from datetime import date, datetime
from uuid import UUID

class PacienteBase(BaseModel):
    dni: str
    nombre_completo: str
    fecha_nacimiento: Optional[date] = None
    sexo: Optional[str] = None
    tipo_sangre: Optional[str] = None
    alergias_conocidas: Optional[str] = None

class PacienteCreate(PacienteBase):
    pass

class PacienteUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    sexo: Optional[str] = None
    tipo_sangre: Optional[str] = None
    alergias_conocidas: Optional[str] = None

class PacienteResponse(PacienteBase):
    id: UUID
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
    paciente_id: UUID

class PacienteHospitalResponse(PacienteHospitalBase):
    id: UUID
    paciente_id: UUID
    hospital_id: str
    fecha_primera_atencion: Optional[datetime]
    fecha_ultima_atencion: Optional[datetime]
    paciente: PacienteResponse
    
    class Config:
        from_attributes = True

# Nuevo schema para creación completa de paciente con episodio
class PacienteCompletoCreate(BaseModel):
    # Datos del paciente
    dni: str
    nombre_completo: str
    fecha_nacimiento: Optional[date] = None
    sexo: Optional[Literal["M", "F", "O"]] = None
    tipo_sangre: Optional[str] = None
    alergias_conocidas: Optional[str] = None
    
    # Datos de contacto y hospital
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    contacto_emergencia: Optional[str] = None
    obra_social: Optional[str] = None
    numero_afiliado: Optional[str] = None
    
    # Datos del episodio inicial
    motivo_consulta: str
    color_triaje: Literal["ROJO", "NARANJA", "AMARILLO", "VERDE", "AZUL"]
    tipo_episodio: str = "consulta"
    medico_responsable: Optional[str] = None

class PacienteCompletoResponse(BaseModel):
    paciente: PacienteResponse
    episodio: Dict[str, Any]
    
    class Config:
        from_attributes = True 