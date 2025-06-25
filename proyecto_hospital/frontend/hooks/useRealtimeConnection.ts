import { useHospital } from '@/lib/context'
import { useCallback, useEffect, useRef, useState } from 'react'

interface RealtimeMessage {
    type: 'notification' | 'list_update' | 'prescription_update' | 'patient_update' | 'connection_success' | 'pong' | 'stats' | 'alert'
    data: any
    timestamp: string
}

interface NotificationItem {
    id: string
    type: string
    message: string
    timestamp: Date
    read: boolean
    priority?: 'low' | 'normal' | 'high' | 'urgent'
}

export const useRealtimeConnection = () => {
    const { state } = useHospital()
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [connectionStats, setConnectionStats] = useState<any>(null)
    const [reconnectAttempts, setReconnectAttempts] = useState(0)
    const [lastPingTime, setLastPingTime] = useState<Date | null>(null)

    const wsRef = useRef<WebSocket | null>(null)
    const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const user = state.user
    const maxReconnectAttempts = 5
    const reconnectDelay = 5000 // 5 segundos
    const pingInterval = 30000 // 30 segundos

    // Función para crear la conexión WebSocket
    const createWebSocketConnection = useCallback(() => {
        // Obtener token de localStorage
        const token = localStorage.getItem('hospital_token')

        if (!user || !token) {
            console.log("👤 No hay usuario autenticado o token para WebSocket")
            return
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = window.location.hostname
        const port = '8000' // Puerto del backend

        // Determinar el rol del usuario (por ahora todos como enfermera, se puede ajustar)
        const role = 'enfermera' // Default role
        const area = 'emergencia'
        const userId = user.id || user.username

        const wsUrl = `${protocol}//${host}:${port}/realtime/ws/${userId}?role=${role}&area=${area}&token=${token}`

        console.log(`🔌 Conectando WebSocket: ${wsUrl}`)

        try {
            const websocket = new WebSocket(wsUrl)

            websocket.onopen = () => {
                console.log('✅ WebSocket conectado exitosamente')
                setIsConnected(true)
                setReconnectAttempts(0)

                // Limpiar intervalo de reconexión si existe
                if (reconnectIntervalRef.current) {
                    clearInterval(reconnectIntervalRef.current)
                    reconnectIntervalRef.current = null
                }

                // Iniciar ping periódico
                startPingInterval()
            }

            websocket.onmessage = (event) => {
                try {
                    const message: RealtimeMessage = JSON.parse(event.data)
                    console.log('📨 Mensaje WebSocket recibido:', message)

                    handleRealtimeMessage(message)
                } catch (error) {
                    console.error('❌ Error parseando mensaje WebSocket:', error)
                }
            }

            websocket.onclose = (event) => {
                console.log(`🔌 WebSocket cerrado. Código: ${event.code}, Razón: ${event.reason}`)
                setIsConnected(false)
                stopPingInterval()

                // Intentar reconectar si no fue una desconexión intencional
                if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
                    scheduleReconnect()
                }
            }

            websocket.onerror = (error) => {
                console.error('❌ Error en WebSocket:', error)
                setIsConnected(false)
            }

            wsRef.current = websocket

        } catch (error) {
            console.error('❌ Error creando WebSocket:', error)
            scheduleReconnect()
        }
    }, [user, reconnectAttempts])

    // Función para manejar reconexión
    const scheduleReconnect = useCallback(() => {
        if (reconnectAttempts >= maxReconnectAttempts) {
            console.log('❌ Máximo de intentos de reconexión alcanzado')
            return
        }

        console.log(`🔄 Programando reconexión en ${reconnectDelay}ms (intento ${reconnectAttempts + 1}/${maxReconnectAttempts})`)

        setReconnectAttempts(prev => prev + 1)

        reconnectIntervalRef.current = setTimeout(() => {
            createWebSocketConnection()
        }, reconnectDelay)
    }, [reconnectAttempts, createWebSocketConnection])

    // Función para iniciar ping periódico
    const startPingInterval = useCallback(() => {
        pingIntervalRef.current = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'ping' }))
                setLastPingTime(new Date())
            }
        }, pingInterval)
    }, [])

    // Función para detener ping periódico
    const stopPingInterval = useCallback(() => {
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current)
            pingIntervalRef.current = null
        }
    }, [])

    // Función para manejar mensajes en tiempo real
    const handleRealtimeMessage = useCallback((message: RealtimeMessage) => {
        switch (message.type) {
            case 'connection_success':
                console.log('🎉 Conexión establecida:', message.data)
                setConnectionStats(message.data.stats)
                break

            case 'notification':
                const notification: NotificationItem = {
                    id: `notif_${Date.now()}`,
                    type: message.data.type || 'info',
                    message: message.data.message,
                    timestamp: new Date(message.timestamp),
                    read: false,
                    priority: message.data.priority || 'normal'
                }

                setNotifications(prev => [notification, ...prev])

                // Mostrar notificación nativa del navegador si está permitido
                if (Notification.permission === 'granted') {
                    new Notification(notification.message, {
                        tag: notification.id,
                        icon: '/favicon.ico'
                    })
                }
                break

            case 'list_update':
                console.log('📝 Actualización de lista:', message.data)
                // Disparar evento personalizado para que los componentes se actualicen
                window.dispatchEvent(new CustomEvent('update-patient-list', {
                    detail: message.data
                }))
                break

            case 'prescription_update':
                console.log('💊 Actualización de prescripción:', message.data)
                window.dispatchEvent(new CustomEvent('update-prescription', {
                    detail: message.data
                }))
                break

            case 'patient_update':
                console.log('👤 Actualización de paciente:', message.data)
                window.dispatchEvent(new CustomEvent('update-patient', {
                    detail: message.data
                }))
                break

            case 'alert':
                console.log('🚨 Alerta recibida:', message.data)
                const alertNotification: NotificationItem = {
                    id: `alert_${Date.now()}`,
                    type: 'alert',
                    message: message.data.message,
                    timestamp: new Date(message.timestamp),
                    read: false,
                    priority: message.data.priority || 'urgent'
                }

                setNotifications(prev => [alertNotification, ...prev])
                break

            case 'pong':
                console.log('🏓 Pong recibido')
                break

            case 'stats':
                setConnectionStats(message.data)
                break

            default:
                console.log('❓ Tipo de mensaje no reconocido:', message.type, message)
        }
    }, [])

    // Función para enviar mensajes
    const sendMessage = useCallback((message: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message))
            return true
        }
        console.warn('⚠️ WebSocket no está conectado. Mensaje no enviado:', message)
        return false
    }, [])

    // Función para marcar notificación como leída
    const markNotificationAsRead = useCallback((notificationId: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId
                    ? { ...notif, read: true }
                    : notif
            )
        )
    }, [])

    // Función para limpiar todas las notificaciones
    const clearNotifications = useCallback(() => {
        setNotifications([])
    }, [])

    // Solicitar permisos de notificación
    const requestNotificationPermission = useCallback(async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission()
            return permission === 'granted'
        }
        return Notification.permission === 'granted'
    }, [])

    // Efecto principal para gestionar la conexión
    useEffect(() => {
        const token = localStorage.getItem('hospital_token')
        if (user && token) {
            createWebSocketConnection()
            requestNotificationPermission()
        }

        // Cleanup al desmontar el componente
        return () => {
            console.log('🧹 Limpiando conexión WebSocket')

            if (wsRef.current) {
                wsRef.current.close(1000, 'Componente desmontado')
                wsRef.current = null
            }

            if (reconnectIntervalRef.current) {
                clearTimeout(reconnectIntervalRef.current)
                reconnectIntervalRef.current = null
            }

            stopPingInterval()
        }
    }, [user, createWebSocketConnection, requestNotificationPermission, stopPingInterval])

    return {
        notifications,
        isConnected,
        connectionStats,
        reconnectAttempts,
        lastPingTime,
        sendMessage,
        markNotificationAsRead,
        clearNotifications,
        unreadCount: notifications.filter(n => !n.read).length
    }
} 