'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import UbigeoCascader from '@/components/forms/ubigeo-cascader';
import { useAuth } from '@/lib/hooks/use-auth';
import { createZona } from '@/lib/services/zone-service';
import { zonaSchema, type ZonaFormData } from '@/lib/validators/zone.schema';

export default function NuevaZonaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ZonaFormData>({
    resolver: zodResolver(zonaSchema),
    defaultValues: { activo: true },
  });

  const onSubmit = async (data: ZonaFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      await createZona(
        {
          ...data,
          descripcion: data.descripcion || '',
          companiId: user.companiCli || user.companiId,
          activo: data.activo,
        },
        user.id
      );
      toast.success('Zona creada exitosamente');
      router.push('/zonas');
    } catch (err) {
      console.error(err);
      toast.error('Error al crear la zona');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/zonas">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Nueva Zona</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Registrar nueva zona geográfica</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <GlassCard hover={false} padding="lg">
          <div className="space-y-6">
            {/* Datos básicos */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Datos de la Zona
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput
                  label="Código"
                  placeholder="Ej: ZN-001"
                  error={errors.codigo?.message}
                  {...register('codigo')}
                />
                <GlassInput
                  label="Nombre"
                  placeholder="Ej: Zona Norte - Sector A"
                  error={errors.nombre?.message}
                  {...register('nombre')}
                />
              </div>
              <div className="mt-4">
                <GlassInput
                  label="Descripción"
                  placeholder="Descripción opcional de la zona"
                  error={errors.descripcion?.message}
                  {...register('descripcion')}
                />
              </div>
            </div>

            {/* Ubigeo */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Ubicación Geográfica
              </h3>
              <UbigeoCascader
                onChange={(vals) => {
                  setValue('departamentoId', vals.departamentoId);
                  setValue('provinciaId', vals.provinciaId);
                  setValue('distritoId', vals.distritoId);
                }}
                errors={{
                  departamentoId: errors.departamentoId?.message,
                  provinciaId: errors.provinciaId?.message,
                  distritoId: errors.distritoId?.message,
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Link href="/zonas">
                <GlassButton variant="secondary" type="button">Cancelar</GlassButton>
              </Link>
              <GlassButton type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
                Guardar Zona
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </form>
    </div>
  );
}
