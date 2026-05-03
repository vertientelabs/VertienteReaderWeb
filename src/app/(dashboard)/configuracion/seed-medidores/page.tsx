'use client';

import { useEffect, useState } from 'react';
import { Database, Gauge, CheckCircle2, AlertTriangle, Loader2, Users } from 'lucide-react';
import { Timestamp, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { db } from '@/lib/firebase/config';
import { useAuth, useHasRole } from '@/lib/hooks/use-auth';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import type { Cliente } from '@/lib/types';

// =====================================================
// Configuracion del seed de medidores
// =====================================================

const COMPANI_ID = 'FHaMfP2Ec9vRxKbcqVPY';
const CREATED_BY = 'JSRwOO7ckfQgTLu68RGg';
const TOTAL_MEDIDORES = 60;

// Valores fijos tomados del ejemplo
const DIAMETRO = '1/2"';
const MARCA = 'Zenner';
const MODELO = 'MTKD-N';
const TIPO = 'mecanico';
const ESTADO = 'activo';
const ESTADO_LECTURA = 'pendiente';

// Genera un numero de medidor unico de 10 digitos
function generateNumeroMedidor(seq: number): string {
  // Formato: 098 + 7 digitos (timestamp parcial + secuencia)
  const base = Date.now().toString().slice(-6);
  const seqStr = seq.toString().padStart(4, '0');
  return `098${base.slice(0, 3)}${seqStr}`;
}

interface SeedResult {
  total: number;
  errores: number;
}

export default function SeedMedidoresPage() {
  const { user } = useAuth();
  const isAdmin = useHasRole('root', 'administrador');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesConMedidor, setClientesConMedidor] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SeedResult | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Cargar clientes de la compania
        const clientesQ = query(
          collection(db, 'clientes'),
          where('companiId', '==', COMPANI_ID)
        );
        const clientesSnap = await getDocs(clientesQ);
        const clientesData = clientesSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Cliente)
        );

        // 2. Cargar todos los medidores existentes para detectar clientes ya asignados
        const medidoresQ = query(
          collection(db, 'medidores'),
          where('companiId', '==', COMPANI_ID)
        );
        const medidoresSnap = await getDocs(medidoresQ);
        const conMedidor = new Set<string>();
        medidoresSnap.docs.forEach((d) => {
          const data = d.data() as { clienteId?: string };
          if (data.clienteId) conMedidor.add(data.clienteId);
        });

        setClientes(clientesData);
        setClientesConMedidor(conMedidor);
      } catch (err) {
        console.error('Error cargando datos:', err);
        toast.error('Error al cargar clientes y medidores');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const clientesDisponibles = clientes.filter((c) => !clientesConMedidor.has(c.id));
  const clientesParaSeed = clientesDisponibles.slice(0, TOTAL_MEDIDORES);
  const puedeSeed = clientesParaSeed.length > 0;

  async function handleSeed() {
    if (!user) {
      toast.error('Debe estar autenticado');
      return;
    }
    if (!puedeSeed) {
      toast.error('No hay clientes disponibles sin medidor');
      return;
    }

    setSeeding(true);
    setProgress(0);
    setResult(null);

    let creados = 0;
    let errores = 0;

    try {
      for (let i = 0; i < clientesParaSeed.length; i++) {
        const cliente = clientesParaSeed[i];
        const now = Timestamp.now();

        try {
          const medidor = {
            clienteId: cliente.id,
            companiId: cliente.companiId || COMPANI_ID,
            createdAt: now,
            createdBy: CREATED_BY,
            departamentoId: cliente.departamentoId || '',
            diametro: DIAMETRO,
            direccionInstalacion: cliente.direccion || '',
            distritoId: cliente.distritoId || '',
            estado: ESTADO,
            estadoLectura: ESTADO_LECTURA,
            latitud: 0,
            lecturaAnterior: 0,
            lecturaInstalacion: 0,
            longitud: 0,
            marca: MARCA,
            modelo: MODELO,
            numeroMedidor: generateNumeroMedidor(i + 1),
            provinciaId: cliente.provinciaId || '',
            tipo: TIPO,
            updatedAt: now,
            zonaId: cliente.zonaId || '',
          };

          await addDoc(collection(db, 'medidores'), medidor);
          creados++;
        } catch (err) {
          console.error(`Error al crear medidor para cliente ${cliente.id}:`, err);
          errores++;
        }

        setProgress(Math.round(((i + 1) / clientesParaSeed.length) * 100));
      }

      setResult({ total: creados, errores });
      if (errores === 0) {
        toast.success(`${creados} medidores creados exitosamente`);
      } else {
        toast.warning(`${creados} medidores creados, ${errores} errores`);
      }
    } catch (err) {
      console.error('Error en seed:', err);
      toast.error(`Error en el proceso de seed (${creados} creados)`);
      setResult({ total: creados, errores });
    } finally {
      setSeeding(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <GlassCard>
          <div className="flex items-center gap-3 text-[var(--text-secondary)]">
            <AlertTriangle className="h-5 w-5 text-[#FF9F0A]" />
            <p>Solo los administradores pueden acceder a esta pagina.</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9F0A] to-[#FF453A] flex items-center justify-center">
          <Gauge className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Generador de Medidores</h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            Asignar medidores ficticios a clientes sin medidor
          </p>
        </div>
      </div>

      {/* Estadisticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A84FF]/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-[#0A84FF]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)]">Total clientes</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {loading ? '—' : clientes.length}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#30D158]/10 flex items-center justify-center">
              <Gauge className="h-5 w-5 text-[#30D158]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)]">Con medidor</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {loading ? '—' : clientesConMedidor.size}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF9F0A]/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-[#FF9F0A]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)]">Sin medidor</p>
              <p className="text-xl font-bold text-[#FF9F0A]">
                {loading ? '—' : clientesDisponibles.length}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Configuracion */}
      <GlassCard>
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Plantilla de medidor a generar
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Marca</p>
            <p className="font-semibold text-[var(--text-primary)]">{MARCA}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Modelo</p>
            <p className="font-semibold text-[var(--text-primary)]">{MODELO}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Tipo</p>
            <p className="font-semibold text-[var(--text-primary)]">{TIPO}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Diametro</p>
            <p className="font-semibold text-[var(--text-primary)]">{DIAMETRO}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Estado</p>
            <GlassChip label={ESTADO} variant="success" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Estado lectura</p>
            <GlassChip label={ESTADO_LECTURA} variant="warning" />
          </div>
          <div className="col-span-2">
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Lecturas iniciales</p>
            <p className="font-mono text-xs text-[var(--text-primary)]">
              latitud=0, longitud=0, lecturaAnterior=0, lecturaInstalacion=0
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.06] text-xs text-[var(--text-tertiary)]">
          Los campos <span className="font-mono">companiId, departamentoId, provinciaId, distritoId, zonaId</span> y{' '}
          <span className="font-mono">direccionInstalacion</span> se toman del cliente asignado.
        </div>
      </GlassCard>

      {/* Vista previa de clientes a procesar */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Clientes a procesar ({clientesParaSeed.length})
          </h2>
          {clientesDisponibles.length > TOTAL_MEDIDORES && (
            <GlassChip
              label={`${clientesDisponibles.length - TOTAL_MEDIDORES} clientes quedaran sin medidor`}
              variant="warning"
            />
          )}
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando clientes...
          </div>
        ) : clientesParaSeed.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-[#FF453A]">
            <AlertTriangle className="h-4 w-4" />
            No hay clientes sin medidor disponibles para procesar.
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-1">
            {clientesParaSeed.slice(0, 10).map((c, idx) => (
              <div
                key={c.id}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/30 dark:bg-white/[0.04]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[var(--text-tertiary)]">{idx + 1}.</span>
                  <span className="text-[var(--text-primary)]">{c.nombreCompleto}</span>
                  <span className="text-[var(--text-tertiary)]">— DNI {c.numeroDocumento}</span>
                </div>
                <span className="text-[var(--text-tertiary)]">{c.direccion}</span>
              </div>
            ))}
            {clientesParaSeed.length > 10 && (
              <p className="text-xs text-[var(--text-tertiary)] pt-2 text-center">
                ...y {clientesParaSeed.length - 10} clientes mas
              </p>
            )}
          </div>
        )}
      </GlassCard>

      {/* Accion */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">
              Generar {clientesParaSeed.length} medidores
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Cada medidor se asignara a un cliente sin medidor existente. La direccion de instalacion se tomara de la direccion del cliente.
            </p>
          </div>
          <GlassButton
            icon={seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}
            onClick={handleSeed}
            disabled={seeding || loading || !puedeSeed}
          >
            {seeding ? `Generando ${progress}%...` : `Generar ${clientesParaSeed.length} medidores`}
          </GlassButton>
        </div>

        {/* Barra de progreso */}
        {seeding && (
          <div className="mt-4 space-y-2">
            <div className="h-2 bg-black/[0.08] dark:bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF9F0A] to-[#FF453A] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-[var(--text-tertiary)] text-center">
              {Math.round((progress / 100) * clientesParaSeed.length)} / {clientesParaSeed.length} medidores creados
            </p>
          </div>
        )}
      </GlassCard>

      {/* Resultado */}
      {result && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-[#30D158]" />
            <h3 className="font-semibold text-[var(--text-primary)]">
              Generacion completada
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#30D158]/10 border border-[#30D158]/20">
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Medidores creados</p>
              <p className="text-2xl font-bold text-[#30D158]">{result.total}</p>
            </div>
            {result.errores > 0 && (
              <div className="p-3 rounded-xl bg-[#FF453A]/10 border border-[#FF453A]/20">
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Errores</p>
                <p className="text-2xl font-bold text-[#FF453A]">{result.errores}</p>
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
