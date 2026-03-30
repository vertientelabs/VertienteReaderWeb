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
import { companiesCol } from '../firebase/collections';
import type { Company } from '../types';
import { logAudit } from './audit-service';

interface CompanyFilters {
  tipoEmpresa?: string;
  activo?: boolean;
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

export async function getCompanies(filters: CompanyFilters = {}) {
  const constraints = [];

  if (filters.tipoEmpresa) constraints.push(where('tipoEmpresa', '==', filters.tipoEmpresa));
  if (filters.activo !== undefined) constraints.push(where('activo', '==', filters.activo));

  constraints.push(orderBy('razonsocial'));
  constraints.push(limit(filters.pageSize || 100));

  if (filters.lastDoc) constraints.push(startAfter(filters.lastDoc));

  const q = query(companiesCol, ...constraints);
  const snapshot = await getDocs(q);

  return {
    data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Company)),
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === (filters.pageSize || 100),
  };
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const docRef = doc(db, 'companies', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Company;
}

export async function searchCompanies(searchTerm: string, tipoEmpresa?: string): Promise<Company[]> {
  // Simple query — fetch all companies (no composite index needed)
  const q = query(companiesCol, orderBy('razonsocial'), limit(200));
  const snapshot = await getDocs(q);

  let all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Company));

  // Filter by tipoEmpresa client-side (avoids composite index requirement)
  if (tipoEmpresa) {
    all = all.filter((c) => c.tipoEmpresa === tipoEmpresa);
  }

  // Filter only active (treat missing activo as active for legacy data)
  all = all.filter((c) => c.activo !== false);

  if (!searchTerm) return all;

  const term = searchTerm.toLowerCase();
  return all.filter(
    (c) =>
      (c.razonsocial || '').toLowerCase().includes(term) ||
      (c.ruc || '').toLowerCase().includes(term) ||
      (c.id || '').toLowerCase().includes(term)
  );
}

export async function createCompany(
  data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
) {
  const now = Timestamp.now();
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  const docRef = await addDoc(companiesCol, {
    ...cleanData,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  });

  await logAudit({
    userId,
    accion: 'CREATE_COMPANY',
    entidad: 'companies',
    entidadId: docRef.id,
    datosNuevos: data as Record<string, unknown>,
  });

  return docRef.id;
}

export async function updateCompany(
  id: string,
  data: Partial<Company>,
  userId: string
) {
  const docRef = doc(db, 'companies', id);
  const prev = await getDoc(docRef);

  // Remove undefined values — Firestore rejects them
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );

  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: Timestamp.now(),
  });

  await logAudit({
    userId,
    accion: 'UPDATE_COMPANY',
    entidad: 'companies',
    entidadId: id,
    datosAnteriores: prev.data() as Record<string, unknown>,
    datosNuevos: data as Record<string, unknown>,
  });
}
