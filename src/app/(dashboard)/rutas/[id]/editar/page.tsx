'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, MapPin, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import { useAuth } from '@/lib/hooks/use-auth';
import { getRutaById, updateRuta } from '@/lib/services/route-service';
import { getZonas, getZonaById } from '@/lib/services/zone-service';
import { rutaSchema, type RutaFormData } from '@/lib/validators/route.schema';
import { FullPageLoader } from '@/components/shared/loading-skeleton';
import type { Zona } from '@/lib/types';

export default function EditarRutaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [selectedZonas, setSelectedZonas] = useState<Zona[]>([]);
  const [searchZona, setSearchZona] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RutaFormData>({
    resolver: zodResolver(rutaSchema),
  });

  useEffect(() => {
    async function load() {
      try {
        const [ruta, allZonas] = await Promise.all([
          getRutaById(id),
          getZonas({ activo: true }),
        ]);
        if (!ruta) {
          toast.error('Ruta no encontrada');
          router.push('/rutas');
          return;
        }
        setZonas(allZonas);
        reset({
          codigo: ruta.codigo,
          nombre: ruta.nombre,
          descripcion: ruta.descripcion || '',
          zonasIds: ruta.zonasIds || [],
          activo: ruta.activo,
        });
        // Load selected zona details
        if (ruta.zonasIds?.length) {
          const zonaDetails = await Promise.all(ruta.zonasIds.map((zId) => getZonaById(zId)));
          setSelectedZonas(zonaDetails.filter(Boolean) as Zona[]);
        }
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar la ruta');
      } finally {
        setLoadingData(false);
      }
    }
    if (id) load();
  }, [id, reset, router]);

  const availableZonas = zonas.filter(
    (z) =>
      !selectedZonas.find((s) => s.id === z.id) &&
      (z.nombre.toLowerCase().includes(searchZona.toLowerCase()) ||
        z.codigo.toLowerCase().includes(searchZona.toLowerCase()))
  );

  const addZona = (zona: Zona) => {
    const updated = [...selectedZonas, zona];
    setSelectedZonas(updated);
    setValue('zonasIds', updated.map((z) => z.id));
    setSearchZona('');
  };

  const removeZona = (zonaId: string) => {
    const updated = selectedZonas.filter((z) => z.id !== zonaId);
    setSelectedZonas(updated);
    setValue('zonasIds', updated.map((z) => z.id));
  };

  const onSubmit = async (data: RutaFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      await updateRuta(id, {
        nombre: data.nombre,
        codigo: data.codigo,
        descripcion: data.descripcion || '',
        zonasIds: data.zonasIds,
        activo: data.activo,
      }, user.id);
      toast.success('Ruta actualizada exitosamente');
      router.push(`/rutas/${id}`);
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar la ruta');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <FullPageLoader />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href={`/rutas/${id}`}>
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Editar Ruta</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Modificar datos de la ruta</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <GlassCard hover={false} padding="lg">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Datos de la Ruta
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput label="Codigo" placeholder="Ej: R-001" error={errors.codigo?.message} {...register('codigo')} />
                <GlassInput label="Nombre" placeholder="Ej: Ruta 01 - Centro" error={errors.nombre?.message} {...register('nombre')} />
              </div>
              <div className="mt-4">
                <GlassInput label="Descripcion" placeholder="Descripcion opcional" {...register('descripcion')} />
              </div>
            </GlassCard>

            <GlassCard hover={false} padding="lg">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Zonas de la Ruta
              </h3>
              {errors.zonasIds && <p className="text-xs text-[#FF453A] mb-3">{errors.zonasIds.message}</p>}
              {selectedZonas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedZonas.map((zona) => (
                    <div key={zona.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0A84FF]/10 border border-[#0A84FF]/20">
                      <MapPin className="h-3.5 w-3.5 text-[#0A84FF]" />
                      <span className="text-sm font-medium text-[#0A84FF]">{zona.codigo} - {zona.nombre}</span>
                      <button type="button" onClick={() => removeZona(zona.id)} className="p-0.5 rounded hover:bg-[#0A84FF]/20 transition-colors">
                        <X className="h-3.5 w-3.5 text-[#0A84FF]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="relative">
                <GlassInput placeholder="Buscar zona por nombre o codigo..." value={searchZona} onChange={(e) => setSearchZona(e.target.value)} icon={<MapPin className="h-4 w-4" />} />
                {searchZona && availableZonas.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-white/90 dark:bg-[#2a2a2a]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {availableZonas.slice(0, 8).map((zona) => (
                      <button key={zona.id} type="button" onClick={() => addZona(zona)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <Plus className="h-4 w-4 text-[#30D158]" />
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{zona.codigo} - {zona.nombre}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>

            <div className="flex items-center justify-end gap-3">
              <Link href={`/rutas/${id}`}>
                <GlassButton variant="secondary" type="button">Cancelar</GlassButton>
              </Link>
              <GlassButton type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
                Guardar Cambios
              </GlassButton>
            </div>
          </div>

          <div>
            <GlassCard hover={false}>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">Resumen</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-tertiary)]">Zonas incluidas</span>
                  <span className="text-lg font-bold text-[var(--text-primary)]">{selectedZonas.length}</span>
                </div>
                <div className="h-px bg-black/5 dark:bg-white/10" />
                <div className="space-y-2">
                  {selectedZonas.length === 0 ? (
                    <p className="text-xs text-[var(--text-tertiary)] text-center py-4">Agregue zonas a la ruta</p>
                  ) : (
                    selectedZonas.map((zona) => (
                      <div key={zona.id} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0A84FF]" />
                        <span className="text-[var(--text-primary)]">{zona.nombre}</span>
                        <span className="text-xs text-[var(--text-tertiary)]">({zona.codigo})</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </form>
    </div>
  );
}
