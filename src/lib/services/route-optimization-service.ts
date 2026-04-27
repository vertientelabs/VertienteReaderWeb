import {
  query,
  where,
  getDocs,
  collection,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getRutaById } from '@/lib/services/route-service';
import { getZonas } from '@/lib/services/zone-service';
import type { Medidor, Zona } from '@/lib/types';

// ============================================
// HAVERSINE DISTANCE (km)
// ============================================

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function totalDistance(points: { lat: number; lng: number }[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng);
  }
  return total;
}

// ============================================
// NEAREST NEIGHBOR TSP HEURISTIC
// ============================================

function nearestNeighborRoute(points: { id: string; lat: number; lng: number }[]): string[] {
  if (points.length <= 2) return points.map((p) => p.id);

  const visited = new Set<number>();
  const route: number[] = [0];
  visited.add(0);

  while (visited.size < points.length) {
    const current = route[route.length - 1];
    let nearestIdx = -1;
    let nearestDist = Infinity;

    for (let i = 0; i < points.length; i++) {
      if (visited.has(i)) continue;
      const dist = haversineDistance(
        points[current].lat, points[current].lng,
        points[i].lat, points[i].lng
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    if (nearestIdx >= 0) {
      route.push(nearestIdx);
      visited.add(nearestIdx);
    }
  }

  return route.map((i) => points[i].id);
}

// ============================================
// PUBLIC API
// ============================================

export async function optimizeRoute(rutaId: string): Promise<{
  ordenOriginal: string[];
  ordenOptimizado: string[];
  distanciaOriginal: number;
  distanciaOptimizada: number;
  ahorroPorcentaje: number;
  medidoresCount: number;
}> {
  const ruta = await getRutaById(rutaId);
  if (!ruta) throw new Error('Ruta no encontrada');

  // Get medidores in the ruta's zonas
  const medidoresQuery = query(
    collection(db, 'medidores'),
    where('zonaId', 'in', ruta.zonasIds.length > 0 ? ruta.zonasIds : ['__none__']),
    where('estado', '==', 'activo')
  );
  const medidoresSnap = await getDocs(medidoresQuery);
  const medidores = medidoresSnap.docs.map((d) => ({
    ...(d.data() as Medidor),
    id: d.id,
  }));

  if (medidores.length < 2) {
    return {
      ordenOriginal: medidores.map((m) => m.id),
      ordenOptimizado: medidores.map((m) => m.id),
      distanciaOriginal: 0,
      distanciaOptimizada: 0,
      ahorroPorcentaje: 0,
      medidoresCount: medidores.length,
    };
  }

  const points = medidores.map((m) => ({
    id: m.id,
    lat: m.latitud || 0,
    lng: m.longitud || 0,
  }));

  const ordenOriginal = points.map((p) => p.id);
  const ordenOptimizado = nearestNeighborRoute(points);

  const originalPoints = ordenOriginal.map((id) => {
    const p = points.find((x) => x.id === id)!;
    return { lat: p.lat, lng: p.lng };
  });
  const optimizedPoints = ordenOptimizado.map((id) => {
    const p = points.find((x) => x.id === id)!;
    return { lat: p.lat, lng: p.lng };
  });

  const distanciaOriginal = totalDistance(originalPoints);
  const distanciaOptimizada = totalDistance(optimizedPoints);
  const ahorroPorcentaje =
    distanciaOriginal > 0
      ? ((distanciaOriginal - distanciaOptimizada) / distanciaOriginal) * 100
      : 0;

  return {
    ordenOriginal,
    ordenOptimizado,
    distanciaOriginal: Math.round(distanciaOriginal * 100) / 100,
    distanciaOptimizada: Math.round(distanciaOptimizada * 100) / 100,
    ahorroPorcentaje: Math.round(ahorroPorcentaje * 100) / 100,
    medidoresCount: medidores.length,
  };
}

export async function prioritizeZones(companiId: string): Promise<
  Array<{
    zonaId: string;
    zonaNombre: string;
    prioridad: number;
    factores: string[];
    medidoresCount: number;
  }>
> {
  const zonas = await getZonas({ activo: true });

  const results = [];

  for (const zona of zonas) {
    const medidoresQuery = query(
      collection(db, 'medidores'),
      where('zonaId', '==', zona.id),
      where('estado', '==', 'activo')
    );
    const medidoresSnap = await getDocs(medidoresQuery);
    const medidoresCount = medidoresSnap.size;

    // Calculate priority based on various factors
    let prioridad = 5; // base
    const factores: string[] = [];

    // More medidores = higher priority
    if (medidoresCount > 500) {
      prioridad += 2;
      factores.push(`Gran volumen: ${medidoresCount} medidores`);
    } else if (medidoresCount > 200) {
      prioridad += 1;
      factores.push(`Volumen medio: ${medidoresCount} medidores`);
    }

    // Check anomalias count
    const anomQuery = query(
      collection(db, 'analytics_anomalias'),
      where('zonaId', '==', zona.id),
      where('estado', '==', 'detectada')
    );
    const anomSnap = await getDocs(anomQuery);
    if (anomSnap.size > 10) {
      prioridad += 2;
      factores.push(`${anomSnap.size} anomalias sin revisar`);
    } else if (anomSnap.size > 5) {
      prioridad += 1;
      factores.push(`${anomSnap.size} anomalias sin revisar`);
    }

    results.push({
      zonaId: zona.id,
      zonaNombre: zona.nombre,
      prioridad: Math.min(10, prioridad),
      factores,
      medidoresCount,
    });
  }

  return results.sort((a, b) => b.prioridad - a.prioridad);
}

export async function estimateRouteTime(rutaId: string): Promise<{
  tiempoEstimado: number;
  lecturasEstimadas: number;
}> {
  const ruta = await getRutaById(rutaId);
  if (!ruta) throw new Error('Ruta no encontrada');

  const medidoresQuery = query(
    collection(db, 'medidores'),
    where('zonaId', 'in', ruta.zonasIds.length > 0 ? ruta.zonasIds : ['__none__']),
    where('estado', '==', 'activo')
  );
  const medidoresSnap = await getDocs(medidoresQuery);
  const lecturasEstimadas = medidoresSnap.size;

  // Average 4.5 minutes per reading + travel time
  const tiempoLectura = lecturasEstimadas * 4.5;
  const tiempoTraslado = lecturasEstimadas * 1.5; // estimated 1.5 min between readings
  const tiempoEstimado = tiempoLectura + tiempoTraslado;

  return {
    tiempoEstimado: Math.round(tiempoEstimado),
    lecturasEstimadas,
  };
}
