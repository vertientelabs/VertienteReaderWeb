'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <GlassCard hover={false} padding="lg" className="max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF453A]/20 to-[#FF453A]/5 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-[#FF453A]" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Algo salió mal
            </h2>
            <p className="text-sm text-[var(--text-tertiary)] mb-4">
              Ha ocurrido un error inesperado. Puedes intentar recargar o volver al inicio.
            </p>
            {this.state.error && (
              <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 mb-6 text-left">
                <code className="text-xs font-mono text-[var(--text-secondary)] break-all line-clamp-3">
                  {this.state.error.message}
                </code>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <GlassButton
                variant="primary"
                icon={<RefreshCw className="h-4 w-4" />}
                onClick={this.handleReset}
              >
                Reintentar
              </GlassButton>
              <Link href="/">
                <GlassButton variant="ghost" icon={<Home className="h-4 w-4" />}>
                  Volver al inicio
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
