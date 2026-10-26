'use client'

import { toast } from 'sonner'
import { AlertTriangle, X } from 'lucide-react'

interface Options {
  title:       string
  description?: string
  confirmLabel?: string
  onConfirm:   () => void | Promise<void>
}

export function confirmToast({ title, description, confirmLabel = 'Eliminar', onConfirm }: Options) {
  toast.custom(id => (
    <div
      className="w-full flex flex-col gap-2 px-4 py-3 rounded-xl shadow-lg"
      style={{ background: '#1A2530', border: '1px solid #27384A', color: '#F0EDE8', minWidth: 300 }}
    >
      <p className="text-sm font-semibold text-white">{title}</p>
      {description && <p className="text-xs text-[#8A95A5]">{description}</p>}
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => {
            toast.dismiss(id)
            onConfirm()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors"
        >
          <AlertTriangle size={12} />
          {confirmLabel}
        </button>
        <button
          onClick={() => toast.dismiss(id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: '#27384A', color: '#8A95A5' }}
        >
          <X size={12} />
          Cancelar
        </button>
      </div>
    </div>
  ))
}
