'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Bell,
  FileText,
  Globe,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import GlassSelect from '@/components/ui/glass-select';
import UbigeoCascader from '@/components/forms/ubigeo-cascader';
import { useAuth } from '@/lib/hooks/use-auth';
import { getCompanyById, updateCompany, createCompany } from '@/lib/services/company-service';
import type { Company } from '@/lib/types';

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [tipoEmpresa, setTipoEmpresa] = useState<string>('CLI');

  // Company data
  const [razonSocial, setRazonSocial] = useState('');
  const [ruc, setRuc] = useState('');
  const [direccionEmpresa, setDireccionEmpresa] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [provinciaId, setProvinciaId] = useState('');
  const [distritoId, setDistritoId] = useState('');

  // Alert thresholds
  const [consumoAltoAlerta, setConsumoAltoAlerta] = useState('200');
  const [consumoBajoAlerta, setConsumoBajoAlerta] = useState('20');
  const [diasLimiteLectura, setDiasLimiteLectura] = useState('25');

  // General
  const [formatoExportacion, setFormatoExportacion] = useState('CSV');
  const [zonaHoraria, setZonaHoraria] = useState('America/Lima');

  // Load existing company data
  useEffect(() => {
    async function loadCompany() {
      if (!user?.companiId) {
        setLoadingData(false);
        return;
      }
      try {
        const company = await getCompanyById(user.companiId);
        if (company) {
          setCompanyId(company.id);
          setRazonSocial(company.razonsocial || '');
          setRuc(company.ruc || '');
          setDireccionEmpresa(company.direccion || '');
          setDepartamentoId(company.departamentoId || '');
          setProvinciaId(company.provinciaId || '');
          setDistritoId(company.distritoId || '');
          setTipoEmpresa(company.tipoEmpresa || 'CLI');
          setConsumoAltoAlerta(String(company.consumoPromedioAlerta ?? 200));
          setConsumoBajoAlerta(String(company.consumoMinimoAlerta ?? 20));
          setDiasLimiteLectura(String(company.diasLimiteLectura ?? 25));
          setFormatoExportacion(company.formatoExportacion || 'CSV');
          setZonaHoraria(company.zonaHoraria || 'America/Lima');
        }
      } catch (err) {
        console.error('Error loading company:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadCompany();
  }, [user?.companiId]);

  const handleSave = async () => {
    if (!user) return;
    if (!razonSocial.trim()) {
      toast.error('La Razón Social es requerida');
      return;
    }

    setSaving(true);
    try {
      const companyData: Partial<Company> = {
        razonsocial: razonSocial.trim(),
        ruc: ruc.trim(),
        direccion: direccionEmpresa.trim(),
        departamentoId,
        provinciaId,
        distritoId,
        consumoPromedioAlerta: tipoEmpresa === 'CLI' ? parseFloat(consumoAltoAlerta) || 200 : undefined,
        consumoMinimoAlerta: tipoEmpresa === 'CLI' ? parseFloat(consumoBajoAlerta) || 20 : undefined,
        diasLimiteLectura: tipoEmpresa === 'CLI' ? parseInt(diasLimiteLectura) || 25 : undefined,
        formatoExportacion: formatoExportacion as 'CSV' | 'JSON' | 'XML',
        zonaHoraria,
        moneda: 'PEN',
      };

      if (companyId) {
        await updateCompany(companyId, companyData, user.id);
      } else {
        const newId = await createCompany(
          {
            ...companyData,
            razonsocial: razonSocial.trim(),
            ruc: ruc.trim(),
            direccion: direccionEmpresa.trim(),
            departamentoId,
            provinciaId,
            distritoId,
            tipoEmpresa: 'CLI' as const,
            activo: true,
            createdBy: user.id,
          } as Omit<Company, 'id' | 'createdAt' | 'updatedAt'>,
          user.id
        );
        setCompanyId(newId);
      }
      toast.success('Configuración guardada exitosamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0A84FF] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Configuración</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Parámetros generales del sistema</p>
        </div>
        <GlassButton icon={<Save className="h-4 w-4" />} onClick={handleSave} loading={saving}>
          Guardar Cambios
        </GlassButton>
      </div>

      {/* Company */}
      <GlassCard hover={false} padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-4.5 w-4.5 text-[#0A84FF]" />
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Datos de la Empresa
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassInput
            label="Razón Social"
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
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
            value={direccionEmpresa}
            onChange={(e) => setDireccionEmpresa(e.target.value)}
            placeholder="Dirección de la empresa"
            className="sm:col-span-2"
          />
        </div>
      </GlassCard>

      {/* Ubicación geográfica */}
      <GlassCard hover={false} padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4.5 w-4.5 text-[#64D2FF]" />
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Ubicación Geográfica
          </h3>
        </div>
        <UbigeoCascader
          departamentoId={departamentoId}
          provinciaId={provinciaId}
          distritoId={distritoId}
          onChange={(vals) => {
            setDepartamentoId(vals.departamentoId);
            setProvinciaId(vals.provinciaId);
            setDistritoId(vals.distritoId);
          }}
        />
      </GlassCard>

      {/* Alert thresholds (only for CLI companies) */}
      {tipoEmpresa === 'CLI' && (
        <GlassCard hover={false} padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-4.5 w-4.5 text-[#FF9F0A]" />
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              Umbrales de Alertas
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassInput
              label="Consumo alto (%)"
              type="number"
              value={consumoAltoAlerta}
              onChange={(e) => setConsumoAltoAlerta(e.target.value)}
              placeholder="200"
            />
            <GlassInput
              label="Consumo bajo (%)"
              type="number"
              value={consumoBajoAlerta}
              onChange={(e) => setConsumoBajoAlerta(e.target.value)}
              placeholder="20"
            />
            <GlassInput
              label="Días límite lectura"
              type="number"
              value={diasLimiteLectura}
              onChange={(e) => setDiasLimiteLectura(e.target.value)}
              placeholder="25"
            />
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Los porcentajes son relativos al promedio histórico del cliente. Un consumo alto del 200% significa que se alertará cuando el consumo supere el doble del promedio.
          </p>
        </GlassCard>
      )}

      {/* Export & General */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassCard hover={false} padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4.5 w-4.5 text-[#30D158]" />
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              Exportación
            </h3>
          </div>
          <GlassSelect
            label="Formato por defecto"
            value={formatoExportacion}
            onChange={(e) => setFormatoExportacion(e.target.value)}
            options={[
              { value: 'CSV', label: 'CSV' },
              { value: 'JSON', label: 'JSON' },
              { value: 'XML', label: 'XML' },
            ]}
          />
        </GlassCard>

        <GlassCard hover={false} padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4.5 w-4.5 text-[#BF5AF2]" />
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              Regional
            </h3>
          </div>
          <div className="space-y-4">
            <GlassSelect
              label="Zona horaria"
              value={zonaHoraria}
              onChange={(e) => setZonaHoraria(e.target.value)}
              options={[
                { value: 'America/Lima', label: 'America/Lima (UTC-5)' },
                { value: 'America/Bogota', label: 'America/Bogota (UTC-5)' },
              ]}
            />
            <GlassInput label="Moneda" value="PEN (Soles)" disabled />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
