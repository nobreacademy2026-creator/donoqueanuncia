/**
 * Camada de tracking pronta para Meta Pixel, Google Analytics 4,
 * Google Tag Manager, WhatsApp e checkout (Kiwify / Hotmart / Cakto).
 * Basta preencher os IDs/URLs abaixo (ou via variáveis VITE_*).
 */
import { supabase } from "@/integrations/supabase/client";
import { loadPublished } from "@/lib/funnel-content";

export const TRACKING_CONFIG = {
  metaPixelId: import.meta.env["VITE_META_PIXEL_ID"] ?? "",
  ga4Id: import.meta.env["VITE_GA4_ID"] ?? "",
  gtmId: import.meta.env["VITE_GTM_ID"] ?? "",
};

export const CHECKOUT_URL = import.meta.env["VITE_CHECKOUT_URL"] ?? "#checkout";
export const WHATSAPP_NUMBER = import.meta.env["VITE_WHATSAPP_NUMBER"] ?? "5500000000000";

type Payload = Record<string, unknown>;

function getSessionId() {
  const key = "dqa_session_id";
  let id = window.sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(key, id);
  }
  return id;
}

export async function initPublishedTracking() {
  if (typeof window === "undefined") return;
  const published = await loadPublished();
  const config = published?.tracking;
  const metaPixelId = config?.metaPixelId || TRACKING_CONFIG.metaPixelId;
  const ga4Id = config?.ga4Id || TRACKING_CONFIG.ga4Id;
  const gtmId = config?.gtmId || TRACKING_CONFIG.gtmId;

  if (metaPixelId && !document.querySelector('script[data-dqa="meta"]')) {
    const script = document.createElement("script");
    script.setAttribute("data-dqa", "meta");
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.async = true;
    script.onload = () => {
      window.fbq?.("init", metaPixelId);
      window.fbq?.("track", "PageView");
    };
    document.head.appendChild(script);
  }
  if (ga4Id && !document.querySelector('script[data-dqa="ga4"]')) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: unknown[]) => window.dataLayer?.push(args as unknown as Payload);
    window.gtag("js", new Date());
    window.gtag("config", ga4Id);
    const script = document.createElement("script");
    script.setAttribute("data-dqa", "ga4");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
    script.async = true;
    document.head.appendChild(script);
  }
  if (gtmId && !document.querySelector('script[data-dqa="gtm"]')) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const script = document.createElement("script");
    script.setAttribute("data-dqa", "gtm");
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
    script.async = true;
    document.head.appendChild(script);
  }
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Payload[];
  }
}

export function trackEvent(event: string, payload: Payload = {}) {
  if (typeof window === "undefined") return;
  window.fbq?.("trackCustom", event, payload);
  window.gtag?.("event", event, payload);
  window.dataLayer?.push({ event, ...payload });
  void supabase
    .from("analytics_events")
    .insert({
      event_name: event,
      payload: payload as never,
      session_id: getSessionId(),
    })
    .then(({ error }) => {
      if (error) console.error("[Analytics] Falha ao registrar evento:", error.message);
    });
}

export function trackLead(payload: Payload = {}) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", "Lead", payload);
  trackEvent("lead_capturado", payload);
}

export function trackCheckoutClick(payload: Payload = {}) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", "InitiateCheckout", payload);
  trackEvent("checkout_iniciado", payload);
}

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
