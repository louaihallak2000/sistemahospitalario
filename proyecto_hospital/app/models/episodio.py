from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from datetime import datetime

class Episodio(Base):
    __tablename__ = "episodios"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    paciente_id = Column(String(36), ForeignKey("pacientes.id", ondelete="CASCADE"), nullable=False)
    hospital_id = Column(String(10), ForeignKey("hospitales.id", ondelete="CASCADE"), nullable=False)
    numero_episodio_local = Column(String(20))
    fecha_inicio = Column(DateTime, nullable=False, default=datetime.utcnow)
    fecha_cierre = Column(DateTime)
    tipo = Column(String(20), nullable=False, default='consulta')  # consulta, emergencia, traslado
    
    # NUEVOS ESTADOS SEGÚN WORKFLOW
    estado = Column(String(30), default='espera_triaje')  
    # Valores: espera_triaje, en_lista_medica, en_atencion, en_shockroom, alta_enfermeria, finalizado
    
    # CAMPOS DE TRIAJE
    color_triaje = Column(String(20))  # ROJO, NARANJA, AMARILLO, VERDE, AZUL
    triaje_realizado_por = Column(String(255))  # Enfermera que hizo el triaje
    fecha_triaje = Column(DateTime)
    signos_vitales_triaje = Column(JSON)  # Signos vitales del triaje
    evaluacion_enfermeria = Column(Text)  # Evaluación inicial de enfermería
    
    # DECISIÓN POST-TRIAJE
    decision_post_triaje = Column(String(30))  # lista_medica, alta_enfermeria, shockroom
    decidido_por = Column(String(255))  # Quién tomó la decisión
    fecha_decision = Column(DateTime)
    
    # ATENCIÓN MÉDICA
    medico_responsable = Column(String(255))
    fecha_inicio_atencion = Column(DateTime)  # Cuándo médico tomó el paciente
    motivo_consulta = Column(Text)
    diagnostico_principal = Column(Text)
    resumen_clinico = Column(Text)
    
    # PRESCRIPCIONES Y PROCEDIMIENTOS
    prescripciones = Column(JSON)  # Lista de medicamentos prescritos
    procedimientos = Column(JSON)  # Lista de procedimientos indicados
    estudios_solicitados = Column(JSON)  # Laboratorio, radiología, etc.
    evoluciones_medicas = Column(JSON)  # Evoluciones del médico
    evoluciones_enfermeria = Column(JSON)  # Evoluciones de enfermería
    
    # MONITOREO
    indicaciones_monitoreo = Column(JSON)  # Frecuencia de signos vitales
    registros_signos_vitales = Column(JSON)  # Historial de signos vitales
    
    # SHOCKROOM
    en_shockroom = Column(Boolean, default=False)
    cama_shockroom = Column(String(10))  # SR-01, SR-02, etc.
    fecha_ingreso_shockroom = Column(DateTime)
    fecha_salida_shockroom = Column(DateTime)
    
    # DECISIÓN FINAL MÉDICA (OBLIGATORIA)
    decision_final = Column(String(20))  # alta, internacion, continua
    fecha_decision_final = Column(DateTime)
    indicaciones_alta = Column(Text)
    area_internacion = Column(String(100))  # Si se interna
    motivo_continuacion = Column(Text)  # Si continúa en emergencias
    
    # TRASLADOS
    hospital_origen = Column(String(100))  # Para traslados externos
    motivo_traslado = Column(Text)
    datos_traslado = Column(JSON)  # Información adicional del traslado
    
    # METADATOS
    creado_por = Column(String(255))  # Usuario que creó el episodio
    ultima_modificacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    modificado_por = Column(String(255))
    
    # Campo JSON para datos adicionales
    datos_json = Column(JSON)
    
    # Relaciones
    paciente = relationship("Paciente", back_populates="episodios")
    hospital = relationship("Hospital", back_populates="episodios") 