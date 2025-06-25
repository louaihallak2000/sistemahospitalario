from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Set
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Conexiones por usuario
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Usuarios por rol (para broadcast por rol)
        self.users_by_role: Dict[str, Set[str]] = {
            "medico": set(),
            "enfermera": set(),
            "admin": set()
        }
        # Usuarios por área/sala
        self.users_by_area: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str, role: str, area: str):
        await websocket.accept()
        
        # Agregar conexión
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        
        # Registrar en grupos
        self.users_by_role[role].add(user_id)
        if area not in self.users_by_area:
            self.users_by_area[area] = set()
        self.users_by_area[area].add(user_id)
        
        logger.info(f"✅ Usuario {user_id} ({role}) conectado al área {area}")
        logger.info(f"📊 Conexiones activas: {len(self.active_connections)}")
    
    async def disconnect(self, websocket: WebSocket, user_id: str, role: str, area: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                self.users_by_role[role].discard(user_id)
                if area in self.users_by_area:
                    self.users_by_area[area].discard(user_id)
        
        logger.info(f"❌ Usuario {user_id} ({role}) desconectado del área {area}")
        logger.info(f"📊 Conexiones activas: {len(self.active_connections)}")
    
    # Enviar a un usuario específico
    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            message_with_timestamp = {
                **message,
                "timestamp": datetime.now().isoformat()
            }
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message_with_timestamp)
                    logger.debug(f"📤 Mensaje enviado a usuario {user_id}")
                except Exception as e:
                    logger.error(f"❌ Error enviando mensaje a {user_id}: {e}")
    
    # Broadcast a todos los médicos en un área
    async def broadcast_to_doctors_in_area(self, area: str, message: dict):
        if area in self.users_by_area:
            doctors_in_area = self.users_by_role["medico"] & self.users_by_area[area]
            for doctor_id in doctors_in_area:
                await self.send_to_user(doctor_id, message)
            logger.info(f"📡 Broadcast a {len(doctors_in_area)} médicos en área {area}")
    
    # Broadcast a todas las enfermeras
    async def broadcast_to_nurses(self, message: dict):
        for nurse_id in self.users_by_role["enfermera"]:
            await self.send_to_user(nurse_id, message)
        logger.info(f"📡 Broadcast a {len(self.users_by_role['enfermera'])} enfermeras")
    
    # Broadcast a todos en un área (médicos + enfermeras)
    async def broadcast_to_area(self, area: str, message: dict):
        if area in self.users_by_area:
            for user_id in self.users_by_area[area]:
                await self.send_to_user(user_id, message)
            logger.info(f"📡 Broadcast a {len(self.users_by_area[area])} usuarios en área {area}")
    
    # Broadcast a todos los usuarios conectados
    async def broadcast_all(self, message: dict):
        total_sent = 0
        for user_id in self.active_connections:
            await self.send_to_user(user_id, message)
            total_sent += 1
        logger.info(f"📡 Broadcast global a {total_sent} usuarios")
    
    # Obtener estadísticas de conexiones
    def get_connection_stats(self):
        return {
            "total_users": len(self.active_connections),
            "users_by_role": {role: len(users) for role, users in self.users_by_role.items()},
            "users_by_area": {area: len(users) for area, users in self.users_by_area.items()},
            "timestamp": datetime.now().isoformat()
        }

# Instancia global del manager
manager = ConnectionManager() 