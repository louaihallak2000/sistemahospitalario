"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'

export default function TriageView() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Activity className="h-8 w-8 text-blue-600" />
                Triaje de Enfermería
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>Sistema de Triaje</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Vista de triaje para enfermería - En desarrollo</p>
                    <p>Aquí se implementará la asignación de colores de triaje según el nuevo workflow.</p>
                </CardContent>
            </Card>
        </div>
    )
} 