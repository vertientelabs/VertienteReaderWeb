import { collection } from 'firebase/firestore';
import { db } from './config';

// Colecciones existentes (compartidas con app móvil)
export const lecturasCol = collection(db, 'lecturas');
export const clientemedidorCol = collection(db, 'clientemedidor');
export const operariosCol = collection(db, 'operarios');
export const usersCol = collection(db, 'users');
export const companiesCol = collection(db, 'companies');

// Colecciones nuevas (web)
export const departamentosCol = collection(db, 'departamentos');
export const provinciasCol = collection(db, 'provincias');
export const distritosCol = collection(db, 'distritos');
export const zonasCol = collection(db, 'zonas');
export const clientesCol = collection(db, 'clientes');
export const medidoresCol = collection(db, 'medidores');
export const rutasCol = collection(db, 'rutas');
export const asignacionesCol = collection(db, 'asignaciones');
export const periodosCol = collection(db, 'periodos');
export const auditoriaCol = collection(db, 'auditoria');
export const configuracionCol = collection(db, 'configuracion');
export const incidenciasCol = collection(db, 'incidencias');

// Colecciones de analytics / IA
export const analyticsAnomaliasCol = collection(db, 'analytics_anomalias');
export const analyticsKpisCol = collection(db, 'analytics_kpis');
export const analyticsPrediccionesCol = collection(db, 'analytics_predicciones');
export const analyticsScoresRiesgoCol = collection(db, 'analytics_scores_riesgo');
export const configuracionIaCol = collection(db, 'configuracion_ia');
