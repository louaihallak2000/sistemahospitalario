from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from app.core.database import Base

class RegistroHistoriaClinica(Base):
    """
    Modelo para registros automáticos en historia clínica
    Registra todas las acciones realizadas en el sistema
    """
    __tablename__ = "registros_historia_clinica"
    
    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False)
    episodio_id = Column(Integer, ForeignKey("episodios.id"), nullable=True)
    tipo_registro = Column(String(100), nullable=False)  # signo_vital, prescripcion, procedimiento, nota_enfermeria, etc
    titulo = Column(String(200), nullable=False)
    contenido = Column(JSON, nullable=False)  # Datos estructurados del registro
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    usuario_nombre = Column(String(200), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    area = Column(String(50), default="emergencia", nullable=False)
    
    # Metadatos adicionales
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    session_id = Column(String(100), nullable=True)
    
    # Relaciones
    # paciente = relationship("Paciente", back_populates="historia_clinica")
    # episodio = relationship("Episodio", back_populates="registros_historia")
    # usuario = relationship("Usuario", back_populates="registros_realizados")
    
    def __repr__(self):
        return f"<RegistroHistoriaClinica(id={self.id}, tipo={self.tipo_registro}, paciente_id={self.paciente_id})>"


class TipoRegistro:
    """Constantes para tipos de registro en historia clínica"""
    SIGNO_VITAL = "signo_vital"
    PRESCRIPCION_ADMINISTRADA = "prescripcion_administrada"
    PRESCRIPCION_NO_ADMINISTRADA = "prescripcion_no_administrada"
    NOTA_ENFERMERIA = "nota_enfermeria"
    PROCEDIMIENTO_REALIZADO = "procedimiento_realizado"
    TRIAJE_ASIGNADO = "triaje_asignado"
    EPISODIO_INICIADO = "episodio_iniciado"
    PACIENTE_ALTA = "paciente_alta"
    PACIENTE_INTERNACION = "paciente_internacion"
    EVOLUCION_MEDICA = "evolucion_medica"
    ESTUDIO_SOLICITADO = "estudio_solicitado"
    RESULTADO_ESTUDIO = "resultado_estudio"
    DERIVACION = "derivacion"
    ALERTA_MEDICA = "alerta_medica"
    CAMBIO_ESTADO = "cambio_estado"


class PlantillaContenido:
    """Plantillas para estructurar el contenido JSON de cada tipo de registro"""
    
    @staticmethod
    def signo_vital(datos_signos: dict) -> dict:
        return {
            "tipo": "signos_vitales",
            "valores": {
                "presion_arterial_sistolica": datos_signos.get("presion_sistolica"),
                "presion_arterial_diastolica": datos_signos.get("presion_diastolica"),
                "frecuencia_cardiaca": datos_signos.get("frecuencia_cardiaca"),
                "frecuencia_respiratoria": datos_signos.get("frecuencia_respiratoria"),
                "temperatura": datos_signos.get("temperatura"),
                "saturacion_oxigeno": datos_signos.get("saturacion_oxigeno"),
                "peso": datos_signos.get("peso"),
                "talla": datos_signos.get("talla"),
                "dolor_escala": datos_signos.get("dolor_escala"),
                "estado_conciencia": datos_signos.get("estado_conciencia")
            },
            "observaciones": datos_signos.get("observaciones", ""),
            "metadatos": {
                "dispositivo": datos_signos.get("dispositivo", "manual"),
                "validado_por": datos_signos.get("validado_por"),
                "turno": datos_signos.get("turno", "unknown")
            }
        }
    
    @staticmethod
    def prescripcion_administrada(datos_prescripcion: dict) -> dict:
        return {
            "tipo": "prescripcion",
            "accion": "administrada",
            "prescripcion": {
                "id": datos_prescripcion.get("prescripcion_id"),
                "tipo": datos_prescripcion.get("tipo_prescripcion"),  # medicamento, procedimiento, cuidado
                "descripcion": datos_prescripcion.get("descripcion"),
                "dosis": datos_prescripcion.get("dosis"),
                "via_administracion": datos_prescripcion.get("via"),
                "medico_prescriptor": datos_prescripcion.get("medico_nombre")
            },
            "administracion": {
                "hora_administracion": datos_prescripcion.get("hora_administracion"),
                "observaciones": datos_prescripcion.get("observaciones"),
                "reacciones_adversas": datos_prescripcion.get("reacciones_adversas"),
                "enfermera_administra": datos_prescripcion.get("enfermera_nombre")
            }
        }
    
    @staticmethod
    def prescripcion_no_administrada(datos_prescripcion: dict) -> dict:
        return {
            "tipo": "prescripcion",
            "accion": "no_administrada",
            "prescripcion": {
                "id": datos_prescripcion.get("prescripcion_id"),
                "tipo": datos_prescripcion.get("tipo_prescripcion"),
                "descripcion": datos_prescripcion.get("descripcion"),
                "medico_prescriptor": datos_prescripcion.get("medico_nombre")
            },
            "motivo_no_administracion": {
                "razon": datos_prescripcion.get("motivo"),
                "detalles": datos_prescripcion.get("detalles_motivo"),
                "hora_intento": datos_prescripcion.get("hora_intento"),
                "enfermera_reporta": datos_prescripcion.get("enfermera_nombre")
            }
        }
    
    @staticmethod
    def nota_enfermeria(datos_nota: dict) -> dict:
        return {
            "tipo": "nota_enfermeria",
            "categoria": datos_nota.get("tipo_registro", "general"),  # general, procedimiento, medicacion, observacion
            "contenido": {
                "titulo": datos_nota.get("titulo"),
                "descripcion": datos_nota.get("descripcion"),
                "procedimiento_realizado": datos_nota.get("procedimiento_realizado"),
                "observaciones_adicionales": datos_nota.get("observaciones")
            },
            "contexto": {
                "turno": datos_nota.get("turno"),
                "requiere_seguimiento": datos_nota.get("requiere_seguimiento", False),
                "prioridad": datos_nota.get("prioridad", "normal")
            }
        }
    
    @staticmethod
    def triaje_asignado(datos_triaje: dict) -> dict:
        return {
            "tipo": "triaje",
            "clasificacion": {
                "color": datos_triaje.get("color"),
                "nivel_urgencia": datos_triaje.get("nivel"),
                "motivo_consulta": datos_triaje.get("motivo_consulta"),
                "sintomas_principales": datos_triaje.get("sintomas")
            },
            "evaluacion": {
                "enfermera_triaje": datos_triaje.get("enfermera_nombre"),
                "observaciones": datos_triaje.get("observaciones"),
                "tiempo_evaluacion": datos_triaje.get("tiempo_evaluacion")
            }
        }
    
    @staticmethod
    def cambio_estado(datos_cambio: dict) -> dict:
        return {
            "tipo": "cambio_estado",
            "transicion": {
                "estado_anterior": datos_cambio.get("estado_anterior"),
                "estado_nuevo": datos_cambio.get("estado_nuevo"),
                "motivo": datos_cambio.get("motivo"),
                "automatico": datos_cambio.get("automatico", False)
            },
            "contexto": {
                "area_origen": datos_cambio.get("area_origen"),
                "area_destino": datos_cambio.get("area_destino"),
                "responsable": datos_cambio.get("responsable_nombre")
            }
        } 