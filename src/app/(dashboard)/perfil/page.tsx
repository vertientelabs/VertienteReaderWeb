'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, Mail, Phone, MapPin, Shield, FileText, Building2 } from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GlassChip from '@/components/ui/glass-chip';
import { useAuth } from '@/lib/hooks/use-auth';
import { getCompanyById } from '@/lib/services/company-service';
import { getInitials } from '@/lib/utils/formatters';

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

export default function PerfilPage() {
  const { user } = useAuth();
  const [departamentoNombre, setDepartamentoNombre] = useState('—');
  const [provinciaNombre, setProvinciaNombre] = useState('—');
  const [distritoNombre, setDistritoNombre] = useState('—');
  const [empresaNombre, setEmpresaNombre] = useState('—');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [depName, provName, distName] = await Promise.all([
          resolveUbigeoName('departamentos', user.departamentoId || ''),
          resolveUbigeoName('provincias', user.provinciaId || ''),
          resolveUbigeoName('distritos', user.distritoId || ''),
        ]);
        setDepartamentoNombre(depName);
        setProvinciaNombre(provName);
        setDistritoNombre(distName);

        if (user.companiId) {
          const company = await getCompanyById(user.companiId);
          if (company) setEmpresaNombre(company.razonsocial);
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[var(--text-tertiary)]">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mi Perfil</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Información de tu cuenta</p>
      </div>

      {/* Profile header card */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {getInitials(user.nombre, user.apellidos)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {user.nombre} {user.apellidos}
              </h2>
              <GlassChip
                label={user.usertype.charAt(0).toUpperCase() + user.usertype.slice(1)}
                variant={roleChipVariant[user.usertype] || 'default'}
              />
              <GlassChip
                label={user.activo ? 'Activo' : 'Inactivo'}
                variant={user.activo ? 'success' : 'default'}
              />
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">{user.email}</p>
          </div>
        </div>
      </GlassCard>

      {/* Detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Documento */}
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            Documento
          </h3>
          <div className="space-y-3">
            <InfoRow label="Tipo de Documento" value={user.tipoDocumento || '—'} />
            <InfoRow label="Número de Documento" value={user.numeroDocumento || '—'} />
          </div>
        </GlassCard>

        {/* Contacto */}
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" />
            Contacto
          </h3>
          <div className="space-y-3">
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Teléfono" value={user.telefono || '—'} />
            <InfoRow label="Dirección" value={user.direccion || '—'} />
          </div>
        </GlassCard>

        {/* Empresa */}
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" />
            Empresa
          </h3>
          <div className="space-y-3">
            <InfoRow label="Empresa" value={loading ? 'Cargando...' : empresaNombre} />
            <InfoRow label="Rol" value={user.usertype.charAt(0).toUpperCase() + user.usertype.slice(1)} />
          </div>
        </GlassCard>

        {/* Ubicación */}
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            Ubicación
          </h3>
          <div className="space-y-3">
            <InfoRow label="Departamento" value={loading ? 'Cargando...' : departamentoNombre} />
            <InfoRow label="Provincia" value={loading ? 'Cargando...' : provinciaNombre} />
            <InfoRow label="Distrito" value={loading ? 'Cargando...' : distritoNombre} />
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
