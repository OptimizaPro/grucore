import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const SERVICE_LABELS: Record<string, { es: string; en: string }> = {
  residential:    { es: 'construcción residencial', en: 'residential construction' },
  renovation:     { es: 'remodelación',             en: 'remodeling' },
  commercial:     { es: 'proyecto comercial',       en: 'commercial project' },
  construction:   { es: 'construcción / design-build', en: 'design-build construction' },
  kitchens_baths: { es: 'cocinas y baños',          en: 'kitchens & baths' },
  other:          { es: 'proyecto de construcción', en: 'construction project' },
}

export async function POST(req: NextRequest) {
  const { name, service, budget, locale, tier } = await req.json()

  const lang    = locale === 'en' ? 'en' : 'es'
  const svcLabel = (SERVICE_LABELS[service] ?? SERVICE_LABELS.other)[lang]
  const firstName = (name as string).split(' ')[0]

  const fallback = lang === 'en'
    ? `Thank you ${firstName}! We've received your request for ${svcLabel}. A Grucore specialist will reach out to you shortly.`
    : `¡Gracias ${firstName}! Hemos recibido tu solicitud de ${svcLabel}. Un especialista de Grucore se pondrá en contacto contigo muy pronto.`

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ message: fallback })
  }

  const tierContext: Record<string, { es: string; en: string }> = {
    hot:  {
      es: 'Es un lead de alta prioridad — tiene terreno, presupuesto definido y quiere iniciar pronto. El mensaje debe transmitir urgencia positiva: un especialista lo contactará HOY.',
      en:  'This is a high-priority lead — they have land, a defined budget and want to start soon. The message should convey positive urgency: a specialist will contact them TODAY.',
    },
    warm: {
      es: 'Es un lead con buen potencial — interesado pero evaluando opciones. El mensaje debe ser cálido y propositivo, prometiendo contacto en 24 horas.',
      en:  'This is a warm lead — interested but evaluating options. The message should be warm and proactive, promising contact within 24 hours.',
    },
    cold: {
      es: 'Es un lead en exploración temprana. El mensaje debe ser amable y sin presión, invitándolo a seguir explorando y diciéndole que estaremos disponibles cuando esté listo.',
      en:  'This is an early-stage exploring lead. The message should be friendly and pressure-free, inviting them to keep exploring and letting them know we will be available when ready.',
    },
  }
  const tierNote = tier ? (tierContext[tier]?.[lang] ?? '') : ''

  const prompt = lang === 'en'
    ? `You are the assistant for Grucore, a premium construction company in Guatemala. A client named ${firstName} just completed a project qualification quiz requesting ${svcLabel} with a budget of ${budget}. ${tierNote} Write a brief (2-3 sentences), warm and professional message in English. Mention their first name and the service. Use at most 1 emoji. Be genuine and direct.`
    : `Eres el asistente de Grucore, una empresa constructora guatemalteca de calidad premium. Un cliente llamado ${firstName} acaba de completar el cuestionario de calificación solicitando ${svcLabel} con presupuesto de ${budget}. ${tierNote} Escribe un mensaje breve (2-3 oraciones), cálido y profesional en español. Menciona su nombre y el tipo de servicio. Usa máximo 1 emoji. Sé genuino y directo.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`)

    const data = await res.json()
    const message: string = data.content?.[0]?.text ?? fallback
    return NextResponse.json({ message })
  } catch {
    return NextResponse.json({ message: fallback })
  }
}
