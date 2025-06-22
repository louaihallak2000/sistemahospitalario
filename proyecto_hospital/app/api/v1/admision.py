from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.core.database import get_db
from app.api.v1.auth import get_hospital_id, get_current_user_token
from app.schemas.admision import (
    RegistroAdmisionCreate, RegistroAdmisionUpdate, RegistroAdmisionResponse,
    RegistroAdmisionCompleto, PacienteAdmisionUpdate
)
from app.models.admision import RegistroAdmision
from app.models.paciente import Paciente, PacienteHospital
from app.models.episodio import Episodio

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=RegistroAdmisionResponse)
async def crear_registro_admision(
    admision_data: RegistroAdmisionCreate,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear un nuevo registro de admisión"""
    try:
        logger.debug(f"Creando registro de admisión para episodio: {admision_data.episodio_id}")
        
        # Verificar que el episodio pertenece al hospital
        episodio = db.query(Episodio).filter(
            Episodio.id == admision_data.episodio_id,
            Episodio.hospital_id == hospital_id
        ).first()
        
        if not episodio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Episodio no encontrado en este hospital"
            )
        
        # Crear registro de admisión
        registro_admision = RegistroAdmision(
            **admision_data.dict(),
            hospital_id=hospital_id,
            usuario_admision=auth_data.get("username", "Usuario")
        )
        
        db.add(registro_admision)
        db.commit()
        db.refresh(registro_admision)
        
        logger.info(f"Registro de admisión creado exitosamente: {registro_admision.id}")
        return registro_admision
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando registro de admisión: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear registro de admisión: {str(e)}"
        )

@router.get("/", response_model=List[RegistroAdmisionCompleto])
async def obtener_registros_admision(
    estado: Optional[str] = None,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener registros de admisión del hospital"""
    try:
        logger.debug(f"Obteniendo registros de admisión - hospital: {hospital_id}, estado: {estado}")
        
        # Query base con filtro por hospital
        query = db.query(
            RegistroAdmision,
            Paciente.nombre_completo.label('paciente_nombre'),
            Paciente.dni.label('paciente_dni'),
            Episodio.numero_episodio_local.label('episodio_numero')
        ).join(
            Paciente, RegistroAdmision.paciente_id == Paciente.id
        ).join(
            Episodio, RegistroAdmision.episodio_id == Episodio.id
        ).filter(
            RegistroAdmision.hospital_id == hospital_id
        )
        
        # Filtrar por estado si se especifica
        if estado:
            query = query.filter(RegistroAdmision.estado_admision == estado)
        
        resultados = query.order_by(RegistroAdmision.fecha_admision.desc()).all()
        
        # Construir respuesta
        registros = []
        for registro, paciente_nombre, paciente_dni, episodio_numero in resultados:
            registro_dict = {
                **registro.__dict__,
                'paciente_nombre': paciente_nombre,
                'paciente_dni': paciente_dni,
                'episodio_numero': episodio_numero
            }
            registros.append(RegistroAdmisionCompleto(**registro_dict))
        
        logger.debug(f"Encontrados {len(registros)} registros de admisión")
        return registros
        
    except Exception as e:
        logger.error(f"Error obteniendo registros de admisión: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener registros de admisión: {str(e)}"
        )

@router.get("/{registro_id}", response_model=RegistroAdmisionCompleto)
async def obtener_registro_admision(
    registro_id: str,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener un registro de admisión específico"""
    try:
        resultado = db.query(
            RegistroAdmision,
            Paciente.nombre_completo.label('paciente_nombre'),
            Paciente.dni.label('paciente_dni'),
            Episodio.numero_episodio_local.label('episodio_numero')
        ).join(
            Paciente, RegistroAdmision.paciente_id == Paciente.id
        ).join(
            Episodio, RegistroAdmision.episodio_id == Episodio.id
        ).filter(
            RegistroAdmision.id == registro_id,
            RegistroAdmision.hospital_id == hospital_id
        ).first()
        
        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registro de admisión no encontrado"
            )
        
        registro, paciente_nombre, paciente_dni, episodio_numero = resultado
        registro_dict = {
            **registro.__dict__,
            'paciente_nombre': paciente_nombre,
            'paciente_dni': paciente_dni,
            'episodio_numero': episodio_numero
        }
        
        return RegistroAdmisionCompleto(**registro_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo registro de admisión: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener registro de admisión: {str(e)}"
        )

@router.put("/{registro_id}", response_model=RegistroAdmisionResponse)
async def actualizar_registro_admision(
    registro_id: str,
    admision_data: RegistroAdmisionUpdate,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Actualizar un registro de admisión"""
    try:
        registro = db.query(RegistroAdmision).filter(
            RegistroAdmision.id == registro_id,
            RegistroAdmision.hospital_id == hospital_id
        ).first()
        
        if not registro:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registro de admisión no encontrado"
            )
        
        # Actualizar campos
        for field, value in admision_data.dict(exclude_unset=True).items():
            setattr(registro, field, value)
        
        db.commit()
        db.refresh(registro)
        
        logger.info(f"Registro de admisión actualizado: {registro_id}")
        return registro
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando registro de admisión: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar registro de admisión: {str(e)}"
        )

@router.put("/paciente/{paciente_id}/datos-admision")
async def actualizar_datos_paciente_admision(
    paciente_id: str,
    datos: PacienteAdmisionUpdate,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Actualizar datos extendidos del paciente para admisión"""
    try:
        # Buscar relación paciente-hospital
        paciente_hospital = db.query(PacienteHospital).filter(
            PacienteHospital.paciente_id == paciente_id,
            PacienteHospital.hospital_id == hospital_id
        ).first()
        
        if not paciente_hospital:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paciente no encontrado en este hospital"
            )
        
        # Actualizar campos extendidos
        for field, value in datos.dict(exclude_unset=True).items():
            setattr(paciente_hospital, field, value)
        
        db.commit()
        
        logger.info(f"Datos de admisión del paciente actualizados: {paciente_id}")
        return {"message": "Datos de paciente actualizados exitosamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando datos de paciente: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar datos del paciente: {str(e)}"
        ) 