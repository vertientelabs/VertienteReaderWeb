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
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { lecturasCol } from '../firebase/collections';
import type { LecturaExtendida } from '../types';
import { logAudit } from './audit-service';

interface LecturaFilters {
  operarioId?: string;
  zonaId?: string;
  rutaId?: string;
  estadoValidacion?: string;
  anomalia?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

export async function getLecturas(filters: LecturaFilters = {}) {
  const constraints = [];

  if (filters.operarioId) constraints.push(where('operarioId', '==', filters.operarioId));
  if (filters.zonaId) constraints.push(where('zonaId', '==', filters.zonaId));
  if (filters.rutaId) constraints.push(where('rutaId', '==', filters.rutaId));
  if (filters.estadoValidacion) constraints.push(where('estadoValidacion', '==', filters.estadoValidacion));

  constraints.push(orderBy('fechaHora', 'desc'));
  constraints.push(limit(filters.pageSize || 20));

  if (filters.lastDoc) constraints.push(startAfter(filters.lastDoc));

  const q = query(lecturasCol, ...constraints);
  const snapshot = await getDocs(q);

  return {
    data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as LecturaExtendida)),
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === (filters.pageSize || 20),
  };
}

export async function getLecturaById(id: string): Promise<LecturaExtendida | null> {
  const docRef = doc(db, 'lecturas', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as LecturaExtendida;
}

export async function validarLectura(
  id: string,
  estado: 'validada' | 'rechazada' | 'observada',
  userId: string
) {
  const docRef = doc(db, 'lecturas', id);
  await updateDoc(docRef, {
    estadoValidacion: estado,
    validadaPor: userId,
    fechaValidacion: Timestamp.now(),
  });

  await logAudit({
    userId,
    accion: 'VALIDAR_LECTURA',
    entidad: 'lecturas',
    entidadId: id,
    datosNuevos: { estadoValidacion: estado },
  });
}

export function subscribeLecturas(
  callback: (lecturas: LecturaExtendida[]) => void,
  filters: { operarioId?: string; rutaId?: string } = {}
) {
  const constraints = [];
  if (filters.operarioId) constraints.push(where('operarioId', '==', filters.operarioId));
  if (filters.rutaId) constraints.push(where('rutaId', '==', filters.rutaId));
  constraints.push(orderBy('fechaHora', 'desc'));
  constraints.push(limit(50));

  const q = query(lecturasCol, ...constraints);

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as LecturaExtendida));
    callback(data);
  });
}
