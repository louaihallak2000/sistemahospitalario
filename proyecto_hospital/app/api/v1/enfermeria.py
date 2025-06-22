from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import logging
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.v1.auth import get_hospital_id, get_current_user_token
from app.schemas.enfermeria import (
    SignosVitalesCreate, SignosVitalesUpdate, SignosVitalesResponse,
    RegistroEnfermeriaCreate, RegistroEnfermeriaUpdate, RegistroEnfermeriaResponse,
    VistaEnfermeriaCompleta
)
from app.models.enfermeria import SignosVitales, RegistroEnfermeria
from app.models.paciente import Paciente
from app.models.episodio import Episodio

router = APIRouter()
logger = logging.getLogger(__name__)

# ==================== ENDPOINTS SIGNOS VITALES ====================

@router.post("/signos-vitales", response_model=SignosVitalesResponse)
async def registrar_signos_vitales(
    signos_data: SignosVitalesCreate,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Registrar signos vitales para un episodio"""
    try:
        logger.debug(f"Registrando signos vitales para episodio: {signos_data.episodio_id}")
        
        # Verificar que el episodio pertenece al hospital
        episodio = db.query(Episodio).filter(
            Episodio.id == signos_data.episodio_id,
            Episodio.hospital_id == hospital_id
        ).first()
        
        if not episodio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Episodio no encontrado en este hospital"
            )
        
        # Crear registro de signos vitales
        signos_vitales = SignosVitales(
            **signos_data.dict(),
            hospital_id=hospital_id,
            usuario_registro=auth_data.get("username", "Enfermero/a")
        )
        
        db.add(signos_vitales)
        db.commit()
        db.refresh(signos_vitales)
        
        logger.info(f"Signos vitales registrados exitosamente: {signos_vitales.id}")
        return signos_vitales
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registrando signos vitales: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar signos vitales: {str(e)}"
        )

@router.get("/signos-vitales/episodio/{episodio_id}", response_model=List[SignosVitalesResponse])
async def obtener_signos_vitales_episodio(
    episodio_id: str,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener todos los signos vitales de un episodio"""
    try:
        # Verificar que el episodio pertenece al hospital
        episodio = db.query(Episodio).filter(
            Episodio.id == episodio_id,
            Episodio.hospital_id == hospital_id
        ).first()
        
        if not episodio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Episodio no encontrado en este hospital"
            )
        
        signos_vitales = db.query(SignosVitales).filter(
            SignosVitales.episodio_id == episodio_id,
            SignosVitales.hospital_id == hospital_id
        ).order_by(desc(SignosVitales.fecha_hora_registro)).all()
        
        return signos_vitales
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo signos vitales: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener signos vitales: {str(e)}"
        )

# ==================== ENDPOINTS REGISTROS ENFERMERÍA ====================

@router.post("/registros", response_model=RegistroEnfermeriaResponse)
async def crear_registro_enfermeria(
    registro_data: RegistroEnfermeriaCreate,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear un nuevo registro de enfermería"""
    try:
        logger.debug(f"Creando registro de enfermería para episodio: {registro_data.episodio_id}")
        
        # Verificar que el episodio pertenece al hospital
        episodio = db.query(Episodio).filter(
            Episodio.id == registro_data.episodio_id,
            Episodio.hospital_id == hospital_id
        ).first()
        
        if not episodio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Episodio no encontrado en este hospital"
            )
        
        # Crear registro de enfermería
        registro = RegistroEnfermeria(
            **registro_data.dict(),
            hospital_id=hospital_id,
            usuario_registro=auth_data.get("username", "Enfermero/a")
        )
        
        db.add(registro)
        db.commit()
        db.refresh(registro)
        
        logger.info(f"Registro de enfermería creado exitosamente: {registro.id}")
        return registro
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando registro de enfermería: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear registro de enfermería: {str(e)}"
        )

@router.get("/registros/episodio/{episodio_id}", response_model=List[RegistroEnfermeriaResponse])
async def obtener_registros_enfermeria_episodio(
    episodio_id: str,
    tipo_registro: Optional[str] = Query(None, description="Filtrar por tipo de registro"),
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener registros de enfermería de un episodio"""
    try:
        # Verificar que el episodio pertenece al hospital
        episodio = db.query(Episodio).filter(
            Episodio.id == episodio_id,
            Episodio.hospital_id == hospital_id
        ).first()
        
        if not episodio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Episodio no encontrado en este hospital"
            )
        
        query = db.query(RegistroEnfermeria).filter(
            RegistroEnfermeria.episodio_id == episodio_id,
            RegistroEnfermeria.hospital_id == hospital_id
        )
        
        if tipo_registro:
            query = query.filter(RegistroEnfermeria.tipo_registro == tipo_registro)
        
        registros = query.order_by(desc(RegistroEnfermeria.fecha_hora_registro)).all()
        
        return registros
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo registros de enfermería: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener registros de enfermería: {str(e)}"
        )

# ==================== DASHBOARD ENFERMERÍA ====================

@router.get("/dashboard", response_model=List[VistaEnfermeriaCompleta])
async def obtener_dashboard_enfermeria(
    estado_episodio: str = Query("activo", description="Estado de los episodios"),
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener vista completa para el dashboard de enfermería"""
    try:
        logger.debug(f"Obteniendo dashboard de enfermería - hospital: {hospital_id}")
        
        # Obtener episodios activos con información del paciente
        episodios = db.query(
            Episodio.id.label('episodio_id'),
            Paciente.nombre_completo.label('paciente_nombre'),
            Paciente.dni.label('paciente_dni'),
            Episodio.numero_episodio_local.label('habitacion')
        ).join(
            Paciente, Episodio.paciente_id == Paciente.id
        ).filter(
            Episodio.hospital_id == hospital_id,
            Episodio.estado == estado_episodio
        ).all()
        
        dashboard_data = []
        
        for episodio in episodios:
            # Obtener últimos signos vitales
            ultimo_signos = db.query(SignosVitales).filter(
                SignosVitales.episodio_id == episodio.episodio_id,
                SignosVitales.hospital_id == hospital_id
            ).order_by(desc(SignosVitales.fecha_hora_registro)).first()
            
            # Obtener registros recientes (últimas 24 horas)
            hace_24h = datetime.utcnow() - timedelta(hours=24)
            registros_recientes = db.query(RegistroEnfermeria).filter(
                RegistroEnfermeria.episodio_id == episodio.episodio_id,
                RegistroEnfermeria.hospital_id == hospital_id,
                RegistroEnfermeria.fecha_hora_registro >= hace_24h
            ).order_by(desc(RegistroEnfermeria.fecha_hora_registro)).limit(5).all()
            
            # Calcular tiempo desde último registro
            tiempo_ultimo_registro = None
            if registros_recientes:
                ultimo_registro = registros_recientes[0]
                delta = datetime.utcnow() - ultimo_registro.fecha_hora_registro
                tiempo_ultimo_registro = int(delta.total_seconds() / 60)  # minutos
            
            dashboard_item = VistaEnfermeriaCompleta(
                episodio_id=episodio.episodio_id,
                paciente_nombre=episodio.paciente_nombre,
                paciente_dni=episodio.paciente_dni,
                habitacion=episodio.habitacion,
                ultimo_signos_vitales=ultimo_signos,
                registros_recientes=registros_recientes,
                tiempo_desde_ultimo_registro=tiempo_ultimo_registro
            )
            
            dashboard_data.append(dashboard_item)
        
        logger.debug(f"Dashboard generado con {len(dashboard_data)} episodios")
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Error obteniendo dashboard de enfermería: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener dashboard de enfermería: {str(e)}"
        ) 