import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Eye, RefreshCw } from "lucide-react";
import type { Episode } from "@/lib/types";
import { TriageAssignModal } from "./TriageAssignModal";
import { useHospital } from "@/lib/context";

interface AwaitingTriageListProps {
  episodes: Episode[];
}

/**
 * Muestra la lista de pacientes que aún no han sido triados.
 */
export function AwaitingTriageList({ episodes }: AwaitingTriageListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const { updateEpisode, refreshDashboard } = useHospital();

  const handleEvaluate = (episode: Episode) => {
    setSelectedEpisode(episode);
    setModalOpen(true);
  };

  const handleAssignTriage = async (color: string) => {
    if (!selectedEpisode) {
      console.error("Error: No se seleccionó ningún episodio para asignar triaje.");
      return;
    }
    try {
      // Al asignar un color, el contexto moverá el episodio a la lista de espera principal.
      await updateEpisode(selectedEpisode.id, { 
        triageColor: color, 
        estado: "En espera de atención",
        status: "waiting" 
      });
      setSelectedEpisode(null);
      setModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar el triaje:", error);
    }
  };

  // Filtrar solo los episodios que realmente están esperando triaje.
  const episodesAwaitingTriage = episodes.filter(
    (ep) => ep.status === "awaiting-triage" || !ep.triageColor
  );

  if (episodesAwaitingTriage.length === 0) {
    return null; 
  }

  return (
    <>
      <TriageAssignModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAssign={handleAssignTriage}
      />
      <Card className="bg-white shadow-sm border mt-6">
        <CardHeader className="bg-white">
          <CardTitle>En Espera de Triaje</CardTitle>
          <CardDescription>
            Pacientes en espera de asignación de triaje ({episodesAwaitingTriage.length})
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="space-y-4">
            {episodesAwaitingTriage.map((episode) => (
              <div
                key={episode.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 rounded-full bg-gray-400 animate-pulse" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {episode.patient?.lastName ?? 'Sin apellido'}, {episode.patient?.firstName ?? 'Sin nombre'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {episode.consultationReason ?? episode.motivo_consulta ?? 'Sin motivo especificado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {episode.waitingTime ?? episode.paciente_edad ?? 0} min
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleEvaluate(episode)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
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