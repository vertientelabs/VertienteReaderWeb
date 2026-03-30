import {
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { incidenciasCol } from '../firebase/collections';
import type { Incidencia } from '../types';

interface IncidenciaFilters {
  estado?: string;
  tipo?: string;
  prioridad?: string;
}

export async function getIncidencias(filters: IncidenciaFilters = {}) {
  const constraints = [];

  if (filters.estado) constraints.push(where('estado', '==', filters.estado));
  if (filters.tipo) constraints.push(where('tipo', '==', filters.tipo));
  if (filters.prioridad) constraints.push(where('prioridad', '==', filters.prioridad));

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(50));

  const q = query(incidenciasCol, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Incidencia));
}

export async function getIncidenciaById(id: string): Promise<Incidencia | null> {
  const docRef = doc(db, 'incidencias', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Incidencia;
}

export async function updateIncidenciaEstado(
  id: string,
  estado: Incidencia['estado'],
  resolucion?: string,
  userId?: string
) {
  const docRef = doc(db, 'incidencias', id);
  const updateData: Record<string, unknown> = {
    estado,
    updatedAt: Timestamp.now(),
  };

  if (resolucion) updateData.resolucion = resolucion;
  if (userId) updateData.resueltaPor = userId;
  if (estado === 'resuelta' || estado === 'cerrada') {
    updateData.fechaResolucion = Timestamp.now();
  }

  await updateDoc(docRef, updateData);
}
