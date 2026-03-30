'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface MapMarker {
  position: [number, number];
  popup?: string;
  color?: 'blue' | 'red' | 'green' | 'orange' | 'purple';
  radius?: number;
}

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: string;
  className?: string;
}

const colorMap: Record<string, string> = {
  blue: '#0A84FF',
  red: '#FF453A',
  green: '#30D158',
  orange: '#FF9F0A',
  purple: '#BF5AF2',
};

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map(m => m.position));
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [markers, map]);
  return null;
}

export default function LeafletMap({
  center = [-12.046, -77.0428],
  zoom = 13,
  markers = [],
  height = '400px',
  className = '',
}: LeafletMapProps) {
  return (
    <div
      className={`rounded-xl overflow-hidden border border-white/[0.18] dark:border-white/[0.08] ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.length > 1 && <FitBounds markers={markers} />}
        {markers.map((marker, idx) => (
          <CircleMarker
            key={idx}
            center={marker.position}
            radius={marker.radius || 8}
            pathOptions={{
              color: colorMap[marker.color || 'blue'],
              fillColor: colorMap[marker.color || 'blue'],
              fillOpacity: 0.7,
              weight: 2,
            }}
          >
            {marker.popup && (
              <Popup>
                <div className="text-xs" dangerouslySetInnerHTML={{ __html: marker.popup }} />
              </Popup>
            )}
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
