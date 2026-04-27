# PROMPT DE IMPLEMENTACION: MEJORAS CON IA EN VERTIENTE READER WEB

---

## INSTRUCCION PRINCIPAL

Eres un ingeniero senior especializado en Next.js, TypeScript, Firebase y Machine Learning. Tu tarea es implementar mejoras de inteligencia artificial en la aplicacion **Vertiente Reader Web**, un sistema de gestion de lectura de medidores de agua para empresas de saneamiento en Peru.

Debes implementar las mejoras en **5 fases progresivas**, modificando y creando archivos dentro del proyecto existente. Cada fase debe ser funcional e independiente antes de pasar a la siguiente.

---

## CONTEXTO DEL NEGOCIO

### Cliente: SEDALIB S.A.
- Empresa de saneamiento de La Libertad, Peru
- 205,397 conexiones de agua potable
- 160,094 con medidor (77.94%), 157,155 operativos
- 251,384 unidades de uso (87.21% domesticas)
- 83.38% facturadas por medicion
- 13 localidades con ANF que varia de 33.92% a 75.16%
- 2,315,696 recibos emitidos al anio

### Problema Principal
**Agua No Facturada (ANF) = 50.95%** (empeoro desde 49.52% en 2023). Mas de la mitad del agua producida (58.977 MM m3) no se factura. Perdida estimada: **S/ 114.2 millones anuales**.

### ANF por Localidad (Puntos Criticos)
| Localidad | ANF (%) | Agua Producida (m3) |
|---|---|---|
| Chepon | 75.16% | 3,262,373 |
| Salaverry | 69.11% | 2,078,005 |
| Paijan | 69.11% | 1,055,798 |
| El Porvenir | 63.37% | 7,434,902 |
| Florencia de Mora | 61.20% | 1,733,247 |
| Moche | 56.15% | 2,263,479 |
| Trujillo | 47.07% | 25,825,376 |
| La Esperanza | 44.49% | 7,121,119 |
| Victor Larco | 33.92% | 5,171,922 |

---

## STACK TECNOLOGICO EXISTENTE

```
Framework:      Next.js 16.2.1 (App Router) + TypeScript
Estilos:        Tailwind CSS 4 + Liquid Glass Design System (glassmorphism, backdrop-blur, CSS variables)
Backend:        Firebase (Firestore, Auth, Storage)
Estado Global:  Zustand (sidebar)
Iconos:         lucide-react
PDF:            jsPDF
RBAC:           5 roles (root, administrador, supervisor, operario, lector)
Proyecto FB:    vertientefb
```

---

## ARQUITECTURA ACTUAL DEL PROYECTO

### Estructura de Directorios
```
src/
  app/
    (auth)/
      login/page.tsx
      forgot-password/page.tsx
      layout.tsx
    (dashboard)/
      layout.tsx                    # Layout principal con sidebar
      page.tsx                      # Dashboard home
      clientes/                     # CRUD completo (page, nuevo, [id], [id]/editar)
      medidores/                    # CRUD completo
      zonas/                        # CRUD completo
      rutas/                        # CRUD completo
      usuarios/                     # CRUD completo
      empresas/                     # CRUD completo
      asignaciones/page.tsx
      lecturas/
        page.tsx
        dashboard/page.tsx          # Dashboard analitico actual
        [id]/page.tsx
      integracion/
        exportar/page.tsx
        historial/page.tsx
      reportes/page.tsx
      configuracion/page.tsx
      auditoria/page.tsx
      incidencias/                  # Lista y detalle
      perfil/page.tsx
  components/
    layout/
      sidebar.tsx                   # Sidebar con navegacion y roles
      topbar.tsx                    # Topbar con busqueda, tema, usuario
      breadcrumb.tsx
    forms/
      ubigeo-cascader.tsx           # Cascading selects departamento/provincia/distrito
    shared/
      data-table.tsx                # Tabla de datos reutilizable con paginacion
      auth-provider.tsx             # Contexto de autenticacion
      loading-skeleton.tsx
      confirm-dialog.tsx
      theme-toggle.tsx
  lib/
    types/
      entities.ts                   # Todas las interfaces del sistema
      enums.ts                      # Todos los enums del sistema
    firebase/
      config.ts                     # Configuracion Firebase
      collections.ts                # Referencias a colecciones Firestore
    services/                       # 15 servicios con logica de negocio
    hooks/                          # 5 hooks custom
    constants.ts                    # Navegacion, umbrales, constantes
    utils.ts
  styles/
    globals.css                     # Estilos globales + Tailwind
    glass-system.css                # Liquid Glass Design System completo
```

### Interfaces Principales (src/lib/types/entities.ts)

