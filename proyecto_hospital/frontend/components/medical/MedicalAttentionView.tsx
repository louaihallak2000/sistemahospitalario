"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCheck } from 'lucide-react'

export default function MedicalAttentionView() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-blue-600" />
                Atención Médica
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>Atención Médica Completa</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Sistema completo de atención médica - En desarrollo</p>
                    <p>Aquí los médicos podrán prescribir, indicar procedimientos, estudios, evoluciones y tomar decisión final.</p>
                </CardContent>
            </Card>
        </div>
    )
} 