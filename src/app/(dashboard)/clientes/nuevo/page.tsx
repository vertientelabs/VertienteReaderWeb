'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { clienteSchema, ClienteFormData } from '@/lib/validators/client.schema';
import { createCliente } from '@/lib/services/client-service';
import { getZonas } from '@/lib/services/zone-service';
import { useAuth } from '@/lib/hooks/use-auth';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import GlassSelect from '@/components/ui/glass-select';
import UbigeoCascader from '@/components/forms/ubigeo-cascader';
import { ArrowLeft, Save } from 'lucide-react';
import type { Zona } from '@/lib/types';

const tipoDocumentoOptions = [
  { value: 'DNI', label: 'DNI' },
  { value: 'RUC', label: 'RUC' },
  { value: 'CE', label: 'Carnet de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

export default function NuevoClientePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      nombreCompleto: '',
      telefono: '',
      email: '',
      direccion: '',
      departamentoId: '',
      provinciaId: '',
      distritoId: '',
      zonaId: '',
      referencia: '',
      latitud: 0,
      longitud: 0,
    },
  });

  const departamentoId = watch('departamentoId');
  const provinciaId = watch('provinciaId');
  const distritoId = watch('distritoId');

  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loadingZonas, setLoadingZonas] = useState(false);

  // Load zonas when distritoId changes
  useEffect(() => {
    if (!distritoId) {
      setZonas([]);
      setValue('zonaId', '');
      return;
    }
    setLoadingZonas(true);
    getZonas({ distritoId, activo: true })
      .then((data) => setZonas(data))
      .catch((err) => {
        console.error('Error loading zonas:', err);
        setZonas([]);
      })
      .finally(() => setLoadingZonas(false));
  }, [distritoId, setValue]);

  const onSubmit = async (data: ClienteFormData) => {
    if (!user) {
      toast.error('No se pudo identificar al usuario');
      return;
    }

    setSubmitting(true);
    try {
      await createCliente(
        {
          ...data,
          estado: 'activo',
          companiId: user.companiCli || user.companiId,
          createdBy: user.id,
        },
        user.id
      );
      toast.success('Cliente creado exitosamente');
      router.push('/clientes');
    } catch (error) {
      console.error('Error creating cliente:', error);
      toast.error('Error al crear el cliente');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clientes">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Volver
          </GlassButton>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Nuevo Cliente</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Registrar un nuevo cliente del servicio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos Personales */}
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Datos Personales
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <GlassSelect
              label="Tipo de Documento"
              options={tipoDocumentoOptions}
              error={errors.tipoDocumento?.message}
              {...register('tipoDocumento')}
            />
            <GlassInput
              label="Número de Documento"
              placeholder="Ingrese número"
              error={errors.numeroDocumento?.message}
              {...register('numeroDocumento')}
            />
            <GlassInput
              label="Nombre Completo"
              placeholder="Nombre completo del cliente"
              error={errors.nombreCompleto?.message}
              {...register('nombreCompleto')}
            />
            <GlassInput
              label="Teléfono"
              placeholder="Número de teléfono"
              error={errors.telefono?.message}
              {...register('telefono')}
            />
            <GlassInput
              label="Email"
              type="email"
              placeholder="correo@ejemplo.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
        </GlassCard>

        {/* Ubicación */}
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Ubicación</h2>
          <div className="space-y-4">
            <UbigeoCascader
              departamentoId={departamentoId}
              provinciaId={provinciaId}
              distritoId={distritoId}
              onChange={(values) => {
                setValue('departamentoId', values.departamentoId, { shouldValidate: true });
                setValue('provinciaId', values.provinciaId, { shouldValidate: true });
                setValue('distritoId', values.distritoId, { shouldValidate: true });
              }}
              errors={{
                departamentoId: errors.departamentoId?.message,
                provinciaId: errors.provinciaId?.message,
                distritoId: errors.distritoId?.message,
              }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassSelect
                label="Zona"
                placeholder={loadingZonas ? 'Cargando zonas...' : distritoId ? 'Seleccione zona' : 'Seleccione distrito primero'}
                options={zonas.map((z) => ({ value: z.id, label: z.nombre }))}
                disabled={!distritoId || loadingZonas}
                error={errors.zonaId?.message}
                {...register('zonaId')}
              />
              <GlassInput
                label="Dirección"
                placeholder="Dirección del cliente"
                error={errors.direccion?.message}
                {...register('direccion')}
              />
            </div>
            <GlassInput
              label="Referencia"
              placeholder="Referencia de ubicación"
              error={errors.referencia?.message}
              {...register('referencia')}
            />
          </div>
        </GlassCard>

        {/* GPS */}
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Coordenadas GPS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Latitud"
              type="number"
              step="any"
              placeholder="-12.0464"
              error={errors.latitud?.message}
              {...register('latitud', { valueAsNumber: true })}
            />
            <GlassInput
              label="Longitud"
              type="number"
              step="any"
              placeholder="-77.0428"
              error={errors.longitud?.message}
              {...register('longitud', { valueAsNumber: true })}
            />
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/clientes">
            <GlassButton type="button" variant="secondary">
              Cancelar
            </GlassButton>
          </Link>
          <GlassButton
            type="submit"
            loading={submitting}
            icon={<Save className="h-4 w-4" />}
          >
            Guardar Cliente
          </GlassButton>
        </div>
      </form>
    </div>
  );
}
