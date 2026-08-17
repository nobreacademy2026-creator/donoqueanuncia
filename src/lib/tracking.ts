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
export const WHATSAPP_NUMBER = import.meta.env["VITE_WHATSAPP_NUMBER"] ?? "5535999777944";

type Payload = Record<string, unknown>;

const GA4_ID_PATTERN = /^G-[A-Z0-9]+$/;
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/;
let trackingInitialization: Promise<void> | null = null;

type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: (...args: unknown[]) => void;
};

function readCookie(name: string) {
  const prefix = `${name}=`;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

async function trackMetaConversion(
  eventName: "PageView" | "Lead" | "InitiateCheckout",
  payload: Payload = {},
) {
  const eventId = crypto.randomUUID();
  window.fbq?.("track", eventName, payload, { eventID: eventId });

  try {
    const fbp = readCookie("_fbp");
    const fbc = readCookie("_fbc");
    const { sendMetaConversion } = await import("@/lib/meta-conversions.functions");
    await sendMetaConversion({
      data: {
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        ...(fbp ? { fbp } : {}),
        ...(fbc ? { fbc } : {}),
        sessionId: getSessionId(),
        customData: Object.fromEntries(
          Object.entries(payload).filter(([, value]) =>
            ["string", "number", "boolean"].includes(typeof value),
          ),
        ) as Record<string, string | number | boolean>,
      },
    });
  } catch (error) {
    console.error("[Meta CAPI] Falha ao enviar evento", { eventName, error });
  }
}

function getSessionId() {
  const key = "dqa_session_id";
  let id = window.sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(key, id);
  }
  return id;
}

function normalizeTrackingId(value: string | undefined, pattern: RegExp) {
  const normalized = value?.trim().toUpperCase() ?? "";
  return pattern.test(normalized) ? normalized : "";
}

function ensureGoogleQueue() {
  const dataLayer = (window.dataLayer ??= []);
  window.gtag ??= (...args: unknown[]) => dataLayer.push(args);
}

async function initializePublishedTracking() {
  if (typeof window === "undefined") return;
  const published = await loadPublished();
  const config = published?.tracking;
  const metaPixelId = config?.metaPixelId || TRACKING_CONFIG.metaPixelId;
  const ga4Id = normalizeTrackingId(config?.ga4Id || TRACKING_CONFIG.ga4Id, GA4_ID_PATTERN);
  const gtmId = normalizeTrackingId(config?.gtmId || TRACKING_CONFIG.gtmId, GTM_ID_PATTERN);

  if (metaPixelId) {
    if (!window.fbq) {
      const fbq = function (...args: unknown[]) {
        if (fbq.callMethod) {
          fbq.callMethod(...args);
        } else {
          fbq.queue.push(args);
        }
      } as MetaPixelFunction;

      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.push = fbq;
      window.fbq = fbq;
    }

    let script = document.querySelector<HTMLScriptElement>('script[data-dqa="meta"]');
    const initializedPixelId = script?.dataset["metaPixelId"];

    if (initializedPixelId !== metaPixelId) {
      window.fbq("init", metaPixelId);
      void trackMetaConversion("PageView");
    }

    if (!script) {
      script = document.createElement("script");
      script.setAttribute("data-dqa", "meta");
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      script.async = true;
      document.head.appendChild(script);
    }

    script.dataset["metaPixelId"] = metaPixelId;
  }
  if (ga4Id && !document.querySelector(`script[data-dqa="ga4"][data-id="${ga4Id}"]`)) {
    ensureGoogleQueue();
    const gtag = window.gtag;
    gtag?.("js", new Date());
    gtag?.("config", ga4Id);
    const script = document.createElement("script");
    script.setAttribute("data-dqa", "ga4");
    script.setAttribute("data-id", ga4Id);
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
    script.async = true;
    document.head.appendChild(script);
  }
  if (gtmId && !document.querySelector(`script[data-dqa="gtm"][data-id="${gtmId}"]`)) {
    ensureGoogleQueue();
    window.dataLayer?.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const script = document.createElement("script");
    script.setAttribute("data-dqa", "gtm");
    script.setAttribute("data-id", gtmId);
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
    script.async = true;
    document.head.appendChild(script);
  }
}

export function initPublishedTracking({ force = false }: { force?: boolean } = {}) {
  if (typeof window === "undefined") return Promise.resolve();
  if (force) trackingInitialization = null;
  trackingInitialization ??= initializePublishedTracking().catch((error) => {
    trackingInitialization = null;
    console.error("[Analytics] Falha ao inicializar o tracking", error);
  });
  return trackingInitialization;
}

export function isMetaPixelConnected(pixelId: string) {
  if (typeof window === "undefined" || !pixelId) return false;
  const script = document.querySelector<HTMLScriptElement>('script[data-dqa="meta"]');
  return script?.dataset["metaPixelId"] === pixelId && typeof window.fbq?.callMethod === "function";
}

export function isGoogleAnalyticsConnected(ga4Id: string) {
  if (typeof window === "undefined") return false;
  const id = normalizeTrackingId(ga4Id, GA4_ID_PATTERN);
  return Boolean(id && document.querySelector(`script[data-dqa="ga4"][data-id="${id}"]`));
}

export function isGoogleTagManagerConnected(gtmId: string) {
  if (typeof window === "undefined") return false;
  const id = normalizeTrackingId(gtmId, GTM_ID_PATTERN);
  return Boolean(id && document.querySelector(`script[data-dqa="gtm"][data-id="${id}"]`));
}

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export async function trackEvent(event: string, payload: Payload = {}): Promise<boolean> {
  if (typeof window === "undefined") return false;
  await initPublishedTracking();
  window.fbq?.("trackCustom", event, payload);
  if (window.gtag) window.gtag("event", event, payload);
  else window.dataLayer?.push({ event, ...payload });
  try {
    const { error } = await supabase.from("analytics_events").insert({
      event_name: event,
      payload: payload as never,
      session_id: getSessionId(),
    });
    if (error) {
      console.error("[Analytics] Falha ao registrar evento no Supabase", {
        event,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return false;
    }
    return true;
  } catch (error) {
    console.error("[Analytics] Falha de rede ao registrar evento", { event, error });
    return false;
  }
}

export function trackLead(payload: Payload = {}) {
  if (typeof window === "undefined") return;
  void trackMetaConversion("Lead", payload);
  trackEvent("lead_capturado", payload);
}

export async function trackCheckoutClick(payload: Payload = {}) {
  if (typeof window === "undefined") return false;
  void trackMetaConversion("InitiateCheckout", payload);
  return trackEvent("checkout_iniciado", payload);
}

export function whatsappLink(message: string, number = WHATSAPP_NUMBER) {
  const sanitizedNumber = number.replace(/\D/g, "") || WHATSAPP_NUMBER;
  return `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(message)}`;
}