```typescript
// ENTIDADES CORE
interface Zona {
  id: string; nombre: string; codigo: string; descripcion?: string;
  departamentoId: string; provinciaId: string; distritoId: string;
  limites?: { lat: number; lng: number }[];
  companiId?: string; activo: boolean;
  createdAt: Timestamp; updatedAt: Timestamp;
}

interface Cliente {
  id: string; tipoDocumento: TipoDocumentoType; numeroDocumento: string;
  nombreCompleto: string; telefono?: string; email?: string;
  direccion: string; departamentoId: string; provinciaId: string;
  distritoId: string; zonaId: string; referencia?: string;
  latitud: number; longitud: number; estado: EstadoClienteType;
  companiId: string; createdAt: Timestamp; updatedAt: Timestamp; createdBy: string;
}

interface Medidor {
  id: string; numeroMedidor: string; marca?: string; modelo?: string;
  tipo: TipoMedidorType; diametro?: string; clienteId: string; zonaId: string;
  direccionInstalacion: string; departamentoId?: string; provinciaId?: string;
  distritoId?: string; latitud: number; longitud: number;
  estado: EstadoMedidorType; fechaInstalacion?: Timestamp;
  lecturaInstalacion?: number; lecturaAnterior: number; lecturaActual?: number;
  estadoLectura: EstadoLecturaType; companiId: string;
  createdAt: Timestamp; updatedAt: Timestamp; createdBy: string;
}

interface Ruta {
  id: string; nombre: string; codigo: string; descripcion?: string;
  zonasIds: string[]; totalMedidores: number; companiId: string;
  activo: boolean; createdAt: Timestamp; updatedAt: Timestamp; createdBy: string;
}

interface Asignacion {
  id: string; operarioId: string; rutaId: string; periodo: string;
  fechaAsignacion: Timestamp; fechaInicio: Timestamp; fechaFin: Timestamp;
  estado: EstadoAsignacionType; totalMedidores: number; medidoresLeidos: number;
  porcentajeAvance: number; asignadoPor: string; companiId: string;
  createdAt: Timestamp; updatedAt: Timestamp;
}

interface LecturaExtendida extends Lectura {
  clienteId: string; zonaId: string; rutaId: string; asignacionId: string;
  consumo: number; observaciones?: string; tipoLectura: TipoLecturaType;
  anomalia?: AnomaliaType; validadaPor?: string; fechaValidacion?: Timestamp;
  estadoValidacion: EstadoValidacionType;
}

interface Lectura {
  id: string; medidorId: string; operarioId: string; valorLectura: number;
  fotoUrl?: string; fechaHora: Timestamp; latitudCaptura: number; longitudCaptura: number;
}

interface Usuario {
  id: string; email: string; nombre: string; apellidos: string;
  tipoDocumento?: string; numeroDocumento?: string; telefono?: string;
  direccion?: string; usertype: UserRole; permisos?: string[];
  companiId: string; companiCli?: string; departamentoId?: string;
  provinciaId?: string; distritoId?: string; activo: boolean;
  ultimoAcceso?: Timestamp; createdAt: Timestamp; updatedAt: Timestamp;
  createdBy: string; avatarUrl?: string;
}

interface Incidencia {
  id: string; lecturaId?: string; medidorId: string; operarioId: string;
  tipo: 'acceso_denegado' | 'medidor_danado' | 'fuga_agua' | 'medidor_no_encontrado' | 'zona_peligrosa' | 'otro';
  descripcion: string; fotoUrl?: string; latitud?: number; longitud?: number;
  estado: 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  resolucion?: string; resueltaPor?: string; fechaResolucion?: Timestamp;
  companiId: string; createdAt: Timestamp; updatedAt: Timestamp;
}

interface Company {
  id: string; razonsocial: string; ruc: string; direccion: string;
  departamentoId: string; provinciaId: string; distritoId: string;
  tipoEmpresa: TipoEmpresaType; empresaClienteId?: string;
  consumoPromedioAlerta?: number; consumoMinimoAlerta?: number;
  diasLimiteLectura?: number; formatoExportacion?: 'CSV' | 'JSON' | 'XML';
  activo: boolean; createdAt: Timestamp; updatedAt: Timestamp; createdBy: string;
}

interface Configuracion {
  id: string; companiId: string; consumoPromedioAlerta: number;
  consumoMinimoAlerta: number; diasLimiteLectura: number;
  formatoExportacion: 'CSV' | 'JSON' | 'XML'; zonaHoraria: string; moneda: string;
}

// UBIGEO
interface Departamento { id: string; nombre: string; activo: boolean; }
interface Provincia { id: string; nombre: string; departamentoId: string; activo: boolean; }
interface Distrito { id: string; nombre: string; provinciaId: string; departamentoId: string; activo: boolean; }
```

### Enums (src/lib/types/enums.ts)
```typescript
type UserRole = 'root' | 'administrador' | 'supervisor' | 'operario' | 'lector';
type EstadoClienteType = 'activo' | 'inactivo' | 'suspendido';
type EstadoMedidorType = 'activo' | 'inactivo' | 'dañado' | 'retirado' | 'por_instalar';
type EstadoLecturaType = 'pendiente' | 'leido';
type TipoMedidorType = 'mecanico' | 'digital' | 'inteligente';
type TipoDocumentoType = 'DNI' | 'RUC' | 'CE' | 'PASAPORTE';
type TipoLecturaType = 'normal' | 'estimada' | 'promedio' | 'verificacion';
type AnomaliaType = 'consumo_alto' | 'consumo_bajo' | 'medidor_parado' | 'retroceso' | 'ninguna';
type EstadoValidacionType = 'pendiente' | 'validada' | 'rechazada' | 'observada';
type EstadoAsignacionType = 'activa' | 'completada' | 'cancelada';
type TipoEmpresaType = 'CLI' | 'PRO';
type EstadoPeriodoType = 'planificado' | 'en_curso' | 'cerrado' | 'facturado';
```

### Colecciones Firestore (src/lib/firebase/collections.ts)
```typescript
// Colecciones existentes (14):
lecturas, clientemedidor, operarios, users, companies,
departamentos, provincias, distritos, zonas, clientes,
medidores, rutas, asignaciones, periodos, auditoria,
configuracion, incidencias
```

### Servicios Existentes (src/lib/services/)

