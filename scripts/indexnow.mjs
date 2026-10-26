#!/usr/bin/env node
/* Submit every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver share
   submissions). Usage:
     INDEXNOW_KEY=<key> SITE_URL=https://www.zconstructionauburn.com npm run indexnow
   Run after a deploy that added or changed pages. Google does not use
   IndexNow; for Google, the sitemap in Search Console does the job. */
const key = process.env.INDEXNOW_KEY || "cd3cd945dd7130fe8ef5e48a038c35ac", site = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.zconstructionauburn.com").replace(/\/$/, "");
if (!key || !site) { console.error("Set INDEXNOW_KEY and SITE_URL (or NEXT_PUBLIC_SITE_URL)."); process.exit(1); }

const xml = await (await fetch(`${site}/sitemap.xml`)).text();
const urls = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))];
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/indexnow.txt`, urlList: urls }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} · ${urls.length} URLs`);
if (!res.ok && res.status !== 202) process.exit(1);
