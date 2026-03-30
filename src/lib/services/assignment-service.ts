import {
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { asignacionesCol } from '../firebase/collections';
import type { Asignacion } from '../types';
import { logAudit } from './audit-service';

export async function getAsignaciones(filters: { periodo?: string; operarioId?: string; estado?: string } = {}) {
  const constraints = [];
  if (filters.periodo) constraints.push(where('periodo', '==', filters.periodo));
  if (filters.operarioId) constraints.push(where('operarioId', '==', filters.operarioId));
  if (filters.estado) constraints.push(where('estado', '==', filters.estado));
  constraints.push(orderBy('fechaAsignacion', 'desc'));

  const q = query(asignacionesCol, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Asignacion));
}

export async function createAsignacion(
  data: Omit<Asignacion, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
) {
  const now = Timestamp.now();
  const docRef = await addDoc(asignacionesCol, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });

  await logAudit({
    userId,
    accion: 'CREATE_ASIGNACION',
    entidad: 'asignaciones',
    entidadId: docRef.id,
    datosNuevos: data as Record<string, unknown>,
  });

  return docRef.id;
}

export async function updateAsignacion(id: string, data: Partial<Asignacion>, userId: string) {
  const docRef = doc(db, 'asignaciones', id);
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });

  await logAudit({
    userId,
    accion: 'UPDATE_ASIGNACION',
    entidad: 'asignaciones',
    entidadId: id,
    datosNuevos: data as Record<string, unknown>,
  });
}
