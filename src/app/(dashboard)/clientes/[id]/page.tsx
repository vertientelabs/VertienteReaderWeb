'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { query, where, orderBy, limit, getDocs, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  ArrowLeft,
  Pencil,
  MapPin,
  User,
  FileText,
  Gauge,
  BarChart3,
  AlertTriangle,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import GlassLineChart from '@/components/charts/line-chart-glass';
import GlassRadarChart from '@/components/charts/radar-chart-glass';
import KpiCard from '@/components/charts/kpi-card';
import { getClienteById } from '@/lib/services/client-service';
import { resolveUbigeoNames } from '@/lib/hooks/use-ubigeo';
import type { Cliente, Medidor, LecturaExtendida, AnalyticsAnomalia, ScoreRiesgo } from '@/lib/types';

const estadoVariant: Record<string, 'success' | 'default' | 'danger'> = {
  activo: 'success',
  inactivo: 'default',
  suspendido: 'danger',
};

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{label}</span>
      <span className="text-sm text-[var(--text-primary)]">{value || '\u2014'}</span>
    </div>
  );
}

const tabs = [
  { id: 'general', label: 'General', icon: User },
  { id: 'consumo', label: 'Consumo', icon: BarChart3 },
  { id: 'medidores', label: 'Medidores', icon: Gauge },
  { id: 'anomalias', label: 'Anomalias', icon: AlertTriangle },
  { id: 'lecturas', label: 'Lecturas', icon: BookOpen },
  { id: 'riesgo', label: 'Riesgo', icon: ShieldAlert },
];

