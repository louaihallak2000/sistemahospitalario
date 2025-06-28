"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
    AlertTriangle,
    Check,
    Clock,
    Plus,
    Settings,
    Stethoscope,
    User
} from "lucide-react"
import { useState } from "react"

interface ShockroomAlertsProps {
    alertas: any[]
    onRefresh: () => void
}

export function ShockroomAlerts({ alertas, onRefresh }: ShockroomAlertsProps) {
    const [selectedAlert, setSelectedAlert] = useState<any>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [filter, setFilter] = useState<string>("all")
    const [newAlert, setNewAlert] = useState({
        tipo_alerta: "",
        prioridad: "media",
        titulo: "",
        descripcion: ""
    })

    const getPriorityColor = (prioridad: string) => {
        switch (prioridad) {
            case "critica":
                return "bg-red-600 text-white animate-pulse"
            case "alta":
                return "bg-orange-500 text-white"
            case "media":
                return "bg-yellow-500 text-white"
            case "baja":
                return "bg-blue-500 text-white"
            default:
                return "bg-gray-500 text-white"
        }
    }

    const getTypeIcon = (tipo: string) => {
        switch (tipo) {
            case "medica":
                return <Stethoscope className="h-4 w-4" />
            case "tecnica":
                return <Settings className="h-4 w-4" />
            case "administrativa":
                return <User className="h-4 w-4" />
            default:
                return <AlertTriangle className="h-4 w-4" />
        }
    }

    const getTypeColor = (tipo: string) => {
        switch (tipo) {
            case "medica":
                return "bg-red-100 text-red-800 border-red-200"
            case "tecnica":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "administrativa":
                return "bg-green-100 text-green-800 border-green-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const handleAttendAlert = async (alertaId: string) => {
        try {
            const token = localStorage.getItem("auth_token")
            if (!token) return

            const response = await fetch(`/api/v1/shockroom/alertas/${alertaId}/atender`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (response.ok) {
                console.log("✅ Alerta marcada como atendida")
                onRefresh()
                setSelectedAlert(null)
            }
        } catch (error) {
            console.error("❌ Error atendiendo alerta:", error)
        }
    }

    const handleCreateAlert = async () => {
        try {
            const token = localStorage.getItem("auth_token")
            if (!token) return

            // Para el ejemplo, usamos la primera asignación disponible
            // En la implementación real, esto debería ser seleccionado por el usuario
            const response = await fetch("/api/v1/shockroom/alertas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newAlert,
                    asignacion_id: "example-id" // Esto debería ser seleccionado
                })
            })

            if (response.ok) {
                console.log("✅ Alerta creada")
                setShowCreateModal(false)
                setNewAlert({
                    tipo_alerta: "",
                    prioridad: "media",
                    titulo: "",
                    descripcion: ""
                })
                onRefresh()
            }
        } catch (error) {
            console.error("❌ Error creando alerta:", error)
        }
    }

    const filteredAlerts = alertas.filter(alerta => {
        if (filter === "all") return true
        if (filter === "active") return alerta.estado === "activa"
        if (filter === "attended") return alerta.estado === "atendida"
        return alerta.prioridad === filter
    })

    const sortedAlerts = [...filteredAlerts].sort((a, b) => {
        // Priorizar por prioridad
        const priorityOrder = { "critica": 0, "alta": 1, "media": 2, "baja": 3 }
        const aOrder = priorityOrder[a.prioridad as keyof typeof priorityOrder] ?? 4
        const bOrder = priorityOrder[b.prioridad as keyof typeof priorityOrder] ?? 4

        if (aOrder !== bOrder) return aOrder - bOrder

        // Luego por fecha (más recientes primero)
        return new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
    })

    return (
        <div className="space-y-6 h-full">
            {/* Header y controles */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Alertas del Shockroom</h2>
                    <p className="text-sm text-gray-600">
                        {alertas.filter(a => a.estado === "activa").length} alertas activas de {alertas.length} totales
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="active">Activas</SelectItem>
                            <SelectItem value="attended">Atendidas</SelectItem>
                            <SelectItem value="critica">Críticas</SelectItem>
                            <SelectItem value="alta">Alta prioridad</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={() => setShowCreateModal(true)} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Alerta
                    </Button>
                </div>
            </div>

            {/* Lista de alertas */}
            <Card className="flex-1">
                <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                        <div className="space-y-3 p-6">
                            {sortedAlerts.map((alerta) => (
                                <div
                                    key={alerta.id}
                                    className={`
                    p-4 border rounded-lg cursor-pointer transition-all duration-200
                    ${alerta.estado === "activa"
                                            ? "border-red-200 bg-red-50 hover:bg-red-100"
                                            : "border-gray-200 bg-white hover:bg-gray-50"
                                        }
                    ${selectedAlert?.id === alerta.id ? "ring-2 ring-blue-500" : ""}
                  `}
                                    onClick={() => setSelectedAlert(alerta)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {/* Header de la alerta */}
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className={`flex items-center space-x-1 px-2 py-1 rounded border ${getTypeColor(alerta.tipo_alerta)}`}>
                                                    {getTypeIcon(alerta.tipo_alerta)}
                                                    <span className="text-xs font-medium capitalize">
                                                        {alerta.tipo_alerta}
                                                    </span>
                                                </div>

                                                <Badge className={getPriorityColor(alerta.prioridad)}>
                                                    {alerta.prioridad.toUpperCase()}
                                                </Badge>

                                                {alerta.estado === "atendida" && (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Atendida
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Título y descripción */}
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {alerta.titulo}
                                            </h3>

                                            {alerta.descripcion && (
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {alerta.descripcion}
                                                </p>
                                            )}

                                            {/* Información temporal */}
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <div className="flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    <span>
                                                        Creada: {new Date(alerta.fecha_creacion).toLocaleString('es-AR')}
                                                    </span>
                                                </div>

                                                {alerta.creada_por && (
                                                    <div className="flex items-center">
                                                        <User className="h-3 w-3 mr-1" />
                                                        <span>Por: {alerta.creada_por}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Información de atención */}
                                            {alerta.fecha_atencion && (
                                                <div className="mt-2 pt-2 border-t border-gray-200">
                                                    <div className="flex items-center space-x-4 text-xs text-green-600">
                                                        <div className="flex items-center">
                                                            <Check className="h-3 w-3 mr-1" />
                                                            <span>
                                                                Atendida: {new Date(alerta.fecha_atencion).toLocaleString('es-AR')}
                                                            </span>
                                                        </div>

                                                        {alerta.atendida_por && (
                                                            <div className="flex items-center">
                                                                <User className="h-3 w-3 mr-1" />
                                                                <span>Por: {alerta.atendida_por}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Botones de acción */}
                                        {alerta.estado === "activa" && (
                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleAttendAlert(alerta.id)
                                                }}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Atender
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {sortedAlerts.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium mb-2">No hay alertas</p>
                                    <p className="text-sm">
                                        {filter === "all"
                                            ? "No se han generado alertas en el shockroom"
                                            : `No hay alertas con el filtro "${filter}"`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Modal para crear nueva alerta */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Plus className="h-5 w-5 mr-2" />
                            Nueva Alerta
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="tipo">Tipo de Alerta</Label>
                            <Select value={newAlert.tipo_alerta} onValueChange={(value) => setNewAlert({ ...newAlert, tipo_alerta: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="medica">Médica</SelectItem>
                                    <SelectItem value="tecnica">Técnica</SelectItem>
                                    <SelectItem value="administrativa">Administrativa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="prioridad">Prioridad</Label>
                            <Select value={newAlert.prioridad} onValueChange={(value) => setNewAlert({ ...newAlert, prioridad: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="critica">Crítica</SelectItem>
                                    <SelectItem value="alta">Alta</SelectItem>
                                    <SelectItem value="media">Media</SelectItem>
                                    <SelectItem value="baja">Baja</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="titulo">Título</Label>
                            <Input
                                id="titulo"
                                value={newAlert.titulo}
                                onChange={(e) => setNewAlert({ ...newAlert, titulo: e.target.value })}
                                placeholder="Título de la alerta"
                            />
                        </div>

                        <div>
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Textarea
                                id="descripcion"
                                value={newAlert.descripcion}
                                onChange={(e) => setNewAlert({ ...newAlert, descripcion: e.target.value })}
                                placeholder="Descripción detallada..."
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleCreateAlert}
                                disabled={!newAlert.tipo_alerta || !newAlert.titulo}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Crear Alerta
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
} 