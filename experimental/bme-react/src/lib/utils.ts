import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumberStr(str: string): string {
  if (!str) return '';
  const num = parseInt(str.replace(/\D/g, ''));
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatFileName(template: string, title: string): string {
  const now = new Date();
  return template
    .replace(/\{judul\}/gi, title || 'Untitled')
    .replace(/%YYYY/g, String(now.getFullYear()))
    .replace(/%MM/g, String(now.getMonth() + 1).padStart(2, '0'))
    .replace(/%DD/g, String(now.getDate()).padStart(2, '0'))
    .replace(/%HH/g, String(now.getHours()).padStart(2, '0'))
    .replace(/%mm/g, String(now.getMinutes()).padStart(2, '0'))
    .replace(/%ss/g, String(now.getSeconds()).padStart(2, '0'));
}

