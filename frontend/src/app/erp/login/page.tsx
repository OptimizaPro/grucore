'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Mail, AlertCircle, ShieldAlert } from 'lucide-react'
import { login, clearTokens } from '@/lib/api'

type State = 'idle' | 'loading' | 'error'

export default function ERPLoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [state, setState]       = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    try {
      const user = await login(email, password)

      // Block client portal accounts from accessing ERP
      if (user.role === 'client_portal') {
        clearTokens()
        setState('error')
        setErrorMsg('Esta cuenta es un portal de cliente. Usa /portal para acceder.')
        return
      }

      window.location.href = '/erp/dashboard'
    } catch (err: any) {
      setState('error')
      setErrorMsg(
        err?.message?.includes('No active account')
          ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
          : (err?.message ?? 'Error al conectar con el servidor.'),
      )
    }
  }

  const inputBase =
    'w-full bg-[#131D28] border rounded-lg px-4 py-3 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none transition-colors'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#131D28]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,107,53,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,53,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#FF6B35]/4 blur-[120px] pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/">
            <Image
              src="/Grucore-white.png"
              alt="Grucore"
              width={180}
              height={46}
              className="h-12 w-auto mx-auto"
            />
          </a>
          <p
            className="mt-3 text-xs text-[#8A95A5] uppercase tracking-[0.2em]"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            Panel de gestión
          </p>
        </div>

        <div className="bg-[#1F2D3A] border border-[#27384A] rounded-2xl p-8 shadow-2xl">
          {/* Internal badge */}
          <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-[#FF6B35]/8 border border-[#FF6B35]/20">
            <ShieldAlert size={13} className="text-[#FF6B35] flex-shrink-0" />
            <p className="text-[11px] text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>
              Acceso exclusivo para personal interno
            </p>
          </div>

          <h1
            className="text-2xl font-semibold text-[#F0EDE8] mb-1"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Panel de gestión
          </h1>
          <p className="text-sm text-[#8A95A5] mb-8">
            Acceso exclusivo para personal interno de Grucore.
          </p>

          {state === 'error' && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-6 text-sm text-red-400">
              <AlertCircle size={16} className="flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputBase} pl-10 border-[#27384A] focus:border-[#FF6B35]/60`}
                  placeholder="tu@grucore.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-[#8A95A5] font-medium">Contraseña</label>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} pl-10 pr-10 border-[#27384A] focus:border-[#FF6B35]/60`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#8A95A5] transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={state === 'loading'}
              className="w-full h-12 flex items-center justify-center gap-2 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {state === 'loading' ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-[#131D28]/30 border-t-[#131D28] animate-spin" />
                  Verificando…
                </>
              ) : (
                'Ingresar al panel'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#4A5568] mt-8">
          ¿Eres cliente?{' '}
          <a href="/portal" className="text-[#8A95A5] hover:text-[#FF6B35] transition-colors">
            Accede a tu portal
          </a>
        </p>
        <p className="text-center text-xs text-[#4A5568] mt-3">
          © {new Date().getFullYear()} Grucore. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
