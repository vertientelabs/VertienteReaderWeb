import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('Email inválido'),
  nombre: z.string().min(1, 'Requerido'),
  apellidos: z.string().min(1, 'Requerido'),
  tipoDocumento: z.enum(['DNI', 'RUC', 'CE', 'PASAPORTE'], { error: 'Requerido' }),
  numeroDocumento: z.string().min(1, 'Requerido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  usertype: z.enum(['root', 'administrador', 'supervisor', 'operario', 'lector']),
  companiId: z.string().min(1, 'Seleccione empresa'),
  departamentoId: z.string().optional(),
  provinciaId: z.string().optional(),
  distritoId: z.string().optional(),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingrese su contraseña'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
