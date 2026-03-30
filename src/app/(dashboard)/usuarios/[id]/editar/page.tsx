'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Search } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import GlassSelect from '@/components/ui/glass-select';
import UbigeoCascader from '@/components/forms/ubigeo-cascader';
import { useAuth } from '@/lib/hooks/use-auth';
import { getUserById, updateUser } from '@/lib/services/user-service';
import { searchCompanies, getCompanyById } from '@/lib/services/company-service';
import { FullPageLoader } from '@/components/shared/loading-skeleton';
import type { Company } from '@/lib/types';

const editUserSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  apellidos: z.string().min(1, 'Requerido'),
  tipoDocumento: z.enum(['DNI', 'RUC', 'CE', 'PASAPORTE']).optional(),
  numeroDocumento: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  usertype: z.enum(['root', 'administrador', 'supervisor', 'operario', 'lector']),
  companiId: z.string().min(1, 'Seleccione empresa'),
  activo: z.boolean(),
  departamentoId: z.string().optional(),
  provinciaId: z.string().optional(),
  distritoId: z.string().optional(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

const roleOptions = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'operario', label: 'Operario' },
  { value: 'lector', label: 'Lector' },
];

const tipoDocumentoOptions = [
  { value: 'DNI', label: 'DNI' },
  { value: 'RUC', label: 'RUC' },
  { value: 'CE', label: 'Carnet de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [email, setEmail] = useState('');

  // Empresa search
  const [empresaSearch, setEmpresaSearch] = useState('');
  const [empresaResults, setEmpresaResults] = useState<Company[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Company | null>(null);
  const [showEmpresaDropdown, setShowEmpresaDropdown] = useState(false);

  const availableRoles = user?.usertype === 'root'
    ? [{ value: 'root', label: 'Root' }, ...roleOptions]
    : roleOptions;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  const [ubigeoValues, setUbigeoValues] = useState({
    departamentoId: '',
    provinciaId: '',
    distritoId: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const userData = await getUserById(id);
        if (!userData) {
          toast.error('Usuario no encontrado');
          router.push('/usuarios');
          return;
        }
        setEmail(userData.email);
        reset({
          nombre: userData.nombre,
          apellidos: userData.apellidos,
          tipoDocumento: (userData.tipoDocumento as EditUserFormData['tipoDocumento']) || 'DNI',
          numeroDocumento: userData.numeroDocumento || '',
          telefono: userData.telefono || '',
          direccion: userData.direccion || '',
          usertype: userData.usertype as EditUserFormData['usertype'],
          companiId: userData.companiId,
          activo: userData.activo ?? true,
          departamentoId: userData.departamentoId || '',
          provinciaId: userData.provinciaId || '',
          distritoId: userData.distritoId || '',
        });
        setUbigeoValues({
          departamentoId: userData.departamentoId || '',
          provinciaId: userData.provinciaId || '',
          distritoId: userData.distritoId || '',
        });

        // Load empresa info
        if (userData.companiId) {
          const company = await getCompanyById(userData.companiId);
          if (company) {
            setSelectedEmpresa(company);
            setEmpresaSearch(company.razonsocial);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar el usuario');
      } finally {
        setLoadingData(false);
      }
    }
    if (id) load();
  }, [id, reset, router]);

  const handleSearchEmpresa = useCallback(async (term: string) => {
    setEmpresaSearch(term);
    if (term.length < 2) {
      setEmpresaResults([]);
      setShowEmpresaDropdown(false);
      return;
    }
    try {
      const results = await searchCompanies(term);
      setEmpresaResults(results);
      setShowEmpresaDropdown(results.length > 0);
    } catch {
      setEmpresaResults([]);
    }
  }, []);

  const handleSelectEmpresa = (company: Company) => {
    setSelectedEmpresa(company);
    setEmpresaSearch(company.razonsocial);
    setValue('companiId', company.id);
    setShowEmpresaDropdown(false);
  };

  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return;
    if (!selectedEmpresa) {
      toast.error('Debe seleccionar una empresa');
      return;
    }

    // Determine companiCli
    let companiCli: string | undefined;
    if (selectedEmpresa.tipoEmpresa === 'PRO' && selectedEmpresa.empresaClienteId) {
      companiCli = selectedEmpresa.empresaClienteId;
    } else if (selectedEmpresa.tipoEmpresa === 'CLI') {
      companiCli = selectedEmpresa.id;
    }

    setLoading(true);
    try {
      await updateUser(id, {
        nombre: data.nombre,
        apellidos: data.apellidos,
        tipoDocumento: data.tipoDocumento || '',
        numeroDocumento: data.numeroDocumento || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
        usertype: data.usertype,
        companiId: data.companiId,
        companiCli: companiCli || '',
        activo: data.activo,
        departamentoId: data.departamentoId || '',
        provinciaId: data.provinciaId || '',
        distritoId: data.distritoId || '',
      }, user.id);
      toast.success('Usuario actualizado exitosamente');
      router.push(`/usuarios/${id}`);
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar el usuario');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <FullPageLoader />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href={`/usuarios/${id}`}>
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Editar Usuario</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">{email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <GlassCard hover={false} padding="lg">
          <div className="space-y-6">
            {/* Datos personales */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">Datos Personales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput label="Nombre" placeholder="Nombre" error={errors.nombre?.message} {...register('nombre')} />
                <GlassInput label="Apellidos" placeholder="Apellidos" error={errors.apellidos?.message} {...register('apellidos')} />
                <GlassSelect
                  label="Tipo de Documento"
                  options={tipoDocumentoOptions}
                  error={errors.tipoDocumento?.message}
                  {...register('tipoDocumento')}
                />
                <GlassInput
                  label="Número de Documento"
                  placeholder="Número de documento"
                  error={errors.numeroDocumento?.message}
                  {...register('numeroDocumento')}
                />
                <GlassInput label="Teléfono" placeholder="Opcional" error={errors.telefono?.message} {...register('telefono')} />
                <GlassInput label="Dirección" placeholder="Opcional" error={errors.direccion?.message} {...register('direccion')} />
              </div>
            </div>

            {/* Ubicación geográfica */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Ubicación Geográfica <span className="text-[var(--text-tertiary)] font-normal normal-case">(Opcional)</span>
              </h3>
              <UbigeoCascader
                departamentoId={ubigeoValues.departamentoId}
                provinciaId={ubigeoValues.provinciaId}
                distritoId={ubigeoValues.distritoId}
                onChange={(vals) => {
                  setValue('departamentoId', vals.departamentoId);
                  setValue('provinciaId', vals.provinciaId);
                  setValue('distritoId', vals.distritoId);
                  setUbigeoValues(vals);
                }}
              />
            </div>

            {/* Rol, empresa, estado */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">Rol, Empresa y Estado</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GlassSelect label="Rol" placeholder="Seleccione rol" options={availableRoles} error={errors.usertype?.message} {...register('usertype')} />
                <div className="relative">
                  <GlassInput
                    label="Empresa"
                    value={empresaSearch}
                    onChange={(e) => handleSearchEmpresa(e.target.value)}
                    placeholder="Buscar empresa..."
                    error={errors.companiId?.message}
                    icon={<Search className="h-4 w-4" />}
                  />
                  {showEmpresaDropdown && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-white/10 bg-[var(--bg-primary)] backdrop-blur-xl shadow-lg max-h-48 overflow-y-auto">
                      {empresaResults.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between"
                          onClick={() => handleSelectEmpresa(c)}
                        >
                          <div>
                            <span className="text-[var(--text-primary)]">{c.razonsocial}</span>
                            <span className="ml-2 text-xs text-[var(--text-tertiary)]">
                              ({c.tipoEmpresa === 'CLI' ? 'Cliente' : 'Proveedora'})
                            </span>
                          </div>
                          <span className="text-xs text-[var(--text-tertiary)]">RUC: {c.ruc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedEmpresa && (
                    <p className="text-xs text-[#30D158] mt-1">
                      {selectedEmpresa.razonsocial} ({selectedEmpresa.tipoEmpresa === 'CLI' ? 'Cliente' : 'Proveedora'})
                    </p>
                  )}
                  <input type="hidden" {...register('companiId')} />
                </div>
                <GlassSelect
                  label="Estado"
                  options={[
                    { value: 'true', label: 'Activo' },
                    { value: 'false', label: 'Inactivo' },
                  ]}
                  value={watch('activo') ? 'true' : 'false'}
                  onChange={(e) => setValue('activo', e.target.value === 'true')}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <Link href={`/usuarios/${id}`}>
                <GlassButton variant="secondary" type="button">Cancelar</GlassButton>
              </Link>
              <GlassButton type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>Guardar Cambios</GlassButton>
            </div>
          </div>
        </GlassCard>
      </form>
    </div>
  );
}
