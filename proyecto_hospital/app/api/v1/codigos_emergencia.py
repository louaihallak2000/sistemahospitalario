from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Optional
from datetime import datetime, timedelta
import json

from app.core.database import get_db
from app.api.v1.auth import get_current_user_token
from app.models.codigo_emergencia import CodigoEmergencia, EpisodioEmergencia
from app.models.paciente import Paciente
from app.models.hospital import Hospital
from pydantic import BaseModel

router = APIRouter()

# SCHEMAS PARA CÓDIGOS DE EMERGENCIA

class CodigoEmergenciaCreate(BaseModel):
    tipo_codigo: str  # AZUL, ACV, IAM, TRAUMA, SEPSIS, PEDIATRICO, OBSTETRICO
    descripcion: str
    ubicacion: Optional[str] = None
    datos_paciente_temporales: Optional[dict] = None

class CodigoEmergenciaResponse(BaseModel):
    id: str
    tipo_codigo: str
    descripcion: str
    ubicacion: Optional[str]
    activado_por: str
    fecha_activacion: datetime
    estado: str
    tiempo_transcurrido: Optional[int]  # minutos desde activación
    personal_respondio: Optional[list]
    
    class Config:
        from_attributes = True

class CodigoEmergenciaUpdate(BaseModel):
    estado: Optional[str] = None
    notas_evento: Optional[str] = None
    resultado: Optional[str] = None
    personal_respondio: Optional[list] = None

class EpisodioEmergenciaCreate(BaseModel):
    codigo_emergencia_id: str
    paciente_id: Optional[str] = None

# ENDPOINTS PRINCIPALES

@router.get("/tipos-codigo", response_model=List[dict])
async def get_tipos_codigo():
    """Obtener tipos de códigos de emergencia disponibles"""
    tipos = [
        {"codigo": "AZUL", "descripcion": "Paro cardiorrespiratorio (RCP inmediato)", "color": "#1e40af"},
        {"codigo": "ACV", "descripcion": "Accidente cerebrovascular (protocolo stroke)", "color": "#7c2d12"},
        {"codigo": "IAM", "descripcion": "Infarto agudo de miocardio (protocolo cardíaco)", "color": "#dc2626"},
        {"codigo": "TRAUMA", "descripcion": "Trauma mayor/politraumatismo", "color": "#ea580c"},
        {"codigo": "SEPSIS", "descripcion": "Sepsis severa (protocolo antibiótico)", "color": "#16a34a"},
        {"codigo": "PEDIATRICO", "descripcion": "Emergencia pediátrica", "color": "#c084fc"},
        {"codigo": "OBSTETRICO", "descripcion": "Emergencia obstétrica", "color": "#f59e0b"}
    ]
    return tipos