```typescript
// anomaly-service.ts
detectAnomaly(params: AnomalyCheckParams): AnomaliaType

// reading-service.ts
getLecturas(filters: LecturaFilters): Promise<{ data: LecturaExtendida[]; lastDoc; hasMore }>
getLecturaById(id: string): Promise<LecturaExtendida | null>
validarLectura(id: string, estado: string, userId: string): Promise<void>
subscribeLecturas(callback, filters?): Unsubscribe

// report-service.ts
generateReporteIndividual(clienteId: string, periodo: string): Promise<jsPDF>
generateReporteZona(zonaId: string, periodo: string): Promise<jsPDF>
generateReporteOperario(operarioId: string, periodo: string): Promise<jsPDF>
generateReporteEjecutivo(periodo: string, companiId: string): Promise<jsPDF>

// client-service.ts
getClientes(filters: ClienteFilters): Promise<{ data: Cliente[]; lastDoc; hasMore }>
getClienteById(id: string): Promise<Cliente | null>
createCliente(data, userId: string): Promise<string>
searchClientes(searchTerm: string): Promise<Cliente[]>
updateCliente(id: string, data: Partial<Cliente>, userId: string): Promise<void>

// zone-service.ts
getZonas(filters?: { distritoId?: string; activo?: boolean }): Promise<Zona[]>
getZonaById(id: string): Promise<Zona | null>
createZona(data, userId: string): Promise<string>
updateZona(id: string, data: Partial<Zona>, userId: string): Promise<void>

// meter-service.ts
getMedidores(filters: MedidorFilters): Promise<{ data: Medidor[]; lastDoc; hasMore }>
getMedidorById(id: string): Promise<Medidor | null>
createMedidor(data, userId: string): Promise<string>
updateMedidor(id: string, data: Partial<Medidor>, userId: string): Promise<void>

// route-service.ts
getRutas(companiId?: string): Promise<Ruta[]>
getRutaById(id: string): Promise<Ruta | null>
createRuta(data, userId: string): Promise<string>
updateRuta(id: string, data: Partial<Ruta>, userId: string): Promise<void>

// assignment-service.ts
getAsignaciones(filters?): Promise<Asignacion[]>
createAsignacion(data, userId: string): Promise<string>
updateAsignacion(id: string, data: Partial<Asignacion>, userId: string): Promise<void>

// export-service.ts
exportToCSV(data: ExportData): string
exportToJSON(data: ExportData): string
exportToXML(data: ExportData): string
downloadFile(content: string, filename: string, mimeType: string): void

// audit-service.ts
logAudit(params: AuditParams): Promise<void>

// user-service.ts
getUsers(filters: UserFilters): Promise<{ data: Usuario[]; lastDoc; hasMore }>
getUserById(id: string): Promise<Usuario | null>
createUser(data, currentUserId: string): Promise<string>
updateUser(id: string, data: Partial<Usuario>, currentUserId: string): Promise<void>

// company-service.ts
getCompanies(filters: CompanyFilters): Promise<{ data: Company[]; lastDoc; hasMore }>
getCompanyById(id: string): Promise<Company | null>
searchCompanies(searchTerm: string, tipoEmpresa?: string): Promise<Company[]>
createCompany(data, userId: string): Promise<string>
updateCompany(id: string, data: Partial<Company>, userId: string): Promise<void>

// clientemedidor-service.ts (integracion con app movil)
// incidencia-service.ts
```

### Hooks Existentes (src/lib/hooks/)
```typescript
// use-auth.ts
useAuth(): { user: Usuario | null; loading: boolean; signIn; signOut; }
useRole(): UserRole | null
useHasRole(...roles: UserRole[]): boolean

// use-permissions.ts
usePermission(module: string, permission: 'create' | 'read' | 'update' | 'delete'): boolean
useCanAccess(module: string): boolean

// use-realtime.ts
useRealtimeCollection<T>(query: Query | null, enabled?: boolean): { data: T[]; loading: boolean; error: Error | null }

// use-ubigeo.ts (cascading departamento/provincia/distrito)
useUbigeo(): { departamentos, provincias, distritos, selected, handlers, syncValues }

// use-sidebar.ts (Zustand)
useSidebar(): { open, collapsed, toggle, close, setCollapsed }
```

### Constantes Actuales (src/lib/constants.ts)
```typescript
ANOMALY_THRESHOLDS = {
  CONSUMO_ALTO_PORCENTAJE: 200,   // 200% del promedio
  CONSUMO_BAJO_PORCENTAJE: 20,    // 20% del promedio
  PERIODOS_MEDIDOR_PARADO: 2,     // 2 periodos con consumo 0
}
```

### Navegacion Actual (15 items en sidebar)
```
Dashboard, Clientes, Medidores, Zonas, Rutas, Asignaciones,
Lecturas, Dashboards, Exportar, Reportes, Usuarios, Empresas,
Configuracion, Auditoria, Incidencias
```

### Componentes Reutilizables Clave
- `DataTable` (src/components/shared/data-table.tsx) - Tabla con paginacion, busqueda, responsive
- `UbigeoCascader` (src/components/forms/ubigeo-cascader.tsx) - Selects en cascada
- `ConfirmDialog` (src/components/shared/confirm-dialog.tsx) - Dialogo de confirmacion
- `LoadingSkeleton` / `FullPageLoader` (src/components/shared/loading-skeleton.tsx)
- `ThemeToggle` (src/components/shared/theme-toggle.tsx) - Cambio claro/oscuro

### Liquid Glass Design System (src/styles/glass-system.css)
```css
/* Variables CSS principales */
--glass-bg: rgba(255,255,255,0.72);          /* Fondo glassmorphism claro */
--glass-bg-dark: rgba(30,30,30,0.78);        /* Fondo glassmorphism oscuro */
--glass-border: rgba(255,255,255,0.3);       /* Borde cristal */
--glass-shadow: 0 8px 32px rgba(0,0,0,0.08); /* Sombra suave */
--text-primary, --text-secondary, --text-tertiary  /* Colores de texto */
--accent: #0071e3;                           /* Color acento (azul Apple) */
--accent-hover: #0077ED;
--success: #34c759; --warning: #ff9f0a; --error: #ff3b30; --info: #5ac8fa;

/* Clases utilitarias */
.glass-card { backdrop-filter: blur(20px); background: var(--glass-bg); border-radius: 16px; }
.glass-button { ... }
.glass-input { ... }
.glass-sidebar { ... }
.mesh-bg { ... }  /* Fondo mesh gradient para login */
```

---

## RESTRICCIONES DE IMPLEMENTACION

1. **Mantener compatibilidad** con la app movil Flutter existente (no modificar colecciones compartidas: `lecturas`, `clientemedidor`, `operarios`)
2. **Usar Firebase Firestore** como backend principal (NO bases de datos externas en esta fase)
3. **Respetar el Liquid Glass Design System** existente en todos los componentes nuevos
4. **Mantener el sistema RBAC** de 5 roles en todas las nuevas funcionalidades
5. **No instalar dependencias pesadas** de ML en el frontend - los calculos de IA se hacen con logica TypeScript/JavaScript en el cliente o en Cloud Functions
6. **Cada componente nuevo debe ser responsive** (mobile-first, siguiendo los patrones existentes con clases sm: md: lg:)
7. **Usar 'use client'** en componentes que usen hooks de React (useState, useEffect, etc.)
8. **Seguir los patrones de codigo existentes**: servicios en lib/services/, hooks en lib/hooks/, paginas en app/(dashboard)/
9. **Instalar dependencias con npm** (no yarn ni pnpm)
10. **Leer la guia de Next.js** en `node_modules/next/dist/docs/` antes de crear cualquier pagina o layout nuevo

---

## FASE 1: FUNDAMENTOS - Motor de Anomalias y Dashboard ANF

### Objetivo
Implementar un motor de deteccion de anomalias avanzado y un dashboard ejecutivo con KPIs de Agua No Facturada (ANF).

