import { Timestamp } from 'firebase/firestore';

export function formatDate(date: Timestamp | Date | string, format: 'short' | 'long' | 'datetime' = 'short'): string {
  const d = date instanceof Timestamp ? date.toDate() : new Date(date);

  const options: Intl.DateTimeFormatOptions =
    format === 'short'
      ? { day: '2-digit', month: '2-digit', year: 'numeric' }
      : format === 'long'
        ? { day: 'numeric', month: 'long', year: 'numeric' }
        : { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };

  return d.toLocaleDateString('es-PE', options);
}

export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatConsumo(m3: number): string {
  return `${formatNumber(m3, 2)} m³`;
}

export function formatPercentage(value: number): string {
  return `${formatNumber(value, 1)}%`;
}

export function getInitials(nombre: string, apellidos?: string): string {
  const first = nombre.charAt(0).toUpperCase();
  const last = apellidos ? apellidos.charAt(0).toUpperCase() : '';
  return `${first}${last}`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
