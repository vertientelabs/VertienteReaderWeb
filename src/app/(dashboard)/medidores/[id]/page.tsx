'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Gauge, MapPin, Calendar, Activity } from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import { getMedidorById } from '@/lib/services/meter-service';
import { getClienteById } from '@/lib/services/client-service';
import { getZonaById } from '@/lib/services/zone-service';
import { getCompanyById } from '@/lib/services/company-service';
import type { Medidor } from '@/lib/types';

const estadoVariant: Record<string, 'success' | 'default' | 'danger' | 'warning' | 'purple'> = {
  activo: 'success',
  inactivo: 'default',
  dañado: 'danger',
  retirado: 'warning',
  por_instalar: 'purple',
};

const tipoVariant: Record<string, 'default' | 'primary' | 'purple'> = {
  mecanico: 'default',
  digital: 'primary',
  inteligente: 'purple',
};

const estadoLecturaVariant: Record<string, 'warning' | 'success'> = {
  pendiente: 'warning',
  leido: 'success',
};

function InfoRow({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-[var(--text-primary)]">{value ?? '-'}</span>
    </div>
  );
}

export default function MedidorDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [medidor, setMedidor] = useState<Medidor | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolved names
  const [clienteNombre, setClienteNombre] = useState('—');
  const [zonaNombre, setZonaNombre] = useState('—');
  const [empresaNombre, setEmpresaNombre] = useState('—');

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMedidorById(id);
        setMedidor(data);

        if (data) {
          // Resolve names in parallel
          const [cliente, zona, empresa] = await Promise.all([
            data.clienteId ? getClienteById(data.clienteId).catch(() => null) : null,
            data.zonaId ? getZonaById(data.zonaId).catch(() => null) : null,
            data.companiId ? getCompanyById(data.companiId).catch(() => null) : null,
          ]);

          if (cliente) setClienteNombre(cliente.nombreCompleto);
          if (zona) setZonaNombre(zona.nombre);
          if (empresa) setEmpresaNombre(empresa.razonsocial);
        }
      } catch (error) {
        console.error('Error fetching medidor:', error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Gauge className="h-8 w-8 text-[var(--text-tertiary)] animate-pulse" />
          <p className="text-sm text-[var(--text-tertiary)]">Cargando medidor...</p>
        </div>
      </div>
    );
  }

  if (!medidor) {
    return (
      <div className="space-y-6">
        <Link href="/medidores">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Volver a medidores
          </GlassButton>
        </Link>
        <GlassCard hover={false}>
          <div className="flex flex-col items-center justify-center py-16">
            <Gauge className="h-10 w-10 text-[var(--text-tertiary)] mb-3" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Medidor no encontrado
            </h2>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">
              El medidor solicitado no existe o fue eliminado.
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  const fechaInstalacion = medidor.fechaInstalacion
    ? medidor.fechaInstalacion.toDate().toLocaleDateString('es-PE')
    : '-';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/medidores">
            <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
              Volver
            </GlassButton>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {medidor.numeroMedidor}
              </h1>
              <GlassChip
                label={medidor.tipo}
                variant={tipoVariant[medidor.tipo] || 'default'}
              />
              <GlassChip
                label={medidor.estado}
                variant={estadoVariant[medidor.estado] || 'default'}
              />
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">
              Detalle del medidor
            </p>
          </div>
        </div>
        <Link href={`/medidores/${id}/editar`}>
          <GlassButton variant="secondary" icon={<Edit className="h-4 w-4" />}>
            Editar
          </GlassButton>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Info */}
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="h-5 w-5 text-[#0A84FF]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Información Técnica
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Marca" value={medidor.marca} />
            <InfoRow label="Modelo" value={medidor.modelo} />
            <InfoRow label="Tipo" value={medidor.tipo} />
            <InfoRow label="Diámetro" value={medidor.diametro} />
          </div>
        </GlassCard>

        {/* Installation Info */}
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-[#30D158]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Instalación
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <InfoRow label="Dirección" value={medidor.direccionInstalacion} />
            </div>
            <InfoRow label="Latitud" value={medidor.latitud} />
            <InfoRow label="Longitud" value={medidor.longitud} />
            <InfoRow label="Fecha Instalación" value={fechaInstalacion} />
            <InfoRow label="Lectura Instalación" value={medidor.lecturaInstalacion} />
          </div>
        </GlassCard>

        {/* Reading Info */}
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-[#FF9F0A]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Lecturas</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Lectura Anterior" value={medidor.lecturaAnterior} />
            <InfoRow label="Lectura Actual" value={medidor.lecturaActual} />
            <div>
              <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">
                Estado Lectura
              </span>
              <GlassChip
                label={medidor.estadoLectura}
                variant={estadoLecturaVariant[medidor.estadoLectura] || 'default'}
              />
            </div>
          </div>
        </GlassCard>

        {/* Assignment Info */}
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-[#BF5AF2]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Asignación
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Cliente" value={clienteNombre} />
            <InfoRow label="Zona" value={zonaNombre} />
            <InfoRow label="Empresa" value={empresaNombre} />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