### 1.1 Nuevas Colecciones Firestore

Agregar en `src/lib/firebase/collections.ts`:

```typescript
// Colecciones de analytics (NUEVAS)
export const analyticsAnomalias = collection(db, 'analytics_anomalias');
export const analyticsKpis = collection(db, 'analytics_kpis');
export const analyticsPredicciones = collection(db, 'analytics_predicciones');
export const analyticsScoresRiesgo = collection(db, 'analytics_scores_riesgo');
export const configuracionIa = collection(db, 'configuracion_ia');
```

### 1.2 Nuevas Interfaces (agregar en src/lib/types/entities.ts)

```typescript
// ============================================
// ANALYTICS - ANOMALIAS
// ============================================
export interface AnalyticsAnomalia {
  id: string;
  lecturaId: string;
  medidorId: string;
  clienteId: string;
  zonaId: string;
  rutaId?: string;
  tipoAnomalia: 'consumo_alto' | 'consumo_bajo' | 'consumo_cero' | 'retroceso' | 'patron_atipico' | 'variacion_estacional';
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  scoreConfiabilidad: number;        // 0-100
  consumoActual: number;
  consumoEsperado: number;
  desviacionPorcentual: number;
  descripcion: string;
  recomendacion: string;
  estado: 'detectada' | 'en_revision' | 'confirmada' | 'descartada' | 'resuelta';
  revisadoPor?: string;
  fechaRevision?: Timestamp;
  resolucion?: string;
  companiId: string;
  periodo: string;
  createdAt: Timestamp;
}

// ============================================
// ANALYTICS - KPIs DIARIOS
// ============================================
export interface AnalyticsKpi {
  id: string;                        // formato: {companiId}_{fecha}
  companiId: string;
  fecha: string;                     // YYYY-MM-DD
  periodo: string;                   // YYYY-MM

  // KPIs de ANF
  aguaProducida?: number;            // m3 (ingresado manualmente o por integracion)
  aguaFacturada: number;             // m3 (calculado de lecturas)
  anf: number;                       // porcentaje

  // KPIs de Lectura
  totalMedidores: number;
  medidoresLeidos: number;
  porcentajeLectura: number;
  lecturasConAnomalia: number;
  lecturasValidadas: number;

  // KPIs por zona (mapa)
  zonaKpis: {
    [zonaId: string]: {
      zonaNombre: string;
      totalMedidores: number;
      medidoresLeidos: number;
      consumoTotal: number;
      anomalias: number;
      anfEstimado?: number;
    };
  };

  // KPIs de Operarios
  operarioKpis: {
    [operarioId: string]: {
      nombre: string;
      lecturasRealizadas: number;
      anomaliasDetectadas: number;
      tiempoPromedio?: number;        // minutos por lectura
    };
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// ANALYTICS - SCORE DE RIESGO
// ============================================
export interface ScoreRiesgo {
  id: string;                        // medidorId
  medidorId: string;
  clienteId: string;
  zonaId: string;
  scoreFraude: number;               // 0-100
  scoreFuga: number;                 // 0-100
  scoreMedidorDeteriorado: number;   // 0-100
  scoreGeneral: number;              // 0-100 (ponderado)
  factores: string[];                // Factores que contribuyen al score
  recomendacion: 'ninguna' | 'monitorear' | 'inspeccion' | 'cambio_medidor' | 'corte';
  ultimaActualizacion: Timestamp;
  companiId: string;
}

// ============================================
// CONFIGURACION IA
// ============================================
export interface ConfiguracionIA {
  id: string;
  companiId: string;
  umbrales: {
    consumoAlto: number;             // porcentaje sobre promedio (default 200)
    consumoBajo: number;             // porcentaje bajo promedio (default 20)
    consumoCero: number;             // periodos consecutivos con 0 (default 2)
    variacionEstacional: number;     // porcentaje de variacion aceptable (default 30)
    scoreRiesgoAlto: number;         // umbral para alerta (default 70)
    scoreRiesgoCritico: number;      // umbral para accion (default 85)
  };
  pesos: {
    fraude: number;                  // peso en score general (default 0.4)
    fuga: number;                    // peso en score general (default 0.3)
    medidorDeteriorado: number;      // peso en score general (default 0.3)
  };
  alertas: {
    emailHabilitado: boolean;
    pushHabilitado: boolean;
    destinatarios: string[];         // userIds
    frecuencia: 'inmediata' | 'diaria' | 'semanal';
  };
  updatedAt: Timestamp;
  updatedBy: string;
}
```

### 1.3 Nuevos Enums (agregar en src/lib/types/enums.ts)

```typescript
export type TipoAnomaliaIAType = 'consumo_alto' | 'consumo_bajo' | 'consumo_cero' | 'retroceso' | 'patron_atipico' | 'variacion_estacional';
export type SeveridadAnomaliaType = 'baja' | 'media' | 'alta' | 'critica';
export type EstadoAnomaliaIAType = 'detectada' | 'en_revision' | 'confirmada' | 'descartada' | 'resuelta';
export type RecomendacionRiesgoType = 'ninguna' | 'monitorear' | 'inspeccion' | 'cambio_medidor' | 'corte';
```

### 1.4 Nuevo Servicio: analytics-service.ts

Crear `src/lib/services/analytics-service.ts` con las siguientes funciones:

