from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Schemas para Signos Vitales
class SignosVitalesBase(BaseModel):
    presion_arterial_sistolica: Optional[int] = Field(None, example=120, description="Presión sistólica en mmHg")
    presion_arterial_diastolica: Optional[int] = Field(None, example=80, description="Presión diastólica en mmHg")
    frecuencia_cardiaca: Optional[int] = Field(None, example=72, description="Latidos por minuto")
    frecuencia_respiratoria: Optional[int] = Field(None, example=16, description="Respiraciones por minuto")
    temperatura: Optional[float] = Field(None, example=36.5, description="Temperatura en grados Celsius")
    saturacion_oxigeno: Optional[float] = Field(None, example=98.0, description="Saturación de oxígeno en %")
    peso: Optional[float] = Field(None, example=70.5, description="Peso en kilogramos")
    talla: Optional[float] = Field(None, example=175.0, description="Talla en centímetros")
    dolor_escala: Optional[int] = Field(None, example=3, description="Escala de dolor del 1 al 10")
    estado_conciencia: Optional[str] = Field(None, example="Alerta", description="Estado de conciencia")
    observaciones: Optional[str] = Field(None, example="Paciente estable, sin alteraciones")

class SignosVitalesCreate(SignosVitalesBase):
    episodio_id: str = Field(..., example="123e4567-e89b-12d3-a456-426614174001")

class SignosVitalesUpdate(SignosVitalesBase):
    pass

class SignosVitalesResponse(SignosVitalesBase):
    id: str
    episodio_id: str
    hospital_id: str
    fecha_hora_registro: datetime
    usuario_registro: Optional[str]
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

# Schemas para Registro de Enfermería
class RegistroEnfermeriaBase(BaseModel):
    tipo_registro: str = Field(..., example="Nota", description="Tipo: Nota, Procedimiento, Medicacion, Observacion")
    titulo: Optional[str] = Field(None, example="Control de signos vitales")
    descripcion: str = Field(..., example="Paciente presenta estabilidad hemodinámica")
    procedimiento_realizado: Optional[str] = Field(None, example="Toma de presión arterial")
    medicamento: Optional[str] = Field(None, example="Paracetamol")
    dosis_administrada: Optional[str] = Field(None, example="500mg")
    via_administracion: Optional[str] = Field(None, example="Oral")
    turno: Optional[str] = Field(None, example="Mañana", description="Mañana, Tarde, Noche")
    requiere_seguimiento: Optional[str] = Field("N", example="N", description="S o N")

class RegistroEnfermeriaCreate(RegistroEnfermeriaBase):
    episodio_id: str = Field(..., example="123e4567-e89b-12d3-a456-426614174001")

class RegistroEnfermeriaUpdate(BaseModel):
    tipo_registro: Optional[str] = None
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    procedimiento_realizado: Optional[str] = None
    medicamento: Optional[str] = None
    dosis_administrada: Optional[str] = None
    via_administracion: Optional[str] = None
    estado_registro: Optional[str] = None
    requiere_seguimiento: Optional[str] = None
    turno: Optional[str] = None

class RegistroEnfermeriaResponse(RegistroEnfermeriaBase):
    id: str
    episodio_id: str
    hospital_id: str
    fecha_hora_registro: datetime
    usuario_registro: Optional[str]
    estado_registro: str
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

# Schema combinado para vista completa de enfermería
class VistaEnfermeriaCompleta(BaseModel):
    """Vista completa para el dashboard de enfermería"""
    episodio_id: str
    paciente_nombre: str
    paciente_dni: str
    habitacion: Optional[str] = None
    ultimo_signos_vitales: Optional[SignosVitalesResponse] = None
    registros_recientes: list[RegistroEnfermeriaResponse] = []
    tiempo_desde_ultimo_registro: Optional[int] = None  # minutos 