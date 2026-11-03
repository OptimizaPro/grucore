import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Django calls this endpoint via post_save signal when CMS data changes.
// Requires ?secret=REVALIDATE_SECRET in the query string.
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const slug = request.nextUrl.searchParams.get('slug')
  const type = request.nextUrl.searchParams.get('type')

  // CompanySettings affects the layout (footer/header) — revalidate all pages
  if (type === 'settings') {
    revalidatePath('/', 'layout')
    return NextResponse.json({ revalidated: true, type: 'settings', scope: 'layout' })
  }

  const locales = ['es', 'en']

  // Map CMS page slugs to Next.js locale-aware paths
  const pathMap: Record<string, string[]> = {
    home:     ['/', '/en'],
    about:    ['/about', '/en/about'],
    contact:  ['/contact', '/en/contact'],
    services: ['/services', '/en/services'],
    projects: ['/projects', '/en/projects'],
    global:   ['/', '/en'],
  }

  const paths = (slug && pathMap[slug]) ?? Object.values(pathMap).flat()

  for (const path of paths) {
    revalidatePath(path, 'page')
  }

  // Also revalidate layout to catch locale-prefixed routes
  revalidatePath('/', 'layout')

  return NextResponse.json({ revalidated: true, slug, paths })
}
