'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, CheckCircle, Clock, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CodigoEmergencia {
    id: string
    tipo_codigo: string
    descripcion: string
    ubicacion: string
    activado_por: string
    fecha_activacion: string
    fecha_cierre?: string
    estado: 'activo' | 'atendido' | 'cerrado'
    personal_respondio: string[]
    tiempo_respuesta?: string
    resultado?: string
}

const TIPOS_CODIGO = [
    {
        value: 'AZUL',
        label: 'CODIGO AZUL - Paro Cardiaco/Respiratorio',
        color: 'bg-blue-500',
        priority: 'CRITICA'
    },
    {
        value: 'ACV',
        label: 'CODIGO ACV - Accidente Cerebrovascular',
        color: 'bg-purple-500',
        priority: 'CRITICA'
    },
    {
        value: 'IAM',
        label: 'CODIGO IAM - Infarto Agudo de Miocardio',
        color: 'bg-red-500',
        priority: 'CRITICA'
    },
    {
        value: 'TRAUMA',
        label: 'CODIGO TRAUMA - Trauma Mayor',
        color: 'bg-orange-500',
        priority: 'CRITICA'
    },
    {
        value: 'SEPSIS',
        label: 'CODIGO SEPSIS - Sepsis Severa',
        color: 'bg-yellow-500',
        priority: 'ALTA'
    },
    {
        value: 'PEDIATRICO',
        label: 'CODIGO PEDIATRICO - Emergencia Pediatrica',
        color: 'bg-pink-500',
        priority: 'CRITICA'
    },
    {
        value: 'OBSTETRICO',
        label: 'CODIGO OBSTETRICO - Emergencia Obstetrica',
        color: 'bg-green-500',
        priority: 'CRITICA'
    }
]

