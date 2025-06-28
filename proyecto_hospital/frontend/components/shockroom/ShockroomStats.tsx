"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Bed,
    Clock,
    TrendingUp,
    Users
} from "lucide-react"

interface ShockroomStatsProps {
    estadisticas: any
    camas: any[]
}

export function ShockroomStats({ estadisticas, camas }: ShockroomStatsProps) {
    if (!estadisticas) {
        return (
            <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Cargando estadísticas...</p>
                </CardContent>
            </Card>
        )
    }

    const getOccupancyColor = (rate: number) => {
        if (rate >= 90) return "text-red-600"
        if (rate >= 70) return "text-orange-600"
        if (rate >= 50) return "text-yellow-600"
        return "text-green-600"
    }

    const statsCards = [
        {
            title: "Camas Totales",
            value: estadisticas.total_camas,
            icon: <Bed className="h-5 w-5" />,
            color: "bg-blue-100 text-blue-600"
        },
        {
            title: "Camas Disponibles",
            value: estadisticas.camas_disponibles,
            icon: <Bed className="h-5 w-5" />,
            color: "bg-green-100 text-green-600"
        },
        {
            title: "Camas Ocupadas",
            value: estadisticas.camas_ocupadas,
            icon: <Users className="h-5 w-5" />,
            color: "bg-red-100 text-red-600"
        },
        {
            title: "Pacientes Críticos",
            value: estadisticas.pacientes_criticos,
            icon: <Activity className="h-5 w-5" />,
            color: "bg-orange-100 text-orange-600"
        },
        {
            title: "Alertas Activas",
            value: estadisticas.alertas_activas,
            icon: <AlertTriangle className="h-5 w-5" />,
            color: "bg-yellow-100 text-yellow-600"
        },
        {
            title: "Tasa de Ocupación",
            value: `${estadisticas.tasa_ocupacion}%`,
            icon: <BarChart3 className="h-5 w-5" />,
            color: "bg-purple-100 text-purple-600"
        }
    ]

    return (
        <div className="space-y-6 h-full overflow-y-auto">
            {/* Tarjetas de estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statsCards.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-full ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Gráfico de ocupación */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Ocupación del Shockroom
                    </CardTitle>
                    <CardDescription>
                        Distribución actual de camas por estado
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Ocupación General</span>
                            <span className={`text-sm font-bold ${getOccupancyColor(estadisticas.tasa_ocupacion)}`}>
                                {estadisticas.tasa_ocupacion}%
                            </span>
                        </div>
                        <Progress
                            value={estadisticas.tasa_ocupacion}
                            className="h-3"
                        />

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                        <span>Disponibles</span>
                                    </div>
                                    <span className="font-medium">{estadisticas.camas_disponibles}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                        <span>Ocupadas</span>
                                    </div>
                                    <span className="font-medium">{estadisticas.camas_ocupadas}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                        <span>Limpieza</span>
                                    </div>
                                    <span className="font-medium">{estadisticas.camas_limpieza}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                        <span>Mantenimiento</span>
                                    </div>
                                    <span className="font-medium">{estadisticas.camas_mantenimiento}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Información detallada por cama */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Bed className="h-5 w-5 mr-2" />
                        Estado Detallado de Camas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {camas.map((cama) => (
                            <div key={cama.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Badge variant="outline" className="min-w-[80px]">
                                        {cama.numero_cama}
                                    </Badge>
                                    <div>
                                        <p className="font-medium text-sm">
                                            {cama.paciente_nombre || "Sin paciente"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {cama.tipo_cama} - {cama.estado}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {cama.alertas_activas && cama.alertas_activas.length > 0 && (
                                        <Badge variant="destructive" className="text-xs">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            {cama.alertas_activas.length}
                                        </Badge>
                                    )}

                                    {cama.tiempo_ocupacion && (
                                        <Badge variant="secondary" className="text-xs">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {Math.floor(cama.tiempo_ocupacion / 60)}h {cama.tiempo_ocupacion % 60}m
                                        </Badge>
                                    )}

                                    <Badge
                                        className={`text-xs ${cama.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                                                cama.estado === 'ocupada' ? 'bg-red-100 text-red-800' :
                                                    cama.estado === 'limpieza' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {cama.estado}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Métricas adicionales */}
            {estadisticas.tiempo_promedio_estancia && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Clock className="h-5 w-5 mr-2" />
                            Métricas de Tiempo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600">Tiempo Promedio de Estancia</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {Math.round(estadisticas.tiempo_promedio_estancia * 10) / 10}h
                                </p>
                            </div>

                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600">Rotación de Camas</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {estadisticas.tiempo_promedio_estancia
                                        ? Math.round((24 / estadisticas.tiempo_promedio_estancia) * 10) / 10
                                        : 0
                                    }
                                </p>
                                <p className="text-xs text-gray-500">pacientes/día por cama</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
} 