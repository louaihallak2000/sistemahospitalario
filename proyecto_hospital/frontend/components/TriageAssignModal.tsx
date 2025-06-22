import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { TriageColor } from "@/lib/types";

// Opciones de colores de triaje
const triageColorOptions: TriageColor[] = ["ROJO", "NARANJA", "AMARILLO", "VERDE", "AZUL"];

interface TriageAssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (color: TriageColor) => void;
}

/**
 * Modal para asignar un color de triaje a un paciente.
 * - Permite seleccionar un color y confirmar la asignación.
 * - Llama a la función onAssign con el color seleccionado.
 */
export function TriageAssignModal({ open, onOpenChange, onAssign }: TriageAssignModalProps) {
  // Estado local para el color seleccionado
  const [selectedColor, setSelectedColor] = useState<TriageColor | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Maneja la confirmación de la asignación
  const handleAssign = () => {
    if (!selectedColor) {
      setError("Debe seleccionar un color de triaje.");
      return;
    }
    setError(null);
    onAssign(selectedColor);
    setSelectedColor(null);
    onOpenChange(false);
  };

  // Maneja el cierre del modal
  const handleClose = () => {
    setSelectedColor(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar color de triaje</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup value={selectedColor || undefined} onValueChange={val => setSelectedColor(val as TriageColor)}>
            {triageColorOptions.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <RadioGroupItem value={color} id={color} />
                <Label htmlFor={color}>{color}</Label>
              </div>
            ))}
          </RadioGroup>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleAssign} className="bg-blue-600 hover:bg-blue-700">Asignar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 