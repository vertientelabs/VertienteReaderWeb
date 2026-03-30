'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Users, Mail, Phone, MapPin, Shield, FileText } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import { getUserById } from '@/lib/services/user-service';
import { getCompanyById } from '@/lib/services/company-service';
import { getInitials } from '@/lib/utils/formatters';
import type { Usuario } from '@/lib/types';

const roleChipVariant: Record<string, 'danger' | 'primary' | 'purple' | 'success' | 'warning'> = {
  root: 'danger',
  administrador: 'primary',
  supervisor: 'purple',
  operario: 'success',
  lector: 'warning',
};

async function resolveUbigeoName(collection: string, id: string): Promise<string> {
  if (!id) return '—';
  try {
    const snap = await getDoc(doc(db, collection, id));
    if (snap.exists()) return snap.data().nombre || id;
  } catch { /* ignore */ }
  return id;
}

export default function UsuarioDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolved display names
  const [departamentoNombre, setDepartamentoNombre] = useState('—');
  const [provinciaNombre, setProvinciaNombre] = useState('—');
  const [distritoNombre, setDistritoNombre] = useState('—');
  const [empresaNombre, setEmpresaNombre] = useState('—');

  useEffect(() => {
    async function load() {
      try {
        const data = await getUserById(id);
        setUsuario(data);

        if (data) {
          // Resolve ubigeo names in parallel
          const [depName, provName, distName] = await Promise.all([
            resolveUbigeoName('departamentos', data.departamentoId || ''),
            resolveUbigeoName('provincias', data.provinciaId || ''),
            resolveUbigeoName('distritos', data.distritoId || ''),
          ]);
          setDepartamentoNombre(depName);
          setProvinciaNombre(provName);
          setDistritoNombre(distName);

          // Resolve empresa name
          if (data.companiId) {
            const company = await getCompanyById(data.companiId);
            if (company) setEmpresaNombre(company.razonsocial);
          }
        }
      } catch (err) {
        console.error('Error loading usuario:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/30 rounded animate-pulse" />
        <GlassCard hover={false}>
          <div className="animate-pulse space-y-4 py-8">
            <div className="h-16 w-16 bg-white/20 rounded-2xl mx-auto" />
            <div className="h-6 w-48 bg-white/20 rounded mx-auto" />
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="space-y-6">
        <Link href="/usuarios">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Volver
          </GlassButton>
        </Link>
        <GlassCard hover={false}>
          <div className="flex flex-col items-center py-16">
            <Users className="h-12 w-12 text-[var(--text-tertiary)] mb-4" />
            <p className="text-[var(--text-secondary)]">Usuario no encontrado</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/usuarios">
            <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Detalle de Usuario</h1>
          </div>
        </div>
        <Link href={`/usuarios/${id}/editar`}>
          <GlassButton variant="secondary" icon={<Pencil className="h-4 w-4" />}>Editar</GlassButton>
        </Link>
      </div>

      {/* Profile card */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {getInitials(usuario.nombre, usuario.apellidos)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {usuario.nombre} {usuario.apellidos}
              </h2>
              <GlassChip
                label={usuario.usertype.charAt(0).toUpperCase() + usuario.usertype.slice(1)}
                variant={roleChipVariant[usuario.usertype] || 'default'}
              />
              <GlassChip
                label={usuario.activo ? 'Activo' : 'Inactivo'}
                variant={usuario.activo ? 'success' : 'default'}
              />
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">{usuario.email}</p>
          </div>
        </div>
      </GlassCard>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Documento */}
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            Documento
          </h3>
          <div className="space-y-3">
            <InfoRow label="Tipo de Documento" value={usuario.tipoDocumento || '—'} />
            <InfoRow label="Número de Documento" value={usuario.numeroDocumento || '—'} />
          </div>
        </GlassCard>

        {/* Contacto */}
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" />
            Contacto
          </h3>
          <div className="space-y-3">
            <InfoRow label="Email" value={usuario.email} />
            <InfoRow label="Teléfono" value={usuario.telefono || '—'} />
            <InfoRow label="Dirección" value={usuario.direccion || '—'} />
          </div>
        </GlassCard>

        {/* Rol y empresa */}
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            Rol y Empresa
          </h3>
          <div className="space-y-3">
            <InfoRow label="Rol" value={usuario.usertype.charAt(0).toUpperCase() + usuario.usertype.slice(1)} />
            <InfoRow label="Empresa" value={empresaNombre} />
          </div>
        </GlassCard>

        {/* Ubicación */}
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            Ubicación
          </h3>
          <div className="space-y-3">
            <InfoRow label="Departamento" value={departamentoNombre} />
            <InfoRow label="Provincia" value={provinciaNombre} />
            <InfoRow label="Distrito" value={distritoNombre} />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
      <p className="text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
