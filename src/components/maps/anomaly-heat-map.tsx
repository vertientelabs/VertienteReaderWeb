'use client';

import dynamic from 'next/dynamic';
import type { MapMarker } from './leaflet-map';

const LeafletMap = dynamic(() => import('./leaflet-map'), { ssr: false });

interface AnomalyItem {
  latitud: number;
  longitud: number;
  tipo: string;
  descripcion?: string;
}

interface AnomalyHeatMapProps {
  anomalias: AnomalyItem[];
}

const tipoColor: Record<string, 'red' | 'orange' | 'purple'> = {
  consumo_alto: 'red',
  retroceso: 'red',
  medidor_parado: 'orange',
  consumo_bajo: 'orange',
};

export default function AnomalyHeatMap({ anomalias }: AnomalyHeatMapProps) {
  // Simple clustering: increase radius for nearby anomalies
  const markers: MapMarker[] = anomalias
    .filter(a => a.latitud && a.longitud)
    .map((a, _i, arr) => {
      const nearby = arr.filter(
        b => Math.abs(b.latitud - a.latitud) < 0.002 && Math.abs(b.longitud - a.longitud) < 0.002
      ).length;
      return {
        position: [a.latitud, a.longitud] as [number, number],
        color: tipoColor[a.tipo] || 'red',
        radius: Math.min(6 + nearby * 3, 20),
        popup: `
          <strong>${a.tipo.replace(/_/g, ' ').toUpperCase()}</strong><br/>
          ${a.descripcion || 'Sin descripción'}
        `,
      };
    });

  return (
    <div className="relative">
      <LeafletMap markers={markers} height="400px" />
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl border border-white/[0.18] dark:border-white/[0.08] p-3 shadow-lg">
        <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Anomalías</p>
        <div className="space-y-1.5">
          {[
            { color: 'bg-[#FF453A]', label: 'Consumo alto / Retroceso' },
            { color: 'bg-[#FF9F0A]', label: 'Medidor parado / Consumo bajo' },
            { color: 'bg-[#BF5AF2]', label: 'Otro' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-[10px] text-[var(--text-tertiary)]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
