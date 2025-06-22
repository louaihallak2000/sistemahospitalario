from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import logging

from app.core.database import get_db
from app.api.v1.auth import get_hospital_id, get_current_user_token
from app.schemas.episodio import (
    EpisodioCreate, EpisodioResponse, EpisodioListaEspera, EstadisticasHospital
)
from app.schemas.paciente import TriageColor
from app.services.paciente_service import PacienteService
from app.models.episodio import Episodio

router = APIRouter()
logger = logging.getLogger(__name__)

# 💊 SCHEMAS PARA PRESCRIPCIONES
class PrescriptionCreate(BaseModel):
    medication: str
    dose: str
    frequency: str
    route: str
    duration: str
    instructions: str = ""

class PrescriptionResponse(BaseModel):
    id: str
    medication: str
    dose: str
    frequency: str
    route: str
    duration: str
    instructions: str
    status: str
    prescribedBy: str
    prescribedAt: str

# 🔬 SCHEMAS PARA ESTUDIOS
class StudyCreate(BaseModel):
    name: str
    type: str  # "laboratory" o "imaging"
    priority: str = "normal"  # "normal", "urgent", "emergency"
    observations: str = ""

class StudyResponse(BaseModel):
    id: str
    name: str
    type: str
    status: str
    priority: str
    orderedBy: str
    orderedAt: str
    observations: str

