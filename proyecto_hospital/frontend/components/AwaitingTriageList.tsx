import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Clock, Eye } from "lucide-react";
import type { Episode } from "@/lib/types";
import { TriageAssignModal } from "./TriageAssignModal";
import { useHospital } from "@/lib/context";

interface AwaitingTriageListProps {
  episodes: Episode[];
  onSelectPatient: (episodeId: string) => void;
}

/**
 * Lista de pacientes en espera de triaje.
 * - Al presionar "Evaluar", se abre un modal para asignar color de triaje.
 * - Al confirmar, se actualiza el episodio y el paciente pasa a la lista de espera habitual.
 */
export function AwaitingTriageList({ episodes }: AwaitingTriageListProps) {
  // Estado para controlar el modal y el episodio seleccionado
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const { updateEpisode } = useHospital(); // Función del contexto para actualizar episodio

  // Maneja el click en "Evaluar"
  const handleEvaluate = (episode: Episode) => {
    setSelectedEpisode(episode);
    setModalOpen(true);
  };

  // Maneja la asignación de color de triaje
  const handleAssignTriage = async (color: string) => {
    if (!selectedEpisode) return;
    // Actualiza el episodio en el backend y en el estado global
    await updateEpisode(selectedEpisode.id, { triageColor: color });
    // El contexto moverá automáticamente al paciente a la lista correcta
    setSelectedEpisode(null);
    setModalOpen(false);
  };

  if (episodes.length === 0) {
    return null; // No renderizar nada si no hay pacientes en esta lista
  }

  return (
    <>
      {/* Modal para asignar color de triaje */}
      <TriageAssignModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAssign={handleAssignTriage}
      />
      <Card className="bg-white shadow-sm border mt-6">
        <CardHeader className="bg-white">
          <CardTitle className="text-gray-900">En Espera de Triaje</CardTitle>
          <CardDescription className="text-gray-600">
            Pacientes activos que necesitan ser evaluados ({episodes.length})
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
                  <div className="w-4 h-4 rounded-full bg-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {episode.patient.lastName || 'Sin apellido'}, {episode.patient.firstName || 'Sin nombre'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {episode.consultationReason || 'Sin motivo especificado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {episode.waitingTime} min
                  </div>
                  {/* Botón para abrir el modal de evaluación */}
                  <Button
                    size="sm"
                    onClick={() => handleEvaluate(episode)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Evaluar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
} 