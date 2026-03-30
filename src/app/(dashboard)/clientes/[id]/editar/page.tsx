'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { clienteSchema, ClienteFormData } from '@/lib/validators/client.schema';
import { getClienteById, updateCliente } from '@/lib/services/client-service';
import { getZonas } from '@/lib/services/zone-service';
import { useAuth } from '@/lib/hooks/use-auth';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import GlassSelect from '@/components/ui/glass-select';
import UbigeoCascader from '@/components/forms/ubigeo-cascader';
import { ArrowLeft, Save } from 'lucide-react';
import { FullPageLoader } from '@/components/shared/loading-skeleton';
import type { Zona } from '@/lib/types';

const tipoDocumentoOptions = [
  { value: 'DNI', label: 'DNI' },
  { value: 'RUC', label: 'RUC' },
  { value: 'CE', label: 'Carnet de Extranjeria' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loadingZonas, setLoadingZonas] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  });

  const departamentoId = watch('departamentoId');
  const provinciaId = watch('provinciaId');
  const distritoId = watch('distritoId');

  const [ubigeoValues, setUbigeoValues] = useState({
    departamentoId: '',
    provinciaId: '',
    distritoId: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const cliente = await getClienteById(id);
        if (!cliente) {
          toast.error('Cliente no encontrado');
          router.push('/clientes');
          return;
        }
        reset({
          tipoDocumento: cliente.tipoDocumento as 'DNI' | 'RUC' | 'CE' | 'PASAPORTE',
          numeroDocumento: cliente.numeroDocumento,
          nombreCompleto: cliente.nombreCompleto,
          telefono: cliente.telefono || '',
          email: cliente.email || '',
          direccion: cliente.direccion,
          departamentoId: cliente.departamentoId,
          provinciaId: cliente.provinciaId,
          distritoId: cliente.distritoId,
          zonaId: cliente.zonaId,
          referencia: cliente.referencia || '',
          latitud: cliente.latitud,
          longitud: cliente.longitud,
        });
        setUbigeoValues({
          departamentoId: cliente.departamentoId,
          provinciaId: cliente.provinciaId,
          distritoId: cliente.distritoId,
        });
        // Load zonas for this distrito
        if (cliente.distritoId) {
          const zonasData = await getZonas({ distritoId: cliente.distritoId, activo: true });
          setZonas(zonasData);
        }
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar el cliente');
      } finally {
        setLoadingData(false);
      }
    }
    if (id) load();
  }, [id, reset, router]);

  // Reload zonas when distrito changes (after initial load)
  useEffect(() => {
    if (loadingData || !distritoId) return;
    setLoadingZonas(true);
    getZonas({ distritoId, activo: true })
      .then((data) => setZonas(data))
      .catch(() => setZonas([]))
      .finally(() => setLoadingZonas(false));
  }, [distritoId, loadingData]);

  const onSubmit = async (data: ClienteFormData) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await updateCliente(id, {
        ...data,
        estado: 'activo',
      }, user.id);
      toast.success('Cliente actualizado exitosamente');
      router.push(`/clientes/${id}`);
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el cliente');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) return <FullPageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/clientes/${id}`}>
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>Volver</GlassButton>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Editar Cliente</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Modificar datos del cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Datos Personales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <GlassSelect label="Tipo de Documento" options={tipoDocumentoOptions} error={errors.tipoDocumento?.message} {...register('tipoDocumento')} />
            <GlassInput label="Numero de Documento" placeholder="Ingrese numero" error={errors.numeroDocumento?.message} {...register('numeroDocumento')} />
            <GlassInput label="Nombre Completo" placeholder="Nombre completo" error={errors.nombreCompleto?.message} {...register('nombreCompleto')} />
            <GlassInput label="Telefono" placeholder="Numero de telefono" error={errors.telefono?.message} {...register('telefono')} />
            <GlassInput label="Email" type="email" placeholder="correo@ejemplo.com" error={errors.email?.message} {...register('email')} />
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Ubicacion</h2>
          <div className="space-y-4">
            <UbigeoCascader
              departamentoId={ubigeoValues.departamentoId}
              provinciaId={ubigeoValues.provinciaId}
              distritoId={ubigeoValues.distritoId}
              onChange={(values) => {
                setValue('departamentoId', values.departamentoId, { shouldValidate: true });
                setValue('provinciaId', values.provinciaId, { shouldValidate: true });
                setValue('distritoId', values.distritoId, { shouldValidate: true });
                setUbigeoValues(values);
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
              <GlassInput label="Direccion" placeholder="Direccion del cliente" error={errors.direccion?.message} {...register('direccion')} />
            </div>
            <GlassInput label="Referencia" placeholder="Referencia de ubicacion" error={errors.referencia?.message} {...register('referencia')} />
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Coordenadas GPS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput label="Latitud" type="number" step="any" placeholder="-12.0464" error={errors.latitud?.message} {...register('latitud', { valueAsNumber: true })} />
            <GlassInput label="Longitud" type="number" step="any" placeholder="-77.0428" error={errors.longitud?.message} {...register('longitud', { valueAsNumber: true })} />
          </div>
        </GlassCard>

        <div className="flex items-center justify-end gap-3">
          <Link href={`/clientes/${id}`}>
            <GlassButton type="button" variant="secondary">Cancelar</GlassButton>
          </Link>
          <GlassButton type="submit" loading={submitting} icon={<Save className="h-4 w-4" />}>Guardar Cambios</GlassButton>
        </div>
      </form>
    </div>
  );
}
