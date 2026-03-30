'use client';

import dynamic from 'next/dynamic';
import type { MapMarker } from './leaflet-map';

const LeafletMap = dynamic(() => import('./leaflet-map'), { ssr: false });

interface LecturaMapItem {
  id: string;
  latitudCaptura: number;
  longitudCaptura: number;
  valorLectura: number;
  operarioId: string;
  anomalia?: string;
  estadoValidacion: string;
}

interface ReadingLiveMapProps {
  lecturas: LecturaMapItem[];
}

function getMarkerColor(lectura: LecturaMapItem): 'green' | 'blue' | 'red' | 'orange' {
  if (lectura.anomalia && lectura.anomalia !== 'ninguna') return 'red';
  switch (lectura.estadoValidacion) {
    case 'validada': return 'green';
    case 'rechazada': return 'red';
    case 'observada': return 'orange';
    default: return 'blue';
  }
}

export default function ReadingLiveMap({ lecturas }: ReadingLiveMapProps) {
  const markers: MapMarker[] = lecturas
    .filter(l => l.latitudCaptura && l.longitudCaptura)
    .map(l => ({
      position: [l.latitudCaptura, l.longitudCaptura] as [number, number],
      color: getMarkerColor(l),
      popup: `
        <strong>Lectura: ${l.valorLectura} m³</strong><br/>
        Operario: ${l.operarioId.substring(0, 12)}<br/>
        Estado: ${l.estadoValidacion}<br/>
        ${l.anomalia && l.anomalia !== 'ninguna' ? `Anomalía: ${l.anomalia}` : ''}
      `,
    }));

  return (
    <div className="relative">
      <LeafletMap markers={markers} height="450px" />
      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl border border-white/[0.18] dark:border-white/[0.08] p-3 shadow-lg">
        <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Leyenda</p>
        <div className="space-y-1.5">
          {[
            { color: 'bg-[#0A84FF]', label: 'Pendiente' },
            { color: 'bg-[#30D158]', label: 'Validada' },
            { color: 'bg-[#FF9F0A]', label: 'Observada' },
            { color: 'bg-[#FF453A]', label: 'Rechazada / Anomalía' },
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
