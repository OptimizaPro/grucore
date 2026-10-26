import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/i18n";

/* Search engines and AI assistants are explicitly welcome: being read by
   OAI-SearchBot (ChatGPT search), PerplexityBot, Claude and Bing is how a
   local contractor gets recommended in AI answers. */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/thank-you", "/es/gracias", "/review", "/es/deje-su-resena", "/api/"];
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/api/og"], disallow },
      { userAgent: ["OAI-SearchBot", "ChatGPT-User", "GPTBot", "PerplexityBot", "Perplexity-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "Google-Extended", "Bingbot", "Applebot-Extended"], allow: ["/", "/api/og"], disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
