'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { getZonaById, updateZona } from '@/lib/services/zone-service';
import { zonaSchema, type ZonaFormData } from '@/lib/validators/zone.schema';
import { FullPageLoader } from '@/components/shared/loading-skeleton';

export default function EditarZonaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ZonaFormData>({
    resolver: zodResolver(zonaSchema),
  });

  const [ubigeoValues, setUbigeoValues] = useState({
    departamentoId: '',
    provinciaId: '',
    distritoId: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const zona = await getZonaById(id);
        if (!zona) {
          toast.error('Zona no encontrada');
          router.push('/zonas');
          return;
        }
        reset({
          codigo: zona.codigo,
          nombre: zona.nombre,
          descripcion: zona.descripcion || '',
          departamentoId: zona.departamentoId,
          provinciaId: zona.provinciaId,
          distritoId: zona.distritoId,
          activo: zona.activo,
        });
        setUbigeoValues({
          departamentoId: zona.departamentoId,
          provinciaId: zona.provinciaId,
          distritoId: zona.distritoId,
        });
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar la zona');
      } finally {
        setLoadingData(false);
      }
    }
    if (id) load();
  }, [id, reset, router]);

  const onSubmit = async (data: ZonaFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      await updateZona(id, {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        departamentoId: data.departamentoId,
        provinciaId: data.provinciaId,
        distritoId: data.distritoId,
        activo: data.activo,
      }, user.id);
      toast.success('Zona actualizada exitosamente');
      router.push(`/zonas/${id}`);
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar la zona');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <FullPageLoader />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href={`/zonas/${id}`}>
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Editar Zona</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Modificar datos de la zona</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <GlassCard hover={false} padding="lg">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Datos de la Zona
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput label="Codigo" placeholder="Ej: ZN-001" error={errors.codigo?.message} {...register('codigo')} />
                <GlassInput label="Nombre" placeholder="Ej: Zona Norte" error={errors.nombre?.message} {...register('nombre')} />
              </div>
              <div className="mt-4">
                <GlassInput label="Descripcion" placeholder="Descripcion opcional" error={errors.descripcion?.message} {...register('descripcion')} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Ubicacion Geografica
              </h3>
              <UbigeoCascader
                departamentoId={ubigeoValues.departamentoId}
                provinciaId={ubigeoValues.provinciaId}
                distritoId={ubigeoValues.distritoId}
                onChange={(vals) => {
                  setValue('departamentoId', vals.departamentoId, { shouldValidate: true });
                  setValue('provinciaId', vals.provinciaId, { shouldValidate: true });
                  setValue('distritoId', vals.distritoId, { shouldValidate: true });
                  setUbigeoValues(vals);
                }}
                errors={{
                  departamentoId: errors.departamentoId?.message,
                  provinciaId: errors.provinciaId?.message,
                  distritoId: errors.distritoId?.message,
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <Link href={`/zonas/${id}`}>
                <GlassButton variant="secondary" type="button">Cancelar</GlassButton>
              </Link>
              <GlassButton type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
                Guardar Cambios
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </form>
    </div>
  );
}