```typescript
// Motor de deteccion de anomalias avanzado
analyzeReading(lectura: LecturaExtendida, historico: LecturaExtendida[]): AnalyticsAnomalia | null
  // - Calcular promedio movil de ultimos 6-12 periodos
  // - Detectar desviaciones usando z-score (> 2 desviaciones estandar)
  // - Clasificar tipo y severidad de anomalia
  // - Generar score de confiabilidad (0-100)
  // - Generar descripcion y recomendacion en espanol

// Calculo de scores de riesgo
calculateRiskScore(medidorId: string, historico: LecturaExtendida[], medidor: Medidor): ScoreRiesgo
  // - Score fraude: consumo vs esperado, patron cero, retrocesos
  // - Score fuga: consumo alto persistente, variacion abrupta
  // - Score medidor deteriorado: antiguedad, lecturas inconsistentes
  // - Score general ponderado segun configuracion

// Calcular KPIs diarios
calculateDailyKpis(companiId: string, fecha: string): Promise<AnalyticsKpi>
  // - Consultar lecturas del periodo
  // - Calcular ANF estimado por zona
  // - Agregar metricas de operarios
  // - Guardar en Firestore

// Obtener anomalias con filtros
getAnomalias(filters: {
  companiId: string;
  zonaId?: string;
  tipoAnomalia?: TipoAnomaliaIAType;
  severidad?: SeveridadAnomaliaType;
  estado?: EstadoAnomaliaIAType;
  periodo?: string;
  limit?: number;
}): Promise<{ data: AnalyticsAnomalia[]; total: number }>

// Actualizar estado de anomalia
updateAnomaliaEstado(id: string, estado: EstadoAnomaliaIAType, userId: string, resolucion?: string): Promise<void>

// Obtener KPIs
getKpis(companiId: string, periodo: string): Promise<AnalyticsKpi[]>
getLatestKpi(companiId: string): Promise<AnalyticsKpi | null>

// Obtener scores de riesgo
getScoresRiesgo(filters: {
  companiId: string;
  zonaId?: string;
  minScore?: number;
  limit?: number;
}): Promise<ScoreRiesgo[]>

// Batch: procesar todas las lecturas de un periodo
batchAnalyzeReadings(companiId: string, periodo: string): Promise<{
  totalAnalizadas: number;
  anomaliasDetectadas: number;
  scoresActualizados: number;
}>
```

### 1.5 Nuevo Hook: use-analytics.ts

Crear `src/lib/hooks/use-analytics.ts`:

```typescript
export function useAnalytics(companiId: string) {
  // Estado y funciones para acceder a analytics
  return {
    kpis, anomalias, scores, loading, error,
    refreshKpis, filterAnomalias, updateAnomalia
  };
}

export function useAnomaliasDashboard(companiId: string, periodo: string) {
  // Datos agregados para dashboard de anomalias
  return {
    resumen: { total, porTipo, porSeveridad, porEstado, porZona },
    tendencia: [],  // ultimos 30 dias
    loading
  };
}
```

### 1.6 Nuevas Paginas

#### 1.6.1 Dashboard Ejecutivo Mejorado
**Ruta**: `src/app/(dashboard)/page.tsx` (MODIFICAR el existente)

Reemplazar el dashboard actual con un dashboard ejecutivo que incluya:

**Fila 1 - KPIs principales** (4 cards glassmorphism):
- ANF actual (%) con indicador de tendencia vs periodo anterior
- Lecturas realizadas / total (barra de progreso circular)
- Anomalias detectadas (con badge de severidad)
- Score de riesgo promedio (con semaforo)

**Fila 2 - Graficos principales** (2 columnas):
- Columna izquierda: Grafico de linea "Tendencia ANF ultimos 12 meses" (recharts `LineChart`)
- Columna derecha: Grafico de barras "Anomalias por tipo" (recharts `BarChart`)

**Fila 3 - Tablas resumen** (2 columnas):
- Columna izquierda: "Top 10 zonas con mayor ANF" (tabla con semaforo de colores)
- Columna derecha: "Anomalias recientes que requieren atencion" (lista con badges)

**Fila 4 - Actividad** (ancho completo):
- Timeline de actividad reciente (lecturas, anomalias, resoluciones)

**Permisos**: Visible para root, administrador, supervisor. Operario y lector ven version simplificada.

**Instalar**: `npm install recharts` para graficos.

#### 1.6.2 Pagina de Anomalias IA
**Ruta**: `src/app/(dashboard)/anomalias/page.tsx` (NUEVA)

- Filtros: periodo, zona, tipo anomalia, severidad, estado
- DataTable con columnas: Fecha, Medidor, Cliente, Zona, Tipo, Severidad, Score, Estado, Acciones
- Acciones: Ver detalle, Confirmar, Descartar, Asignar inspeccion
- Estadisticas resumen en cards superiores (total, confirmadas, descartadas, tasa precision)

#### 1.6.3 Detalle de Anomalia
**Ruta**: `src/app/(dashboard)/anomalias/[id]/page.tsx` (NUEVA)

- Informacion completa de la anomalia
- Historico de consumo del medidor (grafico linea)
- Datos del cliente y medidor
- Acciones: cambiar estado, agregar resolucion
- Mapa con ubicacion del medidor

#### 1.6.4 Configuracion IA
**Ruta**: `src/app/(dashboard)/configuracion/ia/page.tsx` (NUEVA)

- Formulario para editar umbrales de deteccion
- Configuracion de pesos para score de riesgo
- Configuracion de alertas (email, push, destinatarios)
- Boton para ejecutar analisis batch manualmente
- Solo accesible por root y administrador

### 1.7 Actualizacion de Navegacion

Agregar en `src/lib/constants.ts` despues de "Incidencias":

```typescript
{
  label: 'Anomalias IA',
  href: '/anomalias',
  icon: Brain,                      // de lucide-react
  roles: ['root', 'administrador', 'supervisor'],
},
```

### 1.8 Agregar en Breadcrumb

Agregar en `src/components/layout/breadcrumb.tsx` en `routeLabels`:
```typescript
anomalias: 'Anomalias IA',
ia: 'Configuracion IA',
```

---

## FASE 2: PREDICCION DE CONSUMO Y SCORING

### Objetivo
Implementar modelo predictivo de consumo y sistema de scoring de riesgo por conexion.

### 2.1 Nuevas Interfaces (agregar en entities.ts)

```typescript
// ============================================
// ANALYTICS - PREDICCION DE CONSUMO
// ============================================
export interface PrediccionConsumo {
  id: string;                        // {medidorId}_{periodo}
  medidorId: string;
  clienteId: string;
  zonaId: string;
  periodo: string;                   // YYYY-MM (mes predicho)
  consumoPredicho: number;           // m3
  consumoReal?: number;              // m3 (se llena cuando se tiene la lectura real)
  rangoMinimo: number;               // intervalo de confianza inferior
  rangoMaximo: number;               // intervalo de confianza superior
  confianza: number;                 // 0-100 (precision estimada)
  metodo: 'promedio_movil' | 'tendencia_lineal' | 'estacional' | 'mixto';
  factores: {
    promedioHistorico: number;
    tendencia: number;               // pendiente mensual
    factorEstacional: number;        // multiplicador estacional
    factorZona: number;              // ajuste por zona
  };
  desviacionReal?: number;           // porcentaje de error (se llena despues)
  companiId: string;
  createdAt: Timestamp;
}
```

