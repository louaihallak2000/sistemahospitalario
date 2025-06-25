from sqlalchemy.orm import Session
from app.models.historia_clinica import RegistroHistoriaClinica, TipoRegistro, PlantillaContenido
from app.api.v1.websocket import notify_patient_update
from datetime import datetime
import logging
from typing import Optional, Dict, Any
from fastapi import Request

logger = logging.getLogger(__name__)

class HistoriaClinicaService:
    """
    Servicio para registro automático en historia clínica
    Registra todas las acciones realizadas en el sistema
    """
    
    @staticmethod
    async def registrar_en_historia(
        db: Session,
        paciente_id: int,
        episodio_id: Optional[int],
        tipo_registro: str,
        titulo: str,
        contenido_datos: dict,
        usuario_id: int,
        usuario_nombre: str,
        request: Optional[Request] = None
    ) -> RegistroHistoriaClinica:
        """
        Función principal para registrar acciones en historia clínica
        
        Args:
            db: Sesión de base de datos
            paciente_id: ID del paciente
            episodio_id: ID del episodio (opcional)
            tipo_registro: Tipo de registro (usar TipoRegistro.*)
            titulo: Título descriptivo del registro
            contenido_datos: Datos específicos del registro
            usuario_id: ID del usuario que realiza la acción
            usuario_nombre: Nombre del usuario
            request: Request HTTP (opcional, para metadatos)
        """
        
        try:
            # Estructurar el contenido según el tipo de registro
            contenido_estructurado = HistoriaClinicaService._estructurar_contenido(
                tipo_registro, contenido_datos
            )
            
            # Obtener metadatos de la request si está disponible
            metadatos = HistoriaClinicaService._extraer_metadatos(request)
            
            # Crear el registro
            registro = RegistroHistoriaClinica(
                paciente_id=paciente_id,
                episodio_id=episodio_id,
                tipo_registro=tipo_registro,
                titulo=titulo,
                contenido=contenido_estructurado,
                usuario_id=usuario_id,
                usuario_nombre=usuario_nombre,
                timestamp=datetime.utcnow(),
                area="emergencia",
                ip_address=metadatos.get("ip_address"),
                user_agent=metadatos.get("user_agent"),
                session_id=metadatos.get("session_id")
            )
            
            db.add(registro)
            db.commit()
            db.refresh(registro)
            
            logger.info(f"✅ Registro en historia clínica creado: ID {registro.id}, Tipo: {tipo_registro}")
            
            # Notificar en tiempo real
            await notify_patient_update(
                patient_id=str(paciente_id),
                action="historia_clinica_update",
                data={
                    "registro_id": registro.id,
                    "tipo": tipo_registro,
                    "titulo": titulo,
                    "timestamp": registro.timestamp.isoformat(),
                    "usuario": usuario_nombre
                }
            )
            
            return registro
            
        except Exception as e:
            logger.error(f"❌ Error registrando en historia clínica: {e}")
            db.rollback()
            raise
    
    @staticmethod
    def _estructurar_contenido(tipo_registro: str, datos: dict) -> dict:
        """Estructurar contenido según el tipo de registro"""
        
        if tipo_registro == TipoRegistro.SIGNO_VITAL:
            return PlantillaContenido.signo_vital(datos)
        elif tipo_registro == TipoRegistro.PRESCRIPCION_ADMINISTRADA:
            return PlantillaContenido.prescripcion_administrada(datos)
        elif tipo_registro == TipoRegistro.PRESCRIPCION_NO_ADMINISTRADA:
            return PlantillaContenido.prescripcion_no_administrada(datos)
        elif tipo_registro == TipoRegistro.NOTA_ENFERMERIA:
            return PlantillaContenido.nota_enfermeria(datos)
        elif tipo_registro == TipoRegistro.TRIAJE_ASIGNADO:
            return PlantillaContenido.triaje_asignado(datos)
        elif tipo_registro == TipoRegistro.CAMBIO_ESTADO:
            return PlantillaContenido.cambio_estado(datos)
        else:
            # Para tipos no definidos, usar estructura genérica
            return {
                "tipo": "generico",
                "datos": datos,
                "timestamp_procesamiento": datetime.utcnow().isoformat()
            }
    
    @staticmethod
    def _extraer_metadatos(request: Optional[Request]) -> dict:
        """Extraer metadatos de la request HTTP"""
        if not request:
            return {}
        
        return {
            "ip_address": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "session_id": request.headers.get("x-session-id")
        }
    
    @staticmethod
    def obtener_historia_paciente(
        db: Session,
        paciente_id: int,
        desde: Optional[datetime] = None,
        hasta: Optional[datetime] = None,
        tipo_registro: Optional[str] = None
    ) -> list:
        """
        Obtener historia clínica completa de un paciente
        
        Args:
            db: Sesión de base de datos
            paciente_id: ID del paciente
            desde: Fecha desde (opcional)
            hasta: Fecha hasta (opcional)
            tipo_registro: Filtrar por tipo de registro (opcional)
        """
        
        query = db.query(RegistroHistoriaClinica).filter(
            RegistroHistoriaClinica.paciente_id == paciente_id
        )
        
        if desde:
            query = query.filter(RegistroHistoriaClinica.timestamp >= desde)
        
        if hasta:
            query = query.filter(RegistroHistoriaClinica.timestamp <= hasta)
        
        if tipo_registro:
            query = query.filter(RegistroHistoriaClinica.tipo_registro == tipo_registro)
        
        return query.order_by(RegistroHistoriaClinica.timestamp.desc()).all()
    
    @staticmethod
    def obtener_resumen_por_episodio(db: Session, episodio_id: int) -> dict:
        """Obtener resumen de historia clínica por episodio"""
        
        registros = db.query(RegistroHistoriaClinica).filter(
            RegistroHistoriaClinica.episodio_id == episodio_id
        ).order_by(RegistroHistoriaClinica.timestamp.asc()).all()
        
        # Agrupar por tipo de registro
        resumen = {}
        for registro in registros:
            tipo = registro.tipo_registro
            if tipo not in resumen:
                resumen[tipo] = []
            
            resumen[tipo].append({
                "id": registro.id,
                "titulo": registro.titulo,
                "timestamp": registro.timestamp.isoformat(),
                "usuario": registro.usuario_nombre,
                "contenido": registro.contenido
            })
        
        return {
            "episodio_id": episodio_id,
            "total_registros": len(registros),
            "tipos_registro": list(resumen.keys()),
            "registros_por_tipo": resumen,
            "primer_registro": registros[0].timestamp.isoformat() if registros else None,
            "ultimo_registro": registros[-1].timestamp.isoformat() if registros else None
        }


