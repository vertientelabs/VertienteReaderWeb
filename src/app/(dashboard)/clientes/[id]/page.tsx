'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, MapPin, User, FileText } from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import { getClienteById } from '@/lib/services/client-service';
import { resolveUbigeoNames } from '@/lib/hooks/use-ubigeo';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Cliente } from '@/lib/types';

const estadoVariant: Record<string, 'success' | 'default' | 'danger'> = {
  activo: 'success',
  inactivo: 'default',
  suspendido: 'danger',
};

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-[var(--text-primary)]">{value || '—'}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-9 w-20 rounded-xl bg-white/20 dark:bg-white/5 animate-pulse" />
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-white/20 dark:bg-white/5 animate-pulse" />
          <div className="h-4 w-32 rounded-lg bg-white/20 dark:bg-white/5 animate-pulse" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-40 rounded-2xl bg-white/20 dark:bg-white/5 animate-pulse"
        />
      ))}
    </div>
  );
}

export default function ClienteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ubigeoNames, setUbigeoNames] = useState({ departamento: '—', provincia: '—', distrito: '—' });
  const [zonaNombre, setZonaNombre] = useState('—');

  useEffect(() => {
    async function fetchCliente() {
      try {
        const data = await getClienteById(id);
        if (!data) {
          setError('Cliente no encontrado');
        } else {
          setCliente(data);
          // Resolve ubigeo names
          const names = await resolveUbigeoNames(data.departamentoId, data.provinciaId, data.distritoId);
          setUbigeoNames(names);
          // Resolve zona name
          if (data.zonaId) {
            try {
              const zonaSnap = await getDoc(doc(db, 'zonas', data.zonaId));
              if (zonaSnap.exists()) {
                setZonaNombre(zonaSnap.data().nombre || data.zonaId);
              }
            } catch {
              setZonaNombre(data.zonaId);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching cliente:', err);
        setError('Error al cargar el cliente');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCliente();
  }, [id]);

  if (loading) return <Skeleton />;

  if (error || !cliente) {
    return (
      <div className="space-y-6">
        <Link href="/clientes">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Volver
          </GlassButton>
        </Link>
        <GlassCard hover={false}>
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {error || 'Cliente no encontrado'}
            </p>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">
              El cliente solicitado no existe o fue eliminado.
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clientes">
            <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
              Volver
            </GlassButton>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {cliente.nombreCompleto}
              </h1>
              <GlassChip
                label={
                  cliente.estado.charAt(0).toUpperCase() + cliente.estado.slice(1)
                }
                variant={estadoVariant[cliente.estado] ?? 'default'}
              />
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">
              {cliente.tipoDocumento}: {cliente.numeroDocumento}
            </p>
          </div>
        </div>
        <Link href={`/clientes/${cliente.id}/editar`}>
          <GlassButton variant="secondary" icon={<Pencil className="h-4 w-4" />}>
            Editar
          </GlassButton>
        </Link>
      </div>

      {/* Datos Personales */}
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

      {/* Ubicacion */}
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
          <DetailRow label="Latitud" value={cliente.latitud} />
          <DetailRow label="Longitud" value={cliente.longitud} />
        </div>
      </GlassCard>

      {/* Metadata */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-[#BF5AF2]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Informacion del Registro</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailRow label="ID" value={cliente.id} />
          <DetailRow label="Creado por" value={cliente.createdBy} />
          <DetailRow
            label="Fecha de Creacion"
            value={cliente.createdAt?.toDate?.()?.toLocaleDateString('es-PE') ?? '—'}
          />
          <DetailRow
            label="Ultima Actualizacion"
            value={cliente.updatedAt?.toDate?.()?.toLocaleDateString('es-PE') ?? '—'}
          />
        </div>
      </GlassCard>
    </div>
  );
}
