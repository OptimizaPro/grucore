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

  // Map CMS page slugs to Next.js locale-aware paths
  const pathMap: Record<string, string[]> = {
    home:     ['/'],
    about:    ['/about'],
    contact:  ['/contact'],
    services: ['/services'],
    projects: ['/projects'],
    global:   ['/'],           // global affects all pages — revalidate root
  }

  const paths = (slug && pathMap[slug]) ?? Object.values(pathMap).flat()

  for (const path of paths) {
    revalidatePath(path)
  }

  return NextResponse.json({ revalidated: true, slug, paths })
}
