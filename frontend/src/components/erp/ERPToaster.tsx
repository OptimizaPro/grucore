'use client'
import { Toaster } from 'sonner'

export default function ERPToaster() {
  return (
    <Toaster
      theme="dark"
      position="bottom-right"
      richColors
      toastOptions={{
        style: {
          background: '#1A2530',
          border: '1px solid #27384A',
          color: '#F0EDE8',
        },
      }}
    />
  )
}
