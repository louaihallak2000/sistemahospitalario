"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useHospital } from "@/lib/context"
import type { TriageColor } from "@/lib/types"
import { Hospital, LogOut, RefreshCw, UserPlus } from "lucide-react"
import { useState } from "react"
import { Alerts } from "./Alerts"
import { AwaitingTriageList } from "./AwaitingTriageList"
import { PatientList } from "./PatientList"
import { PatientRegistrationModal } from "./PatientRegistrationModal"
import { TriageStats } from "./TriageStats"

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

  const navigateToNursing = () => {
    console.log("👩‍⚕️ Navegando a Enfermería...")
    dispatch({ type: "SET_SCREEN", payload: "nursing" })
  }

  const navigateToShockroom = () => {
    console.log("🚨 Navegando a Shockroom...")
    dispatch({ type: "SET_SCREEN", payload: "shockroom" })
  }

  const getAge = (birthDate?: string) => {
    if (!birthDate) return "N/A"
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    return age
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Fixed */}
      <header className="bg-white shadow-sm border-b shrink-0">
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

      {/* Botones de Acción Rápida - Fixed */}
      <div className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4 shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setShowPatientModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Paciente
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Listas de Pacientes - Columna Principal */}
              <div className="xl:col-span-2 space-y-6">
                {/* Lista de Espera Principal */}
                <div className="w-full">
                  <PatientList
                    episodes={state.episodes}
                    onSelectPatient={handleTakePatient}
                  />
                </div>

                {/* Lista de Espera de Triaje */}
                <div className="w-full">
                  <AwaitingTriageList
                    episodes={state.episodesAwaitingTriage}
                    onSelectPatient={handleVerFicha}
                  />
                </div>
              </div>

              {/* Sidebar - Estadísticas y Alertas */}
              <div className="xl:col-span-1 space-y-6">
                <div className="sticky top-0 space-y-6">
                  <TriageStats stats={state.triageStats} total={state.episodes.length} />
                  <Alerts alerts={state.alerts} />
                </div>
              </div>
            </div>

            {/* Información de Estado del Sistema */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="text-2xl font-bold text-blue-600">{state.episodes.length}</div>
                  <div className="text-sm text-gray-600">Pacientes en Lista</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="text-2xl font-bold text-orange-600">{state.episodesAwaitingTriage.length}</div>
                  <div className="text-sm text-gray-600">Esperando Triaje</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="text-2xl font-bold text-green-600">{state.triageStats.total}</div>
                  <div className="text-sm text-gray-600">Total Atendidos</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="text-2xl font-bold text-red-600">{state.triageStats.critical || 0}</div>
                  <div className="text-sm text-gray-600">Casos Críticos</div>
                </div>
              </div>
            </div>

            {/* Espacio adicional para scroll */}
            <div className="h-20"></div>
          </div>
        </ScrollArea>
      </div>

      {/* Modal de Registro de Paciente */}
      <PatientRegistrationModal open={showPatientModal} onOpenChange={setShowPatientModal} />
    </div>
  )
}
