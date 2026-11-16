import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { APP_CURRENCY } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تنسيق المبالغ المالية بالدينار الجزائري (د.ج)
 */
export function formatCurrency(
  amount?: number | string | null,
  currency: string = APP_CURRENCY
): string {
  if (amount === null || amount === undefined || amount === '') {
    return `— ${currency}`;
  }
  const numericVal = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericVal)) {
    return `— ${currency}`;
  }

  // تنسيق الرقم مع فواصل الآلاف
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericVal);

  return `${formatted} ${currency}`;
}

/**
 * تنسيق التاريخ بنظام اليوم/الشهر/السنة بالتقويم الميلادي
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * تنسيق التاريخ المختصر YYYY-MM-DD
 */
export function formatDateShort(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}

/**
 * تنسيق الأعداد (مثل الكيلومترات)
 */
export function formatNumber(num?: number | string | null, unit?: string): string {
  if (num === null || num === undefined || num === '') {
    return '—';
  }
  const numericVal = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numericVal)) return '—';

  const formatted = new Intl.NumberFormat('fr-FR').format(numericVal);
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * توليد رقم مرجعي فريد للمبيعات والوثائق
 * صيغة: INV-YYYY-XXXXX
 */
export function generateReferenceNumber(prefix: string = 'INV'): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const timeSuffix = Date.now().toString().slice(-3);
  return `${prefix}-${year}-${randomSuffix}${timeSuffix}`;
}

