'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Search } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import GlassSelect from '@/components/ui/glass-select';
import UbigeoCascader from '@/components/forms/ubigeo-cascader';
import { useAuth } from '@/lib/hooks/use-auth';
import { getMedidorById, updateMedidor } from '@/lib/services/meter-service';
import { searchClientes, getClienteById } from '@/lib/services/client-service';
import { getZonas, getZonaById } from '@/lib/services/zone-service';
import { medidorSchema, type MedidorFormData } from '@/lib/validators/meter.schema';
import { FullPageLoader } from '@/components/shared/loading-skeleton';
import type { Cliente, Zona } from '@/lib/types';

const tipoOptions = [
  { value: 'mecanico', label: 'Mecánico' },
  { value: 'digital', label: 'Digital' },
  { value: 'inteligente', label: 'Inteligente' },
];

const estadoOptions = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'dañado', label: 'Dañado' },
  { value: 'retirado', label: 'Retirado' },
  { value: 'por_instalar', label: 'Por instalar' },
];

export default function EditarMedidorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Cliente search state
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteResults, setClienteResults] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);

  // Zona search state
  const [zonaSearch, setZonaSearch] = useState('');
  const [zonaResults, setZonaResults] = useState<Zona[]>([]);
  const [selectedZona, setSelectedZona] = useState<Zona | null>(null);
  const [showZonaDropdown, setShowZonaDropdown] = useState(false);
  const [zonasLoaded, setZonasLoaded] = useState<Zona[]>([]);

  // Ubigeo state
  const [ubigeoValues, setUbigeoValues] = useState({
    departamentoId: '',
    provinciaId: '',
    distritoId: '',
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MedidorFormData>({
    resolver: zodResolver(medidorSchema),
  });

  useEffect(() => {
    async function load() {
      try {
        const medidor = await getMedidorById(id);
        if (!medidor) {
          toast.error('Medidor no encontrado');
          router.push('/medidores');
          return;
        }
        reset({
          numeroMedidor: medidor.numeroMedidor,
          marca: medidor.marca || '',
          modelo: medidor.modelo || '',
          tipo: medidor.tipo as 'mecanico' | 'digital' | 'inteligente',
          diametro: medidor.diametro || '',
          clienteId: medidor.clienteId,
          zonaId: medidor.zonaId,
          direccionInstalacion: medidor.direccionInstalacion,
          latitud: medidor.latitud,
          longitud: medidor.longitud,
          estado: medidor.estado as 'activo' | 'inactivo' | 'dañado' | 'retirado' | 'por_instalar',
          lecturaInstalacion: medidor.lecturaInstalacion || 0,
          departamentoId: medidor.departamentoId || '',
          provinciaId: medidor.provinciaId || '',
          distritoId: medidor.distritoId || '',
        });

        // Set ubigeo values from medidor (or fallback to zona's ubigeo)
        let depId = medidor.departamentoId || '';
        let provId = medidor.provinciaId || '';
        let distId = medidor.distritoId || '';

        // Load cliente info
        if (medidor.clienteId) {
          const cliente = await getClienteById(medidor.clienteId);
          if (cliente) {
            setSelectedCliente(cliente);
            setClienteSearch(cliente.nombreCompleto);
          }
        }

        // Load zona info and fallback ubigeo from zona if not on medidor
        if (medidor.zonaId) {
          const zona = await getZonaById(medidor.zonaId);
          if (zona) {
            setSelectedZona(zona);
            setZonaSearch(zona.nombre);
            // If medidor doesn't have ubigeo, use zona's ubigeo
            if (!depId && zona.departamentoId) depId = zona.departamentoId;
            if (!provId && zona.provinciaId) provId = zona.provinciaId;
            if (!distId && zona.distritoId) distId = zona.distritoId;
          }
        }

        setUbigeoValues({ departamentoId: depId, provinciaId: provId, distritoId: distId });

        // Load zonas for the distrito
        if (distId) {
          try {
            const zonas = await getZonas({ distritoId: distId, activo: true });
            setZonasLoaded(zonas);
          } catch { /* ignore */ }
        }
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar el medidor');
      } finally {
        setLoadingData(false);
      }
    }
    if (id) load();
  }, [id, reset, router, setValue]);

  // Search clientes
  const handleSearchCliente = useCallback(async (term: string) => {
    setClienteSearch(term);
    if (term.length < 2) {
      setClienteResults([]);
      setShowClienteDropdown(false);
      return;
    }
    try {
      const results = await searchClientes(term);
      setClienteResults(results);
      setShowClienteDropdown(results.length > 0);
    } catch {
      setClienteResults([]);
    }
  }, []);

  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setClienteSearch(cliente.nombreCompleto);
    setValue('clienteId', cliente.id);
    setShowClienteDropdown(false);
  };

  // Load zonas when ubigeo changes
  const handleUbigeoChange = useCallback(async (vals: { departamentoId: string; provinciaId: string; distritoId: string }) => {
    setUbigeoValues(vals);
    setSelectedZona(null);
    setZonaSearch('');
    setValue('zonaId', '');
    setValue('departamentoId', vals.departamentoId);
    setValue('provinciaId', vals.provinciaId);
    setValue('distritoId', vals.distritoId);

    if (vals.distritoId) {
      try {
        const zonas = await getZonas({ distritoId: vals.distritoId, activo: true });
        setZonasLoaded(zonas);
      } catch {
        setZonasLoaded([]);
      }
    } else {
      setZonasLoaded([]);
    }
  }, [setValue]);

  // Search zonas (filter from loaded zonas)
  const handleSearchZona = useCallback((term: string) => {
    setZonaSearch(term);
    if (term.length < 1) {
      setZonaResults(zonasLoaded);
      setShowZonaDropdown(zonasLoaded.length > 0);
      return;
    }
    const lower = term.toLowerCase();
    const filtered = zonasLoaded.filter(
      (z) =>
        (z.nombre || '').toLowerCase().includes(lower) ||
        (z.codigo || '').toLowerCase().includes(lower) ||
        (z.descripcion || '').toLowerCase().includes(lower)
    );
    setZonaResults(filtered);
    setShowZonaDropdown(filtered.length > 0);
  }, [zonasLoaded]);

  const handleSelectZona = (zona: Zona) => {
    setSelectedZona(zona);
    setZonaSearch(zona.nombre);
    setValue('zonaId', zona.id);
    setShowZonaDropdown(false);
  };

  const onSubmit = async (data: MedidorFormData) => {
    if (!user) return;
    if (!selectedCliente) {
      toast.error('Debe seleccionar un cliente');
      return;
    }
    if (!selectedZona) {
      toast.error('Debe seleccionar una zona');
      return;
    }

    setSubmitting(true);
    try {
      await updateMedidor(id, {
        numeroMedidor: data.numeroMedidor,
        marca: data.marca || '',
        modelo: data.modelo || '',
        tipo: data.tipo,
        diametro: data.diametro || '',
        clienteId: data.clienteId,
        zonaId: data.zonaId,
        direccionInstalacion: data.direccionInstalacion,
        departamentoId: data.departamentoId || '',
        provinciaId: data.provinciaId || '',
        distritoId: data.distritoId || '',
        latitud: data.latitud,
        longitud: data.longitud,
        estado: data.estado,
        lecturaInstalacion: data.lecturaInstalacion ?? 0,
      }, user.id);
      toast.success('Medidor actualizado exitosamente');
      router.push(`/medidores/${id}`);
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el medidor');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) return <FullPageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/medidores/${id}`}>
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>Volver</GlassButton>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Editar Medidor</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Modificar datos del medidor</p>
        </div>
      </div>

      <GlassCard hover={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Datos del Medidor */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Datos del Medidor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GlassInput label="Número de Medidor" placeholder="Ej: MED-001" error={errors.numeroMedidor?.message} {...register('numeroMedidor')} />
              <GlassInput label="Marca" placeholder="Ej: Zenner" error={errors.marca?.message} {...register('marca')} />
              <GlassInput label="Modelo" placeholder="Ej: MTKD-N" error={errors.modelo?.message} {...register('modelo')} />
              <GlassSelect label="Tipo" options={tipoOptions} error={errors.tipo?.message} {...register('tipo')} />
              <GlassInput label="Diámetro" placeholder='Ej: 1/2"' error={errors.diametro?.message} {...register('diametro')} />
            </div>
          </div>

          {/* Ubicación Geográfica */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Ubicación Geográfica{' '}
              <span className="text-sm text-[var(--text-tertiary)] font-normal">(Opcional)</span>
            </h2>
            <UbigeoCascader
              departamentoId={ubigeoValues.departamentoId}
              provinciaId={ubigeoValues.provinciaId}
              distritoId={ubigeoValues.distritoId}
              onChange={handleUbigeoChange}
            />
          </div>

          {/* Asignación */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Asignación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente search */}
              <div className="relative">
                <GlassInput
                  label="Cliente"
                  value={clienteSearch}
                  onChange={(e) => handleSearchCliente(e.target.value)}
                  placeholder="Buscar por nombre o documento..."
                  error={errors.clienteId?.message}
                  icon={<Search className="h-4 w-4" />}
                />
                {showClienteDropdown && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-white/10 bg-[var(--bg-primary)] backdrop-blur-xl shadow-lg max-h-48 overflow-y-auto">
                    {clienteResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between"
                        onClick={() => handleSelectCliente(c)}
                      >
                        <div>
                          <span className="text-[var(--text-primary)]">{c.nombreCompleto}</span>
                        </div>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {c.tipoDocumento}: {c.numeroDocumento}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedCliente && (
                  <p className="text-xs text-[#30D158] mt-1">
                    {selectedCliente.nombreCompleto} — {selectedCliente.tipoDocumento}: {selectedCliente.numeroDocumento}
                  </p>
                )}
                <input type="hidden" {...register('clienteId')} />
              </div>

              {/* Zona search */}
              <div className="relative">
                <GlassInput
                  label="Zona"
                  value={zonaSearch}
                  onChange={(e) => handleSearchZona(e.target.value)}
                  onFocus={() => {
                    if (zonasLoaded.length > 0) {
                      setZonaResults(zonasLoaded);
                      setShowZonaDropdown(true);
                    }
                  }}
                  placeholder={ubigeoValues.distritoId ? 'Buscar zona por nombre...' : 'Seleccione ubicación primero'}
                  disabled={!ubigeoValues.distritoId}
                  error={errors.zonaId?.message}
                  icon={<Search className="h-4 w-4" />}
                />
                {showZonaDropdown && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-white/10 bg-[var(--bg-primary)] backdrop-blur-xl shadow-lg max-h-48 overflow-y-auto">
                    {zonaResults.length === 0 ? (
                      <div className="px-4 py-2.5 text-sm text-[var(--text-tertiary)]">
                        No se encontraron zonas
                      </div>
                    ) : (
                      zonaResults.map((z) => (
                        <button
                          key={z.id}
                          type="button"
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between"
                          onClick={() => handleSelectZona(z)}
                        >
                          <span className="text-[var(--text-primary)]">{z.nombre}</span>
                          <span className="text-xs text-[var(--text-tertiary)]">{z.codigo}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {selectedZona && (
                  <p className="text-xs text-[#30D158] mt-1">
                    {selectedZona.nombre} ({selectedZona.codigo})
                  </p>
                )}
                <input type="hidden" {...register('zonaId')} />
              </div>
            </div>
          </div>

          {/* Instalación */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Instalación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GlassInput label="Dirección de Instalación" placeholder="Dirección completa" error={errors.direccionInstalacion?.message} {...register('direccionInstalacion')} />
              <GlassSelect label="Estado" options={estadoOptions} error={errors.estado?.message} {...register('estado')} />
              <GlassInput label="Lectura de Instalación" type="number" placeholder="0" error={errors.lecturaInstalacion?.message} {...register('lecturaInstalacion', { valueAsNumber: true })} />
            </div>
          </div>

          {/* GPS */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Coordenadas GPS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassInput label="Latitud" type="number" step="any" placeholder="-12.0464" error={errors.latitud?.message} {...register('latitud', { valueAsNumber: true })} />
              <GlassInput label="Longitud" type="number" step="any" placeholder="-77.0428" error={errors.longitud?.message} {...register('longitud', { valueAsNumber: true })} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
            <Link href={`/medidores/${id}`}>
              <GlassButton type="button" variant="secondary">Cancelar</GlassButton>
            </Link>
            <GlassButton type="submit" loading={submitting} icon={<Save className="h-4 w-4" />}>Guardar Cambios</GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
