import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import type { TriageStats as TriageStatsType, TriageColor } from "@/lib/types";
import { getTriageColor } from "@/lib/utils";

interface TriageStatsProps {
  stats: TriageStatsType;
  total: number;
}

export function TriageStats({ stats, total }: TriageStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {Object.entries(stats).map(([color, count]) => (
        <Card key={color} className="text-center bg-white shadow-sm border">
          <CardContent className="p-4 bg-white">
            <div
              className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg`}
              style={{ backgroundColor: getTriageColor(color as TriageColor).color }}
            >
              {count}
            </div>
            <p className="text-sm font-medium text-gray-900">{color}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 