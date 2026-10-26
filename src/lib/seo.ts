/* Site-wide SEO constants. */

/** Date the non-guide pages' content last changed materially. Bump it when
    you edit service, area or core page copy: it feeds <lastmod> in the
    sitemap and dateModified in structured data, and Google trusts both only
    if they move when content moves. Guides carry their own dates. */
export const CONTENT_UPDATED = "2026-09-29";

/** IndexNow key (Bing, Yandex, Seznam, Naver). Public by design: it is served at
    /indexnow.txt so search engines can confirm the site owner sent the pings.
    A Vercel INDEXNOW_KEY env var overrides it. */
export const INDEXNOW_KEY = "cd3cd945dd7130fe8ef5e48a038c35ac";
