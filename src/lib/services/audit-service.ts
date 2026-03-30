import { addDoc, Timestamp } from 'firebase/firestore';
import { auditoriaCol } from '../firebase/collections';

interface AuditParams {
  userId: string;
  accion: string;
  entidad: string;
  entidadId: string;
  datosAnteriores?: Record<string, unknown>;
  datosNuevos?: Record<string, unknown>;
}

function stripUndefined(obj?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!obj) return undefined;
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

export async function logAudit(params: AuditParams) {
  const clean = {
    ...params,
    datosAnteriores: stripUndefined(params.datosAnteriores),
    datosNuevos: stripUndefined(params.datosNuevos),
    timestamp: Timestamp.now(),
  };
  // Remove top-level undefined fields too
  const payload = Object.fromEntries(Object.entries(clean).filter(([, v]) => v !== undefined));
  await addDoc(auditoriaCol, payload);
}
