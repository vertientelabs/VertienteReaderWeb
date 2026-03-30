import {
  getDocs,
  addDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { clientemedidorCol, medidoresCol } from '../firebase/collections';
import { getClienteById } from './client-service';
import { getZonaById } from './zone-service';
import { getRutaById } from './route-service';
import { resolveUbigeoNames } from '../hooks/use-ubigeo';
import type { Medidor } from '../types';

/**
 * Populates the `clientemedidor` collection for a given assignment.
 * Creates one record per medidor associated with the zonas included in the assigned ruta.
 */
export async function populateClienteMedidor(rutaId: string, asignacionId: string, operarioId: string) {
  // 1. Get the ruta and its zonas
  const ruta = await getRutaById(rutaId);
  if (!ruta || !ruta.zonasIds || ruta.zonasIds.length === 0) return;

  // 2. For each zona, get all active medidores
  const allMedidores: Medidor[] = [];
  for (const zonaId of ruta.zonasIds) {
    const q = query(
      medidoresCol,
      where('zonaId', '==', zonaId),
      where('estado', '==', 'activo')
    );
    const snapshot = await getDocs(q);
    const medidores = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Medidor));
    allMedidores.push(...medidores);
  }

  if (allMedidores.length === 0) return;

  // 3. Collect unique clienteIds and zonaIds for batch resolution
  const uniqueClienteIds = [...new Set(allMedidores.map((m) => m.clienteId).filter(Boolean))];
  const uniqueZonaIds = [...new Set(allMedidores.map((m) => m.zonaId).filter(Boolean))];

  // Resolve all clients and zones in parallel
  const [clienteMap, zonaMap] = await Promise.all([
    resolveEntities(uniqueClienteIds, getClienteById),
    resolveEntities(uniqueZonaIds, getZonaById),
  ]);

  // 4. For each medidor, create a clientemedidor record
  const now = Timestamp.now();
  const promises = allMedidores.map(async (medidor) => {
    const cliente = clienteMap.get(medidor.clienteId);
    const zona = zonaMap.get(medidor.zonaId);

    // Resolve ubigeo names from zona or medidor
    const depId = medidor.departamentoId || zona?.departamentoId || '';
    const provId = medidor.provinciaId || zona?.provinciaId || '';
    const distId = medidor.distritoId || zona?.distritoId || '';

    const ubigeoNames = await resolveUbigeoNames(depId, provId, distId);

    await addDoc(clientemedidorCol, {
      clienteId: medidor.clienteId || '',
      nombreCliente: cliente?.nombreCompleto || '',
      numeroMedidor: medidor.numeroMedidor || '',
      medidorId: medidor.id,
      departamento: ubigeoNames.departamento,
      provincia: ubigeoNames.provincia,
      distrito: ubigeoNames.distrito,
      direccion: medidor.direccionInstalacion || cliente?.direccion || '',
      estado: 'pendiente',
      zonaId: medidor.zonaId || '',
      latitud: medidor.latitud || 0,
      longitud: medidor.longitud || 0,
      lecturaActual: medidor.lecturaActual ?? null,
      lecturaAnterior: medidor.lecturaAnterior ?? 0,
      operarioId,
      asignacionId,
      rutaId,
      createdAt: now,
    });
  });

  await Promise.all(promises);
}

async function resolveEntities<T>(
  ids: string[],
  fetcher: (id: string) => Promise<T | null>
): Promise<Map<string, T>> {
  const map = new Map<string, T>();
  const results = await Promise.all(ids.map((id) => fetcher(id).catch(() => null)));
  ids.forEach((id, i) => {
    if (results[i]) map.set(id, results[i] as T);
  });
  return map;
}
