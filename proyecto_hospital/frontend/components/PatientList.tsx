import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Clock, Eye, RefreshCw } from "lucide-react";
import type { Episode, TriageColor } from "@/lib/types";
import { getTriageColor, getAge } from "@/lib/utils";

interface PatientListProps {
  episodes: Episode[];
  onSelectPatient: (episodeId: string) => void;
}

export function PatientList({ episodes, onSelectPatient }: PatientListProps) {
  return (
    <Card className="bg-white shadow-sm border">
      <CardHeader className="bg-white">
        <CardTitle className="text-gray-900">Lista de Espera</CardTitle>
        <CardDescription className="text-gray-600">
          Pacientes esperando atención ({episodes.length})
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-white">
        <div className="space-y-4">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getTriageColor(episode.triageColor as TriageColor).color }}
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {episode.patient.lastName || 'Sin apellido'}, {episode.patient.firstName || 'Sin nombre'} ({getAge(episode.patient.birthDate)})
                  </p>
                  <p className="text-sm text-gray-500">{episode.consultationReason || 'Sin motivo especificado'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className={`${getTriageColor(episode.triageColor as TriageColor).bg} ${getTriageColor(episode.triageColor as TriageColor).text}`}>
                  {episode.triageColor}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {episode.waitingTime} min
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => onSelectPatient(episode.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    TOMAR
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      // Implementar lógica para ver ficha
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Ficha
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {episodes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay pacientes en la lista de espera</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 