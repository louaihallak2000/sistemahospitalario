"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Hospital, LogOut, UserPlus, List, Package, Clock, User, AlertTriangle, Eye, RefreshCw } from "lucide-react"
import { useHospital } from "@/lib/context"
import { PatientRegistrationModal } from "./PatientRegistrationModal"
import type { TriageColor } from "@/lib/types"

const triageColors: Record<TriageColor, { bg: string; text: string; color: string }> = {
  ROJO: { bg: "bg-red-100", text: "text-red-800", color: "#dc2626" },
  NARANJA: { bg: "bg-orange-100", text: "text-orange-800", color: "#ea580c" },
  AMARILLO: { bg: "bg-yellow-100", text: "text-yellow-800", color: "#ca8a04" },
  VERDE: { bg: "bg-green-100", text: "text-green-800", color: "#16a34a" },
  AZUL: { bg: "bg-blue-100", text: "text-blue-800", color: "#2563eb" },
}

export function Dashboard() {
  const { state, logout, updateEpisode, getTriageStats, refreshDashboard, setSelectedPatient, dispatch } = useHospital()
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const triageStats = getTriageStats()
  const waitingEpisodes = state.episodes.filter((e) => e.status === "waiting")

  const handleTakePatient = async (episodeId: string) => {
    try {
      const episode = state.episodes.find((e) => e.id === episodeId)
      if (episode) {
        // Set selected patient data
        setSelectedPatient({
          patient: episode.patient,
          episode: episode,
          medicalHistory: [], // You'll need to add this
        })
        dispatch({ type: "SET_SCREEN", payload: "patient" })
      }
      await updateEpisode(episodeId, {
        status: "in-progress",
        assignedTo: state.user?.username,
      })
    } catch (error) {
      console.error("Error taking patient:", error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshDashboard()
    } finally {
      setIsRefreshing(false)
    }
  }

  const getAge = (birthDate?: string) => {
    if (!birthDate) return "N/A"
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    return age
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Hospital className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{state.user?.hospitalName}</h1>
                <p className="text-sm text-gray-500">Sistema de Emergencias</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{state.user?.username}</p>
                <p className="text-xs text-gray-500">Médico de Guardia</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas de Triaje */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(triageStats).map(([color, count]) => (
            <Card key={color} className="text-center">
              <CardContent className="p-4">
                <div
                  className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg`}
                  style={{ backgroundColor: triageColors[color as TriageColor].color }}
                >
                  {count}
                </div>
                <p className="text-sm font-medium text-gray-900">{color}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alertas */}
        {state.alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas</h2>
            <div className="space-y-2">
              {state.alerts.map((alert) => (
                <Alert key={alert.id} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Botones de Acción Rápida */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={() => setShowPatientModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </Button>
          <Button variant="outline">
            <List className="h-4 w-4 mr-2" />
            Lista Espera
          </Button>
          <Button variant="outline">
            <Package className="h-4 w-4 mr-2" />
            Inventario
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {/* Lista de Espera */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Espera</CardTitle>
            <CardDescription>Pacientes esperando atención ({waitingEpisodes.length})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {waitingEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: triageColors[episode.triageColor].color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {episode.patient.lastName}, {episode.patient.firstName} ({getAge(episode.patient.birthDate)})
                      </p>
                      <p className="text-sm text-gray-500">{episode.consultationReason}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      className={`${triageColors[episode.triageColor].bg} ${triageColors[episode.triageColor].text}`}
                    >
                      {episode.triageColor}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {episode.waitingTime} min
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleTakePatient(episode.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        TOMAR
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Ficha
                      </Button>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Cambiar Triaje
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {waitingEpisodes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay pacientes en espera</p>
                  <Button variant="outline" onClick={handleRefresh} className="mt-2">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar lista
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Registro de Paciente */}
      <PatientRegistrationModal open={showPatientModal} onOpenChange={setShowPatientModal} />
    </div>
  )
}
