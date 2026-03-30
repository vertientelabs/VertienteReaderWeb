import { z } from 'zod';

export const lecturaSchema = z.object({
  medidorId: z.string().min(1, 'Requerido'),
  valorLectura: z.number().min(0, 'La lectura debe ser positiva'),
  observaciones: z.string().optional(),
  tipoLectura: z.enum(['normal', 'estimada', 'promedio', 'verificacion']),
});

export type LecturaFormData = z.infer<typeof lecturaSchema>;
