import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { Alert as AlertType } from "@/lib/types";

interface AlertsProps {
  alerts: AlertType[];
}

export function Alerts({ alerts }: AlertsProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-900">Alertas</h2>
      {alerts.map((alert) => (
        <Alert key={alert.id} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
} 