@router.post("/activar", response_model=CodigoEmergenciaResponse)
async def activar_codigo_emergencia(
    codigo_data: CodigoEmergenciaCreate,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Activar un código de emergencia"""
    hospital_id = auth_data["hospital_id"]
    username = auth_data["username"]
    
    # Validar tipo de código
    tipos_validos = ["AZUL", "ACV", "IAM", "TRAUMA", "SEPSIS", "PEDIATRICO", "OBSTETRICO"]
    if codigo_data.tipo_codigo not in tipos_validos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de código no válido"
        )
    
    # Crear código de emergencia
    codigo = CodigoEmergencia(
        hospital_id=hospital_id,
        tipo_codigo=codigo_data.tipo_codigo,
        descripcion=codigo_data.descripcion,
        ubicacion=codigo_data.ubicacion,
        activado_por=username,
        datos_paciente_temporales=json.dumps(codigo_data.datos_paciente_temporales or {})
    )
    
    db.add(codigo)
    db.commit()
    db.refresh(codigo)
    
    # Crear episodio de emergencia automáticamente
    episodio_emergencia = EpisodioEmergencia(
        codigo_emergencia_id=codigo.id,
        hospital_id=hospital_id,
        estado="codigo_activo"
    )
    
    db.add(episodio_emergencia)
    db.commit()
    
    # Calcular tiempo transcurrido
    tiempo_transcurrido = int((datetime.utcnow() - codigo.fecha_activacion).total_seconds() / 60)
    
    # TODO: Enviar notificación WebSocket a todo el personal
    # await websocket_manager.broadcast_codigo_emergencia(hospital_id, codigo)
    
    return CodigoEmergenciaResponse(
        id=codigo.id,
        tipo_codigo=codigo.tipo_codigo,
        descripcion=codigo.descripcion,
        ubicacion=codigo.ubicacion,
        activado_por=codigo.activado_por,
        fecha_activacion=codigo.fecha_activacion,
        estado=codigo.estado,
        tiempo_transcurrido=tiempo_transcurrido,
        personal_respondio=json.loads(codigo.personal_respondio or "[]")
    )

@router.get("/activos", response_model=List[CodigoEmergenciaResponse])
async def get_codigos_activos(
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener códigos de emergencia activos"""
    hospital_id = auth_data["hospital_id"]
    
    codigos = db.query(CodigoEmergencia).filter(
        and_(
            CodigoEmergencia.hospital_id == hospital_id,
            CodigoEmergencia.estado.in_(["activo", "atendido"])
        )
    ).order_by(desc(CodigoEmergencia.fecha_activacion)).all()
    
    response = []
    for codigo in codigos:
        tiempo_transcurrido = int((datetime.utcnow() - codigo.fecha_activacion).total_seconds() / 60)
        response.append(CodigoEmergenciaResponse(
            id=codigo.id,
            tipo_codigo=codigo.tipo_codigo,
            descripcion=codigo.descripcion,
            ubicacion=codigo.ubicacion,
            activado_por=codigo.activado_por,
            fecha_activacion=codigo.fecha_activacion,
            estado=codigo.estado,
            tiempo_transcurrido=tiempo_transcurrido,
            personal_respondio=json.loads(codigo.personal_respondio or "[]")
        ))
    
    return response

@router.put("/responder/{codigo_id}")
async def responder_codigo(
    codigo_id: str,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Registrar que el personal respondió al código"""
    hospital_id = auth_data["hospital_id"]
    username = auth_data["username"]
    
    codigo = db.query(CodigoEmergencia).filter(
        and_(
            CodigoEmergencia.id == codigo_id,
            CodigoEmergencia.hospital_id == hospital_id
        )
    ).first()
    
    if not codigo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Código de emergencia no encontrado"
        )
    
    # Agregar personal que respondió
    personal_actual = json.loads(codigo.personal_respondio or "[]")
    if username not in [p.get("usuario") for p in personal_actual]:
        personal_actual.append({
            "usuario": username,
            "fecha_respuesta": datetime.utcnow().isoformat(),
            "tiempo_respuesta": int((datetime.utcnow() - codigo.fecha_activacion).total_seconds() / 60)
        })
        codigo.personal_respondio = json.dumps(personal_actual)
    
    # Si es la primera respuesta, actualizar estado
    if codigo.estado == "activo":
        codigo.estado = "atendido"
        tiempo_primera_respuesta = int((datetime.utcnow() - codigo.fecha_activacion).total_seconds() / 60)
        codigo.tiempo_respuesta = f"{tiempo_primera_respuesta} min"
    
    db.commit()
    
    return {"message": "Respuesta registrada exitosamente"}

@router.put("/cerrar/{codigo_id}")
async def cerrar_codigo(
    codigo_id: str,
    codigo_update: CodigoEmergenciaUpdate,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Cerrar un código de emergencia"""
    hospital_id = auth_data["hospital_id"]
    
    codigo = db.query(CodigoEmergencia).filter(
        and_(
            CodigoEmergencia.id == codigo_id,
            CodigoEmergencia.hospital_id == hospital_id
        )
    ).first()
    
    if not codigo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Código de emergencia no encontrado"
        )
    
    # Actualizar código
    codigo.estado = "cerrado"
    codigo.fecha_cierre = datetime.utcnow()
    if codigo_update.notas_evento:
        codigo.notas_evento = codigo_update.notas_evento
    if codigo_update.resultado:
        codigo.resultado = codigo_update.resultado
    
    # Cerrar episodio de emergencia
    episodio = db.query(EpisodioEmergencia).filter(
        EpisodioEmergencia.codigo_emergencia_id == codigo_id
    ).first()
    
    if episodio:
        episodio.estado = "cerrado"
        episodio.fecha_cierre = datetime.utcnow()
        episodio.resultado_final = codigo_update.resultado
    
    db.commit()
    
    return {"message": "Código de emergencia cerrado exitosamente"}

@router.get("/historial", response_model=List[CodigoEmergenciaResponse])
async def get_historial_codigos(
    dias: int = 7,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener historial de códigos de emergencia"""
    hospital_id = auth_data["hospital_id"]
    fecha_limite = datetime.utcnow() - timedelta(days=dias)
    
    codigos = db.query(CodigoEmergencia).filter(
        and_(
            CodigoEmergencia.hospital_id == hospital_id,
            CodigoEmergencia.fecha_activacion >= fecha_limite
        )
    ).order_by(desc(CodigoEmergencia.fecha_activacion)).all()
    
    response = []
    for codigo in codigos:
        if codigo.fecha_cierre:
            tiempo_transcurrido = int((codigo.fecha_cierre - codigo.fecha_activacion).total_seconds() / 60)
        else:
            tiempo_transcurrido = int((datetime.utcnow() - codigo.fecha_activacion).total_seconds() / 60)
            
        response.append(CodigoEmergenciaResponse(
            id=codigo.id,
            tipo_codigo=codigo.tipo_codigo,
            descripcion=codigo.descripcion,
            ubicacion=codigo.ubicacion,
            activado_por=codigo.activado_por,
            fecha_activacion=codigo.fecha_activacion,
            estado=codigo.estado,
            tiempo_transcurrido=tiempo_transcurrido,
            personal_respondio=json.loads(codigo.personal_respondio or "[]")
        ))
    
    return response

@router.post("/episodio/{codigo_id}/asociar-paciente")
async def asociar_paciente_codigo(
    codigo_id: str,
    paciente_id: str,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Asociar un paciente a un código de emergencia"""
    hospital_id = auth_data["hospital_id"]
    
    # Verificar código
    codigo = db.query(CodigoEmergencia).filter(
        and_(
            CodigoEmergencia.id == codigo_id,
            CodigoEmergencia.hospital_id == hospital_id
        )
    ).first()
    
    if not codigo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Código de emergencia no encontrado"
        )
    
    # Verificar paciente
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado"
        )
    
    # Asociar paciente al código
    codigo.paciente_id = paciente_id
    
    # Actualizar episodio de emergencia
    episodio = db.query(EpisodioEmergencia).filter(
        EpisodioEmergencia.codigo_emergencia_id == codigo_id
    ).first()
    
    if episodio:
        episodio.paciente_id = paciente_id
    
    db.commit()
    
    return {"message": "Paciente asociado al código exitosamente"}

@router.get("/estadisticas")
async def get_estadisticas_codigos(
    dias: int = 30,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener estadísticas de códigos de emergencia"""
    hospital_id = auth_data["hospital_id"]
    fecha_limite = datetime.utcnow() - timedelta(days=dias)
    
    # Códigos por tipo
    codigos = db.query(CodigoEmergencia).filter(
        and_(
            CodigoEmergencia.hospital_id == hospital_id,
            CodigoEmergencia.fecha_activacion >= fecha_limite
        )
    ).all()
    
    estadisticas = {
        "total_codigos": len(codigos),
        "codigos_por_tipo": {},
        "tiempo_respuesta_promedio": 0,
        "codigos_activos": 0
    }
    
    for codigo in codigos:
        # Por tipo
        if codigo.tipo_codigo not in estadisticas["codigos_por_tipo"]:
            estadisticas["codigos_por_tipo"][codigo.tipo_codigo] = 0
        estadisticas["codigos_por_tipo"][codigo.tipo_codigo] += 1
        
        # Activos
        if codigo.estado in ["activo", "atendido"]:
            estadisticas["codigos_activos"] += 1
    
    return estadisticas 