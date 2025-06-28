"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function NursingDecisionView() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <FileText className="h-8 w-8 text-green-600" />
                Decisiones Post-Triaje
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Decisiones de Enfermería</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Sistema de decisiones post-triaje - En desarrollo</p>
                    <p>Aquí enfermería decidirá enviar pacientes a lista médica, alta de enfermería o shockroom.</p>
                </CardContent>
            </Card>
        </div>
    )
} 