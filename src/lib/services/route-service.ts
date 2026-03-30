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
import { rutasCol } from '../firebase/collections';
import type { Ruta } from '../types';
import { logAudit } from './audit-service';

export async function getRutas(companiId?: string) {
  const constraints = [];
  if (companiId) constraints.push(where('companiId', '==', companiId));
  constraints.push(where('activo', '==', true));
  constraints.push(orderBy('nombre'));

  const q = query(rutasCol, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Ruta));
}

export async function getRutaById(id: string): Promise<Ruta | null> {
  const docRef = doc(db, 'rutas', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Ruta;
}

export async function createRuta(
  data: Omit<Ruta, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
) {
  const now = Timestamp.now();
  const docRef = await addDoc(rutasCol, {
    ...data,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  });

  await logAudit({
    userId,
    accion: 'CREATE_RUTA',
    entidad: 'rutas',
    entidadId: docRef.id,
    datosNuevos: data as Record<string, unknown>,
  });

  return docRef.id;
}

export async function updateRuta(id: string, data: Partial<Ruta>, userId: string) {
  const docRef = doc(db, 'rutas', id);
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });

  await logAudit({
    userId,
    accion: 'UPDATE_RUTA',
    entidad: 'rutas',
    entidadId: id,
    datosNuevos: data as Record<string, unknown>,
  });
}
