'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Droplets, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GlassInput from '@/components/ui/glass-input';
import GlassButton from '@/components/ui/glass-button';
import { useAuth } from '@/lib/hooks/use-auth';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validators/user.schema';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      setSent(true);
      toast.success('Correo enviado exitosamente');
    } catch {
      toast.error('Error al enviar el correo de recuperación');
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
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#30D158] flex items-center justify-center mb-4">
            <Droplets className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Recuperar Contraseña</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1 text-center">
            Ingrese su correo para recibir instrucciones
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle className="h-12 w-12 text-[#30D158]" />
            <p className="text-sm text-[var(--text-secondary)] text-center">
              Se ha enviado un correo con las instrucciones para restablecer su contraseña.
            </p>
            <Link href="/login">
              <GlassButton variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
                Volver al login
              </GlassButton>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <GlassInput
              label="Correo electrónico"
              type="email"
              placeholder="usuario@empresa.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <GlassButton type="submit" className="w-full" size="lg" loading={loading}>
              Enviar Instrucciones
            </GlassButton>

            <div className="text-center">
              <Link href="/login" className="text-sm text-[#0A84FF] hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al login
              </Link>
            </div>
          </form>
        )}
      </GlassCard>
    </motion.div>
  );
}
