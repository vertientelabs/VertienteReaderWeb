'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { createMedidor } from '@/lib/services/meter-service';
import { searchClientes } from '@/lib/services/client-service';
import { getZonas } from '@/lib/services/zone-service';
import { medidorSchema, type MedidorFormData } from '@/lib/validators/meter.schema';
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

export default function NuevoMedidorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

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
    formState: { errors },
  } = useForm<MedidorFormData>({
    resolver: zodResolver(medidorSchema),
    defaultValues: {
      tipo: 'mecanico',
      estado: 'por_instalar',
      latitud: 0,
      longitud: 0,
      lecturaInstalacion: 0,
    },
  });

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
    // Reset zona selection when ubigeo changes
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
    if (!user) {
      toast.error('No se pudo identificar al usuario');
      return;
    }
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
      await createMedidor(
        {
          ...data,
          lecturaAnterior: data.lecturaInstalacion ?? 0,
          estadoLectura: 'pendiente' as const,
          companiId: user.companiCli || user.companiId,
          createdBy: user.id,
        },
        user.id
      );
      toast.success('Medidor creado exitosamente');
      router.push('/medidores');
    } catch (error) {
      console.error('Error creating medidor:', error);
      toast.error('Error al crear el medidor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/medidores">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Volver
          </GlassButton>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Nuevo Medidor</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Registrar un nuevo medidor de agua
          </p>
        </div>
      </div>

      <GlassCard hover={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Datos del Medidor */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Datos del Medidor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GlassInput
                label="Número de Medidor"
                placeholder="Ej: MED-001"
                error={errors.numeroMedidor?.message}
                {...register('numeroMedidor')}
              />
              <GlassInput
                label="Marca"
                placeholder="Ej: Zenner"
                error={errors.marca?.message}
                {...register('marca')}
              />
              <GlassInput
                label="Modelo"
                placeholder="Ej: MTKD-N"
                error={errors.modelo?.message}
                {...register('modelo')}
              />
              <GlassSelect
                label="Tipo"
                options={tipoOptions}
                error={errors.tipo?.message}
                {...register('tipo')}
              />
              <GlassInput
                label="Diámetro"
                placeholder='Ej: 1/2"'
                error={errors.diametro?.message}
                {...register('diametro')}
              />
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
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Asignación
            </h2>
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
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Instalación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GlassInput
                label="Dirección de Instalación"
                placeholder="Dirección completa"
                error={errors.direccionInstalacion?.message}
                {...register('direccionInstalacion')}
              />
              <GlassSelect
                label="Estado"
                options={estadoOptions}
                error={errors.estado?.message}
                {...register('estado')}
              />
              <GlassInput
                label="Lectura de Instalación"
                type="number"
                placeholder="0"
                error={errors.lecturaInstalacion?.message}
                {...register('lecturaInstalacion', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* GPS */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Coordenadas GPS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Link href="/medidores">
              <GlassButton type="button" variant="ghost">
                Cancelar
              </GlassButton>
            </Link>
            <GlassButton
              type="submit"
              loading={submitting}
              icon={<Save className="h-4 w-4" />}
            >
              Guardar Medidor
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
