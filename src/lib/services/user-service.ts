import {
  getDocs,
  getDoc,
  setDoc,
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
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, secondaryAuth } from '../firebase/config';
import { usersCol } from '../firebase/collections';
import type { Usuario } from '../types';
import { logAudit } from './audit-service';

interface UserFilters {
  usertype?: string;
  companiId?: string;
  activo?: boolean;
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

export async function getUsers(filters: UserFilters = {}) {
  const constraints = [];

  if (filters.usertype) constraints.push(where('usertype', '==', filters.usertype));
  if (filters.companiId) constraints.push(where('companiId', '==', filters.companiId));
  if (filters.activo !== undefined) constraints.push(where('activo', '==', filters.activo));

  constraints.push(orderBy('nombre'));
  constraints.push(limit(filters.pageSize || 20));

  if (filters.lastDoc) constraints.push(startAfter(filters.lastDoc));

  const q = query(usersCol, ...constraints);
  const snapshot = await getDocs(q);

  return {
    data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Usuario)),
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === (filters.pageSize || 20),
  };
}

export async function getUserById(id: string): Promise<Usuario | null> {
  const docRef = doc(db, 'users', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Usuario;
}

export async function createUser(
  data: {
    email: string;
    password: string;
    nombre: string;
    apellidos: string;
    tipoDocumento?: string;
    numeroDocumento?: string;
    telefono?: string;
    direccion?: string;
    usertype: string;
    companiId: string;
    companiCli?: string;
    departamentoId?: string;
    provinciaId?: string;
    distritoId?: string;
  },
  currentUserId: string
) {
  // Create Firebase Auth user on the secondary instance so the
  // current admin session is not replaced by the newly-created user.
  const credential = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
  const uid = credential.user.uid;
  // Sign out immediately from the secondary instance to keep it clean
  await signOut(secondaryAuth);

  const now = Timestamp.now();
  const userData = {
    email: data.email,
    nombre: data.nombre,
    apellidos: data.apellidos,
    tipoDocumento: data.tipoDocumento || null,
    numeroDocumento: data.numeroDocumento || null,
    telefono: data.telefono || null,
    direccion: data.direccion || null,
    usertype: data.usertype,
    companiId: data.companiId,
    companiCli: data.companiCli || null,
    departamentoId: data.departamentoId || null,
    provinciaId: data.provinciaId || null,
    distritoId: data.distritoId || null,
    activo: true,
    createdAt: now,
    updatedAt: now,
    createdBy: currentUserId,
  };

  await setDoc(doc(db, 'users', uid), userData);

  await logAudit({
    userId: currentUserId,
    accion: 'CREATE_USER',
    entidad: 'users',
    entidadId: uid,
    datosNuevos: { ...userData, password: '[REDACTED]' },
  });

  return uid;
}

export async function updateUser(id: string, data: Partial<Usuario>, currentUserId: string) {
  const docRef = doc(db, 'users', id);
  const prev = await getDoc(docRef);

  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });

  await logAudit({
    userId: currentUserId,
    accion: 'UPDATE_USER',
    entidad: 'users',
    entidadId: id,
    datosAnteriores: prev.data() as Record<string, unknown>,
    datosNuevos: data as Record<string, unknown>,
  });
}
