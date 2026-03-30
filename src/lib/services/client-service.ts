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
import { clientesCol } from '../firebase/collections';
import type { Cliente } from '../types';
import { logAudit } from './audit-service';

interface ClienteFilters {
  zonaId?: string;
  estado?: string;
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

export async function getClientes(filters: ClienteFilters = {}) {
  const constraints = [];

  if (filters.zonaId) constraints.push(where('zonaId', '==', filters.zonaId));
  if (filters.estado) constraints.push(where('estado', '==', filters.estado));
  if (filters.departamentoId) constraints.push(where('departamentoId', '==', filters.departamentoId));

  constraints.push(orderBy('nombreCompleto'));
  constraints.push(limit(filters.pageSize || 20));

  if (filters.lastDoc) constraints.push(startAfter(filters.lastDoc));

  const q = query(clientesCol, ...constraints);
  const snapshot = await getDocs(q);

  return {
    data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Cliente)),
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === (filters.pageSize || 20),
  };
}

export async function getClienteById(id: string): Promise<Cliente | null> {
  const docRef = doc(db, 'clientes', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Cliente;
}

export async function createCliente(
  data: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
) {
  const now = Timestamp.now();
  const docRef = await addDoc(clientesCol, {
    ...data,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  });

  await logAudit({
    userId,
    accion: 'CREATE_CLIENTE',
    entidad: 'clientes',
    entidadId: docRef.id,
    datosNuevos: data as Record<string, unknown>,
  });

  return docRef.id;
}

export async function searchClientes(searchTerm: string): Promise<Cliente[]> {
  const q = query(clientesCol, orderBy('nombreCompleto'), limit(200));
  const snapshot = await getDocs(q);
  let all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Cliente));
  all = all.filter((c) => c.estado !== 'inactivo');
  if (!searchTerm) return all;
  const term = searchTerm.toLowerCase();
  return all.filter(
    (c) =>
      (c.nombreCompleto || '').toLowerCase().includes(term) ||
      (c.numeroDocumento || '').toLowerCase().includes(term)
  );
}

export async function updateCliente(
  id: string,
  data: Partial<Cliente>,
  userId: string
) {
  const docRef = doc(db, 'clientes', id);
  const prev = await getDoc(docRef);

  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });

  await logAudit({
    userId,
    accion: 'UPDATE_CLIENTE',
    entidad: 'clientes',
    entidadId: id,
    datosAnteriores: prev.data() as Record<string, unknown>,
    datosNuevos: data as Record<string, unknown>,
  });
}
