'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
  Activity,
} from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GlassChip from '@/components/ui/glass-chip';
import { GlassAreaChart } from '@/components/charts/consumption-chart';
import { useAuth } from '@/lib/hooks/use-auth';

const dailyData = [
  { name: '01', value: 85 }, { name: '02', value: 120 }, { name: '03', value: 95 },
  { name: '04', value: 145 }, { name: '05', value: 160 }, { name: '06', value: 110 },
  { name: '07', value: 90 }, { name: '08', value: 175 }, { name: '09', value: 200 },
  { name: '10', value: 155 }, { name: '11', value: 180 }, { name: '12', value: 210 },
  { name: '13', value: 190 }, { name: '14', value: 165 }, { name: '15', value: 220 },
];

const kpis = [
  {
    title: 'Lecturas del Periodo',
    value: '2,847',
    subtitle: '+124 hoy',
    icon: BookOpen,
    color: 'from-[#0A84FF] to-[#64D2FF]',
    trend: '+12.5%',
    trendUp: true,
  },
  {
    title: 'Pendientes',
    value: '1,153',
    subtitle: 'de 4,000 medidores',
    icon: Clock,
    color: 'from-[#FF9F0A] to-[#FFD60A]',
    trend: '-8.3%',
    trendUp: true,
  },
  {
    title: 'Completadas',
    value: '71.2%',
    subtitle: 'Avance global',
    icon: CheckCircle2,
    color: 'from-[#30D158] to-[#64D2FF]',
    trend: '+5.2%',
    trendUp: true,
  },
  {
    title: 'Anomalías',
    value: '23',
    subtitle: 'Detectadas este periodo',
    icon: AlertTriangle,
    color: 'from-[#FF453A] to-[#FF9F0A]',
    trend: '+3',
    trendUp: false,
  },
  {
    title: 'Operarios Activos',
    value: '12',
    subtitle: 'En campo ahora',
    icon: Users,
    color: 'from-[#BF5AF2] to-[#0A84FF]',
    trend: '',
    trendUp: true,
  },
  {
    title: 'Consumo Promedio',
    value: '18.4 m³',
    subtitle: 'Este periodo',
    icon: TrendingUp,
    color: 'from-[#30D158] to-[#BF5AF2]',
    trend: '+2.1%',
    trendUp: true,
  },
];

const recentActivity = [
  { action: 'Lectura registrada', detail: 'Med. 00234 - Zona Norte A', time: 'Hace 2 min', type: 'success' as const },
  { action: 'Anomalía detectada', detail: 'Consumo alto - Cliente #1082', time: 'Hace 15 min', type: 'danger' as const },
  { action: 'Ruta completada', detail: 'Ruta 03 - Op. Juan Pérez', time: 'Hace 30 min', type: 'primary' as const },
  { action: 'Lectura validada', detail: 'Lote de 45 lecturas - Zona Sur', time: 'Hace 1 hora', type: 'success' as const },
  { action: 'Asignación creada', detail: 'Ruta 07 → Carlos Rojas', time: 'Hace 2 horas', type: 'primary' as const },
];

const topOperarios = [
  { nombre: 'Juan Pérez', lecturas: 342, porcentaje: 95 },
  { nombre: 'María García', lecturas: 298, porcentaje: 87 },
  { nombre: 'Carlos Rojas', lecturas: 276, porcentaje: 81 },
  { nombre: 'Ana Torres', lecturas: 251, porcentaje: 74 },
  { nombre: 'Pedro Sánchez', lecturas: 223, porcentaje: 66 },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Bienvenido, {user?.nombre || 'Usuario'}
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Periodo actual: Marzo 2026 | Panel de control general
        </p>
      </div>

      {/* KPIs */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.title} variants={item}>
              <GlassCard className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                      {kpi.title}
                    </p>
                    <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{kpi.value}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--text-tertiary)]">{kpi.subtitle}</span>
                      {kpi.trend && (
                        <GlassChip
                          label={kpi.trend}
                          variant={kpi.trendUp ? 'success' : 'danger'}
                        />
                      )}
                    </div>
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-5.5 w-5.5 text-white" />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progress chart placeholder */}
        <motion.div variants={item} initial="hidden" animate="show" className="lg:col-span-2">
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Avance de Lecturas</h3>
                <p className="text-xs text-[var(--text-tertiary)]">Lecturas completadas por día</p>
              </div>
              <div className="flex items-center gap-2">
                <GlassChip label="Este periodo" variant="primary" />
              </div>
            </div>
            <GlassAreaChart data={dailyData} color="#0A84FF" height={240} />
          </GlassCard>
        </motion.div>

        {/* Progress gauge */}
        <motion.div variants={item} initial="hidden" animate="show">
          <GlassCard hover={false} className="h-full">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Avance Global</h3>
            <div className="flex flex-col items-center justify-center h-52">
              {/* Circular progress */}
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" className="stroke-black/10 dark:stroke-white/10" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke="url(#gradient)" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - 0.712)}`}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0A84FF" />
                      <stop offset="100%" stopColor="#30D158" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-[var(--text-primary)]">71.2%</span>
                  <span className="text-xs text-[var(--text-tertiary)]">completado</span>
                </div>
              </div>
              <div className="flex gap-4 mt-4 text-xs text-[var(--text-tertiary)]">
                <span>2,847 leídos</span>
                <span>|</span>
                <span>1,153 pendientes</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Operarios */}
        <motion.div variants={item} initial="hidden" animate="show">
          <GlassCard hover={false}>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Top Operarios</h3>
            <div className="space-y-3">
              {topOperarios.map((op, idx) => (
                <div key={op.nombre} className="flex items-center gap-3">
                  <span className="w-6 text-xs font-bold text-[var(--text-tertiary)] text-right">#{idx + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center text-white text-xs font-bold">
                    {op.nombre.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{op.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0A84FF] to-[#30D158] rounded-full transition-all duration-500"
                          style={{ width: `${op.porcentaje}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)] w-8">{op.porcentaje}%</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{op.lecturas}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item} initial="hidden" animate="show">
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Actividad Reciente</h3>
              <Activity className="h-4 w-4 text-[var(--text-tertiary)]" />
            </div>
            <div className="space-y-3">
              {recentActivity.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                    act.type === 'success' ? 'bg-[#30D158]' :
                    act.type === 'danger' ? 'bg-[#FF453A]' :
                    'bg-[#0A84FF]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{act.action}</p>
                    <p className="text-xs text-[var(--text-tertiary)] truncate">{act.detail}</p>
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
