"use client";
/* Loads only the platforms whose IDs are configured, captures attribution on
   every route change, and turns every tel:/mailto:/WhatsApp click anywhere on
   the site into a tracked contact event. No component has to remember to. */
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { captureAttribution } from "@/lib/attribution";
import { IDS, trackContact } from "@/lib/track";
import { BRAND } from "@/lib/brand";

export default function Tracking() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    captureAttribution();
    // The pixel's init snippet already counts the first page view; count client-side navigations after that.
    if (first.current) { first.current = false; return; }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const h = a.getAttribute("href") || "";
      const where = a.closest("[data-track]")?.getAttribute("data-track") || a.closest("header,footer,main,section")?.tagName.toLowerCase() || "page";
      if (h.startsWith("tel:")) trackContact("phone", where);
      else if (h.startsWith("mailto:")) trackContact("email", where);
      else if (/wa\.me|whatsapp\.com/.test(h)) trackContact("whatsapp", where);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  const gtagId = IDS.ga4 || IDS.ads;
  const configs = [
    IDS.ga4 && `gtag('config','${IDS.ga4}');`,
    IDS.ads && `gtag('config','${IDS.ads}',{allow_enhanced_conversions:true});`,
    // Google forwarding number swap for "calls from website" conversions.
    IDS.ads && IDS.adsCall && `gtag('config','${IDS.ads}/${IDS.adsCall}',{phone_conversion_number:'${BRAND.phone}'});`,
  ].filter(Boolean).join("");

  return (
    <>
      {gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());${configs}`}
          </Script>
        </>
      )}
      {IDS.meta && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${IDS.meta}');fbq('track','PageView');`}
        </Script>
      )}
      {IDS.uet && (
        <Script id="ms-uet" strategy="afterInteractive">
          {`(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"${IDS.uet}",enableAutoSpaTracking:true};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");`}
        </Script>
      )}
      {IDS.callrail && <Script src={IDS.callrail} strategy="afterInteractive" />}
      {IDS.gtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${IDS.gtm}');`}
        </Script>
      )}
    </>
  );
}
