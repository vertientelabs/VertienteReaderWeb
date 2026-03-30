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
import { zonasCol } from '../firebase/collections';
import type { Zona } from '../types';
import { logAudit } from './audit-service';

export async function getZonas(filters: { distritoId?: string; activo?: boolean } = {}) {
  const constraints = [];
  if (filters.distritoId) constraints.push(where('distritoId', '==', filters.distritoId));
  if (filters.activo !== undefined) constraints.push(where('activo', '==', filters.activo));
  constraints.push(orderBy('nombre'));

  const q = query(zonasCol, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Zona));
}

export async function getZonaById(id: string): Promise<Zona | null> {
  const docRef = doc(db, 'zonas', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Zona;
}

export async function createZona(
  data: Omit<Zona, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
) {
  const now = Timestamp.now();
  // Remove undefined fields — Firestore rejects them
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  const docRef = await addDoc(zonasCol, {
    ...cleanData,
    createdAt: now,
    updatedAt: now,
  });

  await logAudit({
    userId,
    accion: 'CREATE_ZONA',
    entidad: 'zonas',
    entidadId: docRef.id,
    datosNuevos: data as Record<string, unknown>,
  });

  return docRef.id;
}

export async function updateZona(id: string, data: Partial<Zona>, userId: string) {
  const docRef = doc(db, 'zonas', id);
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });

  await logAudit({
    userId,
    accion: 'UPDATE_ZONA',
    entidad: 'zonas',
    entidadId: id,
    datosNuevos: data as Record<string, unknown>,
  });
}
