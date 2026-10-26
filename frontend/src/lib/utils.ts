import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un monto en GTQ o USD según la preferencia del usuario.
 * Siempre almacena GTQ en la base de datos; USD es display-only.
 */
export function formatCurrency(
  amountGtq: number,
  currency: 'GTQ' | 'USD' = 'GTQ',
  exchangeRate = 7.75
): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amountGtq / exchangeRate)
  }

  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    maximumFractionDigits: 0,
  }).format(amountGtq)
}

/** Trunca texto a N caracteres con elipsis */
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}
