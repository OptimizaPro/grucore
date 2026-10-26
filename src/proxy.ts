import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* Locale routing.
   - "/es/..."   → served as-is (locale param "es").
   - "/en/..."   → 308 to the bare path; English is canonical at "/".
   - everything else → internally rewritten to "/en/..." so the [locale]
     segment always exists. The visitor never sees "/en" in the address bar. */

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  /* Unlisted build report. Any spelling of /NewSiteNewYou serves the
     /changelog route; /changelog itself is not reachable directly (it falls
     through to the locale router and 404s). The page is noindex and is not in
     the sitemap. */
  if (pathname.toLowerCase() === "/newsitenewyou") {
    const url = request.nextUrl.clone(); url.pathname = "/changelog";
    return NextResponse.rewrite(url);
  }
  /* One URL per page: mixed-case paths (/Services, /es/Servicios) rendered
     as duplicates of the lowercase page. Send them to the canonical spelling. */
  if (pathname !== pathname.toLowerCase()) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 308);
  }
  if (pathname === "/es" || pathname.startsWith("/es/")) return NextResponse.next();
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en/, "") || "/";
    return NextResponse.redirect(url, 308);
  }
  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname}`;
  return NextResponse.rewrite(url);
}
