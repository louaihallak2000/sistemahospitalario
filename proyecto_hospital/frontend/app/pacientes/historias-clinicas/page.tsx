"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useHospital } from "@/lib/context"
import {
    ArrowLeft,
    Calendar,
    FileText,
    Search,
    User
} from "lucide-react"
import { useState } from "react"

export default function HistoriasClinicasPage() {
    const { state, dispatch } = useHospital()
    const [searchTerm, setSearchTerm] = useState("")

    const navegarAInicio = () => {
        dispatch({ type: "SET_SCREEN", payload: "dashboard" })
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Button variant="ghost" onClick={navegarAInicio} className="mr-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Historias Clínicas</h1>
                            <p className="text-gray-600">Consulta el historial médico completo de los pacientes</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
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

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Search className="h-5 w-5 mr-2" />
                                Buscar Historia Clínica
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Funcionalidad en Desarrollo
                                </h3>
                                <p className="text-gray-500">
                                    La consulta de historias clínicas estará disponible próximamente
                                </p>
                                <div className="mt-6">
                                    <Label htmlFor="search">DNI del Paciente</Label>
                                    <div className="flex space-x-4 mt-2">
                                        <Input
                                            id="search"
                                            placeholder="Ingrese el DNI del paciente..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button disabled>
                                            <Search className="h-4 w-4 mr-2" />
                                            Buscar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
} 