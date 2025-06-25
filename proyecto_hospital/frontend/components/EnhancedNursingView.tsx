"use client"

import { useRealtimeConnection } from "@/hooks/useRealtimeConnection"
import { useHospital } from "@/lib/context"
import {
    ArrowLeft,
    Bell,
    Calendar,
    CheckCircle,
    Clock,
    Palette,
    Pill,
    RefreshCw,
    User,
    Users,
    Wifi,
    WifiOff
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { TriageAssignModal } from "./TriageAssignModal"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

export function EnhancedNursingView() {
    const { state, dispatch, updateEpisode, refreshDashboard } = useHospital()
    const {
        notifications,
        isConnected,
        unreadCount,
        markNotificationAsRead,
        clearNotifications
    } = useRealtimeConnection()
    const [activeTab, setActiveTab] = useState<'pacientes' | 'prescripciones' | 'procedimientos'>('pacientes')
    const [allPrescriptions, setAllPrescriptions] = useState<any[]>([])
    const [allProcedures, setAllProcedures] = useState<any[]>([])
    const [lastUpdate, setLastUpdate] = useState(Date.now())

    // 🎨 ESTADOS PARA MODAL DE TRIAJE
    const [triageModalOpen, setTriageModalOpen] = useState(false)
    const [selectedEpisodeForTriage, setSelectedEpisodeForTriage] = useState<any | null>(null)

    // ✅ USAR useMemo PARA CALCULAR PRESCRIPCIONES Y DETECTAR CAMBIOS
    const calculatedPrescriptions = useMemo(() => {
        console.log("🔄 Recalculando prescripciones de episodios...")

        const allEpisodes = [...state.episodes, ...state.episodesAwaitingTriage]
        const prescriptions: any[] = []

        allEpisodes.forEach(episode => {
            const episodePrescriptions = (episode as any)?.prescriptions || []
            episodePrescriptions.forEach((prescription: any) => {
                prescriptions.push({
                    ...prescription,
                    episodeId: episode.id,
                    patientName: episode.patient?.firstName && episode.patient?.lastName
                        ? `${episode.patient.firstName} ${episode.patient.lastName}`
                        : episode.patient?.nombre_completo || 'Paciente Sin Nombre',
                    patientDni: episode.patient?.dni || 'Sin DNI',
                    triageColor: episode.triageColor || 'Sin triaje'
                })
            })
        })

        console.log("💊 Total prescripciones encontradas:", prescriptions.length)
        console.log("📋 Prescripciones activas:", prescriptions.filter(p => p.status === 'active').length)

        return prescriptions
    }, [state.episodes, state.episodesAwaitingTriage, lastUpdate])

    // ✅ USAR useMemo PARA CALCULAR PROCEDIMIENTOS Y DETECTAR CAMBIOS
    const calculatedProcedures = useMemo(() => {
        console.log("🔄 Recalculando procedimientos de episodios...")

        const allEpisodes = [...state.episodes, ...state.episodesAwaitingTriage]
        const procedures: any[] = []

        allEpisodes.forEach(episode => {
            const episodeProcedures = (episode as any)?.procedures || []
            episodeProcedures.forEach((procedure: any) => {
                procedures.push({
                    ...procedure,
                    episodeId: episode.id,
                    patientName: episode.patient?.firstName && episode.patient?.lastName
                        ? `${episode.patient.firstName} ${episode.patient.lastName}`
                        : episode.patient?.nombre_completo || 'Paciente Sin Nombre',
                    patientDni: episode.patient?.dni || 'Sin DNI',
                    triageColor: episode.triageColor || 'Sin triaje'
                })
            })
        })

        console.log("🏥 Total procedimientos encontrados:", procedures.length)
        console.log("📋 Procedimientos pendientes:", procedures.filter(p => p.status === 'pending').length)

        return procedures
    }, [state.episodes, state.episodesAwaitingTriage, lastUpdate])

    // ✅ ACTUALIZAR ESTADO CUANDO CAMBIEN LAS PRESCRIPCIONES CALCULADAS
    useEffect(() => {
        setAllPrescriptions(calculatedPrescriptions)
    }, [calculatedPrescriptions])

    // ✅ ACTUALIZAR ESTADO CUANDO CAMBIEN LOS PROCEDIMIENTOS CALCULADOS
    useEffect(() => {
        setAllProcedures(calculatedProcedures)
    }, [calculatedProcedures])

    // ✅ FUNCIÓN MANUAL PARA REFRESCAR PRESCRIPCIONES
    const refrescarPrescripciones = () => {
        console.log("🔄 Refrescando prescripciones manualmente...")
        setLastUpdate(Date.now())
    }

    // 🎨 FUNCIÓN PARA MANEJAR ASIGNACIÓN DE TRIAJE
    const handleAssignTriage = (episode: any) => {
        console.log("🎨 Iniciando asignación de triaje para episodio:", episode.id)
        setSelectedEpisodeForTriage(episode)
        setTriageModalOpen(true)
    }

    // 🎨 FUNCIÓN PARA CONFIRMAR ASIGNACIÓN DE TRIAJE
    const handleTriageAssign = async (color: string) => {
        if (!selectedEpisodeForTriage) {
            console.error("❌ No se seleccionó ningún episodio para asignar triaje.")
            return
        }

        try {
            console.log("🎨 Asignando color de triaje:", color, "a episodio:", selectedEpisodeForTriage.id)

            // Actualizar el episodio con el color de triaje
            await updateEpisode(selectedEpisodeForTriage.id, {
                triageColor: color,
                estado: "En espera de atención",
                status: "waiting"
            })

            // Refrescar datos
            await refreshDashboard()

            // Cerrar modal y limpiar estado
            setSelectedEpisodeForTriage(null)
            setTriageModalOpen(false)

            console.log("✅ Triaje asignado exitosamente por enfermería")

        } catch (error) {
            console.error("❌ Error al asignar triaje:", error)
        }
    }

    const navegarAInicio = () => {
        dispatch({ type: "SET_SCREEN", payload: "dashboard" })
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800">Activo</Badge>
            case 'administered':
                return <Badge className="bg-blue-100 text-blue-800">Administrado</Badge>
            case 'not_administered':
                return <Badge className="bg-red-100 text-red-800">No Administrado</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getTriageColorBadge = (color: string) => {
        const colors: Record<string, string> = {
            'ROJO': 'bg-red-100 text-red-800',
            'NARANJA': 'bg-orange-100 text-orange-800',
            'AMARILLO': 'bg-yellow-100 text-yellow-800',
            'VERDE': 'bg-green-100 text-green-800',
            'AZUL': 'bg-blue-100 text-blue-800'
        }

        return (
            <Badge className={colors[color] || 'bg-gray-100 text-gray-800'}>
                {color}
            </Badge>
        )
    }

    const activePrescriptions = allPrescriptions.filter(p => p.status === 'active')
    const administeredPrescriptions = allPrescriptions.filter(p => p.status === 'administered')
    const pendingProcedures = allProcedures.filter(p => p.status === 'pending')
    const inProgressProcedures = allProcedures.filter(p => p.status === 'in-progress')
    const completedProcedures = allProcedures.filter(p => p.status === 'completed')

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b px-6 py-4 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Button variant="ghost" onClick={navegarAInicio} className="mr-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Panel de Enfermería Mejorado</h1>
                            <p className="text-gray-600">Gestión integral de cuidados de enfermería</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* Botón de refresco */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refrescarPrescripciones}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Actualizar
                        </Button>

                        {/* Indicador de conexión WebSocket */}
                        <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center">
                            {isConnected ? (
                                <>
                                    <Wifi className="h-4 w-4 mr-1" />
                                    Conectado
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-4 w-4 mr-1" />
                                    Desconectado
                                </>
                            )}
                        </Badge>

                        {/* Indicador de notificaciones */}
                        <Badge variant="outline" className="relative">
                            <Bell className="h-4 w-4 mr-1" />
                            Notificaciones
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2 py-1 min-w-[20px] text-center">
                                    {unreadCount}
                                </span>
                            )}
                        </Badge>

                        <Badge variant="outline" className="bg-green-50 text-green-700">
                            <User className="h-4 w-4 mr-1" />
                            {state.user?.username}
                        </Badge>
                        <Badge variant="outline">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date().toLocaleDateString('es-AR')}
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Barra de notificaciones (si hay) */}
            {unreadCount > 0 && (
                <div className="bg-blue-50 border-b px-6 py-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Bell className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="text-sm text-blue-800">
                                Tienes {unreadCount} notificación{unreadCount > 1 ? 'es' : ''} nueva{unreadCount > 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    // Marcar todas como leídas
                                    notifications.forEach(notif => {
                                        if (!notif.read) {
                                            markNotificationAsRead(notif.id)
                                        }
                                    })
                                }}
                            >
                                Marcar como leídas
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={clearNotifications}
                            >
                                Limpiar todas
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="bg-white border-b px-6 shrink-0">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                    <TabsList className="grid w-full max-w-lg grid-cols-3">
                        <TabsTrigger value="pacientes" className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Pacientes
                            <Badge variant="outline" className="ml-2 text-xs">
                                {state.episodes.length + state.episodesAwaitingTriage.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="prescripciones" className="flex items-center relative">
                            <Pill className="h-4 w-4 mr-2" />
                            Medicamentos
                            <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700">
                                {activePrescriptions.length}
                            </Badge>
                            {/* Badge con notificaciones de prescripciones */}
                            {notifications.filter(n => !n.read && n.type === 'prescription_update').length > 0 && (
                                <Badge variant="destructive" className="ml-2 text-xs h-5 w-5 p-0 flex items-center justify-center">
                                    {notifications.filter(n => !n.read && n.type === 'prescription_update').length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="procedimientos" className="flex items-center relative">
                            <Calendar className="h-4 w-4 mr-2" />
                            Procedimientos
                            <Badge variant="outline" className="ml-2 text-xs bg-orange-50 text-orange-700">
                                {pendingProcedures.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Main Content */}
            <ScrollArea className="flex-1">
                <div className="p-6">
                    <Tabs value={activeTab} className="w-full">
                        <TabsContent value="pacientes">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Lista de Pacientes en Espera de Triaje */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Users className="h-5 w-5 mr-2 text-orange-600" />
                                                Pacientes en Espera de Triaje
                                            </div>
                                            <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                                {state.episodesAwaitingTriage.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-[500px] w-full">
                                            {state.episodesAwaitingTriage.length > 0 ? (
                                                <div className="space-y-4">
                                                    {state.episodesAwaitingTriage.map((episode: any) => (
                                                        <Card key={episode.id} className="border-l-4 border-l-orange-400">
                                                            <CardContent className="p-4">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <h4 className="font-semibold">
                                                                            {episode.patient?.firstName && episode.patient?.lastName
                                                                                ? `${episode.patient.firstName} ${episode.patient.lastName}`
                                                                                : episode.patient?.nombre_completo || 'Sin nombre'
                                                                            }
                                                                        </h4>
                                                                        <p className="text-sm text-gray-600">DNI: {episode.patient?.dni || 'Sin DNI'}</p>
                                                                    </div>
                                                                    <Badge className="bg-orange-100 text-orange-800">
                                                                        Sin Triaje
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-gray-700 mb-2">
                                                                    {episode.consultationReason || episode.motivo_consulta || 'Sin motivo especificado'}
                                                                </p>
                                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                                    <span>
                                                                        <Clock className="h-3 w-3 inline mr-1" />
                                                                        {episode.waitingTime || 0} min
                                                                    </span>
                                                                    <span>
                                                                        <Pill className="h-3 w-3 inline mr-1" />
                                                                        {(episode.prescriptions || []).length} medicamentos
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-end">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleAssignTriage(episode)}
                                                                        className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                                                                    >
                                                                        <Palette className="h-3 w-3 mr-1" />
                                                                        Asignar Triaje
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Users className="h-12 w-12 mx-auto mb-4 text-orange-300" />
                                                    <p className="font-medium">No hay pacientes esperando triaje</p>
                                                    <p className="text-sm">Los pacientes aparecerán aquí cuando necesiten evaluación</p>
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </CardContent>
                                </Card>

                                {/* Lista de Pacientes en Espera */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Users className="h-5 w-5 mr-2 text-blue-600" />
                                                Pacientes en Espera
                                            </div>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                {state.episodes.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-[500px] w-full">
                                            {state.episodes.length > 0 ? (
                                                <div className="space-y-4">
                                                    {state.episodes.map((episode: any) => (
                                                        <Card key={episode.id} className="border-l-4 border-l-blue-500">
                                                            <CardContent className="p-4">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <h4 className="font-semibold">
                                                                            {episode.patient?.firstName && episode.patient?.lastName
                                                                                ? `${episode.patient.firstName} ${episode.patient.lastName}`
                                                                                : episode.patient?.nombre_completo || 'Sin nombre'
                                                                            }
                                                                        </h4>
                                                                        <p className="text-sm text-gray-600">DNI: {episode.patient?.dni || 'Sin DNI'}</p>
                                                                    </div>
                                                                    {getTriageColorBadge(episode.triageColor || 'Sin triaje')}
                                                                </div>
                                                                <p className="text-sm text-gray-700 mb-2">
                                                                    {episode.consultationReason || episode.motivo_consulta || 'Sin motivo especificado'}
                                                                </p>
                                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                                    <span>
                                                                        <Clock className="h-3 w-3 inline mr-1" />
                                                                        {episode.waitingTime || 0} min
                                                                    </span>
                                                                    <span>
                                                                        <Pill className="h-3 w-3 inline mr-1" />
                                                                        {(episode.prescriptions || []).length} medicamentos
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-end">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleAssignTriage(episode)}
                                                                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                                                    >
                                                                        <Palette className="h-3 w-3 mr-1" />
                                                                        Cambiar Triaje
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Users className="h-12 w-12 mx-auto mb-4 text-blue-300" />
                                                    <p className="font-medium">No hay pacientes en espera</p>
                                                    <p className="text-sm">Los pacientes aparecerán aquí después del triaje</p>
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Información de conexión */}
                            {isConnected && (
                                <div className="mt-6 flex items-center justify-center text-green-600">
                                    <Wifi className="h-4 w-4 mr-2" />
                                    <span className="text-sm">Sistema conectado en tiempo real</span>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="prescripciones">
                            <div className="space-y-6">
                                {/* Header con información de actualización */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold">Gestión de Prescripciones</h2>
                                        <p className="text-sm text-gray-600">
                                            Última actualización: {new Date(lastUpdate).toLocaleTimeString('es-AR')}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={refrescarPrescripciones}
                                        className="flex items-center gap-2"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Refrescar
                                    </Button>
                                </div>

                                {/* Prescripciones Activas */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Pill className="h-5 w-5 mr-2" />
                                            Prescripciones Activas
                                            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                                                {activePrescriptions.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {activePrescriptions.length > 0 ? (
                                            <div className="space-y-3">
                                                {activePrescriptions.map((prescription: any, index: number) => (
                                                    <div key={`${prescription.episodeId}-${prescription.id}-${index}`}
                                                        className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="font-semibold">{prescription.medication}</h4>
                                                                {getTriageColorBadge(prescription.triageColor)}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-1">
                                                                {prescription.dose} - {prescription.frequency} - {prescription.route}
                                                            </p>
                                                            <p className="text-sm text-gray-700">
                                                                <strong>Paciente:</strong> {prescription.patientName} (DNI: {prescription.patientDni})
                                                            </p>
                                                            {prescription.instructions && (
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    <strong>Instrucciones:</strong> {prescription.instructions}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Prescrito por: {prescription.prescribedBy} - {
                                                                    prescription.prescribedAt
                                                                        ? new Date(prescription.prescribedAt).toLocaleString('es-AR')
                                                                        : 'Fecha no disponible'
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center space-x-2 ml-4">
                                                            {getStatusBadge(prescription.status)}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="bg-green-100 hover:bg-green-200 text-green-800"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Administrar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                <p className="font-medium">No hay prescripciones activas</p>
                                                <p className="text-sm">Las prescripciones aparecerán aquí cuando los médicos las prescriban</p>
                                                <Button
                                                    variant="outline"
                                                    className="mt-4"
                                                    onClick={refrescarPrescripciones}
                                                >
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                    Verificar nuevas prescripciones
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Prescripciones Administradas */}
                                {administeredPrescriptions.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                Medicamentos Administrados
                                                <Badge variant="outline" className="ml-2">
                                                    {administeredPrescriptions.length}
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {administeredPrescriptions.map((prescription: any, index: number) => (
                                                    <div key={`admin-${prescription.episodeId}-${prescription.id}-${index}`}
                                                        className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="font-semibold">{prescription.medication}</h4>
                                                                {getTriageColorBadge(prescription.triageColor)}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-1">
                                                                {prescription.dose} - {prescription.frequency} - {prescription.route}
                                                            </p>
                                                            <p className="text-sm text-gray-700">
                                                                <strong>Paciente:</strong> {prescription.patientName} (DNI: {prescription.patientDni})
                                                            </p>
                                                        </div>
                                                        <div className="ml-4">
                                                            {getStatusBadge(prescription.status)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Mostrar notificaciones de prescripciones */}
                                {notifications.filter(n => n.type === 'prescription_update').length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <Bell className="h-5 w-5 mr-2" />
                                                Actualizaciones Recientes
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {notifications
                                                    .filter(n => n.type === 'prescription_update')
                                                    .slice(0, 5)
                                                    .map(notif => (
                                                        <div key={notif.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-sm text-blue-800">{notif.message}</p>
                                                                    <p className="text-xs text-blue-600 mt-1">
                                                                        {notif.timestamp.toLocaleTimeString('es-AR')}
                                                                    </p>
                                                                </div>
                                                                {!notif.read && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => markNotificationAsRead(notif.id)}
                                                                    >
                                                                        Marcar leída
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="procedimientos">
                            <div className="space-y-6">
                                {/* Header con información de actualización */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold">Gestión de Procedimientos</h2>
                                        <p className="text-sm text-gray-600">
                                            Última actualización: {new Date(lastUpdate).toLocaleTimeString('es-AR')}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={refrescarPrescripciones}
                                        className="flex items-center gap-2"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Refrescar
                                    </Button>
                                </div>

                                {/* Procedimientos Pendientes */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Pill className="h-5 w-5 mr-2" />
                                            Procedimientos Pendientes
                                            <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700">
                                                {pendingProcedures.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {pendingProcedures.length > 0 ? (
                                            <div className="space-y-3">
                                                {pendingProcedures.map((procedure: any, index: number) => (
                                                    <div key={`${procedure.episodeId}-${procedure.id}-${index}`}
                                                        className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="font-semibold">{procedure.procedure}</h4>
                                                                {getTriageColorBadge(procedure.triageColor)}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-1">
                                                                <strong>Paciente:</strong> {procedure.patientName} (DNI: {procedure.patientDni})
                                                            </p>
                                                            <p className="text-sm text-gray-700 mb-1">
                                                                <strong>Descripción:</strong> {procedure.description}
                                                            </p>
                                                            {procedure.instructions && (
                                                                <p className="text-sm text-gray-600 mb-1">
                                                                    <strong>Instrucciones:</strong> {procedure.instructions}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center text-xs text-gray-500 space-x-4">
                                                                {procedure.frequency && <span><strong>Frecuencia:</strong> {procedure.frequency}</span>}
                                                                {procedure.duration && <span><strong>Duración:</strong> {procedure.duration}</span>}
                                                                <span><strong>Indicado por:</strong> {procedure.orderedBy}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2 ml-4">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="bg-orange-100 hover:bg-orange-200 text-orange-800"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Marcar como realizado
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                <p className="font-medium">No hay procedimientos pendientes</p>
                                                <p className="text-sm">Los procedimientos aparecerán aquí cuando los médicos los asignen</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Procedimientos en Progreso */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Pill className="h-5 w-5 mr-2" />
                                            Procedimientos en Progreso
                                            <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700">
                                                {inProgressProcedures.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {inProgressProcedures.length > 0 ? (
                                            <div className="space-y-3">
                                                {inProgressProcedures.map((procedure: any, index: number) => (
                                                    <div key={`${procedure.episodeId}-${procedure.id}-${index}`}
                                                        className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="font-semibold">{procedure.procedure}</h4>
                                                                {getTriageColorBadge(procedure.triageColor)}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-1">
                                                                <strong>Paciente:</strong> {procedure.patientName} (DNI: {procedure.patientDni})
                                                            </p>
                                                            <p className="text-sm text-gray-700 mb-1">
                                                                <strong>Descripción:</strong> {procedure.description}
                                                            </p>
                                                            {procedure.instructions && (
                                                                <p className="text-sm text-gray-600 mb-1">
                                                                    <strong>Instrucciones:</strong> {procedure.instructions}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-2 ml-4">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Marcar como realizado
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                <p className="font-medium">No hay procedimientos en progreso</p>
                                                <p className="text-sm">Los procedimientos aparecerán aquí cuando los médicos los realicen</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Procedimientos Completos */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            Procedimientos Completos
                                            <Badge variant="outline" className="ml-2">
                                                {completedProcedures.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {completedProcedures.map((procedure: any, index: number) => (
                                                <div key={`${procedure.episodeId}-${procedure.id}-${index}`}
                                                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-semibold">{procedure.procedure}</h4>
                                                            {getTriageColorBadge(procedure.triageColor)}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            <strong>Paciente:</strong> {procedure.patientName} (DNI: {procedure.patientDni})
                                                        </p>
                                                        <p className="text-sm text-gray-700 mb-1">
                                                            <strong>Descripción:</strong> {procedure.description}
                                                        </p>
                                                        {procedure.instructions && (
                                                            <p className="text-sm text-gray-600 mb-1">
                                                                <strong>Instrucciones:</strong> {procedure.instructions}
                                                            </p>
                                                        )}
                                                        {procedure.completedAt && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Completado: {new Date(procedure.completedAt).toLocaleString('es-AR')}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        {getStatusBadge(procedure.status)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </ScrollArea>

            {/* 🎨 MODAL DE ASIGNACIÓN DE TRIAJE */}
            <TriageAssignModal
                open={triageModalOpen}
                onOpenChange={setTriageModalOpen}
                onAssign={handleTriageAssign}
            />
        </div>
    )
} 