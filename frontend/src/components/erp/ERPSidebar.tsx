'use client'

import Image from 'next/image'
import { LayoutDashboard, Users, Package, Truck, FolderOpen, ClipboardList, BarChart2, Images, Settings, LogOut, X, CheckSquare, HardHat, UserSearch, Building2, ChevronDown, BookOpen, ShoppingCart, TrendingUp, Wrench, Landmark } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { logoutERP, type User as UserType } from '@/lib/api'
import { getCompanySettings } from '@/lib/company-settings'
import ERPAvatar from './ERPAvatar'
import ERPSettingsModal from './ERPSettingsModal'

type ERPPage = 'dashboard' | 'clients' | 'team' | 'inventory' | 'suppliers' | 'documentos' | 'bitacora' | 'presupuesto' | 'galeria' | 'tareas' | 'trabajadores' | 'crm' | 'compras' | 'finanzas' | 'activos' | 'subcontratistas' | 'tesoreria'

interface Props {
  currentPage: ERPPage
  userName?: string
  userInitials?: string
  userAvatarUrl?: string | null
  open: boolean
  onToggle: () => void
  onUserUpdate?: (user: UserType) => void
}

type NavItem =
  | { kind: 'link';  page: ERPPage; label: string; Icon: React.ElementType; href: string }
  | { kind: 'group'; id: string;    label: string; Icon: React.ElementType; pages: ERPPage[]; children: { page: ERPPage; label: string; href: string; Icon: React.ElementType }[] }

const NAV_ITEMS: NavItem[] = [
  { kind: 'link',  page: 'dashboard',   label: 'Proyectos',   Icon: LayoutDashboard, href: '/erp/dashboard' },
  { kind: 'link',  page: 'clients',     label: 'Clientes',    Icon: Building2,       href: '/erp/clients' },
  {
    kind: 'group', id: 'colaboradores', label: 'Colaboradores', Icon: Users,
    pages: ['team', 'trabajadores'],
    children: [
      { page: 'team',         label: 'Equipo',       href: '/erp/team',         Icon: Users },
      { page: 'trabajadores', label: 'Trabajadores', href: '/erp/trabajadores', Icon: HardHat },
    ],
  },
  {
    kind: 'group', id: 'recursos', label: 'Recursos', Icon: Package,
    pages: ['inventory', 'suppliers'],
    children: [
      { page: 'inventory', label: 'Inventario',  href: '/erp/inventory', Icon: Package },
      { page: 'suppliers', label: 'Proveedores', href: '/erp/suppliers', Icon: Truck   },
    ],
  },
  {
    kind: 'group', id: 'registro', label: 'Registro', Icon: FolderOpen,
    pages: ['documentos', 'bitacora', 'galeria'],
    children: [
      { page: 'documentos', label: 'Documentos', href: '/erp/documentos', Icon: FolderOpen },
      { page: 'bitacora',   label: 'Bitácora',   href: '/erp/bitacora',   Icon: BookOpen   },
      { page: 'galeria',    label: 'Galería',     href: '/erp/galeria',    Icon: Images     },
    ],
  },
  {
    kind: 'group', id: 'operaciones', label: 'Operaciones', Icon: ClipboardList,
    pages: ['crm', 'tareas'],
    children: [
      { page: 'crm',    label: 'CRM',    href: '/erp/crm',    Icon: UserSearch  },
      { page: 'tareas', label: 'Tareas', href: '/erp/tareas', Icon: CheckSquare },
    ],
  },
  { kind: 'link',  page: 'presupuesto', label: 'Presupuesto', Icon: BarChart2, href: '/erp/presupuesto' },
  {
    kind: 'group', id: 'financiero', label: 'Financiero', Icon: TrendingUp,
    pages: ['compras', 'finanzas', 'activos', 'subcontratistas', 'tesoreria'],
    children: [
      { page: 'compras',          label: 'Compras',          href: '/erp/compras',          Icon: ShoppingCart },
      { page: 'finanzas',         label: 'Finanzas / P&L',   href: '/erp/finanzas',         Icon: TrendingUp   },
      { page: 'activos',          label: 'Activos fijos',    href: '/erp/activos',          Icon: Wrench       },
      { page: 'subcontratistas',  label: 'Subcontratistas',  href: '/erp/subcontratistas',  Icon: HardHat      },
      { page: 'tesoreria',        label: 'Tesorería',        href: '/erp/tesoreria',        Icon: Landmark     },
    ],
  },
]

