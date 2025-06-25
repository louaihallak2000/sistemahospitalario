"use client"

import { useHospital } from "@/lib/context"
import {
  Activity,
  ArrowLeft,
  Clock,
  Eye,
  FileText,
  HeartPulse,
  Pill,
  Plus,
  RefreshCw,
  Stethoscope,
  Users
} from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { ScrollArea } from "./ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Textarea } from "./ui/textarea"

// Define la interfaz para un paciente admitido
interface AdmittedPatient {
  episodio_id: string
  paciente_nombre: string
  paciente_dni: string
  habitacion?: string
  ultimo_signos_vitales?: {
    presion_arterial_sistolica?: number
    presion_arterial_diastolica?: number
    frecuencia_cardiaca?: number
    frecuencia_respiratoria?: number
    temperatura?: number
    saturacion_oxigeno?: number
    peso?: number
    talla?: number
    dolor_escala?: number
    estado_conciencia?: string
    observaciones?: string
  } | null
  registros_recientes?: any[]
  tiempo_desde_ultimo_registro?: number | null
  prescriptions?: any[]
  triageColor?: string
  status?: string
  motivo_consulta?: string
}

interface VitalSignsForm {
  episodio_id: string
  presion_arterial_sistolica: number | null
  presion_arterial_diastolica: number | null
  frecuencia_cardiaca: number | null
  frecuencia_respiratoria: number | null
  temperatura: number | null
  saturacion_oxigeno: number | null
  peso: number | null
  talla: number | null
  dolor_escala: number | null
  estado_conciencia: string
  observaciones: string
}

interface NursingNoteForm {
  episodio_id: string
  tipo_registro: string
  titulo: string
  descripcion: string
  procedimiento_realizado: string
  medicamento: string
  dosis_administrada: string
  via_administracion: string
  turno: string
  requiere_seguimiento: string
}

