"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Monitor } from "lucide-react"

interface ShockroomMonitoringProps {
    camas: any[]
    onRefresh: () => void
}

export function ShockroomMonitoring({ camas, onRefresh }: ShockroomMonitoringProps) {
    return (
        <div className="space-y-6 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {camas.map((cama) => (
                    <Card key={cama.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Monitor className="h-5 w-5 mr-2 text-red-600" />
                                {cama.numero_cama}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-4">
                                <p>Paciente: {cama.paciente_nombre || 'Sin asignar'}</p>
                                <Button onClick={onRefresh} className="mt-2">
                                    Actualizar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {camas.length === 0 && (
                <Card className="h-full">
                    <CardContent className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No hay pacientes en monitoreo</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
} 