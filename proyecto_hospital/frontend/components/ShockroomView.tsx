"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useHospital } from "@/lib/context"
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Bed,
    MapPin,
    Monitor,
    RefreshCw,
    Users
} from "lucide-react"
import { useEffect, useState } from "react"
import { AssignBedModal } from "./shockroom/AssignBedModal"
import { ShockroomAlerts } from "./shockroom/ShockroomAlerts"
import { ShockroomMap } from "./shockroom/ShockroomMap"
import { ShockroomMonitoring } from "./shockroom/ShockroomMonitoring"
import { ShockroomPatientList } from "./shockroom/ShockroomPatientList"
import { ShockroomStats } from "./shockroom/ShockroomStats"

interface ShockroomData {
    camas: any[]
    estadisticas: any
    pacientesCandidatos: any[]
    alertas: any[]
}

export function ShockroomView() {
    const { state, dispatch } = useHospital()
    const [shockroomData, setShockroomData] = useState<ShockroomData>({
        camas: [],
        estadisticas: null,
        pacientesCandidatos: [],
        alertas: []
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedBed, setSelectedBed] = useState<any>(null)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [activeTab, setActiveTab] = useState("map")

    useEffect(() => {
        loadShockroomData()
        // Actualizar cada 30 segundos
        const interval = setInterval(loadShockroomData, 30000)
        return () => clearInterval(interval)
    }, [])

    const loadShockroomData = async () => {
        if (!isLoading) setIsRefreshing(true)

        try {
            const token = localStorage.getItem("auth_token")
            if (!token) return

            // Cargar datos en paralelo
            const [camasRes, statsRes, candidatosRes, alertasRes] = await Promise.all([
                fetch("/api/v1/shockroom/camas", {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch("/api/v1/shockroom/estadisticas", {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch("/api/v1/shockroom/pacientes-candidatos", {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch("/api/v1/shockroom/alertas?estado=activa", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ])

            const [camas, estadisticas, pacientesCandidatos, alertas] = await Promise.all([
                camasRes.json(),
                statsRes.json(),
                candidatosRes.json(),
                alertasRes.json()
            ])

            setShockroomData({
                camas,
                estadisticas,
                pacientesCandidatos,
                alertas
            })

            console.log("🏥 Datos del shockroom cargados:", {
                camas: camas.length,
                candidatos: pacientesCandidatos.length,
                alertas: alertas.length
            })

        } catch (error) {
            console.error("❌ Error cargando datos del shockroom:", error)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    const handleBackToDashboard = () => {
        dispatch({ type: "SET_SCREEN", payload: "dashboard" })
    }

    const handleBedClick = (cama: any) => {
        setSelectedBed(cama)
        if (cama.estado === "disponible") {
            setShowAssignModal(true)
        }
    }

    const handleAssignBed = async (camaId: string, episodioId: string) => {
        try {
            const token = localStorage.getItem("auth_token")
            if (!token) return

            const response = await fetch("/api/v1/shockroom/asignaciones", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    cama_id: camaId,
                    episodio_id: episodioId,
                    paciente_id: shockroomData.pacientesCandidatos.find(p => p.episodio_id === episodioId)?.paciente_id,
                    medico_responsable: state.user?.username,
                    motivo_ingreso: "Paciente crítico - Triaje prioritario"
                })
            })

            if (response.ok) {
                console.log("✅ Paciente asignado al shockroom")
                setShowAssignModal(false)
                await loadShockroomData()
            } else {
                console.error("❌ Error asignando paciente")
            }
        } catch (error) {
            console.error("❌ Error en asignación:", error)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Monitor className="h-12 w-12 mx-auto mb-4 animate-pulse text-red-600" />
                    <p className="text-lg">Cargando Shockroom...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" onClick={handleBackToDashboard}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <div className="flex items-center space-x-2">
                            <div className="bg-red-100 p-2 rounded-lg">
                                <Activity className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Shockroom</h1>
                                <p className="text-sm text-gray-600">Gestión de camas críticas</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Indicadores rápidos */}
                        <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Bed className="h-3 w-3 mr-1" />
                                {shockroomData.estadisticas?.camas_disponibles || 0} Disponibles
                            </Badge>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <Users className="h-3 w-3 mr-1" />
                                {shockroomData.estadisticas?.camas_ocupadas || 0} Ocupadas
                            </Badge>
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {shockroomData.alertas?.length || 0} Alertas
                            </Badge>
                        </div>

                        <Button
                            onClick={loadShockroomData}
                            disabled={isRefreshing}
                            size="sm"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <div className="px-4 pt-4">
                        <TabsList className="grid w-full grid-cols-5 bg-white">
                            <TabsTrigger value="map" className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                Mapa de Camas
                            </TabsTrigger>
                            <TabsTrigger value="monitoring" className="flex items-center">
                                <Monitor className="h-4 w-4 mr-2" />
                                Monitoreo
                            </TabsTrigger>
                            <TabsTrigger value="candidates" className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                Candidatos
                            </TabsTrigger>
                            <TabsTrigger value="alerts" className="flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Alertas
                            </TabsTrigger>
                            <TabsTrigger value="stats" className="flex items-center">
                                <Activity className="h-4 w-4 mr-2" />
                                Estadísticas
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden px-4 pb-4">
                        {/* Mapa de Camas */}
                        <TabsContent value="map" className="h-full mt-4">
                            <ShockroomMap
                                camas={shockroomData.camas}
                                onBedClick={handleBedClick}
                                selectedBed={selectedBed}
                            />
                        </TabsContent>

                        {/* Monitoreo */}
                        <TabsContent value="monitoring" className="h-full mt-4">
                            <ShockroomMonitoring
                                camas={shockroomData.camas.filter(c => c.estado === "ocupada")}
                                onRefresh={loadShockroomData}
                            />
                        </TabsContent>

                        {/* Pacientes Candidatos */}
                        <TabsContent value="candidates" className="h-full mt-4">
                            <ShockroomPatientList
                                pacientes={shockroomData.pacientesCandidatos}
                                camasDisponibles={shockroomData.camas.filter(c => c.estado === "disponible")}
                                onAssignBed={handleAssignBed}
                            />
                        </TabsContent>

                        {/* Alertas */}
                        <TabsContent value="alerts" className="h-full mt-4">
                            <ShockroomAlerts
                                alertas={shockroomData.alertas}
                                onRefresh={loadShockroomData}
                            />
                        </TabsContent>

                        {/* Estadísticas */}
                        <TabsContent value="stats" className="h-full mt-4">
                            <ShockroomStats
                                estadisticas={shockroomData.estadisticas}
                                camas={shockroomData.camas}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* Modal de Asignación */}
            <AssignBedModal
                open={showAssignModal}
                onOpenChange={setShowAssignModal}
                selectedBed={selectedBed}
                candidatos={shockroomData.pacientesCandidatos}
                onAssign={handleAssignBed}
            />
        </div>
    )
} 