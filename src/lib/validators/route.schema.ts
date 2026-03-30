import { z } from 'zod';

export const rutaSchema = z.object({
  nombre: z.string().min(1, 'Requerido').min(3, 'Mínimo 3 caracteres'),
  codigo: z.string().min(1, 'Requerido'),
  descripcion: z.string().optional(),
  zonasIds: z.array(z.string()).min(1, 'Seleccione al menos una zona'),
  activo: z.boolean(),
});

export type RutaFormData = z.infer<typeof rutaSchema>;

export const asignacionSchema = z.object({
  operarioId: z.string().min(1, 'Seleccione un operario'),
  rutaId: z.string().min(1, 'Seleccione una ruta'),
  periodo: z.string().min(1, 'Seleccione un periodo'),
  fechaInicio: z.string().min(1, 'Requerido'),
  fechaFin: z.string().min(1, 'Requerido'),
});

export type AsignacionFormData = z.infer<typeof asignacionSchema>;
