/* WhatsApp deep links with a ready-to-send first message. An empty chat is
   where a lot of WhatsApp leads die ("what do I even write?"); a prefilled
   line gets the conversation started and tells the owner what it's about
   before he picks up. Free: no API, it opens the customer's own app. */
import { BRAND } from "./content";
import type { Locale } from "./i18n";

const T = {
  en: {
    generic: "Hi Z Construction, I'd like a free estimate.",
    topic: (x: string) => `Hi Z Construction, I'd like a free estimate for ${x}.`,
    photos: "Hi, I just sent my estimate request. Here are some photos of the space:",
  },
  es: {
    generic: "Hola, Z Construction. Quisiera un presupuesto gratis.",
    topic: (x: string) => `Hola, Z Construction. Quisiera un presupuesto gratis para ${x}.`,
    photos: "Hola, acabo de mandar mi solicitud. Aquí le mando fotos del espacio:",
  },
} as const;

/** wa.me link. `topic` is a lowercase service or project name ("cabinet painting"). */
export function waHref(locale: Locale, topic?: string | "photos") {
  const t = T[locale];
  const text = topic === "photos" ? t.photos : topic ? t.topic(topic) : t.generic;
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;
}