### 2.2 Nuevo Servicio: prediction-service.ts

Crear `src/lib/services/prediction-service.ts`:

```typescript
// Predecir consumo para un medidor
predictConsumo(medidorId: string, historico: LecturaExtendida[], periodo: string): PrediccionConsumo
  // Algoritmo:
  // 1. Calcular promedio movil ponderado de ultimos 12 meses
  // 2. Calcular tendencia lineal (regresion simple)
  // 3. Detectar estacionalidad (comparar con mismo mes del anio anterior)
  // 4. Combinar factores con pesos segun disponibilidad de datos
  // 5. Calcular intervalo de confianza
  // NOTA: Implementar toda la logica en TypeScript, sin dependencias ML externas

// Predecir consumo por zona
predictConsumoZona(zonaId: string, periodo: string): Promise<{
  consumoTotal: number;
  prediccionesPorMedidor: PrediccionConsumo[];
  confianzaPromedio: number;
}>

// Evaluar precision del modelo
evaluarPrecision(companiId: string, periodo: string): Promise<{
  maePromedio: number;              // Mean Absolute Error
  precisionGlobal: number;          // porcentaje de predicciones dentro del rango
  precisionPorZona: { [zonaId: string]: number };
}>

// Batch: generar predicciones para todos los medidores
batchPredict(companiId: string, periodoTarget: string): Promise<{
  prediccionesGeneradas: number;
  consumoTotalPredicho: number;
}>

// Obtener predicciones
getPredicciones(filters: {
  companiId: string;
  periodo: string;
  zonaId?: string;
  medidorId?: string;
}): Promise<PrediccionConsumo[]>
```

### 2.3 Nuevas Paginas

#### 2.3.1 Dashboard de Prediccion
**Ruta**: `src/app/(dashboard)/predicciones/page.tsx` (NUEVA)

**Contenido**:
- **Card principal**: Consumo predicho total vs meta de facturacion (gauge chart)
- **Grafico**: Prediccion vs Real ultimos 6 meses (area chart con bandas de confianza)
- **Tabla**: Predicciones por zona con precision del modelo
- **Alerta**: Zonas con desviacion significativa (>15%)
- **Segmentacion**: Prediccion por tipo de cliente (domestico, comercial, industrial, estatal)
- **Filtros**: Periodo, zona, tipo de cliente

#### 2.3.2 Score de Riesgo
**Ruta**: `src/app/(dashboard)/riesgos/page.tsx` (NUEVA)

**Contenido**:
- **Resumen**: Cards con distribucion de riesgo (bajo, medio, alto, critico)
- **Tabla**: Top conexiones de mayor riesgo con desglose de scores
- **Filtros**: Zona, tipo de riesgo (fraude, fuga, medidor), rango de score
- **Acciones**: Generar orden de inspeccion, marcar como revisado

#### 2.3.3 Detalle de Riesgo por Conexion
**Ruta**: `src/app/(dashboard)/riesgos/[medidorId]/page.tsx` (NUEVA)

- Desglose visual del score (grafico radar con 3 ejes: fraude, fuga, medidor)
- Factores que contribuyen al score
- Historico de consumo con anomalias marcadas
- Datos del cliente y medidor
- Acciones recomendadas

### 2.4 Actualizacion de Navegacion

Agregar en `src/lib/constants.ts`:
```typescript
{
  label: 'Predicciones',
  href: '/predicciones',
  icon: TrendingUp,                  // de lucide-react
  roles: ['root', 'administrador', 'supervisor'],
},
{
  label: 'Riesgos',
  href: '/riesgos',
  icon: ShieldAlert,                 // de lucide-react
  roles: ['root', 'administrador', 'supervisor'],
},
```

---

## FASE 3: DASHBOARDS AVANZADOS Y VISUALIZACION

### Objetivo
Crear dashboards ejecutivos avanzados con graficos interactivos, mapa de calor y simulador de escenarios.

### 3.1 Instalar Dependencias
```bash
npm install recharts
# recharts es la unica dependencia necesaria para graficos
```

### 3.2 Componentes de Graficos Reutilizables

Crear `src/components/charts/` con los siguientes componentes (todos con Liquid Glass styling):

```
src/components/charts/
  kpi-card.tsx              # Card glassmorphism para KPI con tendencia
  line-chart-glass.tsx      # LineChart con estilo glass
  bar-chart-glass.tsx       # BarChart con estilo glass
  area-chart-glass.tsx      # AreaChart con bandas de confianza
  pie-chart-glass.tsx       # PieChart/DonutChart
  gauge-chart.tsx           # Gauge/medidor semicircular
  radar-chart-glass.tsx     # RadarChart para scores
  heatmap-table.tsx         # Tabla con colores de calor (sin mapa geografico)
  trend-indicator.tsx       # Indicador de tendencia (flecha arriba/abajo + %)
  semaforo.tsx              # Semaforo rojo/amarillo/verde
  stat-comparison.tsx       # Comparador de estadisticas (actual vs anterior)
```

Cada componente debe:
- Usar `backdrop-filter: blur(20px)` y fondos semi-transparentes
- Respetar las CSS variables del tema claro/oscuro
- Ser responsive (adaptar tamano en mobile)
- Usar colores del tema: `var(--accent)`, `var(--success)`, `var(--warning)`, `var(--error)`

### 3.3 Nuevas Paginas de Dashboard

#### 3.3.1 Panel de Control de Perdidas (ANF)
**Ruta**: `src/app/(dashboard)/dashboard-anf/page.tsx` (NUEVA)

**Layout** (responsive grid):
```
Desktop (lg):
[KPI ANF] [KPI Produccion] [KPI Facturacion] [KPI Recuperable]
[---------- Tendencia ANF 12 meses (LineChart) ----------]
[-- Top 10 Zonas ANF (HeatmapTable) --] [-- Mejora/Deterioro --]
[------------ Simulador de Escenarios ------------------]

Mobile (sm):
[KPI ANF]
[KPI Produccion]
[KPI Facturacion]
[KPI Recuperable]
[Tendencia ANF]
[Top 10 Zonas]
[Simulador]
```

