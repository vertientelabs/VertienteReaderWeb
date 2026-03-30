import { z } from 'zod';

export const clienteSchema = z.object({
  tipoDocumento: z.enum(['DNI', 'RUC', 'CE', 'PASAPORTE']),
  numeroDocumento: z.string().min(1, 'Requerido').refine(
    (val) => val.length >= 8,
    'Mínimo 8 caracteres'
  ),
  nombreCompleto: z.string().min(1, 'Requerido').min(3, 'Mínimo 3 caracteres'),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().min(1, 'Requerido'),
  departamentoId: z.string().min(1, 'Seleccione departamento'),
  provinciaId: z.string().min(1, 'Seleccione provincia'),
  distritoId: z.string().min(1, 'Seleccione distrito'),
  zonaId: z.string().min(1, 'Seleccione zona'),
  referencia: z.string().optional(),
  latitud: z.number(),
  longitud: z.number(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;
