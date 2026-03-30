import {
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { medidoresCol } from '../firebase/collections';
import type { Medidor } from '../types';
import { logAudit } from './audit-service';

interface MedidorFilters {
  clienteId?: string;
  zonaId?: string;
  estado?: string;
  tipo?: string;
  estadoLectura?: string;
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

export async function getMedidores(filters: MedidorFilters = {}) {
  const constraints = [];

  if (filters.clienteId) constraints.push(where('clienteId', '==', filters.clienteId));
  if (filters.zonaId) constraints.push(where('zonaId', '==', filters.zonaId));
  if (filters.estado) constraints.push(where('estado', '==', filters.estado));
  if (filters.estadoLectura) constraints.push(where('estadoLectura', '==', filters.estadoLectura));

  constraints.push(orderBy('numeroMedidor'));
  constraints.push(limit(filters.pageSize || 20));

  if (filters.lastDoc) constraints.push(startAfter(filters.lastDoc));

  const q = query(medidoresCol, ...constraints);
  const snapshot = await getDocs(q);

  return {
    data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Medidor)),
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === (filters.pageSize || 20),
  };
}

export async function getMedidorById(id: string): Promise<Medidor | null> {
  const docRef = doc(db, 'medidores', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Medidor;
}

export async function createMedidor(
  data: Omit<Medidor, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
) {
  const now = Timestamp.now();
  const docRef = await addDoc(medidoresCol, {
    ...data,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  });

  await logAudit({
    userId,
    accion: 'CREATE_MEDIDOR',
    entidad: 'medidores',
    entidadId: docRef.id,
    datosNuevos: data as Record<string, unknown>,
  });

  return docRef.id;
}

export async function updateMedidor(id: string, data: Partial<Medidor>, userId: string) {
  const docRef = doc(db, 'medidores', id);
  const prev = await getDoc(docRef);

  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });

  await logAudit({
    userId,
    accion: 'UPDATE_MEDIDOR',
    entidad: 'medidores',
    entidadId: id,
    datosAnteriores: prev.data() as Record<string, unknown>,
    datosNuevos: data as Record<string, unknown>,
  });
}
