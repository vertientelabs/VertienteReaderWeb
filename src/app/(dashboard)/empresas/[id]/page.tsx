'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Building2 } from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import { getCompanyById } from '@/lib/services/company-service';
import type { Company } from '@/lib/types';

export default function EmpresaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [empresa, setEmpresa] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [clienteNombre, setClienteNombre] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getCompanyById(id);
        setEmpresa(data);
        if (data?.tipoEmpresa === 'PRO' && data.empresaClienteId) {
          const cli = await getCompanyById(data.empresaClienteId);
          if (cli) setClienteNombre(cli.razonsocial);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Building2 className="h-10 w-10 text-[var(--text-tertiary)]" />
          <p className="text-sm text-[var(--text-tertiary)]">Cargando empresa...</p>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return <p className="text-[var(--text-tertiary)]">Empresa no encontrada</p>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/empresas">
            <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{empresa.razonsocial}</h1>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">RUC: {empresa.ruc}</p>
          </div>
        </div>
        <Link href={`/empresas/${id}/editar`}>
          <GlassButton icon={<Pencil className="h-4 w-4" />}>Editar</GlassButton>
        </Link>
      </div>

      <GlassCard hover={false} padding="lg">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GlassChip
              label={empresa.tipoEmpresa === 'CLI' ? 'Empresa Cliente' : 'Empresa Proveedora'}
              variant={empresa.tipoEmpresa === 'CLI' ? 'primary' : 'purple'}
            />
            <GlassChip
              label={empresa.activo ? 'Activa' : 'Inactiva'}
              variant={empresa.activo ? 'success' : 'default'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--text-tertiary)]">Dirección</p>
              <p className="text-[var(--text-primary)]">{empresa.direccion || '—'}</p>
            </div>
            {empresa.tipoEmpresa === 'PRO' && (
              <div>
                <p className="text-[var(--text-tertiary)]">Empresa Cliente</p>
                <p className="text-[var(--text-primary)]">{clienteNombre || '—'}</p>
              </div>
            )}
            {empresa.tipoEmpresa === 'CLI' && (
              <>
                <div>
                  <p className="text-[var(--text-tertiary)]">Consumo alto alerta (%)</p>
                  <p className="text-[var(--text-primary)]">{empresa.consumoPromedioAlerta ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[var(--text-tertiary)]">Consumo bajo alerta (%)</p>
                  <p className="text-[var(--text-primary)]">{empresa.consumoMinimoAlerta ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[var(--text-tertiary)]">Días límite lectura</p>
                  <p className="text-[var(--text-primary)]">{empresa.diasLimiteLectura ?? '—'}</p>
                </div>
              </>
            )}
            <div>
              <p className="text-[var(--text-tertiary)]">Formato exportación</p>
              <p className="text-[var(--text-primary)]">{empresa.formatoExportacion || '—'}</p>
            </div>
            <div>
              <p className="text-[var(--text-tertiary)]">Zona horaria</p>
              <p className="text-[var(--text-primary)]">{empresa.zonaHoraria || '—'}</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