# Funciones helper para registrar eventos específicos
async def registrar_signos_vitales(
    db: Session,
    paciente_id: int,
    episodio_id: int,
    datos_signos: dict,
    usuario_id: int,
    usuario_nombre: str,
    request: Optional[Request] = None
):
    """Registrar toma de signos vitales"""
    
    titulo = f"Signos vitales registrados por {usuario_nombre}"
    
    await HistoriaClinicaService.registrar_en_historia(
        db=db,
        paciente_id=paciente_id,
        episodio_id=episodio_id,
        tipo_registro=TipoRegistro.SIGNO_VITAL,
        titulo=titulo,
        contenido_datos=datos_signos,
        usuario_id=usuario_id,
        usuario_nombre=usuario_nombre,
        request=request
    )


async def registrar_prescripcion_administrada(
    db: Session,
    paciente_id: int,
    episodio_id: int,
    datos_prescripcion: dict,
    usuario_id: int,
    usuario_nombre: str,
    request: Optional[Request] = None
):
    """Registrar administración de prescripción"""
    
    titulo = f"Prescripción administrada: {datos_prescripcion.get('descripcion', 'Sin descripción')}"
    
    await HistoriaClinicaService.registrar_en_historia(
        db=db,
        paciente_id=paciente_id,
        episodio_id=episodio_id,
        tipo_registro=TipoRegistro.PRESCRIPCION_ADMINISTRADA,
        titulo=titulo,
        contenido_datos=datos_prescripcion,
        usuario_id=usuario_id,
        usuario_nombre=usuario_nombre,
        request=request
    )


async def registrar_prescripcion_no_administrada(
    db: Session,
    paciente_id: int,
    episodio_id: int,
    datos_prescripcion: dict,
    usuario_id: int,
    usuario_nombre: str,
    request: Optional[Request] = None
):
    """Registrar prescripción no administrada"""
    
    titulo = f"Prescripción NO administrada: {datos_prescripcion.get('descripcion', 'Sin descripción')}"
    
    await HistoriaClinicaService.registrar_en_historia(
        db=db,
        paciente_id=paciente_id,
        episodio_id=episodio_id,
        tipo_registro=TipoRegistro.PRESCRIPCION_NO_ADMINISTRADA,
        titulo=titulo,
        contenido_datos=datos_prescripcion,
        usuario_id=usuario_id,
        usuario_nombre=usuario_nombre,
        request=request
    )


async def registrar_nota_enfermeria(
    db: Session,
    paciente_id: int,
    episodio_id: int,
    datos_nota: dict,
    usuario_id: int,
    usuario_nombre: str,
    request: Optional[Request] = None
):
    """Registrar nota de enfermería"""
    
    titulo = f"Nota de enfermería: {datos_nota.get('titulo', 'Sin título')}"
    
    await HistoriaClinicaService.registrar_en_historia(
        db=db,
        paciente_id=paciente_id,
        episodio_id=episodio_id,
        tipo_registro=TipoRegistro.NOTA_ENFERMERIA,
        titulo=titulo,
        contenido_datos=datos_nota,
        usuario_id=usuario_id,
        usuario_nombre=usuario_nombre,
        request=request
    )


async def registrar_triaje(
    db: Session,
    paciente_id: int,
    episodio_id: int,
    datos_triaje: dict,
    usuario_id: int,
    usuario_nombre: str,
    request: Optional[Request] = None
):
    """Registrar asignación de triaje"""
    
    color = datos_triaje.get('color', 'Sin color')
    titulo = f"Triaje asignado: {color}"
    
    await HistoriaClinicaService.registrar_en_historia(
        db=db,
        paciente_id=paciente_id,
        episodio_id=episodio_id,
        tipo_registro=TipoRegistro.TRIAJE_ASIGNADO,
        titulo=titulo,
        contenido_datos=datos_triaje,
        usuario_id=usuario_id,
        usuario_nombre=usuario_nombre,
        request=request
    ) 