'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Eye, EyeOff, Search } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import GlassSelect from '@/components/ui/glass-select';
import UbigeoCascader from '@/components/forms/ubigeo-cascader';
import { useAuth } from '@/lib/hooks/use-auth';
import { createUser } from '@/lib/services/user-service';
import { searchCompanies } from '@/lib/services/company-service';
import { userSchema, type UserFormData } from '@/lib/validators/user.schema';
import type { Company } from '@/lib/types';

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

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Empresa search state
  const [empresaSearch, setEmpresaSearch] = useState('');
  const [empresaResults, setEmpresaResults] = useState<Company[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Company | null>(null);
  const [showEmpresaDropdown, setShowEmpresaDropdown] = useState(false);

  // Root can create admins
  const availableRoles = user?.usertype === 'root'
    ? [{ value: 'root', label: 'Root' }, ...roleOptions]
    : roleOptions;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      companiId: user?.companiId || '',
      tipoDocumento: 'DNI',
    },
  });

  const selectedRole = watch('usertype');

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

  const onSubmit = async (data: UserFormData) => {
    if (!user) return;
    if (!data.password) {
      toast.error('La contraseña es requerida para usuarios nuevos');
      return;
    }
    if (!selectedEmpresa) {
      toast.error('Debe seleccionar una empresa');
      return;
    }

    setLoading(true);
    try {
      // Determine companiCli: if empresa is PRO, use its empresaClienteId
      let companiCli: string | undefined;
      if (selectedEmpresa.tipoEmpresa === 'PRO' && selectedEmpresa.empresaClienteId) {
        companiCli = selectedEmpresa.empresaClienteId;
      } else if (selectedEmpresa.tipoEmpresa === 'CLI') {
        companiCli = selectedEmpresa.id;
      }

      await createUser(
        {
          email: data.email,
          password: data.password,
          nombre: data.nombre,
          apellidos: data.apellidos,
          tipoDocumento: data.tipoDocumento,
          numeroDocumento: data.numeroDocumento,
          telefono: data.telefono,
          direccion: data.direccion,
          usertype: data.usertype,
          companiId: data.companiId,
          companiCli,
          departamentoId: data.departamentoId,
          provinciaId: data.provinciaId,
          distritoId: data.distritoId,
        },
        user.id
      );
      toast.success('Usuario creado exitosamente');
      router.push('/usuarios');
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code === 'auth/email-already-in-use') {
        toast.error('El correo ya está registrado');
      } else {
        console.error(err);
        toast.error('Error al crear el usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/usuarios">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Nuevo Usuario</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Registrar nuevo usuario del sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <GlassCard hover={false} padding="lg">
          <div className="space-y-6">
            {/* Cuenta */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Cuenta
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput
                  label="Correo electrónico"
                  type="email"
                  placeholder="usuario@empresa.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <div className="relative">
                  <GlassInput
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Datos personales */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Datos Personales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput
                  label="Nombre"
                  placeholder="Nombre"
                  error={errors.nombre?.message}
                  {...register('nombre')}
                />
                <GlassInput
                  label="Apellidos"
                  placeholder="Apellidos"
                  error={errors.apellidos?.message}
                  {...register('apellidos')}
                />
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
                <GlassInput
                  label="Teléfono"
                  placeholder="Opcional"
                  error={errors.telefono?.message}
                  {...register('telefono')}
                />
                <GlassInput
                  label="Dirección"
                  placeholder="Opcional"
                  error={errors.direccion?.message}
                  {...register('direccion')}
                />
              </div>
            </div>

            {/* Ubicación geográfica (opcional) */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Ubicación Geográfica <span className="text-[var(--text-tertiary)] font-normal normal-case">(Opcional)</span>
              </h3>
              <UbigeoCascader
                onChange={(vals) => {
                  setValue('departamentoId', vals.departamentoId);
                  setValue('provinciaId', vals.provinciaId);
                  setValue('distritoId', vals.distritoId);
                }}
              />
            </div>

            {/* Rol y empresa */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Rol y Empresa
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassSelect
                  label="Rol"
                  placeholder="Seleccione rol"
                  options={availableRoles}
                  error={errors.usertype?.message}
                  {...register('usertype')}
                />
                <div className="relative">
                  <GlassInput
                    label="Empresa"
                    value={empresaSearch}
                    onChange={(e) => handleSearchEmpresa(e.target.value)}
                    placeholder="Buscar empresa por nombre..."
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
                      {selectedEmpresa.tipoEmpresa === 'PRO' && ' — Se asignará empresa cliente relacionada'}
                    </p>
                  )}
                  <input type="hidden" {...register('companiId')} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Link href="/usuarios">
                <GlassButton variant="secondary" type="button">Cancelar</GlassButton>
              </Link>
              <GlassButton type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
                Crear Usuario
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </form>
    </div>
  );
}
