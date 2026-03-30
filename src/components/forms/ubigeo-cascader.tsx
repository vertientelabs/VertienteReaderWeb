'use client';

import GlassSelect from '@/components/ui/glass-select';
import { useUbigeo } from '@/lib/hooks/use-ubigeo';
import { useEffect, useRef } from 'react';

interface UbigeoCascaderProps {
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
  onChange: (values: { departamentoId: string; provinciaId: string; distritoId: string }) => void;
  errors?: { departamentoId?: string; provinciaId?: string; distritoId?: string };
  disabled?: boolean;
}

export default function UbigeoCascader({
  departamentoId,
  provinciaId,
  distritoId,
  onChange,
  errors,
  disabled,
}: UbigeoCascaderProps) {
  const {
    departamentos,
    provincias,
    distritos,
    selectedDepartamento,
    selectedProvincia,
    selectedDistrito,
    setSelectedDepartamento,
    setSelectedProvincia,
    setSelectedDistrito,
    syncValues,
  } = useUbigeo();

  // Sync external values on mount (for edit forms)
  const didSync = useRef(false);
  useEffect(() => {
    if (!didSync.current && departamentoId) {
      didSync.current = true;
      syncValues(departamentoId, provinciaId || '', distritoId || '');
    }
  }, [departamentoId, provinciaId, distritoId, syncValues]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <GlassSelect
        label="Departamento"
        placeholder="Seleccione..."
        disabled={disabled}
        value={selectedDepartamento}
        options={departamentos.map((d) => ({ value: d.id, label: d.nombre }))}
        error={errors?.departamentoId}
        onChange={(e) => {
          const val = e.target.value;
          setSelectedDepartamento(val);
          onChange({ departamentoId: val, provinciaId: '', distritoId: '' });
        }}
      />
      <GlassSelect
        label="Provincia"
        placeholder="Seleccione..."
        disabled={disabled || !selectedDepartamento}
        value={selectedProvincia}
        options={provincias.map((p) => ({ value: p.id, label: p.nombre }))}
        error={errors?.provinciaId}
        onChange={(e) => {
          const val = e.target.value;
          setSelectedProvincia(val);
          onChange({ departamentoId: selectedDepartamento, provinciaId: val, distritoId: '' });
        }}
      />
      <GlassSelect
        label="Distrito"
        placeholder="Seleccione..."
        disabled={disabled || !selectedProvincia}
        value={selectedDistrito}
        options={distritos.map((d) => ({ value: d.id, label: d.nombre }))}
        error={errors?.distritoId}
        onChange={(e) => {
          const val = e.target.value;
          setSelectedDistrito(val);
          onChange({ departamentoId: selectedDepartamento, provinciaId: selectedProvincia, distritoId: val });
        }}
      />
    </div>
  );
}
