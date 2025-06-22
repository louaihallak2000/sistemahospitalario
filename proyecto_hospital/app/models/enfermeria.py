from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Float, Integer
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from datetime import datetime

class SignosVitales(Base):
    __tablename__ = "signos_vitales"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    episodio_id = Column(String(36), ForeignKey("episodios.id", ondelete="CASCADE"), nullable=False)
    hospital_id = Column(String(10), ForeignKey("hospitales.id", ondelete="CASCADE"), nullable=False)
    
    # Signos vitales
    presion_arterial_sistolica = Column(Integer)  # mmHg
    presion_arterial_diastolica = Column(Integer)  # mmHg
    frecuencia_cardiaca = Column(Integer)  # latidos por minuto
    frecuencia_respiratoria = Column(Integer)  # respiraciones por minuto
    temperatura = Column(Float)  # grados Celsius
    saturacion_oxigeno = Column(Float)  # porcentaje
    peso = Column(Float)  # kilogramos
    talla = Column(Float)  # centímetros
    
    # Información adicional
    dolor_escala = Column(Integer)  # Escala del 1 al 10
    estado_conciencia = Column(String(50))  # 'Alerta', 'Somnoliento', 'Confuso', etc.
    observaciones = Column(Text)
    
    # Control de registro
    fecha_hora_registro = Column(DateTime, nullable=False, default=datetime.utcnow)
    usuario_registro = Column(String(100))  # Enfermero/a que registró
    
    # Relaciones
    episodio = relationship("Episodio")
    hospital = relationship("Hospital")

class RegistroEnfermeria(Base):
    __tablename__ = "registros_enfermeria"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    episodio_id = Column(String(36), ForeignKey("episodios.id", ondelete="CASCADE"), nullable=False)
    hospital_id = Column(String(10), ForeignKey("hospitales.id", ondelete="CASCADE"), nullable=False)
    
    # Datos del registro
    tipo_registro = Column(String(50), nullable=False)  # 'Nota', 'Procedimiento', 'Medicacion', 'Observacion'
    titulo = Column(String(200))
    descripcion = Column(Text, nullable=False)
    procedimiento_realizado = Column(String(200))
    
    # Medicación administrada (si aplica)
    medicamento = Column(String(200))
    dosis_administrada = Column(String(100))
    via_administracion = Column(String(50))  # 'Oral', 'IV', 'IM', 'SC', etc.
    
    # Control de registro
    fecha_hora_registro = Column(DateTime, nullable=False, default=datetime.utcnow)
    usuario_registro = Column(String(100))  # Enfermero/a que registró
    turno = Column(String(20))  # 'Mañana', 'Tarde', 'Noche'
    
    # Estado y seguimiento
    estado_registro = Column(String(30), default='activo')  # 'activo', 'completado', 'cancelado'
    requiere_seguimiento = Column(String(1), default='N')  # 'S' o 'N'
    
    # Relaciones
    episodio = relationship("Episodio")
    hospital = relationship("Hospital") 