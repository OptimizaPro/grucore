/**
 * estimator.ts — fuente única de verdad para rangos de precios.
 * Alimenta: tarjetas de servicios, página de pricing, calculadora, JSON-LD.
 */

export const EXCHANGE_RATE_DEFAULT = 7.75 // GTQ por 1 USD

export type FinishLevel = 'standard' | 'mid' | 'premium' | 'luxury'

export const FINISH_MULTIPLIERS: Record<FinishLevel, number> = {
  standard: 0.80,
  mid:      1.00,
  premium:  1.35,
  luxury:   1.75,
}

export interface ServiceDefinition {
  id: string
  icon: string
  cover_image: string
  label_es: string
  label_en: string
  description_es: string
  description_en: string
  range_gtq: [number, number]
  typical_duration_months: [number, number]
  highlights_es: string[]
  highlights_en: string[]
}

export const SERVICES: Record<string, ServiceDefinition> = {
  residential_construction: {
    id: 'residential_construction',
    icon: 'Home',
    cover_image: 'https://images.unsplash.com/photo-1593786267440-550458cc882a?auto=format&fit=crop&w=900&q=80',
    label_es: 'Construcción Residencial',
    label_en: 'Residential Construction',
    description_es: 'Diseñamos y construimos la residencia que imaginaste, con materiales de primera y tiempos cumplidos.',
    description_en: 'We design and build the home you imagined, with premium materials and on-time delivery.',
    range_gtq: [300_000, 2_500_000],
    typical_duration_months: [6, 18],
    highlights_es: ['Diseño arquitectónico', 'Supervisión diaria', 'Portal de cliente', 'Garantía 2 años'],
    highlights_en: ['Architectural design', 'Daily supervision', 'Client portal', '2-year warranty'],
  },
  remodeling: {
    id: 'remodeling',
    icon: 'Hammer',
    cover_image: 'https://images.unsplash.com/photo-1697967464378-1498c293e1aa?auto=format&fit=crop&w=900&q=80',
    label_es: 'Remodelación Interior',
    label_en: 'Interior Remodeling',
    description_es: 'Transformamos espacios existentes con criterio de diseño y ejecución limpia.',
    description_en: 'We transform existing spaces with design precision and clean execution.',
    range_gtq: [50_000, 500_000],
    typical_duration_months: [1, 6],
    highlights_es: ['Planimetría incluida', 'Maestro de obra asignado', 'Garantía 1 año'],
    highlights_en: ['Floor plans included', 'Assigned site foreman', '1-year warranty'],
  },
  commercial: {
    id: 'commercial',
    icon: 'Building2',
    cover_image: 'https://images.unsplash.com/photo-1642706679273-3b3afe8ce1d2?auto=format&fit=crop&w=900&q=80',
    label_es: 'Proyectos Comerciales',
    label_en: 'Commercial Projects',
    description_es: 'Oficinas, locales, restaurantes y desarrollos mixtos. Cronogramas cumplidos.',
    description_en: 'Offices, retail spaces, restaurants and mixed developments. Timelines met.',
    range_gtq: [200_000, 5_000_000],
    typical_duration_months: [3, 12],
    highlights_es: ['Equipo dedicado', 'Reportes semanales', 'Garantía contractual'],
    highlights_en: ['Dedicated team', 'Weekly reports', 'Contractual warranty'],
  },
  design_build: {
    id: 'design_build',
    icon: 'PenTool',
    cover_image: 'https://images.unsplash.com/photo-1583330620291-66cf6ac16864?auto=format&fit=crop&w=900&q=80',
    label_es: 'Diseño y Construcción',
    label_en: 'Design + Build',
    description_es: 'Arquitectura, ingeniería y ejecución bajo un solo contrato.',
    description_en: 'Architecture, engineering and execution under a single contract.',
    range_gtq: [400_000, 3_000_000],
    typical_duration_months: [8, 20],
    highlights_es: ['Un solo contrato', 'Sin brechas diseño-obra', 'Gestión integral'],
    highlights_en: ['Single contract', 'No design-build gaps', 'Full management'],
  },
  industrial: {
    id: 'industrial',
    icon: 'Warehouse',
    cover_image: 'https://images.unsplash.com/photo-1785257532053-34686f5c3e10?auto=format&fit=crop&w=900&q=80',
    label_es: 'Construcción Industrial',
    label_en: 'Industrial Construction',
    description_es: 'Bodegas, naves industriales y plantas de producción.',
    description_en: 'Warehouses, industrial facilities and production plants.',
    range_gtq: [500_000, 8_000_000],
    typical_duration_months: [4, 18],
    highlights_es: ['Estructura metálica', 'Instalaciones especializadas', 'Permisos incluidos'],
    highlights_en: ['Steel structure', 'Specialized installations', 'Permits included'],
  },
  finishing: {
    id: 'finishing',
    icon: 'Sparkles',
    cover_image: 'https://images.unsplash.com/photo-1730342754687-956c90fb0db9?auto=format&fit=crop&w=900&q=80',
    label_es: 'Acabados Premium',
    label_en: 'Premium Finishes',
    description_es: 'Pisos, cielos, carpintería fina, pintura y detalles de cierre.',
    description_en: 'Flooring, ceilings, fine carpentry, paint and closing details.',
    range_gtq: [30_000, 300_000],
    typical_duration_months: [1, 3],
    highlights_es: ['Materiales seleccionados', 'Detalle artesanal', 'Garantía 1 año'],
    highlights_en: ['Selected materials', 'Artisan detail', '1-year warranty'],
  },
}

export function formatRangeGtq(range: [number, number]): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', maximumFractionDigits: 0 }).format(n)
  return `${fmt(range[0])} – ${fmt(range[1])}`
}

export function formatRangeUsd(range: [number, number], rate = EXCHANGE_RATE_DEFAULT): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  return `${fmt(range[0] / rate)} – ${fmt(range[1] / rate)}`
}