@router.get("/", response_model=List[EpisodioResponse])
async def get_episodios(
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener todos los episodios del hospital"""
    try:
        logger.debug(f"Obteniendo episodios para hospital: {hospital_id}")
        episodios = db.query(Episodio).filter(
            Episodio.hospital_id == hospital_id
        ).all()
        logger.debug(f"Encontrados {len(episodios)} episodios")
        return episodios
    except Exception as e:
        logger.error(f"Error obteniendo episodios: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener episodios: {str(e)}"
        )

@router.get("/sin-triaje", response_model=List[EpisodioListaEspera])
async def get_lista_espera_sin_triaje(
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener la lista de espera de pacientes activos SIN triaje asignado."""
    try:
        # Llama al servicio, indicando que queremos la lista sin triaje
        result = PacienteService.get_lista_espera(db, hospital_id, estado="activo", con_triaje=False)
        logger.info(f"Obtenida lista sin triaje: {len(result)} episodios")
        return result
    except Exception as e:
        logger.error(f"Error en lista sin triaje: {e}", exc_info=True)
        return []

@router.get("/lista-espera", response_model=List[EpisodioListaEspera])
async def get_lista_espera(
    estado: str = Query(default="activo", description="Estado de los episodios a filtrar"),
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener la lista de espera de episodios para el hospital actual"""
    try:
        logger.debug(f"Obteniendo lista de espera - hospital_id: {hospital_id}, estado: {estado}")
        # Llama al servicio, indicando que queremos la lista CON triaje
        result = PacienteService.get_lista_espera(db, hospital_id, estado, con_triaje=True)
        logger.info(f"Lista espera obtenida: {len(result)} episodios")
        return result
    except Exception as e:
        logger.error(f"Error en lista de espera: {e}", exc_info=True)
        # Retornar lista vacía en caso de error
        return []

@router.get("/estadisticas", response_model=EstadisticasHospital)
async def get_estadisticas_hospital(
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener estadísticas del hospital actual"""
    try:
        import traceback
        print(f"🔍 GET /estadisticas - hospital_id: {hospital_id}")
        print(f"🔍 Auth data: {auth_data}")
        
        result = PacienteService.get_estadisticas_hospital(db, hospital_id)
        print(f"✅ Estadísticas obtenidas correctamente")
        return result
    except Exception as e:
        print(f"❌ ERROR en estadísticas: {type(e).__name__}: {e}")
        print(f"🔍 Traceback completo:")
        traceback.print_exc()
        # Retornar estadísticas vacías en caso de error
        from app.schemas.episodio import EstadisticasTriaje, EstadisticasHospital
        return EstadisticasHospital(
            triageStats=EstadisticasTriaje(),
            alerts=[],
            total_pacientes_espera=0,
            promedio_tiempo_espera=0.0
        )

@router.post("/", response_model=EpisodioResponse)
async def create_episodio(
    episodio_data: EpisodioCreate,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear un nuevo episodio médico"""
    return PacienteService.create_episodio(db, episodio_data, hospital_id)

# 💊 ENDPOINTS PARA PRESCRIPCIONES
@router.post("/{episodio_id}/prescripciones", response_model=PrescriptionResponse)
async def create_prescription(
    episodio_id: str,
    prescription_data: PrescriptionCreate,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear una nueva prescripción para un episodio"""
    # 🔧 IMPLEMENTACIÓN TEMPORAL - Guardar en datos_json del episodio
    import json
    from datetime import datetime
    from app.models.episodio import Episodio
    
    # Buscar episodio
    episodio = db.query(Episodio).filter(
        Episodio.id == episodio_id,
        Episodio.hospital_id == hospital_id
    ).first()
    
    if not episodio:
        raise HTTPException(status_code=404, detail="Episodio no encontrado")
    
    # Obtener prescripciones existentes
    datos_json = json.loads(episodio.datos_json) if episodio.datos_json else {}
    prescriptions = datos_json.get("prescriptions", [])
    
    # Crear nueva prescripción
    new_prescription = {
        "id": f"pre_{int(datetime.now().timestamp() * 1000)}",
        "medication": prescription_data.medication,
        "dose": prescription_data.dose,
        "frequency": prescription_data.frequency,
        "route": prescription_data.route,
        "duration": prescription_data.duration,
        "instructions": prescription_data.instructions,
        "status": "active",
        "prescribedBy": auth_data.get("username", "Médico"),
        "prescribedAt": datetime.now().isoformat(),
        "stockAvailable": 100  # Mock
    }
    
    # Agregar a la lista
    prescriptions.append(new_prescription)
    datos_json["prescriptions"] = prescriptions
    
    # Guardar en base de datos
    episodio.datos_json = json.dumps(datos_json)
    db.commit()
    
    return PrescriptionResponse(**new_prescription)

@router.get("/{episodio_id}/prescripciones", response_model=List[PrescriptionResponse])
async def get_prescriptions(
    episodio_id: str,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener todas las prescripciones de un episodio"""
    import json
    from app.models.episodio import Episodio
    
    episodio = db.query(Episodio).filter(
        Episodio.id == episodio_id,
        Episodio.hospital_id == hospital_id
    ).first()
    
    if not episodio:
        raise HTTPException(status_code=404, detail="Episodio no encontrado")
    
    datos_json = json.loads(episodio.datos_json) if episodio.datos_json else {}
    prescriptions = datos_json.get("prescriptions", [])
    
    return [PrescriptionResponse(**p) for p in prescriptions]

# 🔬 ENDPOINTS PARA ESTUDIOS
@router.post("/{episodio_id}/estudios", response_model=StudyResponse)
async def create_study(
    episodio_id: str,
    study_data: StudyCreate,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear un nueva orden de estudio para un episodio"""
    import json
    from datetime import datetime
    from app.models.episodio import Episodio
    
    # Buscar episodio
    episodio = db.query(Episodio).filter(
        Episodio.id == episodio_id,
        Episodio.hospital_id == hospital_id
    ).first()
    
    if not episodio:
        raise HTTPException(status_code=404, detail="Episodio no encontrado")
    
    # Obtener estudios existentes
    datos_json = json.loads(episodio.datos_json) if episodio.datos_json else {}
    studies = datos_json.get("studies", [])
    
    # Crear nuevo estudio
    new_study = {
        "id": f"stu_{int(datetime.now().timestamp() * 1000)}",
        "name": study_data.name,
        "type": study_data.type,
        "status": "pending",
        "priority": study_data.priority,
        "orderedBy": auth_data.get("username", "Médico"),
        "orderedAt": datetime.now().isoformat(),
        "observations": study_data.observations
    }
    
    # Agregar a la lista
    studies.append(new_study)
    datos_json["studies"] = studies
    
    # Guardar en base de datos
    episodio.datos_json = json.dumps(datos_json)
    db.commit()
    
    return StudyResponse(**new_study)

@router.get("/{episodio_id}/estudios", response_model=List[StudyResponse])
async def get_studies(
    episodio_id: str,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener todos los estudios de un episodio"""
    import json
    from app.models.episodio import Episodio
    
    episodio = db.query(Episodio).filter(
        Episodio.id == episodio_id,
        Episodio.hospital_id == hospital_id
    ).first()
    
    if not episodio:
        raise HTTPException(status_code=404, detail="Episodio no encontrado")
    
    datos_json = json.loads(episodio.datos_json) if episodio.datos_json else {}
    studies = datos_json.get("studies", [])
    
    return [StudyResponse(**s) for s in studies]

@router.put("/{episodio_id}/estudios/{estudio_id}/estado")
async def update_study_status(
    episodio_id: str,
    estudio_id: str,
    new_status: dict,  # {"status": "pending|sent|completed"}
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Actualizar el estado de un estudio"""
    import json
    from datetime import datetime
    from app.models.episodio import Episodio
    
    episodio = db.query(Episodio).filter(
        Episodio.id == episodio_id,
        Episodio.hospital_id == hospital_id
    ).first()
    
    if not episodio:
        raise HTTPException(status_code=404, detail="Episodio no encontrado")
    
    datos_json = json.loads(episodio.datos_json) if episodio.datos_json else {}
    studies = datos_json.get("studies", [])
    
    # Buscar y actualizar el estudio
    for study in studies:
        if study["id"] == estudio_id:
            study["status"] = new_status.get("status", study["status"])
            if new_status.get("status") == "completed":
                study["resultDate"] = datetime.now().isoformat()
            break
    else:
        raise HTTPException(status_code=404, detail="Estudio no encontrado")
    
    # Guardar cambios
    datos_json["studies"] = studies
    episodio.datos_json = json.dumps(datos_json)
    db.commit()
    
    return {"message": "Estado actualizado correctamente"}

class TriageUpdateRequest(BaseModel):
    color: TriageColor

@router.put("/{episodio_id}/triage", response_model=EpisodioResponse)
async def update_triaje_color(
    episodio_id: str,
    request_data: TriageUpdateRequest,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """
    Endpoint para actualizar el color de triaje de un episodio.
    - Recibe un objeto con el color de triaje.
    - Devuelve el episodio actualizado.
    """
    print(f"🎨 DEBUG - update_triaje_color")
    print(f"   episodio_id: {episodio_id}")
    print(f"   request_data: {request_data}")
    print(f"   color: {request_data.color}")
    print(f"   hospital_id: {hospital_id}")
    
    try:
        result = PacienteService.update_triaje_color(db, episodio_id, hospital_id, request_data.color)
        print(f"✅ Triaje actualizado exitosamente")
        return result
    except Exception as e:
        print(f"❌ Error en servicio: {e}")
        raise 