'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { departamentosCol, provinciasCol, distritosCol } from '../firebase/collections';
import { db } from '../firebase/config';
import type { Departamento, Provincia, Distrito } from '../types';

export function useUbigeo() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedDepartamento, setSelectedDepartamento] = useState('');
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [selectedDistrito, setSelectedDistrito] = useState('');

  // Phase tracks initialization: 'idle' | 'syncing' | 'ready'
  const phase = useRef<'idle' | 'syncing' | 'ready'>('idle');
  const pendingValues = useRef({ depId: '', provId: '', distId: '' });

  // Load departamentos on mount
  useEffect(() => {
    async function loadDepartamentos() {
      const q = query(departamentosCol, where('activo', '==', true), orderBy('nombre'));
      const snapshot = await getDocs(q);
      setDepartamentos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Departamento)));
    }
    loadDepartamentos();
  }, []);

  // Sequential cascade loader for syncing initial values
  const syncValues = useCallback(async (depId: string, provId: string, distId: string) => {
    if (!depId) return;
    phase.current = 'syncing';
    pendingValues.current = { depId, provId, distId };

    // Step 1: Set departamento
    setSelectedDepartamento(depId);

    // Step 2: Load provincias for this departamento
    try {
      const qProv = query(
        provinciasCol,
        where('departamentoId', '==', depId),
        where('activo', '==', true),
        orderBy('nombre')
      );
      const snapProv = await getDocs(qProv);
      const provList = snapProv.docs.map((d) => ({ id: d.id, ...d.data() } as Provincia));
      setProvincias(provList);

      // Step 3: Set provincia
      if (provId) {
        setSelectedProvincia(provId);

        // Step 4: Load distritos for this provincia
        const qDist = query(
          distritosCol,
          where('provinciaId', '==', provId),
          where('activo', '==', true),
          orderBy('nombre')
        );
        const snapDist = await getDocs(qDist);
        const distList = snapDist.docs.map((d) => ({ id: d.id, ...d.data() } as Distrito));
        setDistritos(distList);

        // Step 5: Set distrito
        if (distId) {
          setSelectedDistrito(distId);
        }
      }
    } catch (err) {
      console.error('[useUbigeo] Error syncing values:', err);
    }

    phase.current = 'ready';
  }, []);

  // Load provincias when departamento changes (user interaction only)
  const handleDepartamentoChange = useCallback(async (depId: string) => {
    setSelectedDepartamento(depId);
    setSelectedProvincia('');
    setSelectedDistrito('');
    setProvincias([]);
    setDistritos([]);

    if (!depId) return;

    setLoading(true);
    try {
      const q = query(
        provinciasCol,
        where('departamentoId', '==', depId),
        where('activo', '==', true),
        orderBy('nombre')
      );
      const snapshot = await getDocs(q);
      setProvincias(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Provincia)));
    } catch (err) {
      console.error('[useUbigeo] Error loading provincias:', err);
    }
    setLoading(false);
  }, []);

  // Load distritos when provincia changes (user interaction only)
  const handleProvinciaChange = useCallback(async (provId: string) => {
    setSelectedProvincia(provId);
    setSelectedDistrito('');
    setDistritos([]);

    if (!provId) return;

    setLoading(true);
    try {
      const q = query(
        distritosCol,
        where('provinciaId', '==', provId),
        where('activo', '==', true),
        orderBy('nombre')
      );
      const snapshot = await getDocs(q);
      setDistritos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Distrito)));
    } catch (err) {
      console.error('[useUbigeo] Error loading distritos:', err);
    }
    setLoading(false);
  }, []);

  const handleDistritoChange = useCallback((distId: string) => {
    setSelectedDistrito(distId);
  }, []);

  return {
    departamentos,
    provincias,
    distritos,
    selectedDepartamento,
    selectedProvincia,
    selectedDistrito,
    setSelectedDepartamento: handleDepartamentoChange,
    setSelectedProvincia: handleProvinciaChange,
    setSelectedDistrito: handleDistritoChange,
    syncValues,
    loading,
  };
}

// Utility to resolve ubigeo names from IDs
export async function resolveUbigeoNames(
  departamentoId?: string,
  provinciaId?: string,
  distritoId?: string
): Promise<{ departamento: string; provincia: string; distrito: string }> {
  const result = { departamento: '—', provincia: '—', distrito: '—' };

  const promises: Promise<void>[] = [];

  if (departamentoId) {
    promises.push(
      getDoc(doc(db, 'departamentos', departamentoId))
        .then((snap) => {
          if (snap.exists()) result.departamento = snap.data().nombre || departamentoId;
        })
        .catch(() => { result.departamento = departamentoId; })
    );
  }

  if (provinciaId) {
    promises.push(
      getDoc(doc(db, 'provincias', provinciaId))
        .then((snap) => {
          if (snap.exists()) result.provincia = snap.data().nombre || provinciaId;
        })
        .catch(() => { result.provincia = provinciaId; })
    );
  }

  if (distritoId) {
    promises.push(
      getDoc(doc(db, 'distritos', distritoId))
        .then((snap) => {
          if (snap.exists()) result.distrito = snap.data().nombre || distritoId;
        })
        .catch(() => { result.distrito = distritoId; })
    );
  }

  await Promise.all(promises);
  return result;
}
