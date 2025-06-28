"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Stethoscope } from 'lucide-react'

export default function MedicalListView() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Stethoscope className="h-8 w-8 text-purple-600" />
                Lista Médica
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>Pacientes para Atención Médica</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Lista de pacientes triados esperando atención médica - En desarrollo</p>
                    <p>Los médicos podrán ver y tomar pacientes de esta lista ordenada por prioridad de triaje.</p>
                </CardContent>
            </Card>
        </div>
    )
} 