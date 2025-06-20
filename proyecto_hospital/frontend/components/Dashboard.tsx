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

// 🛡️ FUNCIÓN DEFENSIVA: Mapear colores de triaje con validación
const getTriageColor = (triageColor?: string | null) => {
  console.log("🎨 getTriageColor - valor recibido:", triageColor, "tipo:", typeof triageColor)
  
  if (!triageColor) {
    console.warn("⚠️ triageColor es null/undefined, usando VERDE por defecto")
    return triageColors.VERDE
  }
  
  // Normalizar a mayúsculas
  const normalizedColor = triageColor.toString().toUpperCase()
  console.log("🔄 Color normalizado:", normalizedColor)
  
  // Mapeo de posibles variaciones
  const colorMapping: Record<string, TriageColor> = {
    'ROJO': 'ROJO',
    'RED': 'ROJO',
    'CRITICAL': 'ROJO',
    'CRITICO': 'ROJO',
    
    'NARANJA': 'NARANJA',
    'ORANGE': 'NARANJA',
    'URGENT': 'NARANJA',
    'URGENTE': 'NARANJA',
    
    'AMARILLO': 'AMARILLO',
    'YELLOW': 'AMARILLO',
    'SEMI-URGENT': 'AMARILLO',
    'SEMIURGENTE': 'AMARILLO',
    
    'VERDE': 'VERDE',
    'GREEN': 'VERDE',
    'NON-URGENT': 'VERDE',
    'NO-URGENTE': 'VERDE',
    
    'AZUL': 'AZUL',
    'BLUE': 'AZUL',
    'CONSULTATION': 'AZUL',
    'CONSULTA': 'AZUL'
  }
  
  const mappedColor = colorMapping[normalizedColor]
  if (mappedColor) {
    console.log("✅ Color mapeado exitosamente:", normalizedColor, "→", mappedColor)
    return triageColors[mappedColor]
  }
  
  console.warn("⚠️ Color no reconocido:", normalizedColor, "usando VERDE por defecto")
  return triageColors.VERDE
}

export function Dashboard() {
  const { state, logout, updateEpisode, getTriageStats, refreshDashboard, setSelectedPatient, dispatch } = useHospital()
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const triageStats = getTriageStats()
  
  // 🔍 DEBUGGING: Ver todos los episodios y el filtrado
  console.log("🏥 Dashboard - Total episodios en state:", state.episodes.length)
  console.log("📋 Dashboard - Episodios completos:", state.episodes)
  const waitingEpisodes = state.episodes.filter((e) => e.status === "waiting")
  console.log("⏰ Dashboard - Episodios waiting filtrados:", waitingEpisodes.length)
  console.log("📊 Dashboard - waitingEpisodes:", waitingEpisodes)
  
  // 🎨 DEBUGGING: Ver los colores de triaje de cada episodio
  waitingEpisodes.forEach((episode, index) => {
    console.log(`🎨 Episodio ${index + 1}:`, {
      id: episode.id,
      triageColor: episode.triageColor,
      color_triaje: episode.color_triaje,
      patientName: episode.patient?.nombre_completo || 'Sin nombre'
    })
  })

  const handleTakePatient = (episodeId: string) => {
    console.log("🔥 MÉTODO ULTRA SIMPLE - handleTakePatient para episodio:", episodeId)
    
    // 🛡️ NO USAR async/await PARA EVITAR CUALQUIER PROBLEMA
    const episode = state.episodes.find((e) => e.id === episodeId)
    console.log("📋 Episodio encontrado:", episode?.id)
    
    if (!episode) {
      console.error("❌ Episodio no encontrado")
      return
    }

    console.log("🔧 Preparando datos básicos del paciente...")
    
    // 🎯 USAR DATOS EXISTENTES SIN MODIFICAR TIPOS
    const patientData = {
      patient: {
        ...episode.patient,
        firstName: episode.patient.firstName || episode.patient.nombre_completo?.split(' ')[0] || 'Paciente',
        lastName: episode.patient.lastName || episode.patient.nombre_completo?.split(' ').slice(1).join(' ') || '',
        birthDate: episode.patient.birthDate || episode.patient.fecha_nacimiento || '',
      },
      episode: {
        ...episode,
        status: "in-progress" as const,
      },
      medicalHistory: []
    }
    
    console.log("📝 Configurando paciente seleccionado...")
    setSelectedPatient(patientData)
    
    console.log("🔄 Navegando a pantalla de paciente INMEDIATAMENTE...")
    dispatch({ type: "SET_SCREEN", payload: "patient" })
    
    console.log("✅ NAVEGACIÓN COMPLETADA - SIN ERRORES")
  }

  const handleVerFicha = (episodeId: string) => {
    console.log("🔍 VER FICHA - episodeId:", episodeId)
    console.log("📍 URL destino: PatientRecord component")
    
    const episode = state.episodes.find((e) => e.id === episodeId)
    console.log("📋 Episodio encontrado para Ver Ficha:", episode?.id)
    
    if (!episode) {
      console.error("❌ Episodio no encontrado para Ver Ficha")
      return
    }

    console.log("🔧 Preparando datos para Ver Ficha...")
    
    // 🎯 MISMO FORMATO QUE handleTakePatient PERO SIN CAMBIAR STATUS
    const patientData = {
      patient: {
        ...episode.patient,
        firstName: episode.patient.firstName || episode.patient.nombre_completo?.split(' ')[0] || 'Paciente',
        lastName: episode.patient.lastName || episode.patient.nombre_completo?.split(' ').slice(1).join(' ') || '',
        birthDate: episode.patient.birthDate || episode.patient.fecha_nacimiento || '',
      },
      episode: {
        ...episode,
        // ✅ MANTENER EL STATUS ORIGINAL (NO CAMBIAR A in-progress)
      },
      medicalHistory: []
    }
    
    console.log("📝 Configurando paciente seleccionado para Ver Ficha...")
    setSelectedPatient(patientData)
    
    console.log("🔄 Navegando a ficha del paciente...")
    dispatch({ type: "SET_SCREEN", payload: "patient" })
    
    console.log("✅ VER FICHA - NAVEGACIÓN COMPLETADA")
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
            <Card key={color} className="text-center bg-white shadow-sm border">
              <CardContent className="p-4 bg-white">
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
        <Card className="bg-white shadow-sm border">
          <CardHeader className="bg-white">
            <CardTitle className="text-gray-900">Lista de Espera</CardTitle>
            <CardDescription className="text-gray-600">Pacientes esperando atención ({waitingEpisodes.length})</CardDescription>
          </CardHeader>
          <CardContent className="bg-white">
            <div className="space-y-4">
              {waitingEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getTriageColor(episode.triageColor).color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {episode.patient.lastName || 'Sin apellido'}, {episode.patient.firstName || 'Sin nombre'} ({getAge(episode.patient.birthDate)})
                      </p>
                      <p className="text-sm text-gray-500">{episode.consultationReason || 'Sin motivo especificado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {(() => {
                      const triageStyle = getTriageColor(episode.triageColor);
                      return (
                        <Badge className={`${triageStyle.bg} ${triageStyle.text}`}>
                          {episode.triageColor || 'VERDE'}  
                        </Badge>
                      );
                    })()}
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
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleVerFicha(episode.id)}
                      >
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