export default function ClienteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ubigeoNames, setUbigeoNames] = useState({ departamento: '\u2014', provincia: '\u2014', distrito: '\u2014' });
  const [zonaNombre, setZonaNombre] = useState('\u2014');
  const [activeTab, setActiveTab] = useState('general');
  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [lecturas, setLecturas] = useState<LecturaExtendida[]>([]);
  const [anomalias, setAnomalias] = useState<AnalyticsAnomalia[]>([]);
  const [scores, setScores] = useState<ScoreRiesgo[]>([]);
  const [consumoData, setConsumoData] = useState<{ name: string; consumo: number }[]>([]);

  useEffect(() => {
    async function fetchCliente() {
      try {
        const data = await getClienteById(id);
        if (!data) { setError('Cliente no encontrado'); return; }
        setCliente(data);
        const names = await resolveUbigeoNames(data.departamentoId, data.provinciaId, data.distritoId);
        setUbigeoNames(names);
        if (data.zonaId) {
          try {
            const zonaSnap = await getDoc(doc(db, 'zonas', data.zonaId));
            if (zonaSnap.exists()) setZonaNombre(zonaSnap.data().nombre || data.zonaId);
          } catch { setZonaNombre(data.zonaId); }
        }

        // Load related data
        const [medSnap, lectSnap, anomSnap] = await Promise.all([
          getDocs(query(collection(db, 'medidores'), where('clienteId', '==', id))),
          getDocs(query(collection(db, 'lecturas'), where('clienteId', '==', id), orderBy('fechaHora', 'desc'), limit(24))),
          getDocs(query(collection(db, 'analytics_anomalias'), where('clienteId', '==', id), orderBy('createdAt', 'desc'), limit(20))),
        ]);

        const meds = medSnap.docs.map(d => ({ id: d.id, ...d.data() } as Medidor));
        setMedidores(meds);
        const lects = lectSnap.docs.map(d => ({ id: d.id, ...d.data() } as LecturaExtendida));
        setLecturas(lects);
        setAnomalias(anomSnap.docs.map(d => ({ id: d.id, ...d.data() } as AnalyticsAnomalia)));

        // Load risk scores for medidores
        const scorePromises = meds.map(async (m) => {
          const scoreDoc = await getDoc(doc(db, 'analytics_scores_riesgo', m.id));
          return scoreDoc.exists() ? { id: scoreDoc.id, ...scoreDoc.data() } as ScoreRiesgo : null;
        });
        const scoreResults = await Promise.all(scorePromises);
        setScores(scoreResults.filter(Boolean) as ScoreRiesgo[]);

        // Build consumo chart data
        const consumoMap = new Map<string, number>();
        for (const l of lects) {
          const date = l.fechaHora?.toDate?.();
          if (date) {
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            consumoMap.set(key, (consumoMap.get(key) || 0) + (l.consumo ?? 0));
          }
        }
        const sorted = Array.from(consumoMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        setConsumoData(sorted.map(([k, v]) => ({
          name: k.split('-')[1] + '/' + k.split('-')[0].slice(2),
          consumo: Math.round(v * 100) / 100,
        })));
      } catch (err) {
        console.error('Error fetching cliente:', err);
        setError('Error al cargar el cliente');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCliente();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-white/20 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div className="space-y-6">
        <Link href="/clientes">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>Volver</GlassButton>
        </Link>
        <GlassCard hover={false}>
          <p className="text-center py-16 text-[var(--text-tertiary)]">{error || 'Cliente no encontrado'}</p>
        </GlassCard>
      </div>
    );
  }

  const consumoPromedio = consumoData.length > 0
    ? consumoData.reduce((s, d) => s + d.consumo, 0) / consumoData.length
    : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores.map(s => s.scoreGeneral)) : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/clientes">
            <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>Volver</GlassButton>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{cliente.nombreCompleto}</h1>
              <GlassChip label={cliente.estado} variant={estadoVariant[cliente.estado] ?? 'default'} />
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{cliente.tipoDocumento}: {cliente.numeroDocumento} | Perfil 360</p>
          </div>
        </div>
        <Link href={`/clientes/${cliente.id}/editar`}>
          <GlassButton variant="secondary" size="sm" icon={<Pencil className="h-4 w-4" />}>Editar</GlassButton>
        </Link>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Consumo Prom." value={`${consumoPromedio.toFixed(1)} m3`} icon={BarChart3} color="from-[#0A84FF] to-[#64D2FF]" />
        <KpiCard title="Medidores" value={medidores.length} icon={Gauge} color="from-[#30D158] to-[#64D2FF]" />
        <KpiCard title="Anomalias" value={anomalias.length} icon={AlertTriangle} color="from-[#FF9F0A] to-[#FFD60A]" />
        <KpiCard title="Riesgo Max" value={maxScore} icon={ShieldAlert} color="from-[#FF453A] to-[#FF9F0A]" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[var(--accent)] text-white shadow-lg'
                  : 'bg-white/40 dark:bg-white/5 text-[var(--text-secondary)] hover:bg-white/60 dark:hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-[#0A84FF]" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Datos Personales</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailRow label="Nombre Completo" value={cliente.nombreCompleto} />
              <DetailRow label="Tipo de Documento" value={cliente.tipoDocumento} />
              <DetailRow label="Numero de Documento" value={cliente.numeroDocumento} />
              <DetailRow label="Telefono" value={cliente.telefono} />
              <DetailRow label="Email" value={cliente.email} />
              <DetailRow label="Estado" value={cliente.estado} />
            </div>
          </GlassCard>
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-[#30D158]" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Ubicacion</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailRow label="Direccion" value={cliente.direccion} />
              <DetailRow label="Referencia" value={cliente.referencia} />
              <DetailRow label="Zona" value={zonaNombre} />
              <DetailRow label="Departamento" value={ubigeoNames.departamento} />
              <DetailRow label="Provincia" value={ubigeoNames.provincia} />
              <DetailRow label="Distrito" value={ubigeoNames.distrito} />
            </div>
          </GlassCard>
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-[#BF5AF2]" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Registro</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailRow label="ID" value={cliente.id} />
              <DetailRow label="Creado por" value={cliente.createdBy} />
              <DetailRow label="Fecha de Creacion" value={cliente.createdAt?.toDate?.()?.toLocaleDateString('es-PE') ?? '\u2014'} />
              <DetailRow label="Ultima Actualizacion" value={cliente.updatedAt?.toDate?.()?.toLocaleDateString('es-PE') ?? '\u2014'} />
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'consumo' && (
        <GlassCard hover={false}>
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">Historico de Consumo</h3>
          <p className="text-xs text-[var(--text-tertiary)] mb-4">Ultimos {consumoData.length} periodos</p>
          {consumoData.length > 0 ? (
            <>
              <GlassLineChart
                data={consumoData}
                lines={[{ dataKey: 'consumo', color: '#0A84FF', label: 'Consumo (m3)' }]}
                height={280}
              />
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Promedio</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{consumoPromedio.toFixed(1)} m3</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Maximo</p>
                  <p className="text-lg font-bold text-[#FF453A]">{Math.max(...consumoData.map(d => d.consumo)).toFixed(1)} m3</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Minimo</p>
                  <p className="text-lg font-bold text-[#30D158]">{Math.min(...consumoData.map(d => d.consumo)).toFixed(1)} m3</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center py-8 text-sm text-[var(--text-tertiary)]">Sin datos de consumo disponibles</p>
          )}
        </GlassCard>
      )}

      {activeTab === 'medidores' && (
        <GlassCard hover={false} padding="none">
          <div className="p-4 border-b border-black/5 dark:border-white/5">
            <h3 className="font-semibold text-[var(--text-primary)]">Medidores del Cliente</h3>
          </div>
          {medidores.length === 0 ? (
            <p className="text-center py-8 text-sm text-[var(--text-tertiary)]">Sin medidores registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5">
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Numero</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Tipo</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Marca</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Estado</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Ult. Lectura</th>
                  </tr>
                </thead>
                <tbody>
                  {medidores.map((m) => (
                    <tr key={m.id} className="border-b border-black/5 dark:border-white/5">
                      <td className="p-3 text-sm font-mono text-[var(--text-primary)]">
                        <Link href={`/medidores/${m.id}`} className="hover:text-[var(--accent)]">{m.numeroMedidor}</Link>
                      </td>
                      <td className="p-3 text-sm text-[var(--text-secondary)]">{m.tipo}</td>
                      <td className="p-3 text-sm text-[var(--text-secondary)]">{m.marca || '-'}</td>
                      <td className="p-3"><GlassChip label={m.estado} variant={m.estado === 'activo' ? 'success' : 'warning'} /></td>
                      <td className="p-3 text-sm text-[var(--text-primary)]">{m.lecturaActual ?? m.lecturaAnterior ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {activeTab === 'anomalias' && (
        <GlassCard hover={false} padding="none">
          <div className="p-4 border-b border-black/5 dark:border-white/5">
            <h3 className="font-semibold text-[var(--text-primary)]">Historial de Anomalias</h3>
          </div>
          {anomalias.length === 0 ? (
            <p className="text-center py-8 text-sm text-[var(--text-tertiary)]">Sin anomalias detectadas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5">
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Fecha</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Tipo</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Severidad</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Estado</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalias.map((a) => (
                    <tr key={a.id} className="border-b border-black/5 dark:border-white/5">
                      <td className="p-3 text-sm text-[var(--text-primary)]">{a.createdAt?.toDate?.().toLocaleDateString('es-PE') ?? '-'}</td>
                      <td className="p-3"><GlassChip label={a.tipoAnomalia.replace('_', ' ')} variant="primary" /></td>
                      <td className="p-3"><GlassChip label={a.severidad} variant={a.severidad === 'critica' ? 'danger' : a.severidad === 'alta' ? 'warning' : 'default'} /></td>
                      <td className="p-3"><GlassChip label={a.estado} variant={a.estado === 'confirmada' ? 'success' : 'default'} /></td>
                      <td className="p-3 text-sm font-bold text-[var(--text-primary)]">{a.scoreConfiabilidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {activeTab === 'lecturas' && (
        <GlassCard hover={false} padding="none">
          <div className="p-4 border-b border-black/5 dark:border-white/5">
            <h3 className="font-semibold text-[var(--text-primary)]">Ultimas Lecturas</h3>
          </div>
          {lecturas.length === 0 ? (
            <p className="text-center py-8 text-sm text-[var(--text-tertiary)]">Sin lecturas registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5">
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Fecha</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Valor</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Consumo</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Tipo</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Validacion</th>
                  </tr>
                </thead>
                <tbody>
                  {lecturas.map((l) => (
                    <tr key={l.id} className="border-b border-black/5 dark:border-white/5">
                      <td className="p-3 text-sm text-[var(--text-primary)]">{l.fechaHora?.toDate?.().toLocaleDateString('es-PE') ?? '-'}</td>
                      <td className="p-3 text-sm font-mono text-[var(--text-primary)]">{l.valorLectura}</td>
                      <td className="p-3 text-sm font-bold text-[var(--text-primary)]">{l.consumo?.toFixed(1) ?? '-'} m3</td>
                      <td className="p-3"><GlassChip label={l.tipoLectura || 'normal'} variant="default" /></td>
                      <td className="p-3"><GlassChip label={l.estadoValidacion || 'pendiente'} variant={l.estadoValidacion === 'validada' ? 'success' : 'default'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {activeTab === 'riesgo' && (
        <div className="space-y-4">
          {scores.length === 0 ? (
            <GlassCard hover={false}>
              <p className="text-center py-8 text-sm text-[var(--text-tertiary)]">
                Sin scores de riesgo. Ejecute el analisis batch desde Configuracion IA.
              </p>
            </GlassCard>
          ) : (
            scores.map((s) => (
              <GlassCard key={s.id} hover={false}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                      Medidor: {medidores.find(m => m.id === s.medidorId)?.numeroMedidor || s.medidorId.slice(0, 10)}
                    </h3>
                    <GlassRadarChart
                      data={[
                        { subject: 'Fraude', value: s.scoreFraude },
                        { subject: 'Fuga', value: s.scoreFuga },
                        { subject: 'Medidor', value: s.scoreMedidorDeteriorado },
                      ]}
                      height={220}
                      color={s.scoreGeneral >= 70 ? '#FF453A' : '#0A84FF'}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] text-center">
                        <p className="text-xs text-[var(--text-tertiary)]">General</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{s.scoreGeneral}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] text-center">
                        <p className="text-xs text-[var(--text-tertiary)]">Recomendacion</p>
                        <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">{s.recomendacion}</p>
                      </div>
                    </div>
                    {s.factores.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-[var(--text-tertiary)] mb-2">Factores</p>
                        {s.factores.map((f, i) => (
                          <div key={i} className="flex items-start gap-2 py-1">
                            <AlertTriangle className="h-3.5 w-3.5 text-[#FF9F0A] mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-[var(--text-secondary)]">{f}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Link href={`/riesgos/${s.medidorId}`}>
                      <GlassButton variant="secondary" size="sm" className="w-full mt-2">
                        Ver detalle completo
                      </GlassButton>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}