export default function ERPSidebar({ currentPage, userName, userInitials, userAvatarUrl, open, onToggle, onUserUpdate }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  // Groups open by default if current page is inside them
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const item = NAV_ITEMS.find(i => i.kind === 'group' && (i as any).pages.includes(currentPage))
    return item ? { [( item as any).id]: true } : {}
  })

  useEffect(() => {
    getCompanySettings().then(s => setLogoUrl(s.logo_url))
  }, [])

  function toggleGroup(id: string) {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={onToggle} />
      )}

      <aside className={cn(
        'fixed md:sticky top-0 left-0 h-screen w-64 bg-[#1A2530] border-r border-[#27384A] flex flex-col z-40 transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#27384A] flex-shrink-0">
          <a href="/erp/dashboard">
            <Image
              src={logoUrl ?? '/Grucore-white.png'}
              alt="Grucore"
              width={180}
              height={47}
              className="h-12 w-auto"
              unoptimized={!!logoUrl}
            />
          </a>
          <button className="ml-auto md:hidden text-[#8A95A5]" onClick={onToggle}>
            <X size={18} />
          </button>
        </div>

        {/* ERP badge */}
        <div className="px-6 py-3 border-b border-[#27384A]">
          <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest" style={{ fontFamily: 'Space Mono, monospace' }}>
            Panel de Gestión
          </p>
        </div>

        {/* Nav */}
        <nav data-tour="erp-nav" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            if (item.kind === 'link') {
              return (
                <a
                  key={item.page}
                  href={item.href}
                  data-tour={`erp-${item.page}`}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    currentPage === item.page
                      ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                      : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A]',
                  )}
                >
                  <item.Icon size={16} />
                  {item.label}
                </a>
              )
            }

            // Group
            const isGroupActive = item.pages.includes(currentPage)
            const isOpen = !!openGroups[item.id]
            return (
              <div key={item.id}>
                <button
                  onClick={() => toggleGroup(item.id)}
                  data-tour={`erp-${item.id}`}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    isGroupActive
                      ? 'text-[#FF6B35]'
                      : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A]',
                  )}
                >
                  <item.Icon size={16} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={13}
                    className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
                  />
                </button>
                {isOpen && (
                  <div className="mt-0.5 ml-4 pl-3 border-l border-[#27384A] space-y-0.5">
                    {item.children.map(child => (
                      <a
                        key={child.page}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                          currentPage === child.page
                            ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                            : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A]',
                        )}
                      >
                        <child.Icon size={13} />
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-[#27384A] space-y-1">
          {userName && (
            <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
              <ERPAvatar avatarUrl={userAvatarUrl} initials={userInitials ?? '??'} size="sm" />
              <span className="text-xs text-[#8A95A5] truncate">{userName}</span>
            </div>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A] transition-colors"
          >
            <Settings size={16} />
            Configuración
          </button>
          <button
            onClick={logoutERP}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#8A95A5] hover:text-red-400 hover:bg-[#1F2D3A] transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {settingsOpen && (
        <ERPSettingsModal
          onClose={() => setSettingsOpen(false)}
          onSuccess={(updated) => {
            setSettingsOpen(false)
            onUserUpdate?.(updated)
            // Refresh logo in case brand was updated
            getCompanySettings().then(s => setLogoUrl(s.logo_url))
          }}
        />
      )}
    </>
  )
}
