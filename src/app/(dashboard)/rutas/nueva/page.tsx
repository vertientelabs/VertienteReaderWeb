'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, MapPin, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import GlassChip from '@/components/ui/glass-chip';
import { useAuth } from '@/lib/hooks/use-auth';
import { createRuta } from '@/lib/services/route-service';
import { getZonas } from '@/lib/services/zone-service';
import { rutaSchema, type RutaFormData } from '@/lib/validators/route.schema';
import type { Zona } from '@/lib/types';

export default function NuevaRutaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [zonasLoading, setZonasLoading] = useState(true);
  const [selectedZonas, setSelectedZonas] = useState<Zona[]>([]);
  const [searchZona, setSearchZona] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RutaFormData>({
    resolver: zodResolver(rutaSchema),
    defaultValues: { activo: true, zonasIds: [] },
  });

  useEffect(() => {
    async function loadZonas() {
      try {
        const data = await getZonas({ activo: true });
        setZonas(data);
      } catch (err) {
        console.error(err);
      } finally {
        setZonasLoading(false);
      }
    }
    loadZonas();
  }, []);

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
      await createRuta(
        {
          nombre: data.nombre,
          codigo: data.codigo,
          descripcion: data.descripcion || undefined,
          zonasIds: data.zonasIds,
          totalMedidores: 0,
          companiId: user.companiCli || user.companiId,
          activo: data.activo,
          createdBy: user.id,
        },
        user.id
      );
      toast.success('Ruta creada exitosamente');
      router.push('/rutas');
    } catch (err) {
      console.error(err);
      toast.error('Error al crear la ruta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/rutas">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Nueva Ruta</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Crear ruta y asignar zonas</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Form fields */}
          <div className="lg:col-span-2 space-y-4">
            <GlassCard hover={false} padding="lg">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Datos de la Ruta
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput
                  label="Código"
                  placeholder="Ej: R-001"
                  error={errors.codigo?.message}
                  {...register('codigo')}
                />
                <GlassInput
                  label="Nombre"
                  placeholder="Ej: Ruta 01 - Centro"
                  error={errors.nombre?.message}
                  {...register('nombre')}
                />
              </div>
              <div className="mt-4">
                <GlassInput
                  label="Descripción"
                  placeholder="Descripción opcional"
                  {...register('descripcion')}
                />
              </div>
            </GlassCard>

            {/* Zone selector */}
            <GlassCard hover={false} padding="lg">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Zonas de la Ruta
              </h3>

              {errors.zonasIds && (
                <p className="text-xs text-[#FF453A] mb-3">{errors.zonasIds.message}</p>
              )}

              {/* Selected zones */}
              {selectedZonas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedZonas.map((zona) => (
                    <div
                      key={zona.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0A84FF]/10 border border-[#0A84FF]/20"
                    >
                      <MapPin className="h-3.5 w-3.5 text-[#0A84FF]" />
                      <span className="text-sm font-medium text-[#0A84FF]">
                        {zona.codigo} - {zona.nombre}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeZona(zona.id)}
                        className="p-0.5 rounded hover:bg-[#0A84FF]/20 transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-[#0A84FF]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search and add zones */}
              <div className="relative">
                <GlassInput
                  placeholder="Buscar zona por nombre o código..."
                  value={searchZona}
                  onChange={(e) => setSearchZona(e.target.value)}
                  icon={<MapPin className="h-4 w-4" />}
                />
                {searchZona && availableZonas.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-white/90 dark:bg-[#2a2a2a]/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {availableZonas.slice(0, 8).map((zona) => (
                      <button
                        key={zona.id}
                        type="button"
                        onClick={() => addZona(zona)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
                      >
                        <Plus className="h-4 w-4 text-[#30D158]" />
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            {zona.codigo} - {zona.nombre}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {zona.descripcion || zona.distritoId}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {zonasLoading && (
                <p className="text-xs text-[var(--text-tertiary)] mt-2">Cargando zonas disponibles...</p>
              )}
            </GlassCard>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Link href="/rutas">
                <GlassButton variant="secondary" type="button">Cancelar</GlassButton>
              </Link>
              <GlassButton type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
                Guardar Ruta
              </GlassButton>
            </div>
          </div>

          {/* Right: Summary */}
          <div>
            <GlassCard hover={false}>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Resumen
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-tertiary)]">Zonas incluidas</span>
                  <span className="text-lg font-bold text-[var(--text-primary)]">{selectedZonas.length}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="space-y-2">
                  {selectedZonas.length === 0 ? (
                    <p className="text-xs text-[var(--text-tertiary)] text-center py-4">
                      Agregue zonas a la ruta
                    </p>
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
