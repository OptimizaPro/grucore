'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react'
import { login } from '@/lib/api'
import { getCompanySettings } from '@/lib/company-settings'

type State = 'idle' | 'loading' | 'error'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

const STATS = [
  { value: '+50', label: 'Proyectos entregados' },
  { value: '10+', label: 'Años de experiencia'  },
  { value: '100%', label: 'Clientes satisfechos'  },
]

export default function PortalLoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [state,    setState]    = useState<State>('idle')
  const [logoUrl,  setLogoUrl]  = useState<string | null>(null)

  useEffect(() => {
    getCompanySettings().then(s => setLogoUrl(s.logo_url))
  }, [])
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')
    try {
      await login(email, password)
      window.location.href = '/portal/dashboard'
    } catch (err: any) {
      setState('error')
      setErrorMsg(
        err?.message?.includes('No active account')
          ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
          : (err?.message ?? 'Error al conectar con el servidor.'),
      )
    }
  }

  return (
    <div className="flex min-h-[100dvh] bg-[#0C151E]">

      {/* ── Panel izquierdo — visual ──────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[58%] xl:w-[50%] flex-col overflow-hidden">

        {/* Fotografía de fondo */}
        <Image
          src="https://picsum.photos/seed/grucore-luxury-construction-site/1400/900"
          alt="Proyecto de construcción Grucore"
          fill
          className="object-cover object-center"
          priority
          sizes="60vw"
        />

        {/* Capas de gradiente — profundidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C151E] via-[#0C151E]/75 to-[#0C151E]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C151E]/85 via-transparent to-[#0C151E]/40" />

        {/* Línea acento naranja — borde derecho */}
        <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-[#FF6B35]/50 to-transparent" />

        {/* Contenido posicionado */}
        <div className="relative z-10 flex flex-col h-full px-14 xl:px-18 py-14">

          {/* Logo */}
          <a href="/" className="w-fit opacity-90 hover:opacity-100 transition-opacity">
            <Image
              src={logoUrl ?? '/Grucore-white.png'}
              alt="Grucore — Construcción y Remodelaciones"
              width={520}
              height={60}
              priority
              className="h-16 w-auto"
              style={{ width: 'auto' }}
              unoptimized={!!logoUrl}
            />
          </a>

          {/* Titular central */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="max-w-[480px]">
              <p
                className="text-[10px] text-[#FF6B35] uppercase tracking-[0.25em] mb-5"
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                Portal de cliente
              </p>
              <h1
                className="text-[2.6rem] xl:text-[3.1rem] font-bold text-[#F0EDE8] leading-[1.1] tracking-tight"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Sigue el avance<br />de tu proyecto<br />en tiempo real.
              </h1>
              <p className="mt-6 text-[15px] text-[#8A95A5] leading-relaxed max-w-[38ch]">
                Fotos de obra, bitácoras semanales y aprobación de hitos de pago, desde cualquier lugar.
              </p>
            </div>
          </div>

          {/* Stats — parte inferior */}
          <div className="border-t border-[#27384A]/50 pt-8">
            <div className="grid grid-cols-3 gap-6">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p
                    className="text-2xl font-bold text-[#F0EDE8]"
                    style={{ fontFamily: 'Space Mono, monospace' }}
                  >
                    {value}
                  </p>
                  <p className="text-xs text-[#8A95A5] mt-1 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Panel derecho — formulario ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 xl:px-16 bg-[#0C151E]">
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="w-full max-w-[420px]"
        >

          {/* Logo móvil */}
          <motion.div variants={fadeUp} className="lg:hidden mb-10">
            <Image
              src={logoUrl ?? '/Grucore-white.png'}
              alt="Grucore"
              width={140}
              height={36}
              className="h-9 w-auto"
              unoptimized={!!logoUrl}
            />
          </motion.div>

          {/* Encabezado */}
          <motion.div variants={fadeUp} className="mb-10">
            <p
              className="text-[10px] text-[#FF6B35] uppercase tracking-[0.25em] mb-3"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              Acceso seguro
            </p>
            <h2
              className="text-[1.85rem] font-bold text-[#F0EDE8] tracking-tight"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Bienvenido de vuelta
            </h2>
            <p className="text-sm text-[#8A95A5] mt-2 leading-relaxed">
              Ingresa tus credenciales para acceder a tu portal.
            </p>
          </motion.div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} noValidate>
            <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">

              {/* Email */}
              <motion.div variants={fadeUp}>
                <label className="block text-xs font-semibold text-[#8A95A5] mb-2 tracking-wide">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A5568] pointer-events-none"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#131D28] border border-[#27384A] rounded-xl pl-11 pr-4 py-[13px] text-sm text-[#F0EDE8] placeholder:text-[#3A4A5A] focus:outline-none focus:border-[#FF6B35]/70 focus:ring-2 focus:ring-[#FF6B35]/15 transition-all duration-200"
                    placeholder="tu@correo.com"
                    autoComplete="email"
                  />
                </div>
              </motion.div>

              {/* Contraseña */}
              <motion.div variants={fadeUp}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#8A95A5] tracking-wide">
                    Contraseña
                  </label>
                  <a
                    href="#"
                    className="text-xs text-[#FF6B35] hover:text-[#FF8557] transition-colors"
                  >
                    Recuperar acceso
                  </a>
                </div>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A5568] pointer-events-none"
                  />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#131D28] border border-[#27384A] rounded-xl pl-11 pr-12 py-[13px] text-sm text-[#F0EDE8] placeholder:text-[#3A4A5A] focus:outline-none focus:border-[#FF6B35]/70 focus:ring-2 focus:ring-[#FF6B35]/15 transition-all duration-200"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#8A95A5] transition-colors p-0.5"
                    aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {state === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-sm text-red-400">
                      <AlertCircle size={14} className="flex-shrink-0" />
                      {errorMsg}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botón */}
              <motion.div variants={fadeUp}>
                <button
                  type="submit"
                  disabled={state === 'loading'}
                  className="group w-full h-[50px] flex items-center justify-center gap-2.5 bg-[#FF6B35] text-[#0C151E] text-sm font-bold rounded-xl hover:bg-[#FF8557] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 mt-1"
                >
                  {state === 'loading' ? (
                    <span className="w-5 h-5 rounded-full border-2 border-[#0C151E]/25 border-t-[#0C151E] animate-spin" />
                  ) : (
                    <>
                      Ingresar al portal
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </motion.div>

            </motion.div>
          </form>

          {/* Badge de seguridad */}
          <motion.div
            variants={fadeUp}
            className="mt-8 flex items-center gap-3 p-4 rounded-xl border border-[#27384A] bg-[#131D28]/60"
          >
            <ShieldCheck size={16} className="text-[#FF6B35] flex-shrink-0" />
            <p className="text-xs text-[#8A95A5] leading-relaxed">
              Conexión cifrada con SSL. Acceso exclusivo para clientes registrados.
            </p>
          </motion.div>

          {/* Pie de formulario */}
          <motion.p variants={fadeUp} className="text-center text-xs text-slate-400 mt-8">
            ¿No tienes acceso?{' '}
            <a href="/contact" className="text-[#8A95A5] hover:text-slate-300 transition-colors">
              Contáctanos
            </a>
            {' '}— tu asesor te enviará las credenciales.
          </motion.p>

          <motion.p variants={fadeUp} className="text-center text-xs text-slate-400 mt-4">
            &copy; {new Date().getFullYear()} Grucore. Todos los derechos reservados.
          </motion.p>

        </motion.div>
      </div>

    </div>
  )
}
