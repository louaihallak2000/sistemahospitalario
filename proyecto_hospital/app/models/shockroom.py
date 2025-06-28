from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Integer, Boolean
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from datetime import datetime

class ShockroomCama(Base):
    __tablename__ = "shockroom_camas"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hospital_id = Column(String(10), ForeignKey("hospitales.id", ondelete="CASCADE"), nullable=False)
    numero_cama = Column(String(10), nullable=False)  # SR-01, SR-02, etc.
    posicion_x = Column(Integer, nullable=False)  # Posición X en el mapa
    posicion_y = Column(Integer, nullable=False)  # Posición Y en el mapa
    estado = Column(String(20), default='disponible')  # disponible, ocupada, limpieza, mantenimiento, fuera_servicio
    tipo_cama = Column(String(50), default='critica')  # critica, observacion, aislamiento
    equipamiento = Column(JSON)  # Lista de equipos disponibles
    observaciones = Column(Text)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    hospital = relationship("Hospital", back_populates="shockroom_camas")
    asignaciones = relationship("ShockroomAsignacion", back_populates="cama")

class ShockroomAsignacion(Base):
    __tablename__ = "shockroom_asignaciones"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cama_id = Column(String(36), ForeignKey("shockroom_camas.id", ondelete="CASCADE"), nullable=False)
    episodio_id = Column(String(36), ForeignKey("episodios.id", ondelete="CASCADE"), nullable=False)
    paciente_id = Column(String(36), ForeignKey("pacientes.id", ondelete="CASCADE"), nullable=False)
    medico_responsable = Column(String(255))
    enfermera_asignada = Column(String(255))
    fecha_ingreso = Column(DateTime, default=datetime.utcnow)
    fecha_salida = Column(DateTime)
    motivo_ingreso = Column(Text)
    estado_paciente = Column(String(50), default='estable')  # critico, estable, mejorando, deteriorando
    prioridad = Column(String(20), default='alta')  # alta, media, baja
    monitoreo_continuo = Column(Boolean, default=True)
    equipos_utilizados = Column(JSON)  # Lista de equipos en uso
    observaciones = Column(Text)
    datos_monitorizacion = Column(JSON)  # Signos vitales y monitoreo
    
    # Relaciones
    cama = relationship("ShockroomCama", back_populates="asignaciones")
    episodio = relationship("Episodio")
    paciente = relationship("Paciente")

class ShockroomAlerta(Base):
    __tablename__ = "shockroom_alertas"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    asignacion_id = Column(String(36), ForeignKey("shockroom_asignaciones.id", ondelete="CASCADE"), nullable=False)
    tipo_alerta = Column(String(50), nullable=False)  # medica, tecnica, administrativa
    prioridad = Column(String(20), default='media')  # critica, alta, media, baja
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text)
    estado = Column(String(20), default='activa')  # activa, atendida, cerrada
    creada_por = Column(String(255))
    atendida_por = Column(String(255))
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_atencion = Column(DateTime)
    fecha_cierre = Column(DateTime)
    
    # Relaciones
    asignacion = relationship("ShockroomAsignacion") 