**Simulador de Escenarios**: Un slider que permita ajustar el ANF objetivo (35%-50%) y muestre:
- Volumen recuperable en m3
- Ingreso adicional estimado en S/
- Comparativa con escenario actual

#### 3.3.2 Panel de Eficiencia Operativa
**Ruta**: `src/app/(dashboard)/dashboard-operativo/page.tsx` (NUEVA)

- Lecturas realizadas vs programadas (gauge)
- Ranking de operarios por productividad (bar chart horizontal)
- Lecturas pendientes/fallidas por zona (heatmap table)
- Tiempo promedio por lectura y por ruta (line chart)
- ROI operativo estimado

#### 3.3.3 Panel de Alta Direccion
**Ruta**: `src/app/(dashboard)/dashboard-ejecutivo/page.tsx` (NUEVA)

- Semaforo de indicadores clave (ANF, cobertura, continuidad, presion)
- Tendencias de 12 meses en indicadores SUNASS
- Alertas criticas que requieren decision
- Proyeccion financiera (facturacion y cobranza)
- Comparativa entre localidades (benchmarking interno)
- **Solo accesible por**: root, administrador

### 3.4 Actualizacion de Navegacion

Reemplazar el item "Dashboards" actual por un submenu o agregar items:
```typescript
{
  label: 'Panel ANF',
  href: '/dashboard-anf',
  icon: Droplets,                    // de lucide-react
  roles: ['root', 'administrador', 'supervisor'],
},
{
  label: 'Panel Operativo',
  href: '/dashboard-operativo',
  icon: Activity,                    // de lucide-react
  roles: ['root', 'administrador', 'supervisor'],
},
{
  label: 'Panel Ejecutivo',
  href: '/dashboard-ejecutivo',
  icon: Crown,                       // de lucide-react
  roles: ['root', 'administrador'],
},
```

---

## FASE 4: PERFIL 360 DEL CLIENTE Y REPORTES AVANZADOS

### Objetivo
Implementar vista unificada del cliente con todo su historial, y reportes avanzados con IA.

### 4.1 Perfil 360 del Cliente

**Modificar**: `src/app/(dashboard)/clientes/[id]/page.tsx`

Transformar la pagina de detalle actual en un perfil completo 360:

**Tab 1 - Informacion General** (existente, mejorar):
- Datos personales, direccion, contacto
- Mapa con ubicacion

**Tab 2 - Consumo** (NUEVO):
- Grafico de linea: historico de consumo ultimos 24 meses
- Consumo actual vs prediccion (con banda de confianza)
- Promedio mensual, maximo, minimo
- Tendencia (creciente, decreciente, estable)

**Tab 3 - Medidores** (NUEVO):
- Lista de medidores del cliente
- Estado de cada medidor
- Score de riesgo por medidor (radar chart)
- Fecha de instalacion y antiguedad

**Tab 4 - Anomalias** (NUEVO):
- Historial de anomalias detectadas
- Estado de resolucion
- Grafico: anomalias por mes

**Tab 5 - Lecturas** (NUEVO):
- Ultimas 24 lecturas con detalles
- Fotos de medidor (si existen)
- Operario que realizo la lectura

**Tab 6 - Score de Riesgo** (NUEVO):
- Score actual desglosado (radar chart)
- Factores que contribuyen
- Historico de score
- Recomendaciones automaticas

**Implementar como tabs navegables** usando botones con estilo glass.

### 4.2 Nuevos Reportes (agregar en report-service.ts)

Agregar funciones al servicio existente:

```typescript
// Reporte de ANF por zona con drill-down
generateReporteANF(companiId: string, periodo: string): Promise<jsPDF>

// Reporte de Anomalias con clasificacion y recomendaciones
generateReporteAnomalias(companiId: string, periodo: string, zonaId?: string): Promise<jsPDF>

// Reporte de Prediccion vs Real
generateReportePrediccion(companiId: string, periodo: string): Promise<jsPDF>

// Reporte de Eficiencia de Micromedicion
generateReporteEficiencia(companiId: string, periodo: string): Promise<jsPDF>

// Reporte de Medidores candidatos a renovacion
generateReporteMedidoresRenovacion(companiId: string): Promise<jsPDF>

// Reporte de Score de Riesgo por zona
generateReporteRiesgos(companiId: string, zonaId?: string): Promise<jsPDF>
```

### 4.3 Actualizar Pagina de Reportes

**Modificar**: `src/app/(dashboard)/reportes/page.tsx`

Agregar seccion "Reportes con IA" con cards para cada nuevo reporte:
- Cada card muestra icono, titulo, descripcion breve
- Boton para generar (con loading state)
- Filtros de periodo y zona donde aplique

---

## FASE 5: OPTIMIZACION DE RUTAS Y AUTOMATIZACION

### Objetivo
Implementar optimizacion inteligente de rutas de lectura y automatizacion de procesos.

### 5.1 Nuevo Servicio: route-optimization-service.ts

Crear `src/lib/services/route-optimization-service.ts`:

```typescript
// Optimizar orden de lectura en una ruta (TSP simplificado - nearest neighbor)
optimizeRoute(rutaId: string): Promise<{
  ordenOriginal: string[];           // medidorIds en orden original
  ordenOptimizado: string[];         // medidorIds en orden optimizado
  distanciaOriginal: number;         // km estimados
  distanciaOptimizada: number;       // km estimados
  ahorroPorcentaje: number;
}>
  // Algoritmo: Nearest Neighbor heuristic usando coordenadas lat/lng de medidores
  // Calcular distancia haversine entre puntos
  // No requiere APIs externas

// Sugerir reasignacion de operarios
suggestReassignment(companiId: string, periodo: string): Promise<{
  sugerencias: Array<{
    operarioId: string;
    operarioNombre: string;
    rutaActualId: string;
    rutaSugeridaId: string;
    razon: string;
    impactoEstimado: string;
  }>;
}>

// Estimar tiempo de ruta
estimateRouteTime(rutaId: string): Promise<{
  tiempoEstimado: number;           // minutos
  lecturasEstimadas: number;
  dificultadPromedio: number;        // 1-5
}>

// Priorizar zonas por criticidad
prioritizeZones(companiId: string): Promise<Array<{
  zonaId: string;
  zonaNombre: string;
  prioridad: number;                 // 1-10
  factores: string[];
  anfEstimado: number;
}>>
```

