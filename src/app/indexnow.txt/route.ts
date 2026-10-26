/* IndexNow key file. Bing, Yandex, Seznam and Naver recrawl a URL within
   minutes when it's submitted with this key (and Bing's index is what
   ChatGPT search and Copilot read). Set INDEXNOW_KEY in Vercel (any 32-char
   hex string), then run `npm run indexnow` after a deploy that changed
   content. The key file lives at /indexnow.txt and is declared via
   keyLocation, so no root-level /<key>.txt route is needed. */
import { INDEXNOW_KEY } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const key = process.env.INDEXNOW_KEY || INDEXNOW_KEY;
  return key ? new Response(key, { headers: { "Content-Type": "text/plain" } }) : new Response("Not configured", { status: 404 });
}
