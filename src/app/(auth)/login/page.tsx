'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Droplets,
  HardHat,
  Pickaxe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import GlassInput from '@/components/ui/glass-input';
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

  const year = new Date().getFullYear();

  return (
    <div className="relative w-full max-w-5xl">
      {/* ============== AMBIENT ORBS ============== */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-visible">
        <motion.div
          className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(10,132,255,0.35) 0%, transparent 70%)' }}
          animate={{ x: [0, 30, -10, 0], y: [0, 20, -15, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-20 h-[460px] w-[460px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(48,209,88,0.30) 0%, transparent 70%)' }}
          animate={{ x: [0, -25, 15, 0], y: [0, -30, 10, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255,159,10,0.18) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ============== TOP BADGE ============== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]"
      >
        <div className="flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/60 px-3 py-1.5 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#30D158] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#30D158]" />
          </span>
          Vertiente Labs · Suite operacional
        </div>
        <span className="hidden sm:inline">v1.0 · MMXXV</span>
      </motion.div>

      {/* ============== MAIN CARD ============== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="
          relative overflow-hidden rounded-[28px]
          border border-black/[0.08] dark:border-white/[0.08]
          bg-white/72 dark:bg-[#16161a]/80
          backdrop-blur-2xl
          shadow-[0_30px_80px_-20px_rgba(10,132,255,0.25),0_8px_32px_rgba(0,0,0,0.08)]
          dark:shadow-[0_30px_80px_-20px_rgba(10,132,255,0.35),0_8px_32px_rgba(0,0,0,0.4)]
        "
      >
        {/* Subtle grain texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Inner highlight ring (top edge) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20"
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
          {/* ============== HERO PANEL ============== */}
          <div className="relative flex flex-col justify-between overflow-hidden p-8 sm:p-10 lg:p-12 lg:pr-14 min-h-[520px]">
            {/* Diagonal gradient accent */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.85]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(10,132,255,0.12) 0%, rgba(10,132,255,0) 35%, rgba(48,209,88,0.10) 70%, rgba(255,159,10,0.08) 100%)',
              }}
            />

            {/* Decorative SVG: animated water drop / wave */}
            <svg
              aria-hidden
              className="absolute -right-16 -bottom-10 h-[320px] w-[320px] opacity-[0.10] dark:opacity-[0.18]"
              viewBox="0 0 200 200"
              fill="none"
            >
              <defs>
                <linearGradient id="dropGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0A84FF" />
                  <stop offset="60%" stopColor="#30D158" />
                  <stop offset="100%" stopColor="#FF9F0A" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((i) => (
                <motion.circle
                  key={i}
                  cx="100"
                  cy="100"
                  r={30 + i * 22}
                  stroke="url(#dropGrad)"
                  strokeWidth="1.2"
                  fill="none"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: [0, 0.8, 0], scale: [0.6, 1.2, 1.4] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: 'easeOut',
                  }}
                />
              ))}
              <motion.path
                d="M100 40 Q 130 80 130 110 A 30 30 0 1 1 70 110 Q 70 80 100 40 Z"
                stroke="url(#dropGrad)"
                strokeWidth="1.8"
                fill="none"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '100px 100px' }}
              />
            </svg>

            {/* Vertical edition tape */}
            <div className="absolute right-3 top-12 hidden lg:flex flex-col items-center gap-3 text-[9px] font-bold uppercase tracking-[0.4em] text-[var(--text-tertiary)] [writing-mode:vertical-rl] rotate-180">
              <span>Edición Empresarial</span>
              <span className="h-8 w-px bg-current opacity-40" />
              <span>{year}</span>
            </div>

            {/* Hero content */}
            <div className="relative">
              {/* Logo block */}
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="
                    relative h-16 w-16 overflow-hidden rounded-2xl
                    bg-white shadow-[0_12px_40px_rgba(10,132,255,0.4)]
                    ring-1 ring-black/5
                  "
                >
                  <Image
                    src="/assets/logo.png"
                    alt="Vertiente Reader"
                    width={64}
                    height={64}
                    className="h-full w-full object-contain p-1"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0A84FF]">
                    Vertiente
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
                    Reader
                  </span>
                </div>
              </div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-10"
              >
                <h1 className="text-[2.5rem] sm:text-[3rem] font-bold leading-[0.95] tracking-tight text-[var(--text-primary)]">
                  Control total
                  <br />
                  <span className="bg-gradient-to-r from-[#0A84FF] via-[#30D158] to-[#FF9F0A] bg-clip-text text-transparent">
                    sobre el flujo.
                  </span>
                </h1>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
                  Plataforma integrada para la gestión de lecturas, asignaciones y
                  análisis predictivo en empresas de servicios públicos.
                </p>
              </motion.div>
            </div>

            {/* Industry strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="relative mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-black/[0.06] dark:border-white/[0.06] pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]"
            >
              <span className="flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5 text-[#0A84FF]" />
                Servicios públicos
              </span>
              <span className="text-black/15 dark:text-white/15">·</span>
              <span className="flex items-center gap-1.5">
                <HardHat className="h-3.5 w-3.5 text-[#FF9F0A]" />
                Construcción
              </span>
              <span className="text-black/15 dark:text-white/15">·</span>
              <span className="flex items-center gap-1.5">
                <Pickaxe className="h-3.5 w-3.5 text-[#BF5AF2]" />
                Minería
              </span>
            </motion.div>
          </div>

          {/* ============== FORM PANEL ============== */}
          <div className="relative flex flex-col justify-center border-t border-black/[0.06] dark:border-white/[0.08] bg-white/40 dark:bg-black/20 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
            {/* Form panel inner gradient highlight */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background:
                  'radial-gradient(ellipse at top right, rgba(10,132,255,0.08) 0%, transparent 60%)',
              }}
            />

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0A84FF]">
                  Acceso seguro
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  Inicia sesión
                </h2>
                <p className="mt-1 text-sm text-[var(--text-tertiary)]">
                  Usa tus credenciales corporativas.
                </p>
              </motion.div>

              <motion.form
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                onSubmit={handleSubmit(onSubmit)}
                className="mt-7 space-y-4"
              >
                <GlassInput
                  label="Correo electrónico"
                  type="email"
                  placeholder="usuario@empresa.com"
                  icon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  autoComplete="email"
                  {...register('email')}
                />

                <div className="relative">
                  <GlassInput
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    icon={<Lock className="h-4 w-4" />}
                    error={errors.password?.message}
                    autoComplete="current-password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-[38px] rounded-md p-1 text-[var(--text-tertiary)] transition-colors hover:bg-black/[0.04] hover:text-[var(--text-primary)] dark:hover:bg-white/[0.06]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#0A84FF] transition-colors hover:text-[#0070d8]"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Custom CTA button — overrides GlassButton for richer hover */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group relative mt-2 flex w-full items-center justify-center gap-2
                    overflow-hidden rounded-xl px-6 py-3.5 text-sm font-semibold tracking-wide text-white
                    bg-gradient-to-r from-[#0A84FF] via-[#0A84FF] to-[#0070d8]
                    shadow-[0_10px_30px_-8px_rgba(10,132,255,0.6)]
                    transition-all duration-300
                    hover:shadow-[0_14px_36px_-8px_rgba(10,132,255,0.7)]
                    hover:translate-y-[-1px]
                    active:translate-y-[0px] active:scale-[0.99]
                    disabled:cursor-not-allowed disabled:opacity-60
                  "
                >
                  {/* shine sweep */}
                  <span
                    aria-hidden
                    className="
                      absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12
                      bg-gradient-to-r from-transparent via-white/30 to-transparent
                      transition-transform duration-700
                      group-hover:translate-x-[400%]
                    "
                  />
                  <span className="relative flex items-center gap-2">
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Validando…
                      </>
                    ) : (
                      <>
                        Iniciar sesión
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </span>
                </button>
              </motion.form>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-tertiary)]"
              >
                Sistema de gestión de medidores
              </motion.p>
            </div>
          </div>
        </div>

        {/* ============== BOTTOM RAIL ============== */}
        <div className="relative flex items-center justify-between border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-6 py-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
          <span>© {year} Vertiente Labs</span>
          <a
            href="https://vertientelabs.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline transition-colors hover:text-[#0A84FF]"
          >
            vertientelabs.com →
          </a>
          <span className="sm:hidden">v1.0</span>
        </div>
      </motion.div>
    </div>
  );
}
