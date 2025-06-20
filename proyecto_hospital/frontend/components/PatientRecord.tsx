"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  User,
  AlertTriangle,
  Heart,
  Thermometer,
  Activity,
  Droplets,
  Plus,
  FileText,
  History,
  Printer,
  UserCheck,
  Building,
  Edit,
  Check,
  Clock,
  Calendar,
  Eye,
} from "lucide-react"
import { useHospital } from "@/lib/context"
import { PrescriptionModal } from "./modals/PrescriptionModal"
import { StudyModal } from "./modals/StudyModal"
import { ReferralModal } from "./modals/ReferralModal"
import { EvolutionModal } from "./modals/EvolutionModal"
import { DischargeModal } from "./modals/DischargeModal"
import { AdmissionModal } from "./modals/AdmissionModal"

export function PatientRecord() {
  const { state, dispatch, updateVitalSigns, updateStudyStatus, printStudyOrder, printPatientRecord } = useHospital()
  const [activeTab, setActiveTab] = useState("episode")
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [showStudyModal, setShowStudyModal] = useState(false)
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [showEvolutionModal, setShowEvolutionModal] = useState(false)
  const [showDischargeModal, setShowDischargeModal] = useState(false)
  const [showAdmissionModal, setShowAdmissionModal] = useState(false)
  const [editingVitals, setEditingVitals] = useState(false)
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: "120/80",
    heartRate: 72,
    temperature: 36.5,
    oxygenSaturation: 98,
  })

  const patient = state.selectedPatient?.patient
  const episode = state.selectedPatient?.episode

  // 🚨 DEBUGGING CRÍTICO: Estados de prescripciones y estudios
  console.log("🚨 === DEBUGGING CRÍTICO PatientRecord ===")
  console.log("👤 PatientRecord - selectedPatient:", state.selectedPatient)
  console.log("📋 PatientRecord - episode:", episode)
  console.log("📋 PatientRecord - episode ID:", episode?.id)
  
  // 🔍 VERIFICAR ARRAYS ANTES DE INICIALIZAR
  console.log("🔍 ANTES - episode.prescriptions:", (episode as any)?.prescriptions)
  console.log("🔍 ANTES - episode.studies:", (episode as any)?.studies)
  console.log("🔍 ANTES - episode.evolutions:", (episode as any)?.evolutions)
  
  // ✅ INICIALIZAR ARRAYS SI NO EXISTEN (CRÍTICO)
  const episodeWithArrays = episode ? {
    ...episode,
    prescriptions: (episode as any).prescriptions || [],
    studies: (episode as any).studies || [],
    evolutions: (episode as any).evolutions || []
  } : null

  console.log("✅ DESPUÉS - episodeWithArrays.prescriptions:", (episodeWithArrays as any)?.prescriptions)
  console.log("✅ DESPUÉS - prescriptions count:", (episodeWithArrays as any)?.prescriptions?.length || 0)
  console.log("✅ DESPUÉS - episodeWithArrays.studies:", (episodeWithArrays as any)?.studies)
  console.log("✅ DESPUÉS - studies count:", (episodeWithArrays as any)?.studies?.length || 0)
  console.log("✅ DESPUÉS - episodeWithArrays.evolutions:", (episodeWithArrays as any)?.evolutions)
  console.log("✅ DESPUÉS - evolutions count:", (episodeWithArrays as any)?.evolutions?.length || 0)
  
  // 🎯 FILTRAR PRESCRIPCIONES POR ESTADO
  const activePrescriptions = (episodeWithArrays as any)?.prescriptions?.filter((p: any) => p.status === "active") || []
  const administeredPrescriptions = (episodeWithArrays as any)?.prescriptions?.filter((p: any) => p.status === "administered") || []
  
  console.log("💊 ACTIVE prescriptions:", activePrescriptions)
  console.log("💊 ADMINISTERED prescriptions:", administeredPrescriptions)
  
  // 🎯 FILTRAR ESTUDIOS POR ESTADO  
  const pendingStudies = (episodeWithArrays as any)?.studies?.filter((s: any) => s.status === "pending") || []
  const sentStudies = (episodeWithArrays as any)?.studies?.filter((s: any) => s.status === "sent") || []
  const completedStudies = (episodeWithArrays as any)?.studies?.filter((s: any) => s.status === "completed") || []
  
  console.log("🔬 PENDING studies:", pendingStudies)
  console.log("🔬 SENT studies:", sentStudies)
  console.log("🔬 COMPLETED studies:", completedStudies)
  console.log("🚨 === FIN DEBUGGING CRÍTICO ===")

  if (!patient || !episode) {
    console.error("❌ PatientRecord - Paciente o episodio no encontrado")
    return <div>Paciente no encontrado</div>
  }

  const getAge = (birthDate?: string) => {
    if (!birthDate) return "N/A"
    const today = new Date()
    const birth = new Date(birthDate)
    return today.getFullYear() - birth.getFullYear()
  }

  const handleBackToDashboard = () => {
    dispatch({ type: "SET_SCREEN", payload: "dashboard" })
    dispatch({ type: "SET_SELECTED_PATIENT", payload: null })
  }

  const handleSaveVitals = async () => {
    await updateVitalSigns(episode.id, vitalSigns)
    setEditingVitals(false)
  }

  const handleDischargePatient = () => {
    console.log("🏥 Abriendo modal de alta médica")
    setShowDischargeModal(true)
  }

  const handleAdmitPatient = () => {
    console.log("🏥 Abriendo modal de internación")
    setShowAdmissionModal(true)
  }

  const handlePrintRecord = () => {
    console.log("🖨️ Imprimiendo ficha médica completa")
    printPatientRecord(patient, episode, vitalSigns)
  }

  // 🎯 DETERMINAR MODO DE VISUALIZACIÓN
  const isInProgress = episode.status === "in-progress"
  const isReadOnlyMode = episode.status === "waiting"
  
  console.log("🔍 MODO ACTUAL:", {
    status: episode.status,
    isInProgress,
    isReadOnlyMode,
    mode: isInProgress ? "ATENCIÓN ACTIVA" : "SOLO CONSULTA"
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBackToDashboard}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div className="text-sm text-gray-500">
                Dashboard &gt; Lista Espera &gt; {patient.lastName}, {patient.firstName}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDischargePatient}
                disabled={isReadOnlyMode}
                title={isReadOnlyMode ? "Debe 'TOMAR' al paciente para dar de alta" : "Dar de alta al paciente"}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Alta
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAdmitPatient}
                disabled={isReadOnlyMode}
                title={isReadOnlyMode ? "Debe 'TOMAR' al paciente para internar" : "Internar al paciente"}
              >
                <Building className="h-4 w-4 mr-2" />
                Internar
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintRecord}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de Modo de Visualización */}
        {isReadOnlyMode && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <Eye className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>👁️ MODO CONSULTA:</strong> Visualizando información del paciente. 
              Para realizar acciones médicas, use el botón <strong>"TOMAR"</strong> desde la lista de espera.
            </AlertDescription>
          </Alert>
        )}
        
        {isInProgress && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <User className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>👨‍⚕️ PACIENTE EN ATENCIÓN:</strong> Todas las funcionalidades médicas están disponibles.
            </AlertDescription>
          </Alert>
        )}

        {/* Patient Header */}
        <Card className="mb-6 bg-white shadow-sm border">
          <CardContent className="p-6 bg-white">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.lastName}, {patient.firstName}
                </h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                  <div>
                    <span className="text-gray-500">Edad:</span>
                    <span className="ml-2 font-medium">{getAge(patient.birthDate)} años</span>
                  </div>
                  <div>
                    <span className="text-gray-500">DNI:</span>
                    <span className="ml-2 font-medium">{patient.dni}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Obra Social:</span>
                    <span className="ml-2 font-medium">{patient.insurance || "Sin cobertura"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Estado:</span>
                    {isInProgress ? (
                      <Badge className="ml-2 bg-blue-100 text-blue-800">👨‍⚕️ En Atención Activa</Badge>
                    ) : (
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800">👁️ Solo Consulta</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Allergies Alert */}
            {patient.allergies && patient.allergies.length > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>⚠️ ALÉRGICO A:</strong> {patient.allergies.join(", ")}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card className="mb-6 bg-white shadow-sm border">
          <CardHeader className="bg-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-gray-900">Signos Vitales</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (editingVitals ? handleSaveVitals() : setEditingVitals(true))}
              >
                {editingVitals ? <Check className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {editingVitals ? "Guardar" : "Editar"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="bg-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <Heart className="h-8 w-8 text-red-500" />
                <div>
                  <Label className="text-sm text-gray-500">Presión Arterial</Label>
                  {editingVitals ? (
                    <Input
                      value={vitalSigns.bloodPressure}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{vitalSigns.bloodPressure} mmHg</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8 text-blue-500" />
                <div>
                  <Label className="text-sm text-gray-500">Frecuencia Cardíaca</Label>
                  {editingVitals ? (
                    <Input
                      type="number"
                      value={vitalSigns.heartRate}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: Number.parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{vitalSigns.heartRate} lpm</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Thermometer className="h-8 w-8 text-orange-500" />
                <div>
                  <Label className="text-sm text-gray-500">Temperatura</Label>
                  {editingVitals ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={vitalSigns.temperature}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: Number.parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{vitalSigns.temperature}°C</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Droplets className="h-8 w-8 text-cyan-500" />
                <div>
                  <Label className="text-sm text-gray-500">Saturación O2</Label>
                  {editingVitals ? (
                    <Input
                      type="number"
                      value={vitalSigns.oxygenSaturation}
                      onChange={(e) =>
                        setVitalSigns({ ...vitalSigns, oxygenSaturation: Number.parseInt(e.target.value) })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{vitalSigns.oxygenSaturation}%</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="episode">Episodio Actual</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescripciones</TabsTrigger>
            <TabsTrigger value="studies">Estudios</TabsTrigger>
            <TabsTrigger value="history">Historia Clínica</TabsTrigger>
          </TabsList>

          {/* Episode Tab */}
          <TabsContent value="episode">
            <Card className="bg-white shadow-sm border">
              <CardHeader className="bg-white">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-gray-900">Evoluciones Médicas</CardTitle>
                  <Button 
                    onClick={() => setShowEvolutionModal(true)}
                    disabled={isReadOnlyMode}
                    title={isReadOnlyMode ? "Debe 'TOMAR' al paciente para agregar evoluciones" : "Agregar nueva evolución médica"}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Evolución
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(episodeWithArrays as any)?.evolutions?.map((evolution: any) => (
                    <div key={evolution.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>{evolution.date}</span>
                        <Clock className="h-4 w-4" />
                        <span>{evolution.time}</span>
                        <span>-</span>
                        <span className="font-medium">{evolution.doctor}</span>
                      </div>
                      <p className="text-gray-900">{evolution.content}</p>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay evoluciones registradas</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Medicamentos</CardTitle>
                  <Button 
                    onClick={() => setShowPrescriptionModal(true)}
                    disabled={isReadOnlyMode}
                    title={isReadOnlyMode ? "Debe 'TOMAR' al paciente para prescribir medicamentos" : "Prescribir nuevo medicamento"}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Prescribir Medicamento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-green-700 mb-3">Medicamentos Activos</h3>
                    <div className="space-y-2">
                      {activePrescriptions.map((prescription: any) => (
                        <div
                          key={prescription.id}
                          className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{prescription.medication}</p>
                            <p className="text-sm text-gray-600">
                              {prescription.dose} - {prescription.frequency} - {prescription.route}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Pendiente</Badge>
                        </div>
                      )) || <p className="text-gray-500">No hay medicamentos activos</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-blue-700 mb-3">Medicamentos Administrados</h3>
                    <div className="space-y-2">
                      {administeredPrescriptions.map((prescription: any) => (
                        <div
                          key={prescription.id}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{prescription.medication}</p>
                            <p className="text-sm text-gray-600">
                              {prescription.administeredAt} - {prescription.administeredBy}
                            </p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">✅ Administrado</Badge>
                        </div>
                      )) || <p className="text-gray-500">No hay medicamentos administrados</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Studies Tab */}
          <TabsContent value="studies">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Estudios</CardTitle>
                  <Button 
                    onClick={() => setShowStudyModal(true)}
                    disabled={isReadOnlyMode}
                    title={isReadOnlyMode ? "Debe 'TOMAR' al paciente para solicitar estudios" : "Solicitar nuevos estudios"}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Solicitar Estudios
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-orange-700 mb-3">Órdenes Pendientes</h3>
                    <div className="space-y-2">
                      {pendingStudies.map((study: any) => (
                        <div key={study.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{study.name}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="capitalize">{study.type === 'laboratory' ? 'Laboratorio' : 'Imágenes'}</span>
                                {study.priority && (
                                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                    study.priority === 'emergency' 
                                      ? 'bg-red-100 text-red-800' 
                                      : study.priority === 'urgent' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {study.priority === 'emergency' ? 'Emergencia' : study.priority === 'urgent' ? 'Urgente' : 'Normal'}
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Solicitado por: {study.orderedBy} - {new Date(study.orderedAt).toLocaleDateString()}
                              </p>
                              {study.observations && (
                                <p className="text-sm text-gray-700 mt-2 italic">
                                  "{study.observations}"
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col space-y-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => printStudyOrder(patient, episode, study)}
                                className="bg-white hover:bg-gray-50"
                              >
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir Orden
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStudyStatus(episode.id, study.id, "sent")}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                              >
                                ✈️ Marcar Enviado
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStudyStatus(episode.id, study.id, "completed")}
                                className="bg-green-50 hover:bg-green-100 text-green-700"
                              >
                                ✅ Marcar Completado
                              </Button>
                            </div>
                          </div>
                        </div>
                      )) || <p className="text-gray-500">No hay estudios pendientes</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-blue-700 mb-3">Estudios Enviados</h3>
                    <div className="space-y-2">
                      {sentStudies.map((study: any) => (
                        <div key={study.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{study.name}</p>
                              <p className="text-sm text-gray-600">
                                <span className="capitalize">{study.type === 'laboratory' ? 'Laboratorio' : 'Imágenes'}</span>
                                {study.priority && (
                                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                    study.priority === 'emergency' 
                                      ? 'bg-red-100 text-red-800' 
                                      : study.priority === 'urgent' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {study.priority === 'emergency' ? 'Emergencia' : study.priority === 'urgent' ? 'Urgente' : 'Normal'}
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">
                                Enviado - Esperando resultados
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStudyStatus(episode.id, study.id, "completed")}
                              className="bg-green-50 hover:bg-green-100 text-green-700"
                            >
                              ✅ Marcar Completado
                            </Button>
                          </div>
                        </div>
                      )) || <p className="text-gray-500">No hay estudios enviados</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-green-700 mb-3">Resultados Disponibles</h3>
                    <div className="space-y-2">
                      {completedStudies.map((study: any) => (
                        <div key={study.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{study.name}</p>
                              <p className="text-sm text-gray-600">
                                <span className="capitalize">{study.type === 'laboratory' ? 'Laboratorio' : 'Imágenes'}</span>
                                {study.priority && (
                                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                    study.priority === 'emergency' 
                                      ? 'bg-red-100 text-red-800' 
                                      : study.priority === 'urgent' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {study.priority === 'emergency' ? 'Emergencia' : study.priority === 'urgent' ? 'Urgente' : 'Normal'}
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">
                                Completado: {study.resultDate ? new Date(study.resultDate).toLocaleDateString() : 'Hoy'}
                              </p>
                              {study.observations && (
                                <p className="text-sm text-gray-700 mt-1 italic">
                                  Observaciones: "{study.observations}"
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                              >
                                📋 Ver Resultado
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-gray-50 hover:bg-gray-100"
                              >
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir
                              </Button>
                            </div>
                          </div>
                        </div>
                      )) || <p className="text-gray-500">No hay resultados disponibles</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historia Clínica</CardTitle>
                <CardDescription>Episodios anteriores del paciente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.selectedPatient?.medicalHistory?.map((history) => (
                    <div key={history.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{history.diagnosis}</p>
                          <p className="text-sm text-gray-600">
                            {history.hospital} - {history.doctor}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">{history.date}</span>
                      </div>
                      <p className="text-sm text-gray-700">{history.summary}</p>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay historia clínica disponible</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <PrescriptionModal open={showPrescriptionModal} onOpenChange={setShowPrescriptionModal} />
      <StudyModal open={showStudyModal} onOpenChange={setShowStudyModal} />
      <ReferralModal open={showReferralModal} onOpenChange={setShowReferralModal} />
      <EvolutionModal open={showEvolutionModal} onOpenChange={setShowEvolutionModal} />
      <DischargeModal open={showDischargeModal} onOpenChange={setShowDischargeModal} />
      <AdmissionModal open={showAdmissionModal} onOpenChange={setShowAdmissionModal} />
    </div>
  )
}
