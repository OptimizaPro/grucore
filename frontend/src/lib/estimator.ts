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
  before_image?: string
  after_image?: string
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
  residential: {
    id: 'residential',
    icon: 'Home',
    cover_image: 'https://images.unsplash.com/photo-1593786267440-550458cc882a?auto=format&fit=crop&w=900&q=80',
    before_image: '/residencial-antes.webp',
    after_image:  '/residencial-despues.png',
    label_es: 'Construcción Residencial',
    label_en: 'Residential Construction',
    description_es: 'Diseñamos y construimos la residencia que imaginaste, con materiales de primera y tiempos cumplidos.',
    description_en: 'We design and build the home you imagined, with premium materials and on-time delivery.',
    range_gtq: [300_000, 2_500_000],
    typical_duration_months: [6, 18],
    highlights_es: [
      'Diseño arquitectónico y planos ejecutivos',
      'Planos estructurales e instalaciones',
      'Presupuesto detallado ítem por ítem',
      'Maestro de obra y supervisor asignados',
      'Supervisión técnica diaria en sitio',
      'Reportes fotográficos semanales',
      'Portal de cliente con avance en tiempo real',
      'Coordinación de subcontratistas y proveedores',
      'Garantía de obra 2 años',
    ],
    highlights_en: [
      'Architectural design and construction drawings',
      'Structural and MEP plans',
      'Detailed line-item budget',
      'Assigned site foreman and supervisor',
      'Daily on-site technical supervision',
      'Weekly photo progress reports',
      'Real-time client portal',
      'Subcontractor and supplier coordination',
      '2-year construction warranty',
    ],
  },
  remodeling: {
    id: 'remodeling',
    icon: 'Hammer',
    cover_image: '/remodelacion-despues.png',
    before_image: '/remodelacion-antes.webp',
    after_image:  '/remodelacion-despues.png',
    label_es: 'Remodelación Interior',
    label_en: 'Interior Remodeling',
    description_es: 'Transformamos espacios existentes con criterio de diseño y ejecución limpia.',
    description_en: 'We transform existing spaces with design precision and clean execution.',
    range_gtq: [50_000, 500_000],
    typical_duration_months: [1, 6],
    highlights_es: [
      'Levantamiento de medidas in situ',
      'Planimetría y propuesta de distribución',
      'Presupuesto detallado antes de iniciar',
      'Maestro de obra asignado al proyecto',
      'Supervisión permanente durante la ejecución',
      'Coordinación de acabados y proveedores',
      'Limpieza y retiro de escombros incluidos',
      'Garantía de obra 1 año',
    ],
    highlights_en: [
      'On-site measurement survey',
      'Floor plans and layout proposal',
      'Detailed budget before start',
      'Assigned site foreman',
      'Permanent supervision during execution',
      'Finishes and supplier coordination',
      'Cleanup and debris removal included',
      '1-year construction warranty',
    ],
  },
  commercial: {
    id: 'commercial',
    icon: 'Building2',
    cover_image: '/comercial-despues.png',
    before_image: '/comercial-antes.webp',
    after_image:  '/comercial-despues.png',
    label_es: 'Proyectos Comerciales',
    label_en: 'Commercial Projects',
    description_es: 'Oficinas, locales, restaurantes y desarrollos mixtos. Cronogramas cumplidos.',
    description_en: 'Offices, retail spaces, restaurants and mixed developments. Timelines met.',
    range_gtq: [200_000, 5_000_000],
    typical_duration_months: [3, 12],
    highlights_es: [
      'Equipo de proyecto dedicado',
      'Planos ejecutivos y especificaciones técnicas',
      'Presupuesto ítem por ítem antes de iniciar',
      'Cronograma de obra con hitos definidos',
      'Supervisión técnica diaria en sitio',
      'Coordinación de instalaciones eléctricas e hidráulicas',
      'Reportes de avance semanales',
      'Portal de cliente con seguimiento en tiempo real',
      'Garantía contractual de obra',
    ],
    highlights_en: [
      'Dedicated project team',
      'Construction drawings and technical specs',
      'Line-item budget before start',
      'Construction schedule with defined milestones',
      'Daily on-site technical supervision',
      'Electrical and plumbing coordination',
      'Weekly progress reports',
      'Real-time client portal',
      'Contractual construction warranty',
    ],
  },
  design_build: {
    id: 'design_build',
    icon: 'PenTool',
    cover_image: 'https://images.unsplash.com/photo-1583330620291-66cf6ac16864?auto=format&fit=crop&w=900&q=80',
    before_image: '/design-build-antes.png',
    after_image:  '/design-build-despues.jpg',
    label_es: 'Diseño y Construcción',
    label_en: 'Design + Build',
    description_es: 'Arquitectura, ingeniería y ejecución bajo un solo contrato.',
    description_en: 'Architecture, engineering and execution under a single contract.',
    range_gtq: [400_000, 3_000_000],
    typical_duration_months: [8, 20],
    highlights_es: [
      'Un solo contrato: diseño y ejecución',
      'Anteproyecto y diseño arquitectónico',
      'Planos constructivos y estructurales',
      'Especificaciones técnicas completas',
      'Presupuesto cerrado antes de iniciar obra',
      'Sin brechas entre diseño y construcción',
      'Asesor único de la cotización a la entrega',
      'Seguimiento financiero y de avance integrado',
      'Garantía de obra según contrato',
    ],
    highlights_en: [
      'Single contract: design and execution',
      'Preliminary and architectural design',
      'Construction and structural drawings',
      'Complete technical specifications',
      'Closed budget before breaking ground',
      'No gaps between design and construction',
      'Single advisor from estimate to handover',
      'Integrated financial and progress tracking',
      'Contractual construction warranty',
    ],
  },
  industrial: {
    id: 'industrial',
    icon: 'Warehouse',
    cover_image: 'https://images.unsplash.com/photo-1785257532053-34686f5c3e10?auto=format&fit=crop&w=900&q=80',
    before_image: '/industrial-antes.webp',
    after_image:  '/industrial-despues.png',
    label_es: 'Construcción Industrial',
    label_en: 'Industrial Construction',
    description_es: 'Bodegas, naves industriales y plantas de producción.',
    description_en: 'Warehouses, industrial facilities and production plants.',
    range_gtq: [500_000, 8_000_000],
    typical_duration_months: [4, 18],
    highlights_es: [
      'Diseño estructural certificado',
      'Estructura metálica o de concreto según requerimiento',
      'Instalaciones eléctricas industriales',
      'Instalaciones hidráulicas y sanitarias',
      'Pisos industriales de alto tráfico',
      'Presupuesto detallado antes de iniciar',
      'Cronograma de obra con hitos definidos',
      'Supervisión técnica diaria en sitio',
      'Garantía contractual de obra',
    ],
    highlights_en: [
      'Certified structural design',
      'Steel or concrete structure as required',
      'Industrial electrical installations',
      'Plumbing and sanitary systems',
      'High-traffic industrial flooring',
      'Detailed budget before start',
      'Construction schedule with defined milestones',
      'Daily on-site technical supervision',
      'Contractual construction warranty',
    ],
  },
  kitchens_baths: {
    id: 'kitchens_baths',
    icon: 'Bath',
    cover_image: '/cocina-despues.jpg',
    before_image: '/cocina-antes.png',
    after_image:  '/cocina-despues.jpg',
    label_es: 'Cocinas y Baños',
    label_en: 'Kitchens & Baths',
    description_es: 'Remodelación especializada de cocinas y baños. Diseño funcional, materiales de calidad y ejecución limpia con tiempos definidos.',
    description_en: 'Specialized kitchen and bathroom remodeling. Functional design, quality materials and clean execution with defined timelines.',
    range_gtq: [25_000, 250_000],
    typical_duration_months: [1, 3],
    highlights_es: [
      'Levantamiento de medidas in situ',
      'Plano 2D y propuesta de distribución',
      'Selección y coordinación de materiales',
      'Demolición y preparación de superficie',
      'Instalaciones hidráulicas y eléctricas',
      'Colocación de azulejos y revestimientos',
      'Mobiliario e instalación de accesorios',
      'Limpieza final y entrega formal',
      'Garantía de obra 1 año',
    ],
    highlights_en: [
      'On-site measurement survey',
      '2D floor plan and layout proposal',
      'Material selection and coordination',
      'Demolition and surface preparation',
      'Plumbing and electrical work',
      'Tile and cladding installation',
      'Cabinetry and fixture installation',
      'Final cleanup and formal handover',
      '1-year construction warranty',
    ],
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
