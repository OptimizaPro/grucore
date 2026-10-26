import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { BRAND, PHOTOS, LOCAL_PHOTOS, photo, type PhotoKey } from "@/lib/content";

/* ---------------------------------------------------------------------------
   /api/og?t=Title&k=Kicker&p=photoKey&l=es
   Branded share card (1200×630) for every page, in the page's language. When
   a homeowner forwards a service page on WhatsApp or Facebook (the main way
   referrals travel in the Spanish-speaking community), the preview shows the
   company, the page title, the phone number and a job photo instead of an
   anonymous stock image. Fonts are the site's own (OFL), bundled in
   src/assets/fonts so the card renders identically on Vercel.
   ------------------------------------------------------------------------- */
export const runtime = "nodejs";

const NAVY = "#0f1a2e", BONE = "#f4efe6", AMBER = "#e3931e";
/* Read from disk rather than fetch(new URL(..., import.meta.url)): Turbopack's
   Node runtime does not serve file: URLs. next.config.ts traces these files
   into the serverless bundle (outputFileTracingIncludes). */
/* Literal paths (not a variable) so the bundler traces exactly these files. */
let assets: Promise<{ display: ArrayBuffer; body: ArrayBuffer; logo: string }> | undefined;
function getAssets() {
  return (assets ??= Promise.all([
    readFile(path.join(process.cwd(), "src/assets/fonts/BarlowCondensed-ExtraBold.ttf")),
    readFile(path.join(process.cwd(), "src/assets/fonts/Barlow-Regular.ttf")),
    readFile(path.join(process.cwd(), "public/brand/logo-on-dark.png")),
  ]).then(([display, body, logo]) => ({
    display: display.buffer.slice(display.byteOffset, display.byteOffset + display.byteLength) as ArrayBuffer,
    body: body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer,
    logo: `data:image/png;base64,${logo.toString("base64")}`,
  })));
}

const clean = (s: string | null, max: number) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const es = q.get("l") === "es";
  const title = clean(q.get("t"), 90) || BRAND.name;
  const kicker = clean(q.get("k"), 80) || (es ? "Pintura y remodelación · Auburn y Opelika, AL" : "Painting & remodeling · Auburn & Opelika, AL");
  const key = (q.get("p") ?? "") as PhotoKey;
  /* The owner's photos are read from disk and embedded (a card should never
     depend on fetching the live site); placeholders stay remote. */
  let img = photo(key in PHOTOS || key in LOCAL_PHOTOS ? key : "hero", 900);
  if (img.startsWith("/")) {
    const file = await readFile(path.join(process.cwd(), "public", img.replace(/^\//, "").replace(/\.\./g, "")));
    img = `data:image/jpeg;base64,${file.toString("base64")}`;
  }
  const { display, body, logo } = await getAssets();
  const size = title.length > 56 ? 54 : title.length > 36 ? 64 : 78;
  const pills = es ? ["Presupuestos gratis", "Hablamos español"] : ["Free written estimates", "Se habla español"];

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", background: NAVY, color: BONE, fontFamily: "Barlow", position: "relative" }}>
        {/* photo, right */}
        <div style={{ position: "absolute", right: 0, top: 0, width: 560, height: 630, display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" width={560} height={630} style={{ objectFit: "cover", width: 560, height: 630 }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${NAVY} 0%, rgba(15,26,46,.6) 30%, rgba(15,26,46,.1) 100%)` }} />
        </div>
        {/* amber rule, left */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 14, height: 630, background: AMBER }} />
        {/* text panel */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: 660, height: 630, padding: "48px 0 44px 64px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="" width={190} height={120} style={{ width: 190, height: 120, objectFit: "contain", objectPosition: "left" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", fontSize: 19, lineHeight: 1.25, letterSpacing: 2.5, textTransform: "uppercase", color: AMBER, maxWidth: 560 }}>{kicker}</div>
            <div style={{ display: "flex", fontFamily: "Barlow Condensed", fontSize: size, lineHeight: 0.94, textTransform: "uppercase", letterSpacing: 0.5, maxWidth: 570 }}>{title}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 570 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, whiteSpace: "nowrap" }}>
              <div style={{ display: "flex", fontFamily: "Barlow Condensed", fontSize: 40, letterSpacing: 1 }}>{BRAND.phone}</div>
              <div style={{ display: "flex", fontSize: 20, color: "rgba(244,239,230,.6)" }}>{es ? "Llame o mande mensaje" : "Call or text"}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {pills.map((p) => <div key={p} style={{ display: "flex", padding: "7px 14px", border: "1.5px solid rgba(244,239,230,.35)", borderRadius: 999, fontSize: 16, letterSpacing: 1.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>{p}</div>)}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200, height: 630,
      fonts: [{ name: "Barlow Condensed", data: display, weight: 800, style: "normal" }, { name: "Barlow", data: body, weight: 400, style: "normal" }],
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800" },
    },
  );
}