export default function EmergencyCodesView() {
    const [codigosActivos, setCodigosActivos] = useState<CodigoEmergencia[]>([])
    const [historialCodigos, setHistorialCodigos] = useState<CodigoEmergencia[]>([])
    const [mostrarActivar, setMostrarActivar] = useState(false)
    const [nuevoCodigoData, setNuevoCodigoData] = useState({
        tipo_codigo: '',
        descripcion: '',
        ubicacion: ''
    })
    const [loading, setLoading] = useState(false)

    // Cargar codigos activos
    const cargarCodigosActivos = async () => {
        try {
            const response = await fetch('/api/codigos-emergencia/activos', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-Hospital-ID': localStorage.getItem('hospital_id') || 'HOSP001'
                }
            })
            if (response.ok) {
                const data = await response.json()
                setCodigosActivos(data)
            }
        } catch (error) {
            console.error('Error cargando codigos activos:', error)
        }
    }

    // Cargar historial
    const cargarHistorial = async () => {
        try {
            const response = await fetch('/api/codigos-emergencia/historial', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-Hospital-ID': localStorage.getItem('hospital_id') || 'HOSP001'
                }
            })
            if (response.ok) {
                const data = await response.json()
                setHistorialCodigos(data)
            }
        } catch (error) {
            console.error('Error cargando historial:', error)
        }
    }

    useEffect(() => {
        cargarCodigosActivos()
        cargarHistorial()
    }, [])

    // Activar codigo de emergencia
    const activarCodigo = async () => {
        if (!nuevoCodigoData.tipo_codigo || !nuevoCodigoData.ubicacion) {
            alert('Debe completar tipo de codigo y ubicacion')
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/codigos-emergencia/activar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-Hospital-ID': localStorage.getItem('hospital_id') || 'HOSP001'
                },
                body: JSON.stringify(nuevoCodigoData)
            })

            if (response.ok) {
                const nuevoCodigo = await response.json()
                setCodigosActivos(prev => [nuevoCodigo, ...prev])
                setNuevoCodigoData({ tipo_codigo: '', descripcion: '', ubicacion: '' })
                setMostrarActivar(false)
            }
        } catch (error) {
            console.error('Error activando codigo:', error)
            alert('Error activando codigo de emergencia')
        } finally {
            setLoading(false)
        }
    }

    // Responder a codigo
    const responderCodigo = async (codigoId: string) => {
        try {
            const response = await fetch(`/api/codigos-emergencia/${codigoId}/responder`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-Hospital-ID': localStorage.getItem('hospital_id') || 'HOSP001'
                }
            })

            if (response.ok) {
                cargarCodigosActivos()
            }
        } catch (error) {
            console.error('Error respondiendo a codigo:', error)
        }
    }

    // Cerrar codigo
    const cerrarCodigo = async (codigoId: string, resultado: string) => {
        try {
            const response = await fetch(`/api/codigos-emergencia/${codigoId}/cerrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-Hospital-ID': localStorage.getItem('hospital_id') || 'HOSP001'
                },
                body: JSON.stringify({ resultado })
            })

            if (response.ok) {
                setCodigosActivos(prev => prev.filter(c => c.id !== codigoId))
                cargarHistorial()
            }
        } catch (error) {
            console.error('Error cerrando codigo:', error)
        }
    }

    const getTipoCodigo = (tipo: string) => {
        return TIPOS_CODIGO.find(t => t.value === tipo) || TIPOS_CODIGO[0]
    }

    const formatearTiempo = (fecha: string) => {
        const ahora = new Date()
        const fechaCodigo = new Date(fecha)
        const diferencia = Math.floor((ahora.getTime() - fechaCodigo.getTime()) / 1000 / 60)

        if (diferencia < 60) {
            return `${diferencia} min`
        } else {
            const horas = Math.floor(diferencia / 60)
            const minutos = diferencia % 60
            return `${horas}h ${minutos}min`
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Codigos de Emergencia</h1>
                    <p className="text-gray-600">Sistema de activacion y gestion de codigos de emergencia</p>
                </div>
                <Button
                    onClick={() => setMostrarActivar(true)}
                    className="bg-red-600 hover:bg-red-700"
                    size="lg"
                >
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    ACTIVAR CODIGO
                </Button>
            </div>

            {/* Codigos Activos */}
            {codigosActivos.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-red-600 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        CODIGOS ACTIVOS ({codigosActivos.length})
                    </h2>

                    {codigosActivos.map((codigo) => {
                        const tipoCodigo = getTipoCodigo(codigo.tipo_codigo)
                        return (
                            <Alert key={codigo.id} className="border-red-200 bg-red-50">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <AlertTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Badge className={`${tipoCodigo.color} text-white`}>
                                            {codigo.tipo_codigo}
                                        </Badge>
                                        <span className="font-bold">{tipoCodigo.label}</span>
                                        <Badge variant="destructive" className="animate-pulse">
                                            ACTIVO
                                        </Badge>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <Clock className="w-4 h-4" />
                                        {formatearTiempo(codigo.fecha_activacion)}
                                    </div>
                                </AlertTitle>
                                <AlertDescription className="mt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <strong>Ubicacion:</strong> {codigo.ubicacion}
                                        </div>
                                        <div>
                                            <strong>Activado por:</strong> {codigo.activado_por}
                                        </div>
                                        <div>
                                            <strong>Personal respondido:</strong> {codigo.personal_respondio?.length || 0}
                                        </div>
                                    </div>
                                    {codigo.descripcion && (
                                        <div className="mt-2">
                                            <strong>Descripcion:</strong> {codigo.descripcion}
                                        </div>
                                    )}
                                    <div className="flex space-x-2 mt-4">
                                        <Button
                                            size="sm"
                                            onClick={() => responderCodigo(codigo.id)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Users className="w-4 h-4 mr-1" />
                                            RESPONDER
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => cerrarCodigo(codigo.id, 'resuelto')}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            CERRAR CODIGO
                                        </Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )
                    })}
                </div>
            )}

            {/* Modal Activar Codigo */}
            {mostrarActivar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="text-red-600">ACTIVAR CODIGO DE EMERGENCIA</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setMostrarActivar(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </CardTitle>
                            <CardDescription>
                                Seleccione el tipo de emergencia y complete la informacion
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Tipo de Codigo</label>
                                <Select
                                    value={nuevoCodigoData.tipo_codigo}
                                    onValueChange={(value) => setNuevoCodigoData(prev => ({ ...prev, tipo_codigo: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar codigo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIPOS_CODIGO.map(tipo => (
                                            <SelectItem key={tipo.value} value={tipo.value}>
                                                <div className="flex items-center space-x-2">
                                                    <div className={`w-3 h-3 rounded-full ${tipo.color}`}></div>
                                                    <span>{tipo.label}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {tipo.priority}
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Ubicacion</label>
                                <Input
                                    placeholder="Ej: Urgencias Box 3, Sala de espera, etc."
                                    value={nuevoCodigoData.ubicacion}
                                    onChange={(e) => setNuevoCodigoData(prev => ({ ...prev, ubicacion: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Descripcion (opcional)</label>
                                <Textarea
                                    placeholder="Informacion adicional sobre la emergencia"
                                    value={nuevoCodigoData.descripcion}
                                    onChange={(e) => setNuevoCodigoData(prev => ({ ...prev, descripcion: e.target.value }))}
                                />
                            </div>

                            <div className="flex space-x-2">
                                <Button
                                    onClick={activarCodigo}
                                    disabled={loading || !nuevoCodigoData.tipo_codigo || !nuevoCodigoData.ubicacion}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                >
                                    {loading ? 'Activando...' : 'ACTIVAR CODIGO'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setMostrarActivar(false)}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Historial Reciente */}
            <Card>
                <CardHeader>
                    <CardTitle>Historial Reciente</CardTitle>
                    <CardDescription>Ultimos codigos de emergencia activados</CardDescription>
                </CardHeader>
                <CardContent>
                    {historialCodigos.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay historial de codigos de emergencia</p>
                    ) : (
                        <div className="space-y-3">
                            {historialCodigos.slice(0, 10).map((codigo) => {
                                const tipoCodigo = getTipoCodigo(codigo.tipo_codigo)
                                return (
                                    <div key={codigo.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Badge className={`${tipoCodigo.color} text-white`}>
                                                {codigo.tipo_codigo}
                                            </Badge>
                                            <div>
                                                <div className="font-medium">{codigo.ubicacion}</div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(codigo.fecha_activacion).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant={codigo.estado === 'cerrado' ? 'secondary' : 'outline'}
                                                className={codigo.estado === 'cerrado' ? 'bg-green-100 text-green-800' : ''}
                                            >
                                                {codigo.estado.toUpperCase()}
                                            </Badge>
                                            {codigo.tiempo_respuesta && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Respuesta: {codigo.tiempo_respuesta}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Informacion de Codigos */}
            <Card>
                <CardHeader>
                    <CardTitle>Tipos de Codigos de Emergencia</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {TIPOS_CODIGO.map(tipo => (
                            <div key={tipo.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                                <div className={`w-4 h-4 rounded-full ${tipo.color}`}></div>
                                <div className="flex-1">
                                    <div className="font-medium">{tipo.value}</div>
                                    <div className="text-sm text-gray-600">{tipo.label.split(' - ')[1]}</div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {tipo.priority}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 