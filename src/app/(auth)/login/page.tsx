'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GlassInput from '@/components/ui/glass-input';
import GlassButton from '@/components/ui/glass-button';
import { useAuth } from '@/lib/hooks/use-auth';
import { loginSchema, type LoginFormData } from '@/lib/validators/user.schema';

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Bienvenido a Vertiente Reader');
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/invalid-credential') {
        toast.error('Credenciales inválidas');
      } else if (firebaseError.code === 'auth/user-not-found') {
        toast.error('Usuario no encontrado');
      } else if (firebaseError.code === 'auth/too-many-requests') {
        toast.error('Demasiados intentos. Intente más tarde');
      } else {
        toast.error('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <GlassCard variant="elevated" hover={false} padding="lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 shadow-[0_8px_30px_rgba(10,132,255,0.3)]">
            <Image src="/assets/logo.png" alt="Vertiente Reader" width={80} height={80} className="w-full h-full object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Vertiente Reader</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Panel de Gestión</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <GlassInput
            label="Correo electrónico"
            type="email"
            placeholder="usuario@empresa.com"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="relative">
            <GlassInput
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingrese su contraseña"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-[#0A84FF] hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <GlassButton type="submit" className="w-full" size="lg" loading={loading}>
            Iniciar Sesión
          </GlassButton>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-6">
          Sistema de gestión de lectura de medidores de agua
        </p>
      </GlassCard>
    </motion.div>
  );
}