export function NursingView() {
  const { state, fetchAdmittedPatients, registerVitalSigns, registerNursingNote, dispatch } = useHospital()
  const [patients, setPatients] = useState<AdmittedPatient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<AdmittedPatient | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("vital-signs")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  // Estados para formularios
  const [vitalSignsForm, setVitalSignsForm] = useState<VitalSignsForm>({
    episodio_id: "",
    presion_arterial_sistolica: null,
    presion_arterial_diastolica: null,
    frecuencia_cardiaca: null,
    frecuencia_respiratoria: null,
    temperatura: null,
    saturacion_oxigeno: null,
    peso: null,
    talla: null,
    dolor_escala: null,
    estado_conciencia: "Alerta",
    observaciones: ""
  })

  const [nursingNoteForm, setNursingNoteForm] = useState<NursingNoteForm>({
    episodio_id: "",
    tipo_registro: "Nota",
    titulo: "",
    descripcion: "",
    procedimiento_realizado: "",
    medicamento: "",
    dosis_administrada: "",
    via_administracion: "",
    turno: "Mañana",
    requiere_seguimiento: "N"
  })

  useEffect(() => {
    loadData()
  }, [lastUpdate])

  const loadData = async () => {
    setIsLoading(true)
    try {
      console.log("🔄 Cargando datos de enfermería...")
      const data = await fetchAdmittedPatients()
      console.log("📊 Datos recibidos:", data)
      if (data) {
        setPatients(data)
        console.log("✅ Pacientes establecidos:", data.length)
      }
    } catch (error) {
      console.error("Error cargando datos de enfermería:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refrescarDatos = () => {
    console.log("🔄 Refrescando datos de enfermería manualmente...")
    setLastUpdate(Date.now())
  }

  const handleRegisterCare = (patient: AdmittedPatient) => {
    console.log("👩‍⚕️ Registrando cuidado para:", patient.paciente_nombre)
    setSelectedPatient(patient)
    setVitalSignsForm(prev => ({ ...prev, episodio_id: patient.episodio_id }))
    setNursingNoteForm(prev => ({ ...prev, episodio_id: patient.episodio_id }))
    setIsDialogOpen(true)
  }

  const handleVitalSignsSubmit = async () => {
    if (!selectedPatient) return

    try {
      setIsLoading(true)
      await registerVitalSigns(vitalSignsForm)

      // Resetear formulario
      setVitalSignsForm({
        episodio_id: selectedPatient.episodio_id,
        presion_arterial_sistolica: null,
        presion_arterial_diastolica: null,
        frecuencia_cardiaca: null,
        frecuencia_respiratoria: null,
        temperatura: null,
        saturacion_oxigeno: null,
        peso: null,
        talla: null,
        dolor_escala: null,
        estado_conciencia: "Alerta",
        observaciones: ""
      })

      // Recargar datos
      await loadData()
      setIsDialogOpen(false)

      alert("Signos vitales registrados exitosamente")
    } catch (error) {
      console.error("Error registrando signos vitales:", error)
      alert("Error al registrar signos vitales")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNursingNoteSubmit = async () => {
    if (!selectedPatient) return

    try {
      setIsLoading(true)
      await registerNursingNote(nursingNoteForm)

      // Resetear formulario
      setNursingNoteForm({
        episodio_id: selectedPatient.episodio_id,
        tipo_registro: "Nota",
        titulo: "",
        descripcion: "",
        procedimiento_realizado: "",
        medicamento: "",
        dosis_administrada: "",
        via_administracion: "",
        turno: "Mañana",
        requiere_seguimiento: "N"
      })

      // Recargar datos
      await loadData()
      setIsDialogOpen(false)

      alert("Nota de enfermería registrada exitosamente")
    } catch (error) {
      console.error("Error registrando nota de enfermería:", error)
      alert("Error al registrar nota de enfermería")
    } finally {
      setIsLoading(false)
    }
  }

  const getLastVitalSigns = (patient: AdmittedPatient) => {
    if (!patient.ultimo_signos_vitales) {
      return <span className="text-gray-500 italic">Sin registros</span>
    }

    const vitals = patient.ultimo_signos_vitales
    return (
      <div className="text-sm space-y-1">
        {vitals.presion_arterial_sistolica && vitals.presion_arterial_diastolica && (
          <div>PA: {vitals.presion_arterial_sistolica}/{vitals.presion_arterial_diastolica} mmHg</div>
        )}
        {vitals.frecuencia_cardiaca && (
          <div>FC: {vitals.frecuencia_cardiaca} lpm</div>
        )}
        {vitals.temperatura && (
          <div>T°: {vitals.temperatura}°C</div>
        )}
        {vitals.saturacion_oxigeno && (
          <div>SatO2: {vitals.saturacion_oxigeno}%</div>
        )}
      </div>
    )
  }

  const getTimeSinceLastRecord = (minutes: number | null | undefined) => {
    if (!minutes) return <Badge variant="outline">Sin registros</Badge>

    if (minutes < 60) {
      return <Badge variant="default">{minutes} min</Badge>
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      return <Badge variant="secondary">{hours}h</Badge>
    } else {
      const days = Math.floor(minutes / 1440)
      return <Badge variant="destructive">{days}d</Badge>
    }
  }

  const getTriageColorBadge = (color?: string) => {
    if (!color) return <Badge variant="outline">Sin triaje</Badge>

    const colors: Record<string, string> = {
      'ROJO': 'bg-red-100 text-red-800 border-red-300',
      'NARANJA': 'bg-orange-100 text-orange-800 border-orange-300',
      'AMARILLO': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'VERDE': 'bg-green-100 text-green-800 border-green-300',
      'AZUL': 'bg-blue-100 text-blue-800 border-blue-300'
    }

    return (
      <Badge className={colors[color] || 'bg-gray-100 text-gray-800'}>
        {color}
      </Badge>
    )
  }

  const getPrescriptionsInfo = (patient: AdmittedPatient) => {
    const prescriptions = patient.prescriptions || []
    const activePrescriptions = prescriptions.filter(p => p.status === 'active')

    if (activePrescriptions.length === 0) {
      return <span className="text-gray-500 italic">Sin medicamentos</span>
    }

    return (
      <div className="space-y-1">
        {activePrescriptions.slice(0, 2).map((prescription: any, index: number) => (
          <div key={index} className="text-sm">
            <span className="font-medium">{prescription.medication}</span>
            <span className="text-gray-600 ml-1">({prescription.dose})</span>
          </div>
        ))}
        {activePrescriptions.length > 2 && (
          <div className="text-xs text-blue-600">+{activePrescriptions.length - 2} más</div>
        )}
      </div>
    )
  }

  const navigateToHome = () => {
    dispatch({ type: "SET_SCREEN", payload: "dashboard" })
  }

  // Calcular contadores totales
  const totalPrescriptions = patients.reduce((total, p) => total + (p.prescriptions?.length || 0), 0)
  const activePrescriptions = patients.reduce((total, p) =>
    total + (p.prescriptions?.filter(pr => pr.status === 'active').length || 0), 0)

  // Componente del formulario de signos vitales
  const VitalSignsFormComponent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="presion_sistolica">Presión Sistólica (mmHg)</Label>
          <Input
            id="presion_sistolica"
            type="number"
            value={vitalSignsForm.presion_arterial_sistolica || ""}
            onChange={(e) => setVitalSignsForm(prev => ({
              ...prev,
              presion_arterial_sistolica: e.target.value ? parseInt(e.target.value) : null
            }))}
            placeholder="120"
          />
        </div>
        <div>
          <Label htmlFor="presion_diastolica">Presión Diastólica (mmHg)</Label>
          <Input
            id="presion_diastolica"
            type="number"
            value={vitalSignsForm.presion_arterial_diastolica || ""}
            onChange={(e) => setVitalSignsForm(prev => ({
              ...prev,
              presion_arterial_diastolica: e.target.value ? parseInt(e.target.value) : null
            }))}
            placeholder="80"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="frecuencia_cardiaca">Frecuencia Cardíaca (lpm)</Label>
          <Input
            id="frecuencia_cardiaca"
            type="number"
            value={vitalSignsForm.frecuencia_cardiaca || ""}
            onChange={(e) => setVitalSignsForm(prev => ({
              ...prev,
              frecuencia_cardiaca: e.target.value ? parseInt(e.target.value) : null
            }))}
            placeholder="72"
          />
        </div>
        <div>
          <Label htmlFor="frecuencia_respiratoria">Frecuencia Respiratoria (/min)</Label>
          <Input
            id="frecuencia_respiratoria"
            type="number"
            value={vitalSignsForm.frecuencia_respiratoria || ""}
            onChange={(e) => setVitalSignsForm(prev => ({
              ...prev,
              frecuencia_respiratoria: e.target.value ? parseInt(e.target.value) : null
            }))}
            placeholder="16"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="temperatura">Temperatura (°C)</Label>
          <Input
            id="temperatura"
            type="number"
            step="0.1"
            value={vitalSignsForm.temperatura || ""}
            onChange={(e) => setVitalSignsForm(prev => ({
              ...prev,
              temperatura: e.target.value ? parseFloat(e.target.value) : null
            }))}
            placeholder="36.5"
          />
        </div>
        <div>
          <Label htmlFor="saturacion_oxigeno">Saturación O2 (%)</Label>
          <Input
            id="saturacion_oxigeno"
            type="number"
            value={vitalSignsForm.saturacion_oxigeno || ""}
            onChange={(e) => setVitalSignsForm(prev => ({
              ...prev,
              saturacion_oxigeno: e.target.value ? parseInt(e.target.value) : null
            }))}
            placeholder="98"
          />
        </div>
        <div>
          <Label htmlFor="dolor_escala">Dolor (1-10)</Label>
          <Input
            id="dolor_escala"
            type="number"
            min="0"
            max="10"
            value={vitalSignsForm.dolor_escala || ""}
            onChange={(e) => setVitalSignsForm(prev => ({
              ...prev,
              dolor_escala: e.target.value ? parseInt(e.target.value) : null
            }))}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="peso">Peso (kg)</Label>
          <Input
            id="peso"
            type="number"
            step="0.1"
            value={vitalSignsForm.peso || ""}
            onChange={(e) => setVitalSignsForm(prev => ({
              ...prev,
              peso: e.target.value ? parseFloat(e.target.value) : null
            }))}
            placeholder="70"
          />
        </div>
        <div>
          <Label htmlFor="talla">Talla (cm)</Label>
          <Input
            id="talla"
            type="number"
            value={vitalSignsForm.talla || ""}
            onChange={(e) => setVitalSignsForm(prev => ({
              ...prev,
              talla: e.target.value ? parseInt(e.target.value) : null
            }))}
            placeholder="170"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="estado_conciencia">Estado de Conciencia</Label>
        <Select
          value={vitalSignsForm.estado_conciencia}
          onValueChange={(value) => setVitalSignsForm(prev => ({ ...prev, estado_conciencia: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alerta">Alerta</SelectItem>
            <SelectItem value="Somnoliento">Somnoliento</SelectItem>
            <SelectItem value="Confuso">Confuso</SelectItem>
            <SelectItem value="Estuporoso">Estuporoso</SelectItem>
            <SelectItem value="Comatoso">Comatoso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          value={vitalSignsForm.observaciones}
          onChange={(e) => setVitalSignsForm(prev => ({ ...prev, observaciones: e.target.value }))}
          placeholder="Observaciones adicionales..."
          rows={3}
        />
      </div>

      <Button
        onClick={handleVitalSignsSubmit}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Guardando..." : "Registrar Signos Vitales"}
      </Button>
    </div>
  )

  // Componente del formulario de nota de enfermería
  const NursingNoteFormComponent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo_registro">Tipo de Registro</Label>
          <Select
            value={nursingNoteForm.tipo_registro}
            onValueChange={(value) => setNursingNoteForm(prev => ({ ...prev, tipo_registro: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nota">Nota</SelectItem>
              <SelectItem value="Procedimiento">Procedimiento</SelectItem>
              <SelectItem value="Medicacion">Medicación</SelectItem>
              <SelectItem value="Observacion">Observación</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="turno">Turno</Label>
          <Select
            value={nursingNoteForm.turno}
            onValueChange={(value) => setNursingNoteForm(prev => ({ ...prev, turno: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mañana">Mañana</SelectItem>
              <SelectItem value="Tarde">Tarde</SelectItem>
              <SelectItem value="Noche">Noche</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          value={nursingNoteForm.titulo}
          onChange={(e) => setNursingNoteForm(prev => ({ ...prev, titulo: e.target.value }))}
          placeholder="Título del registro"
        />
      </div>

      <div>
        <Label htmlFor="descripcion">Descripción *</Label>
        <Textarea
          id="descripcion"
          value={nursingNoteForm.descripcion}
          onChange={(e) => setNursingNoteForm(prev => ({ ...prev, descripcion: e.target.value }))}
          placeholder="Descripción detallada del registro..."
          rows={4}
          required
        />
      </div>

      {nursingNoteForm.tipo_registro === "Procedimiento" && (
        <div>
          <Label htmlFor="procedimiento_realizado">Procedimiento Realizado</Label>
          <Input
            id="procedimiento_realizado"
            value={nursingNoteForm.procedimiento_realizado}
            onChange={(e) => setNursingNoteForm(prev => ({ ...prev, procedimiento_realizado: e.target.value }))}
            placeholder="Descripción del procedimiento"
          />
        </div>
      )}

      {nursingNoteForm.tipo_registro === "Medicacion" && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="medicamento">Medicamento</Label>
            <Input
              id="medicamento"
              value={nursingNoteForm.medicamento}
              onChange={(e) => setNursingNoteForm(prev => ({ ...prev, medicamento: e.target.value }))}
              placeholder="Nombre del medicamento"
            />
          </div>
          <div>
            <Label htmlFor="dosis_administrada">Dosis</Label>
            <Input
              id="dosis_administrada"
              value={nursingNoteForm.dosis_administrada}
              onChange={(e) => setNursingNoteForm(prev => ({ ...prev, dosis_administrada: e.target.value }))}
              placeholder="500mg"
            />
          </div>
          <div>
            <Label htmlFor="via_administracion">Vía</Label>
            <Select
              value={nursingNoteForm.via_administracion}
              onValueChange={(value) => setNursingNoteForm(prev => ({ ...prev, via_administracion: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar vía" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Oral">Oral</SelectItem>
                <SelectItem value="IV">Intravenosa</SelectItem>
                <SelectItem value="IM">Intramuscular</SelectItem>
                <SelectItem value="SC">Subcutánea</SelectItem>
                <SelectItem value="Topica">Tópica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="requiere_seguimiento">¿Requiere Seguimiento?</Label>
        <Select
          value={nursingNoteForm.requiere_seguimiento}
          onValueChange={(value) => setNursingNoteForm(prev => ({ ...prev, requiere_seguimiento: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="N">No</SelectItem>
            <SelectItem value="S">Sí</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleNursingNoteSubmit}
        disabled={isLoading || !nursingNoteForm.descripcion}
        className="w-full"
      >
        {isLoading ? "Guardando..." : "Registrar Nota"}
      </Button>
    </div>
  )

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={navigateToHome}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <HeartPulse className="h-6 w-6 text-blue-600" />
                Dashboard de Enfermería
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestión de cuidados y registros de enfermería
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={refrescarDatos}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>

            <Badge variant="outline" className="bg-green-50">
              <Users className="h-4 w-4 mr-1" />
              {patients.length} pacientes
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Pill className="h-4 w-4 mr-1" />
              {activePrescriptions} activas
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              <Pill className="h-4 w-4 mr-1" />
              {totalPrescriptions} total
            </Badge>
            <div className="text-sm text-gray-500">
              Hospital: {state.user?.hospital_id || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Content with Scroll */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Pacientes en Atención
                  </CardTitle>
                  <CardDescription>
                    Lista de pacientes activos para seguimiento de enfermería ({patients.length} pacientes)
                  </CardDescription>
                </div>
                <div className="text-sm text-gray-500">
                  Última actualización: {new Date(lastUpdate).toLocaleTimeString('es-AR')}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-5 w-5 animate-spin" />
                    Cargando pacientes...
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[600px] w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>DNI</TableHead>
                        <TableHead>Triaje</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Prescripciones Activas</TableHead>
                        <TableHead>Últimos Signos Vitales</TableHead>
                        <TableHead>Último Registro</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients.map((patient) => (
                        <TableRow key={patient.episodio_id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{patient.paciente_nombre}</div>
                              <div className="text-sm text-gray-500">{patient.motivo_consulta}</div>
                            </div>
                          </TableCell>
                          <TableCell>{patient.paciente_dni}</TableCell>
                          <TableCell>
                            {getTriageColorBadge(patient.triageColor)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {patient.habitacion || "Sin asignar"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getPrescriptionsInfo(patient)}
                          </TableCell>
                          <TableCell>
                            {getLastVitalSigns(patient)}
                          </TableCell>
                          <TableCell>
                            {getTimeSinceLastRecord(patient.tiempo_desde_ultimo_registro)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleRegisterCare(patient)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Registrar
                              </Button>
                              {patient.prescriptions && patient.prescriptions.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // TODO: Implementar vista de prescripciones
                                    alert(`Prescripciones de ${patient.paciente_nombre}:\n\n${patient.prescriptions?.map((p: any) =>
                                      `• ${p.medication} - ${p.dose} - ${p.frequency}`
                                    ).join('\n') || 'Sin prescripciones'
                                      }`)
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver Meds
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}

              {!isLoading && patients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No hay pacientes en atención actualmente</p>
                  <p className="text-sm">Los pacientes aparecerán aquí cuando estén en la lista de espera</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={refrescarDatos}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Verificar nuevos pacientes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Modal de Registro */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-blue-600" />
              Registro de Enfermería - {selectedPatient?.paciente_nombre}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vital-signs" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Signos Vitales
                </TabsTrigger>
                <TabsTrigger value="nursing-note" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Nota de Enfermería
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vital-signs" className="mt-4">
                <VitalSignsFormComponent />
              </TabsContent>

              <TabsContent value="nursing-note" className="mt-4">
                <NursingNoteFormComponent />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 