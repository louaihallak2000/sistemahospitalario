"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Hospital, LogOut, UserPlus, List, Package, Clock, User, AlertTriangle, Eye, RefreshCw } from "lucide-react"
import { useHospital } from "@/lib/context"
import { PatientRegistrationModal } from "./PatientRegistrationModal"
import type { TriageColor, Episode } from "@/lib/types"
import { PatientList } from "./PatientList"
import { TriageStats } from "./TriageStats"
import { Alerts } from "./Alerts"
import { AwaitingTriageList } from "./AwaitingTriageList"

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
  
  // 🔍 DEBUGGING: Ver episodios sin triaje específicamente
  console.log("🎨 Dashboard - Episodios sin triaje (state.episodesAwaitingTriage):", state.episodesAwaitingTriage)
  console.log("📈 Dashboard - Cantidad episodios sin triaje:", state.episodesAwaitingTriage.length)
  
  // 🎨 DEBUGGING: Ver los colores de triaje de cada episodio
  waitingEpisodes.forEach((episode, index) => {
    console.log(`🎨 Episodio ${index + 1}:`, {
      id: episode.id,
      triageColor: episode.triageColor,
      color_triaje: episode.color_triaje,
      patientName: episode.patient?.firstName + ' ' + episode.patient?.lastName || 'Sin nombre'
    })
  })

  // Helper para buscar un episodio por ID en ambas listas
  const findEpisodeById = (episodeId: string) => {
    // Busca primero en la lista principal, luego en la de triaje
    return (
      state.episodes.find((e) => e.id === episodeId) ||
      state.episodesAwaitingTriage.find((e) => e.id === episodeId)
    );
  };

  const handleTakePatient = (episodeId: string) => {
    // Buscar el episodio en ambas listas
    const episode = findEpisodeById(episodeId);
    console.log("📋 Episodio encontrado:", episode?.id);
    if (!episode) {
      console.error("❌ Episodio no encontrado");
      return;
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
    // Buscar el episodio en ambas listas
    const episode = findEpisodeById(episodeId);
    console.log("📋 Episodio encontrado para Ver Ficha:", episode?.id);
    if (!episode) {
      console.error("❌ Episodio no encontrado para Ver Ficha");
      return;
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <PatientList
              episodes={state.episodes}
              onSelectPatient={handleTakePatient}
            />
            <AwaitingTriageList
              episodes={state.episodesAwaitingTriage}
              onSelectPatient={handleTakePatient}
            />
          </div>
          <div className="space-y-6">
            <TriageStats stats={state.triageStats} total={state.episodes.length} />
            <Alerts alerts={state.alerts} />
          </div>
        </div>

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
      </div>

      {/* Modal de Registro de Paciente */}
      <PatientRegistrationModal open={showPatientModal} onOpenChange={setShowPatientModal} />
    </div>
  )
}
