"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { 
  UserPlus, 
  Search, 
  Calendar, 
  Phone, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  ArrowLeft
} from "lucide-react"
import { useHospital } from "@/lib/context"

interface AdmissionRecord {
  id: string
  paciente_nombre: string
  paciente_dni: string
  episodio_numero: string
  tipo_admision: string
  motivo_consulta: string
  estado_admision: string
  fecha_admision: string
  acompanante_nombre?: string
  acompanante_telefono?: string
  observaciones_admision?: string
}

interface PatientForm {
  dni: string
  nombre_completo: string
  fecha_nacimiento: string
  sexo: string
  telefono: string
  direccion: string
  obra_social: string
  numero_afiliado: string
  documento_tipo: string
  contacto_emergencia_nombre: string
  contacto_emergencia_telefono: string
  contacto_emergencia_parentesco: string
}

interface AdmissionForm {
  tipo_admision: string
  motivo_consulta: string
  acompanante_nombre: string
  acompanante_telefono: string
  acompanante_parentesco: string
  observaciones_admision: string
}

export function AdmissionView() {
  const { state, dispatch } = useHospital()
  const [activeTab, setActiveTab] = useState("new-admission")
  const [admissionRecords, setAdmissionRecords] = useState<AdmissionRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchDni, setSearchDni] = useState("")
  const [foundPatient, setFoundPatient] = useState<any>(null)
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)

  // Estados para formularios
  const [patientForm, setPatientForm] = useState<PatientForm>({
    dni: "",
    nombre_completo: "",
    fecha_nacimiento: "",
    sexo: "",
    telefono: "",
    direccion: "",
    obra_social: "",
    numero_afiliado: "",
    documento_tipo: "DNI",
    contacto_emergencia_nombre: "",
    contacto_emergencia_telefono: "",
    contacto_emergencia_parentesco: ""
  })

  const [admissionForm, setAdmissionForm] = useState<AdmissionForm>({
    tipo_admision: "",
    motivo_consulta: "",
    acompanante_nombre: "",
    acompanante_telefono: "",
    acompanante_parentesco: "",
    observaciones_admision: ""
  })

  // Cargar registros de admisión al montar el componente
  useEffect(() => {
    if (activeTab === "records") {
      loadAdmissionRecords()
    }
  }, [activeTab])

  const loadAdmissionRecords = async () => {
    setIsLoading(true)
    try {
      // TODO: Implementar llamada a API de admisión
      // const records = await apiService.getAdmissionRecords()
      // setAdmissionRecords(records)
      
      // Mock data por ahora
      setAdmissionRecords([
        {
          id: "1",
          paciente_nombre: "Juan Pérez",
          paciente_dni: "12345678",
          episodio_numero: "EP001",
          tipo_admision: "Guardia",
          motivo_consulta: "Dolor abdominal",
          estado_admision: "activa",
          fecha_admision: new Date().toISOString(),
          acompanante_nombre: "María Pérez",
          acompanante_telefono: "11-1234-5678"
        }
      ])
    } catch (error) {
      console.error("Error cargando registros de admisión:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchPatient = async () => {
    if (!searchDni.trim()) return

    setIsLoading(true)
    try {
      // TODO: Implementar búsqueda de paciente
      // const patient = await apiService.searchPatient(searchDni)
      
      // Mock: simular paciente encontrado o no encontrado
      if (searchDni === "12345678") {
        setFoundPatient({
          dni: "12345678",
          nombre_completo: "Juan Carlos Pérez",
          telefono: "11-1234-5678",
          obra_social: "OSDE"
        })
        setShowNewPatientForm(false)
      } else {
        setFoundPatient(null)
        setShowNewPatientForm(true)
        setPatientForm(prev => ({ ...prev, dni: searchDni }))
      }
    } catch (error) {
      console.error("Error buscando paciente:", error)
      setFoundPatient(null)
      setShowNewPatientForm(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdmission = async () => {
    if (!admissionForm.tipo_admision || !admissionForm.motivo_consulta) {
      alert("Por favor complete los campos obligatorios")
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implementar creación de admisión
      console.log("Creando admisión:", { foundPatient, patientForm, admissionForm })
      
      // Resetear formularios
      setSearchDni("")
      setFoundPatient(null)
      setShowNewPatientForm(false)
      setPatientForm({
        dni: "",
        nombre_completo: "",
        fecha_nacimiento: "",
        sexo: "",
        telefono: "",
        direccion: "",
        obra_social: "",
        numero_afiliado: "",
        documento_tipo: "DNI",
        contacto_emergencia_nombre: "",
        contacto_emergencia_telefono: "",
        contacto_emergencia_parentesco: ""
      })
      setAdmissionForm({
        tipo_admision: "",
        motivo_consulta: "",
        acompanante_nombre: "",
        acompanante_telefono: "",
        acompanante_parentesco: "",
        observaciones_admision: ""
      })

      alert("Admisión registrada exitosamente")
    } catch (error) {
      console.error("Error registrando admisión:", error)
      alert("Error al registrar la admisión")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "activa":
        return <Badge variant="default" className="bg-green-100 text-green-800">Activa</Badge>
      case "completada":
        return <Badge variant="secondary">Completada</Badge>
      case "cancelada":
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const navigateToHome = () => {
    dispatch({ type: "SET_SCREEN", payload: "dashboard" })
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={navigateToHome}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-blue-600" />
                Módulo de Admisión
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestión de ingresos y registros de pacientes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            Hospital: {state.user?.hospital_id || "N/A"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="new-admission" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Nueva Admisión
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Registros
            </TabsTrigger>
          </TabsList>

          {/* Nueva Admisión */}
          <TabsContent value="new-admission" className="space-y-6">
            {/* Búsqueda de Paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Búsqueda de Paciente
                </CardTitle>
                <CardDescription>
                  Ingrese el DNI del paciente para buscar en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search-dni">DNI del Paciente</Label>
                    <Input
                      id="search-dni"
                      value={searchDni}
                      onChange={(e) => setSearchDni(e.target.value)}
                      placeholder="Ej: 12345678"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={searchPatient} disabled={isLoading}>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                </div>

                {/* Resultado de búsqueda */}
                {foundPatient && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Paciente encontrado</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Nombre:</span> {foundPatient.nombre_completo}
                      </div>
                      <div>
                        <span className="font-medium">DNI:</span> {foundPatient.dni}
                      </div>
                      <div>
                        <span className="font-medium">Teléfono:</span> {foundPatient.telefono}
                      </div>
                      <div>
                        <span className="font-medium">Obra Social:</span> {foundPatient.obra_social}
                      </div>
                    </div>
                  </div>
                )}

                {showNewPatientForm && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 mb-2">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Paciente no encontrado</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Complete el formulario a continuación para registrar un nuevo paciente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formulario de Nuevo Paciente */}
            {showNewPatientForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Registro de Nuevo Paciente</CardTitle>
                  <CardDescription>
                    Complete la información del paciente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dni">DNI *</Label>
                      <Input
                        id="dni"
                        value={patientForm.dni}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, dni: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="documento_tipo">Tipo de Documento</Label>
                      <Select 
                        value={patientForm.documento_tipo} 
                        onValueChange={(value) => setPatientForm(prev => ({ ...prev, documento_tipo: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DNI">DNI</SelectItem>
                          <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                          <SelectItem value="LC">Libreta Cívica</SelectItem>
                          <SelectItem value="LE">Libreta de Enrolamiento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="nombre_completo">Nombre Completo *</Label>
                    <Input
                      id="nombre_completo"
                      value={patientForm.nombre_completo}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, nombre_completo: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                      <Input
                        id="fecha_nacimiento"
                        type="date"
                        value={patientForm.fecha_nacimiento}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, fecha_nacimiento: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sexo">Sexo</Label>
                      <Select 
                        value={patientForm.sexo} 
                        onValueChange={(value) => setPatientForm(prev => ({ ...prev, sexo: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                          <SelectItem value="X">No especifica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={patientForm.telefono}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, telefono: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="obra_social">Obra Social</Label>
                      <Input
                        id="obra_social"
                        value={patientForm.obra_social}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, obra_social: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={patientForm.direccion}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, direccion: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  {/* Contacto de Emergencia */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Contacto de Emergencia</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="contacto_emergencia_nombre">Nombre</Label>
                        <Input
                          id="contacto_emergencia_nombre"
                          value={patientForm.contacto_emergencia_nombre}
                          onChange={(e) => setPatientForm(prev => ({ ...prev, contacto_emergencia_nombre: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contacto_emergencia_telefono">Teléfono</Label>
                        <Input
                          id="contacto_emergencia_telefono"
                          value={patientForm.contacto_emergencia_telefono}
                          onChange={(e) => setPatientForm(prev => ({ ...prev, contacto_emergencia_telefono: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contacto_emergencia_parentesco">Parentesco</Label>
                        <Select 
                          value={patientForm.contacto_emergencia_parentesco} 
                          onValueChange={(value) => setPatientForm(prev => ({ ...prev, contacto_emergencia_parentesco: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Padre">Padre</SelectItem>
                            <SelectItem value="Madre">Madre</SelectItem>
                            <SelectItem value="Cónyuge">Cónyuge</SelectItem>
                            <SelectItem value="Hijo/a">Hijo/a</SelectItem>
                            <SelectItem value="Hermano/a">Hermano/a</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formulario de Admisión */}
            {(foundPatient || showNewPatientForm) && (
              <Card>
                <CardHeader>
                  <CardTitle>Datos de Admisión</CardTitle>
                  <CardDescription>
                    Complete la información del ingreso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo_admision">Tipo de Admisión *</Label>
                      <Select 
                        value={admissionForm.tipo_admision} 
                        onValueChange={(value) => setAdmissionForm(prev => ({ ...prev, tipo_admision: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Guardia">Guardia</SelectItem>
                          <SelectItem value="Programada">Programada</SelectItem>
                          <SelectItem value="Derivacion">Derivación</SelectItem>
                          <SelectItem value="Emergencia">Emergencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="acompanante_parentesco">Parentesco del Acompañante</Label>
                      <Input
                        id="acompanante_parentesco"
                        value={admissionForm.acompanante_parentesco}
                        onChange={(e) => setAdmissionForm(prev => ({ ...prev, acompanante_parentesco: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="motivo_consulta">Motivo de Consulta *</Label>
                    <Textarea
                      id="motivo_consulta"
                      value={admissionForm.motivo_consulta}
                      onChange={(e) => setAdmissionForm(prev => ({ ...prev, motivo_consulta: e.target.value }))}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="acompanante_nombre">Nombre del Acompañante</Label>
                      <Input
                        id="acompanante_nombre"
                        value={admissionForm.acompanante_nombre}
                        onChange={(e) => setAdmissionForm(prev => ({ ...prev, acompanante_nombre: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="acompanante_telefono">Teléfono del Acompañante</Label>
                      <Input
                        id="acompanante_telefono"
                        value={admissionForm.acompanante_telefono}
                        onChange={(e) => setAdmissionForm(prev => ({ ...prev, acompanante_telefono: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="observaciones_admision">Observaciones</Label>
                    <Textarea
                      id="observaciones_admision"
                      value={admissionForm.observaciones_admision}
                      onChange={(e) => setAdmissionForm(prev => ({ ...prev, observaciones_admision: e.target.value }))}
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleAdmission} disabled={isLoading} className="px-8">
                      {isLoading ? "Procesando..." : "Registrar Admisión"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Registros de Admisión */}
          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Registros de Admisión
                </CardTitle>
                <CardDescription>
                  Historial de admisiones registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-5 w-5 animate-spin" />
                      Cargando registros...
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>DNI</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admissionRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.paciente_nombre}
                          </TableCell>
                          <TableCell>{record.paciente_dni}</TableCell>
                          <TableCell>{record.tipo_admision}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {record.motivo_consulta}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(record.estado_admision)}
                          </TableCell>
                          <TableCell>
                            {new Date(record.fecha_admision).toLocaleDateString("es-AR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 