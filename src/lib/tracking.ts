/**
 * Camada de tracking pronta para Meta Pixel, Google Analytics 4,
 * Google Tag Manager, WhatsApp e checkout (Kiwify / Hotmart / Cakto).
 * Basta preencher os IDs/URLs abaixo (ou via variáveis VITE_*).
 */

export const TRACKING_CONFIG = {
  metaPixelId: import.meta.env["VITE_META_PIXEL_ID"] ?? "",
  ga4Id: import.meta.env["VITE_GA4_ID"] ?? "",
  gtmId: import.meta.env["VITE_GTM_ID"] ?? "",
};

export const CHECKOUT_URL = import.meta.env["VITE_CHECKOUT_URL"] ?? "#checkout";
export const WHATSAPP_NUMBER = import.meta.env["VITE_WHATSAPP_NUMBER"] ?? "5500000000000";

type Payload = Record<string, unknown>;

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