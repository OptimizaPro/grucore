import { NextResponse } from "next/server";
import { deliver, parseLead } from "@/lib/leads";

/* Quote form endpoint. Validates, scores and fans the lead out to every
   configured channel (see src/lib/leads.ts). With nothing configured (local
   dev) the lead is logged and the form still succeeds end to end. */
export const runtime = "nodejs";

/* Best-effort burst limiter per server instance: 5 submissions / 10 min / IP. */
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const list = (hits.get(ip) ?? []).filter((t) => now - t < win);
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 5;
}

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try { b = (await req.json()) as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 }); }
  if (String(b.company ?? "").trim()) return NextResponse.json({ ok: true, leadId: "hp" }); // honeypot: pretend success

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || undefined;
  if (ip && limited(ip)) return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });

  const cookies = Object.fromEntries((req.headers.get("cookie") ?? "").split(/;\s*/).filter(Boolean).map((c) => { const i = c.indexOf("="); return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))]; }));
  const lead = parseLead(b, { ip, userAgent: req.headers.get("user-agent") ?? undefined, fbp: cookies._fbp, fbc: cookies._fbc });
  if (!lead) return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });

  const { delivered, results } = await deliver(lead);
  const configured = results.some((r) => !r.skipped);
  if (!configured) {
    console.log(`[lead] (no delivery channels configured, logging only) ${lead.grade}/${lead.score} ${lead.channel}\n` + JSON.stringify(lead, null, 2));
    return NextResponse.json({ ok: true, leadId: lead.id, delivered: false, grade: lead.grade, score: lead.score, channel: lead.channel });
  }
  if (!delivered) {
    console.error("[lead] NOT DELIVERED to owner", JSON.stringify({ lead, results }));
    return NextResponse.json({ ok: false, error: "send failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, leadId: lead.id, delivered: true, grade: lead.grade, score: lead.score, channel: lead.channel });
}
