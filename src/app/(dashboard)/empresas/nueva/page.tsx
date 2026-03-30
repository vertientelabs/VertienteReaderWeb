'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Search } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import GlassSelect from '@/components/ui/glass-select';
import UbigeoCascader from '@/components/forms/ubigeo-cascader';
import { useAuth } from '@/lib/hooks/use-auth';
import { createCompany, updateCompany, searchCompanies } from '@/lib/services/company-service';
import type { Company } from '@/lib/types';

const tipoOptions = [
  { value: 'CLI', label: 'CLI - Empresa Cliente' },
  { value: 'PRO', label: 'PRO - Empresa Proveedora' },
];

export default function NuevaEmpresaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [razonsocial, setRazonsocial] = useState('');
  const [ruc, setRuc] = useState('');
  const [direccion, setDireccion] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [provinciaId, setProvinciaId] = useState('');
  const [distritoId, setDistritoId] = useState('');
  const [tipoEmpresa, setTipoEmpresa] = useState('CLI');

  // Alert thresholds (only for CLI)
  const [consumoAlto, setConsumoAlto] = useState('200');
  const [consumoBajo, setConsumoBajo] = useState('20');
  const [diasLimite, setDiasLimite] = useState('25');
  const [formatoExportacion, setFormatoExportacion] = useState('CSV');
  const [zonaHoraria, setZonaHoraria] = useState('America/Lima');

  // Empresa cliente search (for PRO type)
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteResults, setClienteResults] = useState<Company[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Company | null>(null);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);

  const handleSearchCliente = useCallback(async (term: string) => {
    setClienteSearch(term);
    if (term.length < 2) {
      setClienteResults([]);
      setShowClienteDropdown(false);
      return;
    }
    try {
      const results = await searchCompanies(term, 'CLI');
      setClienteResults(results);
      setShowClienteDropdown(results.length > 0);
    } catch {
      setClienteResults([]);
    }
  }, []);

  const handleSelectCliente = (company: Company) => {
    setSelectedCliente(company);
    setClienteSearch(company.razonsocial);
    setShowClienteDropdown(false);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!razonsocial.trim()) {
      toast.error('La Razón Social es requerida');
      return;
    }
    if (!ruc.trim()) {
      toast.error('El RUC es requerido');
      return;
    }
    if (tipoEmpresa === 'PRO' && !selectedCliente) {
      toast.error('Debe seleccionar una empresa cliente relacionada');
      return;
    }

    setLoading(true);
    try {
      // companiCli: CLI = own id (set after creation), PRO = empresa cliente id
      const companiCliValue = tipoEmpresa === 'PRO' ? selectedCliente?.id : undefined;

      const newId = await createCompany(
        {
          razonsocial: razonsocial.trim(),
          ruc: ruc.trim(),
          direccion: direccion.trim(),
          departamentoId,
          provinciaId,
          distritoId,
          tipoEmpresa: tipoEmpresa as 'CLI' | 'PRO',
          empresaClienteId: tipoEmpresa === 'PRO' ? selectedCliente?.id : undefined,
          companiCli: companiCliValue,
          consumoPromedioAlerta: tipoEmpresa === 'CLI' ? parseFloat(consumoAlto) || 200 : undefined,
          consumoMinimoAlerta: tipoEmpresa === 'CLI' ? parseFloat(consumoBajo) || 20 : undefined,
          diasLimiteLectura: tipoEmpresa === 'CLI' ? parseInt(diasLimite) || 25 : undefined,
          formatoExportacion: formatoExportacion as 'CSV' | 'JSON' | 'XML',
          zonaHoraria,
          moneda: 'PEN',
          activo: true,
          createdBy: user.id,
        },
        user.id
      );

      // For CLI companies, companiCli = own ID (need to update after creation)
      if (tipoEmpresa === 'CLI') {
        await updateCompany(newId, { companiCli: newId } as Partial<Company>, user.id);
      }

      toast.success('Empresa creada exitosamente');
      router.push('/empresas');
    } catch (err) {
      console.error(err);
      toast.error('Error al crear la empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/empresas">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Nueva Empresa</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Registrar nueva empresa en el sistema</p>
        </div>
      </div>

      <GlassCard hover={false} padding="lg">
        <div className="space-y-6">
          {/* Tipo de empresa */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
              Tipología
            </h3>
            <GlassSelect
              label="Tipo de Empresa"
              value={tipoEmpresa}
              onChange={(e) => {
                setTipoEmpresa(e.target.value);
                if (e.target.value === 'CLI') {
                  setSelectedCliente(null);
                  setClienteSearch('');
                }
              }}
              options={tipoOptions}
            />
          </div>

          {/* Datos de la empresa */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
              Datos de la Empresa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassInput
                label="Razón Social"
                value={razonsocial}
                onChange={(e) => setRazonsocial(e.target.value)}
                placeholder="Nombre de la empresa"
              />
              <GlassInput
                label="RUC"
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
                placeholder="20XXXXXXXXX"
              />
              <GlassInput
                label="Dirección"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección de la empresa"
                className="sm:col-span-2"
              />
            </div>
          </div>

          {/* Ubicación geográfica */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
              Ubicación Geográfica
            </h3>
            <UbigeoCascader
              onChange={(vals) => {
                setDepartamentoId(vals.departamentoId);
                setProvinciaId(vals.provinciaId);
                setDistritoId(vals.distritoId);
              }}
            />
          </div>

          {/* Empresa cliente (only for PRO) */}
          {tipoEmpresa === 'PRO' && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Empresa Cliente Relacionada
              </h3>
              <div className="relative">
                <GlassInput
                  label="Buscar Empresa Cliente"
                  value={clienteSearch}
                  onChange={(e) => handleSearchCliente(e.target.value)}
                  placeholder="Escriba el nombre de la empresa cliente..."
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
                        <span className="text-[var(--text-primary)]">{c.razonsocial}</span>
                        <span className="text-xs text-[var(--text-tertiary)]">RUC: {c.ruc}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedCliente && (
                  <p className="text-xs text-[#30D158] mt-1">
                    Seleccionada: {selectedCliente.razonsocial} (RUC: {selectedCliente.ruc})
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Umbrales de alerta (only for CLI) */}
          {tipoEmpresa === 'CLI' && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Umbrales de Alertas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GlassInput
                  label="Consumo alto (%)"
                  type="number"
                  value={consumoAlto}
                  onChange={(e) => setConsumoAlto(e.target.value)}
                  placeholder="200"
                />
                <GlassInput
                  label="Consumo bajo (%)"
                  type="number"
                  value={consumoBajo}
                  onChange={(e) => setConsumoBajo(e.target.value)}
                  placeholder="20"
                />
                <GlassInput
                  label="Días límite lectura"
                  type="number"
                  value={diasLimite}
                  onChange={(e) => setDiasLimite(e.target.value)}
                  placeholder="25"
                />
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-3">
                Los porcentajes son relativos al promedio histórico del cliente.
              </p>
            </div>
          )}

          {/* Configuración general */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
              Configuración General
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassSelect
                label="Formato exportación"
                value={formatoExportacion}
                onChange={(e) => setFormatoExportacion(e.target.value)}
                options={[
                  { value: 'CSV', label: 'CSV' },
                  { value: 'JSON', label: 'JSON' },
                  { value: 'XML', label: 'XML' },
                ]}
              />
              <GlassSelect
                label="Zona horaria"
                value={zonaHoraria}
                onChange={(e) => setZonaHoraria(e.target.value)}
                options={[
                  { value: 'America/Lima', label: 'America/Lima (UTC-5)' },
                  { value: 'America/Bogota', label: 'America/Bogota (UTC-5)' },
                ]}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Link href="/empresas">
              <GlassButton variant="secondary" type="button">Cancelar</GlassButton>
            </Link>
            <GlassButton onClick={handleSubmit} loading={loading} icon={<Save className="h-4 w-4" />}>
              Crear Empresa
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
