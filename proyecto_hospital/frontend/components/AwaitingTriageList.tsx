import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHospital } from "@/lib/context";
import type { Episode } from "@/lib/types";
import { AlertCircle, Clock, Eye, Users } from "lucide-react";
import { useState } from 'react';
import { TriageAssignModal } from "./TriageAssignModal";

interface AwaitingTriageListProps {
  episodes: Episode[];
  onSelectPatient?: (episodeId: string) => void;
}

/**
 * Muestra la lista de pacientes que aún no han sido triados.
 */
export function AwaitingTriageList({ episodes, onSelectPatient }: AwaitingTriageListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const { updateEpisode, refreshDashboard } = useHospital();

  console.log("🎨 AwaitingTriageList - Episodes recibidos:", episodes.length);
  console.log("📋 AwaitingTriageList - Episodes completos:", episodes);

  const handleEvaluate = (episode: Episode) => {
    console.log("👁️ Evaluando episodio:", episode.id);
    setSelectedEpisode(episode);
    setModalOpen(true);
  };

  const handleAssignTriage = async (color: string) => {
    if (!selectedEpisode) {
      console.error("Error: No se seleccionó ningún episodio para asignar triaje.");
      return;
    }
    try {
      console.log("🎨 Asignando color de triaje:", color, "a episodio:", selectedEpisode.id);
      // Al asignar un color, el contexto moverá el episodio a la lista de espera principal.
      await updateEpisode(selectedEpisode.id, {
        triageColor: color,
        estado: "En espera de atención",
        status: "waiting"
      });
      setSelectedEpisode(null);
      setModalOpen(false);
      console.log("✅ Triaje asignado exitosamente");
    } catch (error) {
      console.error("Error al actualizar el triaje:", error);
    }
  };

  // ✅ MEJORAR FILTRADO: Más específico y con logging
  const episodesAwaitingTriage = episodes.filter((ep) => {
    const needsTriage = ep.status === "awaiting-triage" || !ep.triageColor || ep.triageColor === null || ep.triageColor === "";
    console.log(`🔍 Episodio ${ep.id}:`, {
      status: ep.status,
      triageColor: ep.triageColor,
      needsTriage: needsTriage,
      patientName: ep.patient?.firstName + ' ' + ep.patient?.lastName
    });
    return needsTriage;
  });

  console.log("📊 Episodios que necesitan triaje:", episodesAwaitingTriage.length);

  // ✅ MOSTRAR INFORMACIÓN INCLUSO SI NO HAY EPISODIOS
  return (
    <>
      <TriageAssignModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAssign={handleAssignTriage}
      />
      <Card className="bg-white shadow-sm border mt-6">
        <CardHeader className="bg-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                En Espera de Triaje
              </CardTitle>
              <CardDescription>
                Pacientes en espera de asignación de triaje ({episodesAwaitingTriage.length})
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-orange-50 text-orange-700">
              <Users className="h-4 w-4 mr-1" />
              {episodesAwaitingTriage.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="bg-white p-0">
          {episodesAwaitingTriage.length > 0 ? (
            <ScrollArea className="h-[500px] w-full">
              <div className="space-y-4 p-6">
                {episodesAwaitingTriage.map((episode) => (
                  <div
                    key={episode.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-orange-50 transition-colors border-l-4 border-l-orange-400"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 rounded-full bg-orange-400 animate-pulse" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {episode.patient?.lastName ?? 'Sin apellido'}, {episode.patient?.firstName ?? 'Sin nombre'}
                        </p>
                        <p className="text-sm text-gray-600">
                          DNI: {episode.patient?.dni ?? 'Sin DNI'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {episode.consultationReason ?? episode.motivo_consulta ?? 'Sin motivo especificado'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {episode.waitingTime ?? episode.paciente_edad ?? 0} min
                        </div>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800">
                          Sin Triaje
                        </Badge>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button
                          size="sm"
                          onClick={() => handleEvaluate(episode)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Evaluar
                        </Button>
                        {onSelectPatient && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSelectPatient(episode.id)}
                            className="border-green-600 text-green-600 hover:bg-green-50"
                          >
                            Ver Ficha
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-orange-300" />
              <p className="font-medium">No hay pacientes esperando triaje</p>
              <p className="text-sm">Todos los pacientes han sido evaluados</p>
              <div className="mt-4 text-xs text-gray-400">
                <p>Total de episodios recibidos: {episodes.length}</p>
                <p>Episodios que necesitan triaje: {episodesAwaitingTriage.length}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
} 