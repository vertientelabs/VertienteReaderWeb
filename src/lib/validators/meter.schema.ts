import { z } from 'zod';

export const medidorSchema = z.object({
  numeroMedidor: z.string().min(1, 'Requerido'),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  tipo: z.enum(['mecanico', 'digital', 'inteligente']),
  diametro: z.string().optional(),
  clienteId: z.string().min(1, 'Seleccione un cliente'),
  zonaId: z.string().min(1, 'Seleccione una zona'),
  direccionInstalacion: z.string().min(1, 'Requerido'),
  departamentoId: z.string().optional(),
  provinciaId: z.string().optional(),
  distritoId: z.string().optional(),
  latitud: z.number(),
  longitud: z.number(),
  estado: z.enum(['activo', 'inactivo', 'dañado', 'retirado', 'por_instalar']),
  lecturaInstalacion: z.number().min(0).optional(),
});

export type MedidorFormData = z.infer<typeof medidorSchema>;
