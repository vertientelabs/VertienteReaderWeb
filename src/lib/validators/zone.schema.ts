import { z } from 'zod';

export const zonaSchema = z.object({
  codigo: z.string().min(1, 'Requerido'),
  nombre: z.string().min(1, 'Requerido').min(3, 'Mínimo 3 caracteres'),
  descripcion: z.string().optional(),
  departamentoId: z.string().min(1, 'Seleccione departamento'),
  provinciaId: z.string().min(1, 'Seleccione provincia'),
  distritoId: z.string().min(1, 'Seleccione distrito'),
  activo: z.boolean(),
});

export type ZonaFormData = z.infer<typeof zonaSchema>;
