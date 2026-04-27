'use client';

import { useEffect, useState } from 'react';
import { Database, Users, CheckCircle2, AlertTriangle, Loader2, MapPin } from 'lucide-react';
import { Timestamp, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { db } from '@/lib/firebase/config';
import { useAuth, useHasRole } from '@/lib/hooks/use-auth';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import Breadcrumb from '@/components/layout/breadcrumb';
import type { Zona } from '@/lib/types';

// =====================================================
// Datos ficticios para generar clientes de Trujillo
// =====================================================

const NOMBRES_HOMBRE = [
  'Alonso', 'Carlos', 'Diego', 'Eduardo', 'Fernando', 'Gabriel', 'Hugo', 'Ivan',
  'Jorge', 'Luis', 'Manuel', 'Nicolas', 'Oscar', 'Pedro', 'Raul', 'Sergio',
  'Tomas', 'Victor', 'Walter', 'Adrian', 'Bruno', 'Cesar', 'Daniel', 'Esteban',
  'Felipe', 'Gonzalo', 'Hector', 'Ignacio', 'Javier', 'Kevin',
];

const NOMBRES_MUJER = [
  'Ana', 'Beatriz', 'Carmen', 'Diana', 'Elena', 'Fernanda', 'Gabriela', 'Helena',
  'Isabel', 'Julia', 'Karla', 'Lucia', 'Maria', 'Natalia', 'Olga', 'Patricia',
  'Rosa', 'Sandra', 'Teresa', 'Veronica', 'Adriana', 'Brenda', 'Claudia', 'Daniela',
  'Estefania', 'Florencia', 'Graciela', 'Hilda', 'Ines', 'Jimena',
];

const APELLIDOS = [
  'Rodriguez', 'Gonzalez', 'Garcia', 'Fernandez', 'Lopez', 'Martinez', 'Sanchez',
  'Perez', 'Gomez', 'Diaz', 'Cruz', 'Reyes', 'Morales', 'Flores', 'Ramirez',
  'Torres', 'Rivera', 'Vargas', 'Castillo', 'Romero', 'Mendoza', 'Alvarez',
  'Ruiz', 'Gutierrez', 'Chavez', 'Vasquez', 'Rojas', 'Castro', 'Ortiz',
  'Silva', 'Soto', 'Nunez', 'Salazar', 'Aguilar', 'Medina', 'Cabrera',
  'Pena', 'Carrasco', 'Saldana', 'Quispe', 'Huaman', 'Ramos', 'Cordova',
];

const CALLES_TRUJILLO = [
  'San Martin', 'Bolivar', 'Pizarro', 'Independencia', 'Junin', 'Ayacucho',
  'Grau', 'Bolognesi', 'Sucre', 'Almagro', 'Orbegoso', 'Estete',
  'Diego de Almagro', 'Francisco Pizarro', 'Mariscal Caceres', 'Larco',
  'Espana', 'America Sur', 'America Norte', 'Husares de Junin',
  'Los Pinos', 'Los Olivos', 'Las Palmeras', 'Las Flores', 'Los Eucaliptos',
  'Av. Tupac Amaru', 'Av. Mansiche', 'Av. Cesar Vallejo', 'Av. Federico Villarreal',
  'Jr. Colon', 'Jr. Gamarra', 'Jr. Zepita', 'Jr. San Agustin', 'Jr. Pichincha',
  'Calle Real', 'Calle Bolognesi', 'Pasaje San Pedro',
];

// Identifiers requested by the user
const COMPANI_ID = 'FHaMfP2Ec9vRxKbcqVPY';
const CREATED_BY = 'JSRwOO7ckfQgTLu68RGg';
const DEPARTAMENTO_ID = '13'; // La Libertad
const PROVINCIA_ID = '1301'; // Trujillo
const DISTRITO_ID = '130101'; // Trujillo

const TOTAL_CLIENTES = 60;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDni(): string {
  // 8-digit DNI starting with 1, 2, 4, 6, 7 (valid Peruvian range)
  const prefixes = ['1', '2', '4', '6', '7'];
  const prefix = pick(prefixes);
  let rest = '';
  for (let i = 0; i < 7; i++) rest += Math.floor(Math.random() * 10);
  return prefix + rest;
}

function randomNombre(): string {
  const isHombre = Math.random() < 0.5;
  const nombre = isHombre ? pick(NOMBRES_HOMBRE) : pick(NOMBRES_MUJER);
  const apellido1 = pick(APELLIDOS);
  const apellido2 = pick(APELLIDOS);
  // Mix: some with single surname, most with double
  if (Math.random() < 0.2) return `${nombre} ${apellido1}`;
  return `${nombre} ${apellido1} ${apellido2}`;
}

function randomDireccion(): string {
  const calle = pick(CALLES_TRUJILLO);
  const numero = Math.floor(Math.random() * 1500) + 100;
  return `${calle} ${numero}`;
}

interface SeedResult {
  total: number;
  porZona: Record<string, number>;
}

export default function SeedClientesPage() {
  const { user } = useAuth();
  const isAdmin = useHasRole('root', 'administrador');
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loadingZonas, setLoadingZonas] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SeedResult | null>(null);

  useEffect(() => {
    async function loadZonas() {
      try {
        const q = query(
          collection(db, 'zonas'),
          where('distritoId', '==', DISTRITO_ID)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Zona));
        setZonas(data);
      } catch (err) {
        console.error('Error loading zonas:', err);
        toast.error('Error al cargar las zonas del distrito 130101');
      } finally {
        setLoadingZonas(false);
      }
    }
    loadZonas();
  }, []);

  async function handleSeed() {
    if (!user) {
      toast.error('Debe estar autenticado');
      return;
    }
    if (zonas.length < 1) {
      toast.error('No hay zonas disponibles para el distrito 130101');
      return;
    }

    setSeeding(true);
    setProgress(0);
    setResult(null);

    const porZona: Record<string, number> = {};
    zonas.forEach((z) => (porZona[z.id] = 0));

    let creados = 0;

    try {
      for (let i = 0; i < TOTAL_CLIENTES; i++) {
        // Distribute evenly across zones (round-robin)
        const zona = zonas[i % zonas.length];
        const dni = randomDni();
        const now = Timestamp.now();

        const cliente = {
          companiId: COMPANI_ID,
          createdAt: now,
          createdBy: CREATED_BY,
          departamentoId: DEPARTAMENTO_ID,
          direccion: randomDireccion(),
          distritoId: DISTRITO_ID,
          email: `cliente_${dni}@gmail.com`,
          estado: 'activo',
          latitud: 0,
          longitud: 0,
          nombreCompleto: randomNombre(),
          numeroDocumento: dni,
          provinciaId: PROVINCIA_ID,
          referencia: '',
          telefono: '',
          tipoDocumento: 'DNI',
          updatedAt: now,
          zonaId: zona.id,
        };

        await addDoc(collection(db, 'clientes'), cliente);
        creados++;
        porZona[zona.id]++;
        setProgress(Math.round((creados / TOTAL_CLIENTES) * 100));
      }

      setResult({ total: creados, porZona });
      toast.success(`${creados} clientes creados exitosamente`);
    } catch (err) {
      console.error('Error en seed:', err);
      toast.error(`Error al crear clientes (${creados}/${TOTAL_CLIENTES} creados)`);
      setResult({ total: creados, porZona });
    } finally {
      setSeeding(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <GlassCard>
          <div className="flex items-center gap-3 text-[var(--text-secondary)]">
            <AlertTriangle className="h-5 w-5 text-[#FF9F0A]" />
            <p>Solo los administradores pueden acceder a esta pagina.</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#5E5CE6] flex items-center justify-center">
          <Database className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Generador de Datos Seed</h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            Poblar la coleccion de clientes con datos ficticios para Trujillo
          </p>
        </div>
      </div>

      {/* Configuration summary */}
      <GlassCard>
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Configuracion</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Total de clientes</p>
            <p className="font-semibold text-[var(--text-primary)]">{TOTAL_CLIENTES}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Departamento</p>
            <p className="font-mono text-[var(--text-primary)]">{DEPARTAMENTO_ID} - La Libertad</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Provincia</p>
            <p className="font-mono text-[var(--text-primary)]">{PROVINCIA_ID} - Trujillo</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Distrito</p>
            <p className="font-mono text-[var(--text-primary)]">{DISTRITO_ID} - Trujillo</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-[var(--text-tertiary)] mb-1">companiId</p>
            <p className="font-mono text-xs text-[var(--text-primary)]">{COMPANI_ID}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-[var(--text-tertiary)] mb-1">createdBy</p>
            <p className="font-mono text-xs text-[var(--text-primary)]">{CREATED_BY}</p>
          </div>
        </div>
      </GlassCard>

      {/* Zonas detected */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Zonas detectadas para distrito {DISTRITO_ID}
          </h2>
          <GlassChip
            label={`${zonas.length} zona${zonas.length !== 1 ? 's' : ''}`}
            variant={zonas.length === 3 ? 'success' : zonas.length > 0 ? 'warning' : 'danger'}
          />
        </div>
        {loadingZonas ? (
          <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando zonas...
          </div>
        ) : zonas.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-[#FF453A]">
            <AlertTriangle className="h-4 w-4" />
            No se encontraron zonas para el distrito 130101. Cree zonas antes de generar clientes.
          </div>
        ) : (
          <div className="space-y-2">
            {zonas.map((z) => {
              const asignados = Math.floor(TOTAL_CLIENTES / zonas.length);
              const extra = TOTAL_CLIENTES % zonas.length;
              const idx = zonas.indexOf(z);
              const total = asignados + (idx < extra ? 1 : 0);
              return (
                <div
                  key={z.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/30 dark:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-[#30D158]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {z.nombre}
                      </p>
                      <p className="text-xs font-mono text-[var(--text-tertiary)]">
                        {z.id}
                      </p>
                    </div>
                  </div>
                  <GlassChip
                    label={`${total} clientes`}
                    variant="primary"
                  />
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Action */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">
              Generar {TOTAL_CLIENTES} clientes ficticios
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Los clientes se distribuiran equitativamente entre las {zonas.length || '—'} zonas detectadas.
            </p>
          </div>
          <GlassButton
            icon={seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
            onClick={handleSeed}
            disabled={seeding || loadingZonas || zonas.length === 0}
          >
            {seeding ? `Generando ${progress}%...` : `Generar ${TOTAL_CLIENTES} clientes`}
          </GlassButton>
        </div>

        {/* Progress bar */}
        {seeding && (
          <div className="mt-4 space-y-2">
            <div className="h-2 bg-black/[0.08] dark:bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-[var(--text-tertiary)] text-center">
              {Math.round((progress / 100) * TOTAL_CLIENTES)} / {TOTAL_CLIENTES} clientes creados
            </p>
          </div>
        )}
      </GlassCard>

      {/* Result */}
      {result && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-[#30D158]" />
            <h3 className="font-semibold text-[var(--text-primary)]">
              Generacion completada: {result.total} clientes
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(result.porZona).map(([zonaId, count]) => {
              const zona = zonas.find((z) => z.id === zonaId);
              return (
                <div
                  key={zonaId}
                  className="p-3 rounded-xl bg-[#30D158]/10 border border-[#30D158]/20"
                >
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">{zona?.nombre || zonaId}</p>
                  <p className="text-lg font-bold text-[#30D158]">{count} clientes</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
