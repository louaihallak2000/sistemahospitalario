from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from fastapi.security import HTTPBearer
import logging
import sys
import os
# Agregar el directorio proyecto_hospital al path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
from websocket.manager import manager
from app.core.security import decode_token
import json

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    user_id: str,
    role: str = Query(..., description="Rol del usuario (medico, enfermera, admin)"),
    area: str = Query("emergencia", description="Área del hospital"),
    token: str = Query(..., description="Token de autenticación")
):
    """
    Endpoint WebSocket para notificaciones en tiempo real
    
    Parámetros:
    - user_id: ID único del usuario
    - role: Rol del usuario (medico, enfermera, admin)  
    - area: Área del hospital (emergencia por defecto)
    - token: Token JWT para autenticación
    """
    
    # Validar token de autenticación
    try:
        payload = decode_token(token)
        if not payload:
            await websocket.close(code=4001, reason="Token inválido")
            return
            
        # Verificar que el user_id coincida con el token
        token_user_id = str(payload.get("user_id", ""))
        if token_user_id != user_id:
            await websocket.close(code=4002, reason="User ID no coincide con token")
            return
            
    except Exception as e:
        logger.error(f"❌ Error validando token WebSocket: {e}")
        await websocket.close(code=4003, reason="Error de autenticación")
        return
    
    # Conectar usuario
    await manager.connect(websocket, user_id, role, area)
    
    try:
        # Enviar mensaje de bienvenida
        await manager.send_to_user(user_id, {
            "type": "connection_success",
            "data": {
                "message": f"Conectado exitosamente como {role} en área {area}",
                "user_id": user_id,
                "role": role,
                "area": area,
                "stats": manager.get_connection_stats()
            }
        })
        
        # Mantener conexión viva
        while True:
            try:
                # Recibir mensajes del cliente (ping, heartbeat, etc.)
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Manejar diferentes tipos de mensajes
                if message.get("type") == "ping":
                    await manager.send_to_user(user_id, {
                        "type": "pong",
                        "data": {"timestamp": manager.get_connection_stats()["timestamp"]}
                    })
                elif message.get("type") == "get_stats":
                    await manager.send_to_user(user_id, {
                        "type": "stats",
                        "data": manager.get_connection_stats()
                    })
                else:
                    logger.debug(f"Mensaje recibido de {user_id}: {message}")
                    
            except Exception as e:
                logger.error(f"❌ Error procesando mensaje de {user_id}: {e}")
                break
                
    except WebSocketDisconnect:
        logger.info(f"🔌 Usuario {user_id} desconectado")
    except Exception as e:
        logger.error(f"❌ Error en WebSocket de {user_id}: {e}")
    finally:
        await manager.disconnect(websocket, user_id, role, area)

@router.get("/ws/stats")
async def get_websocket_stats():
    """Obtener estadísticas de conexiones WebSocket"""
    return manager.get_connection_stats()

@router.post("/ws/broadcast")
async def broadcast_message(
    message: dict,
    target_type: str = Query(..., description="Tipo de broadcast: all, role, area, user"),
    target_value: str = Query(None, description="Valor del target (role, area o user_id)"),
    # current_user: dict = Depends(get_current_user)  # Uncomment when auth is ready
):
    """
    Enviar mensaje broadcast a usuarios conectados
    
    Parámetros:
    - message: Mensaje a enviar
    - target_type: Tipo de destinatarios (all, role, area, user)
    - target_value: Valor específico según el tipo
    """
    
    try:
        if target_type == "all":
            await manager.broadcast_all(message)
        elif target_type == "role":
            if target_value == "medico":
                await manager.broadcast_to_doctors_in_area("emergencia", message)
            elif target_value == "enfermera":
                await manager.broadcast_to_nurses(message)
        elif target_type == "area":
            await manager.broadcast_to_area(target_value, message)
        elif target_type == "user":
            await manager.send_to_user(target_value, message)
        else:
            return {"error": "Tipo de broadcast no válido"}
            
        return {"success": True, "message": "Mensaje enviado exitosamente"}
        
    except Exception as e:
        logger.error(f"❌ Error enviando broadcast: {e}")
        return {"error": str(e)}

# Funciones helper para usar en otros módulos
async def notify_patient_update(patient_id: str, action: str, data: dict):
    """Notificar actualización de paciente a todos los usuarios del área"""
    message = {
        "type": "patient_update",
        "data": {
            "patient_id": patient_id,
            "action": action,
            "details": data
        }
    }
    try:
        await manager.broadcast_to_area("emergencia", message)
    except Exception as e:
        logger.error(f"❌ Error en notify_patient_update: {e}")

async def notify_prescription_update(prescription_id: str, patient_id: str, action: str, nurse_id: str = None):
    """Notificar actualización de prescripción"""
    message = {
        "type": "prescription_update", 
        "data": {
            "prescription_id": prescription_id,
            "patient_id": patient_id,
            "action": action,
            "nurse_id": nurse_id
        }
    }
    
    try:
        # Notificar a enfermeras
        await manager.broadcast_to_nurses(message)
        
        # También notificar a médicos del área
        await manager.broadcast_to_doctors_in_area("emergencia", message)
    except Exception as e:
        logger.error(f"❌ Error en notify_prescription_update: {e}")

async def notify_list_update(list_type: str, action: str, item_id: str):
    """Notificar actualización de listas (espera, triaje, etc.)"""
    message = {
        "type": "list_update",
        "data": {
            "list": list_type,
            "action": action,
            "item_id": item_id
        }
    }
    try:
        await manager.broadcast_to_area("emergencia", message)
    except Exception as e:
        logger.error(f"❌ Error en notify_list_update: {e}")

async def send_alert_to_doctors(alert_message: str, priority: str = "normal"):
    """Enviar alerta a todos los médicos"""
    message = {
        "type": "alert",
        "data": {
            "message": alert_message,
            "priority": priority,
            "source": "system"
        }
    }
    try:
        await manager.broadcast_to_doctors_in_area("emergencia", message)
    except Exception as e:
        logger.error(f"❌ Error en send_alert_to_doctors: {e}") 