### 5.2 Nuevas Paginas

#### 5.2.1 Optimizacion de Rutas
**Ruta**: `src/app/(dashboard)/rutas/optimizar/page.tsx` (NUEVA)

- Selector de ruta
- Visualizacion: orden actual vs orden optimizado (tabla comparativa)
- Metricas: distancia ahorrada, tiempo estimado
- Boton "Aplicar optimizacion" (actualiza el orden en Firestore)
- Tabla de priorizacion de zonas

#### 5.2.2 Asignacion Inteligente
**Ruta**: `src/app/(dashboard)/asignaciones/sugerencias/page.tsx` (NUEVA)

- Lista de sugerencias de reasignacion
- Razon y impacto estimado de cada sugerencia
- Acciones: Aceptar sugerencia, Descartar, Aplicar todas

### 5.3 Actualizacion de Navegacion

Agregar sub-items o items nuevos:
```typescript
{
  label: 'Optimizar Rutas',
  href: '/rutas/optimizar',
  icon: Navigation,                  // de lucide-react
  roles: ['root', 'administrador', 'supervisor'],
},
```

---

## RESUMEN DE ARCHIVOS A CREAR/MODIFICAR

### Archivos NUEVOS a crear:

```
src/lib/services/analytics-service.ts
src/lib/services/prediction-service.ts
src/lib/services/route-optimization-service.ts
src/lib/hooks/use-analytics.ts

src/components/charts/kpi-card.tsx
src/components/charts/line-chart-glass.tsx
src/components/charts/bar-chart-glass.tsx
src/components/charts/area-chart-glass.tsx
src/components/charts/pie-chart-glass.tsx
src/components/charts/gauge-chart.tsx
src/components/charts/radar-chart-glass.tsx
src/components/charts/heatmap-table.tsx
src/components/charts/trend-indicator.tsx
src/components/charts/semaforo.tsx
src/components/charts/stat-comparison.tsx

src/app/(dashboard)/anomalias/page.tsx
src/app/(dashboard)/anomalias/[id]/page.tsx
src/app/(dashboard)/predicciones/page.tsx
src/app/(dashboard)/riesgos/page.tsx
src/app/(dashboard)/riesgos/[medidorId]/page.tsx
src/app/(dashboard)/dashboard-anf/page.tsx
src/app/(dashboard)/dashboard-operativo/page.tsx
src/app/(dashboard)/dashboard-ejecutivo/page.tsx
src/app/(dashboard)/configuracion/ia/page.tsx
src/app/(dashboard)/rutas/optimizar/page.tsx
src/app/(dashboard)/asignaciones/sugerencias/page.tsx
```

### Archivos EXISTENTES a modificar:

```
src/lib/firebase/collections.ts      # Agregar colecciones analytics
src/lib/types/entities.ts            # Agregar interfaces de analytics
src/lib/types/enums.ts               # Agregar enums de IA
src/lib/constants.ts                 # Agregar items de navegacion
src/lib/services/report-service.ts   # Agregar reportes con IA
src/components/layout/breadcrumb.tsx  # Agregar labels de nuevas rutas
src/app/(dashboard)/page.tsx         # Reemplazar dashboard con version ejecutiva
src/app/(dashboard)/clientes/[id]/page.tsx  # Transformar en Perfil 360
src/app/(dashboard)/reportes/page.tsx       # Agregar seccion reportes IA
```

### Dependencias a instalar:

```bash
npm install recharts
```

---

## PATRONES DE CODIGO A SEGUIR

### Patron de Pagina (ejemplo)
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import Breadcrumb from '@/components/layout/breadcrumb';

export default function NombrePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TipoData[]>([]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await serviceFn(user!.companiId);
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <Breadcrumb />
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6">
        Titulo de la Pagina
      </h1>
      {/* Contenido con glass-card classes */}
      <div className="glass-card p-4 sm:p-6">
        {/* ... */}
      </div>
    </div>
  );
}
```

### Patron de Servicio (ejemplo)
```typescript
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function getItems(filters: Filters): Promise<Item[]> {
  const constraints = [where('companiId', '==', filters.companiId)];
  if (filters.zonaId) constraints.push(where('zonaId', '==', filters.zonaId));
  constraints.push(orderBy('createdAt', 'desc'));
  if (filters.limit) constraints.push(limit(filters.limit));

  const q = query(collection(db, 'coleccion'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));
}
```

### Patron de Componente Glass Card
```typescript
<div className="glass-card rounded-2xl p-4 sm:p-6 border border-[var(--glass-border)]">
  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Titulo</h3>
  <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Valor</p>
  <span className="text-xs text-[var(--success)]">+2.5% vs anterior</span>
</div>
```

### Patron de Grid Responsive
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  {/* Cards */}
</div>
```

---

## ORDEN DE EJECUCION

Implementar en este orden estricto:

1. **Fase 1** - Empezar por: types/enums -> collections -> analytics-service -> use-analytics -> componentes charts -> paginas dashboard y anomalias
2. **Fase 2** - prediction-service -> paginas de prediccion y riesgo
3. **Fase 3** - componentes charts adicionales -> dashboard-anf, dashboard-operativo, dashboard-ejecutivo
4. **Fase 4** - perfil 360 del cliente -> reportes avanzados
5. **Fase 5** - route-optimization-service -> paginas de optimizacion

**Despues de cada fase**: verificar que el proyecto compila sin errores (`npm run build`) y que las paginas son accesibles y funcionales.

---

## DATOS DE PRUEBA

Si no hay datos reales suficientes en Firestore, generar datos de prueba realistas para demostrar las funcionalidades:
- Usar los nombres de localidades reales de SEDALIB (Trujillo, Victor Larco, La Esperanza, etc.)
- Usar rangos de consumo realistas (10-30 m3/mes para domesticos, 50-200 para comerciales)
- Generar historico de al menos 12 meses para poder calcular tendencias
- Los datos de prueba deben cargarse mediante un script separado o seed function, NO hardcodeados en los componentes

---

*Documento generado el 2 de abril de 2026*
*Para uso con Claude Code, Cursor, o cualquier asistente de IA*
*Proyecto: Vertiente Reader Web - PCC / Vertiente Labs*
