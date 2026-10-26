export type ProjectType = 'residential' | 'commercial' | 'industrial' | 'remodeling' | 'design_build'

export interface Project {
  id: string
  slug: string
  title:       { es: string; en: string }
  type:        ProjectType
  type_label:  { es: string; en: string }
  location:    string
  city:        string
  area_m2:     number
  floors:      number
  duration_months: number
  year:        number
  budget_gtq?: number
  status:      'completed' | 'active'
  is_featured: boolean
  cover_color: string
  cover_image: string   // Unsplash URL
  description: { es: string; en: string }
  highlights:  { es: string[]; en: string[] }
  tags:        string[]
  before_image?: string  // Imagen antes de la remodelación (para slider)
  after_image?:  string  // Imagen después de la remodelación (para slider)
}

export const PROJECTS: Project[] = [
  {
    id: '1',
    slug: 'residencia-los-cipresales',
    title:   { es: 'Residencia Los Cipresales', en: 'Los Cipresales Residence' },
    type:    'residential',
    type_label: { es: 'Construcción Residencial', en: 'Residential Construction' },
    location: 'Carretera a El Salvador km 14.5',
    city:    'Ciudad de Guatemala',
    area_m2: 480,
    floors:  2,
    duration_months: 14,
    year:    2024,
    status:  'completed',
    is_featured: true,
    cover_color: '#1A1508',
    cover_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    description: {
      es: 'Residencia de dos niveles con diseño contemporáneo en zona residencial de alto valor. El proyecto incluyó diseño arquitectónico completo, estructura de concreto y acabados de primera categoría en una parcela de 800 m².',
      en: 'Two-level contemporary residence in a high-value residential area. The project included full architectural design, concrete structure and premium finishes on an 800 m² plot.',
    },
    highlights: {
      es: ['Diseño arquitectónico propio', 'Piscina y área social', 'Domótica integrada', 'Jardín paisajístico', 'Acabados en mármol importado'],
      en: ['Custom architectural design', 'Pool and social area', 'Integrated home automation', 'Landscaped garden', 'Imported marble finishes'],
    },
    tags: ['Residencial', 'Lujo', 'Construcción nueva'],
    before_image: '/cipresales-antes.jpg',
    after_image:  '/cipresales-despues.avif',
  },
  {
    id: '2',
    slug: 'oficinas-corporativas-torre-norte',
    title:   { es: 'Oficinas Corporativas Torre Norte', en: 'Torre Norte Corporate Offices' },
    type:    'commercial',
    type_label: { es: 'Remodelación Comercial', en: 'Commercial Remodeling' },
    location: 'Zona 10',
    city:    'Ciudad de Guatemala',
    area_m2: 1200,
    floors:  3,
    duration_months: 6,
    year:    2024,
    status:  'completed',
    is_featured: true,
    cover_color: '#08121A',
    cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    description: {
      es: 'Remodelación integral de tres pisos de oficinas para empresa del sector financiero. El proyecto requirió ejecución en fines de semana para no interrumpir operaciones, con entrega de cada piso en plazos escalonados.',
      en: 'Full remodeling of three floors of offices for a financial sector company. The project required weekend execution to avoid interrupting operations, with staggered delivery of each floor.',
    },
    highlights: {
      es: ['Ejecución sin interrumpir operaciones', 'Certificación LEED ready', 'Sistema de climatización nuevo', 'Salas de reuniones equipadas', 'Acabados corporativos premium'],
      en: ['Execution without interrupting operations', 'LEED ready certification', 'New climate control system', 'Equipped meeting rooms', 'Premium corporate finishes'],
    },
    tags: ['Comercial', 'Oficinas', 'Remodelación'],
    before_image: '/oficinas-antes.jpg',
    after_image:  '/oficinas-despues.avif',
  },
  {
    id: '3',
    slug: 'restaurante-costa-del-este',
    title:   { es: 'Restaurante Costa del Este, Panamá', en: 'Costa dell Este Restaurant, Panama' },
    type:    'commercial',
    type_label: { es: 'Construcción Comercial', en: 'Commercial Construction' },
    location: 'Av de la Rotonda, Costa del Este',
    city:    'Ciudad de Panamá',
    area_m2: 350,
    floors:  1,
    duration_months: 5,
    year:    2023,
    status:  'completed',
    is_featured: true,
    cover_color: '#180D0A',
    cover_image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    description: {
      es: 'Construcción de restaurante de concepto abierto en edificio colonial restaurado en el centro histórico de Antigua Guatemala. El reto fue mantener la estética patrimonial exterior mientras se construía un interior moderno y funcional.',
      en: 'Construction of an open-concept restaurant in a restored colonial building in the historic center of Antigua Guatemala. The challenge was maintaining the heritage exterior aesthetics while building a modern and functional interior.',
    },
    highlights: {
      es: ['Respeto por patrimonio arquitectónico', 'Cocina industrial certificada', 'Sistema contra incendios', 'Iluminación arquitectónica', 'Bar y área de eventos'],
      en: ['Respect for architectural heritage', 'Certified industrial kitchen', 'Fire suppression system', 'Architectural lighting', 'Bar and event area'],
    },
    tags: ['Comercial', 'Restaurante', 'Patrimonio'],
    before_image: '/restaurante-antes.jpg',
    after_image:  '/restaurante-despues.avif',
  },
  {
    id: '4',
    slug: 'bodega-industrial-zona-franca',
    title:   { es: 'Bodega Industrial Zona Franca', en: 'Industrial Warehouse Free Zone' },
    type:    'industrial',
    type_label: { es: 'Construcción Industrial', en: 'Industrial Construction' },
    location: 'Zona Franca Guatemala',
    city:    'Villa Nueva',
    area_m2: 3200,
    floors:  1,
    duration_months: 8,
    year:    2023,
    status:  'completed',
    is_featured: false,
    cover_color: '#0A0F14',
    cover_image: '/bodega-industrial.jpg',
    description: {
      es: 'Nave industrial de estructura metálica para empresa de logística internacional. Incluye zona de andenes de carga, oficinas administrativas integradas y sistema contra incendios NFPA.',
      en: 'Steel structure industrial facility for an international logistics company. Includes loading dock area, integrated administrative offices and NFPA fire suppression system.',
    },
    highlights: {
      es: ['Estructura metálica prefabricada', '8 andenes de carga', 'Certificación NFPA', 'Oficinas integradas 400 m²', 'Luz LED industrial'],
      en: ['Prefabricated steel structure', '8 loading docks', 'NFPA certification', 'Integrated offices 400 m²', 'Industrial LED lighting'],
    },
    tags: ['Industrial', 'Logística', 'Estructura metálica'],
    before_image: '/bodega-antes.jpg',
    after_image:  '/bodega-despues.jpg',
  },
  {
    id: '5',
    slug: 'remodelacion-casa-zona-15',
    title:   { es: 'Remodelación Casa Zona 15', en: 'Zone 15 Home Remodeling' },
    type:    'remodeling',
    type_label: { es: 'Remodelación Residencial', en: 'Residential Remodeling' },
    location: 'Vista Hermosa III',
    city:    'Ciudad de Guatemala',
    area_m2: 280,
    floors:  2,
    duration_months: 4,
    year:    2024,
    status:  'completed',
    is_featured: false,
    cover_color: '#14100A',
    cover_image: '/cocina-despues.jpg',
    description: {
      es: 'Remodelación completa de residencia existente: cocina abierta al área social, tres baños renovados, sala ampliada y área de terraza techada. Ejecución con familia habitando el inmueble.',
      en: 'Full remodeling of an existing residence: open kitchen to the social area, three renovated bathrooms, expanded living room and covered terrace area. Execution with family living in the property.',
    },
    highlights: {
      es: ['Cocina abierta con isla', 'Tres baños renovados', 'Sala ampliada', 'Terraza techada nueva', 'Pisos de porcelanato 120×120'],
      en: ['Open kitchen with island', 'Three renovated bathrooms', 'Expanded living room', 'New covered terrace', '120×120 porcelain floors'],
    },
    tags: ['Residencial', 'Remodelación', 'Diseño interior'],
    before_image: '/cocina-antes.jpg',
    after_image:  '/cocina-despues.jpg',
  },
  {
    id: '6',
    slug: 'clinica-medica-pradera',
    title:   { es: 'Clínica Médica La Pradera', en: 'La Pradera Medical Clinic' },
    type:    'commercial',
    type_label: { es: 'Construcción Comercial', en: 'Commercial Construction' },
    location: 'La Pradera',
    city:    'Ciudad de Guatemala',
    area_m2: 420,
    floors:  1,
    duration_months: 5,
    year:    2023,
    status:  'completed',
    is_featured: false,
    cover_color: '#080E14',
    cover_image: '/clinica-medica.jpg',
    description: {
      es: 'Construcción de clínica médica especializada con 8 consultorios, área de diagnóstico por imagen, laboratorio clínico y área administrativa. Acabados clínicos con normativa sanitaria guatemalteca.',
      en: 'Construction of a specialized medical clinic with 8 consultation rooms, diagnostic imaging area, clinical laboratory and administrative area. Clinical finishes compliant with Guatemalan health regulations.',
    },
    highlights: {
      es: ['8 consultorios especializados', 'Área de rayos X blindada', 'Normativa sanitaria MSPAS', 'Sistema de gases médicos', 'Iluminación quirúrgica'],
      en: ['8 specialized consultation rooms', 'Shielded X-ray area', 'MSPAS health regulations', 'Medical gas system', 'Surgical lighting'],
    },
    tags: ['Comercial', 'Salud', 'Especializado'],
    before_image: '/clinica-antes.jpg',
    after_image:  '/clinica-medica.jpg',
  },
]

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug)
}

export function getProjectsByType(type: ProjectType): Project[] {
  return PROJECTS.filter((p) => p.type === type)
}

export const PROJECT_TYPES: Array<{ value: ProjectType | 'all'; label_es: string; label_en: string }> = [
  { value: 'all',          label_es: 'Todos',           label_en: 'All' },
  { value: 'residential',  label_es: 'Residencial',     label_en: 'Residential' },
  { value: 'commercial',   label_es: 'Comercial',       label_en: 'Commercial' },
  { value: 'industrial',   label_es: 'Industrial',      label_en: 'Industrial' },
  { value: 'remodeling',   label_es: 'Remodelación',    label_en: 'Remodeling' },
]
