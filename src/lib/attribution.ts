/* ---------------------------------------------------------------------------
   Where did this lead come from? Captured on every page view, stored in the
   visitor's browser, and posted with the quote form so each lead email/CRM
   row says "Google Ads · kitchen-remodel-auburn · gclid=…" or
   "ChatGPT → /services/bathroom-remodeling".

   first = the touch that found us; last = the most recent touch that carried
   a real signal (UTM, click ID or outside referrer). Direct revisits don't
   overwrite a paid or organic last touch.
   ------------------------------------------------------------------------- */

export interface Touch {
  source?: string; medium?: string; campaign?: string; term?: string; content?: string;
  gclid?: string; gbraid?: string; wbraid?: string; fbclid?: string; msclkid?: string;
  referrer?: string; landing?: string; ts?: number;
}
export interface Attribution { first?: Touch; last?: Touch; pages?: number }

const KEY = "zc-attr";
const PARAMS = ["gclid", "gbraid", "wbraid", "fbclid", "msclkid"] as const;

function read(): Attribution {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}") as Attribution; } catch { return {}; }
}
function write(a: Attribution) {
  try { localStorage.setItem(KEY, JSON.stringify(a)); } catch {}
}

export function captureAttribution() {
  if (typeof window === "undefined") return;
  const url = new URL(location.href);
  const q = url.searchParams;
  const ref = document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : "";
  const t: Touch = {
    source: q.get("utm_source") || undefined, medium: q.get("utm_medium") || undefined, campaign: q.get("utm_campaign") || undefined,
    term: q.get("utm_term") || undefined, content: q.get("utm_content") || undefined,
    referrer: ref || undefined, landing: url.pathname + (url.search ? url.search.slice(0, 300) : ""), ts: Date.now(),
  };
  for (const p of PARAMS) { const v = q.get(p); if (v) t[p] = v.slice(0, 200); }
  const signal = !!(t.source || t.medium || ref || PARAMS.some((p) => t[p]));
  const a = read();
  write({ first: a.first ?? t, last: signal || !a.last ? t : a.last, pages: (a.pages ?? 0) + 1 });
}

export function getAttribution(): Attribution {
  return typeof window === "undefined" ? {} : read();
}
