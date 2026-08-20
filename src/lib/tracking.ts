/** Centralized browser tracking, attribution and Meta deduplication. */
import { supabase } from "@/integrations/supabase/client";
import { loadPublished } from "@/lib/funnel-content";

export const TRACKING_CONFIG = {
  metaPixelId: import.meta.env["VITE_META_PIXEL_ID"] ?? "",
  ga4Id: import.meta.env["VITE_GA4_ID"] ?? "",
  gtmId: import.meta.env["VITE_GTM_ID"] ?? "",
};

export const CHECKOUT_URL = import.meta.env["VITE_CHECKOUT_URL"] ?? "#checkout";
export const WHATSAPP_NUMBER = import.meta.env["VITE_WHATSAPP_NUMBER"] ?? "5535999777944";

export type StandardEventName =
  "PageView" | "ViewContent" | "Lead" | "Contact" | "AddToCart" | "InitiateCheckout" | "Purchase";

type Payload = Record<string, unknown>;
type MetaStatus = "sent" | "pending" | "error" | "not_sent" | "skipped";
type Attribution = {
  source?: string | undefined;
  campaign?: string | undefined;
  adSet?: string | undefined;
  ad?: string | undefined;
  utmSource?: string | undefined;
  utmMedium?: string | undefined;
  utmCampaign?: string | undefined;
  utmContent?: string | undefined;
  utmTerm?: string | undefined;
  fbclid?: string | undefined;
  fbp?: string | undefined;
  fbc?: string | undefined;
  landingPage?: string | undefined;
  referrer?: string | undefined;
};

const GA4_ID_PATTERN = /^G-[A-Z0-9]+$/;
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/;
const ATTRIBUTION_KEY = "dqa_attribution_v1";
const STANDARD_EVENTS = new Set<StandardEventName>([
  "PageView",
  "ViewContent",
  "Lead",
  "Contact",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
]);
let trackingInitialization: Promise<void> | null = null;

type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: (...args: unknown[]) => void;
};

function cleanText(value: unknown, maxLength = 500) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, maxLength) : undefined;
}

function readCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const prefix = `${name}=`;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
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

function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  let previous: Attribution = {};
  try {
    previous = JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY) ?? "{}") as Attribution;
  } catch {
    previous = {};
  }

  const params = new URLSearchParams(window.location.search);
  const current: Attribution = {
    utmSource: cleanText(params.get("utm_source"), 255),
    utmMedium: cleanText(params.get("utm_medium"), 255),
    utmCampaign: cleanText(params.get("utm_campaign"), 255),
    utmContent: cleanText(params.get("utm_content"), 255),
    utmTerm: cleanText(params.get("utm_term"), 255),
    fbclid: cleanText(params.get("fbclid"), 500),
    campaign: cleanText(
      params.get("campaign_name") ?? params.get("campaign") ?? params.get("campaign_id"),
      255,
    ),
    adSet: cleanText(
      params.get("adset_name") ?? params.get("adset") ?? params.get("adset_id"),
      255,
    ),
    ad: cleanText(params.get("ad_name") ?? params.get("ad") ?? params.get("ad_id"), 255),
    fbp: cleanText(readCookie("_fbp"), 255),
    fbc: cleanText(readCookie("_fbc"), 255),
    landingPage: previous.landingPage ?? window.location.href.slice(0, 2048),
    referrer: previous.referrer ?? cleanText(document.referrer, 2048),
  };
  let referrerSource: string | undefined;
  try {
    referrerSource = document.referrer
      ? cleanText(new URL(document.referrer).hostname, 255)
      : undefined;
  } catch {
    referrerSource = undefined;
  }
  current.source =
    current.utmSource ??
    (current.fbclid ? "facebook" : undefined) ??
    previous.source ??
    referrerSource ??
    "direct";

  const merged = Object.fromEntries(
    Object.entries({ ...previous, ...current }).filter(([, value]) => value !== undefined),
  ) as Attribution;
  try {
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(merged));
  } catch {
    // Tracking must never interrupt the visitor journey.
  }
  return merged;
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
  captureAttribution();
  const published = await loadPublished();
  const config = published?.tracking;
  const metaPixelId = config?.metaPixelId || TRACKING_CONFIG.metaPixelId;
  const ga4Id = normalizeTrackingId(config?.ga4Id || TRACKING_CONFIG.ga4Id, GA4_ID_PATTERN);
  const gtmId = normalizeTrackingId(config?.gtmId || TRACKING_CONFIG.gtmId, GTM_ID_PATTERN);

  if (metaPixelId) {
    if (!window.fbq) {
      const fbq = function (...args: unknown[]) {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue.push(args);
      } as MetaPixelFunction;
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.push = fbq;
      window.fbq = fbq;
    }

    let script = document.querySelector<HTMLScriptElement>('script[data-dqa="meta"]');
    if (script?.dataset["metaPixelId"] !== metaPixelId) {
      window.fbq("init", metaPixelId);
    }
    if (!script) {
      script = document.createElement("script");
      script.dataset["dqa"] = "meta";
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      script.async = true;
      document.head.appendChild(script);
    }
    script.dataset["metaPixelId"] = metaPixelId;
  }

  if (ga4Id && !document.querySelector(`script[data-dqa="ga4"][data-id="${ga4Id}"]`)) {
    ensureGoogleQueue();
    window.gtag?.("js", new Date());
    window.gtag?.("config", ga4Id);
    const script = document.createElement("script");
    script.dataset["dqa"] = "ga4";
    script.dataset["id"] = ga4Id;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
    script.async = true;
    document.head.appendChild(script);
  }

  if (gtmId && !document.querySelector(`script[data-dqa="gtm"][data-id="${gtmId}"]`)) {
    ensureGoogleQueue();
    window.dataLayer?.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const script = document.createElement("script");
    script.dataset["dqa"] = "gtm";
    script.dataset["id"] = gtmId;
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

function primitivePayload(payload: Payload) {
  return Object.fromEntries(
    Object.entries(payload)
      .slice(0, 40)
      .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
      .map(([key, value]) => [
        key.slice(0, 80),
        typeof value === "string" ? value.slice(0, 500) : value,
      ]),
  ) as Record<string, string | number | boolean>;
}

function numericValue(payload: Payload) {
  const value = payload["value"];
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

async function recordEvent(
  eventName: string,
  payload: Payload,
  options: {
    eventId?: string;
    pixelStatus?: MetaStatus;
    apiStatus?: MetaStatus;
    metaError?: string;
    isTest?: boolean;
  } = {},
) {
  const attribution = captureAttribution();
  const value = numericValue(payload);
  const currency =
    cleanText(payload["currency"], 8)?.toUpperCase() ?? (value !== undefined ? "BRL" : undefined);
  const row = {
    event_name: eventName.slice(0, 120),
    payload: primitivePayload(payload),
    session_id: getSessionId(),
    event_id: options.eventId ?? null,
    page_url: window.location.href.slice(0, 2048),
    page_title: document.title.slice(0, 500),
    referrer: attribution.referrer ?? null,
    value: value ?? null,
    currency: currency ?? null,
    source: attribution.source ?? null,
    campaign: attribution.campaign ?? attribution.utmCampaign ?? null,
    ad_set: attribution.adSet ?? null,
    ad: attribution.ad ?? null,
    utm_source: attribution.utmSource ?? null,
    utm_medium: attribution.utmMedium ?? null,
    utm_campaign: attribution.utmCampaign ?? null,
    utm_content: attribution.utmContent ?? null,
    utm_term: attribution.utmTerm ?? null,
    fbclid: attribution.fbclid ?? null,
    fbp: attribution.fbp ?? null,
    fbc: attribution.fbc ?? null,
    client_name: cleanText(payload["name"] ?? payload["nome"], 255) ?? null,
    lead_status: cleanText(payload["status"], 80) ?? null,
    meta_pixel_status: options.pixelStatus ?? "not_sent",
    meta_api_status: options.apiStatus ?? "not_sent",
    meta_error: cleanText(options.metaError, 500) ?? null,
    is_test: options.isTest ?? false,
  };
  const { error } = await supabase.rpc("record_tracking_event", { p_event: row });
  if (error && error.code !== "23505") {
    console.error("[Analytics] Falha ao registrar evento", {
      event: eventName,
      code: error.code,
      message: error.message,
    });
    return false;
  }
  return true;
}

async function dispatchStandardEvent(
  eventName: StandardEventName,
  payload: Payload = {},
  options: { test?: boolean; skipInitialization?: boolean } = {},
) {
  if (typeof window === "undefined") return false;
  if (!options.skipInitialization) await initPublishedTracking();
  const eventId = `${eventName.toLowerCase()}_${Date.now()}_${crypto.randomUUID()}`;
  const attribution = captureAttribution();
  let pixelStatus: MetaStatus = "not_sent";
  let apiStatus: MetaStatus = "pending";
  let metaError: string | undefined;

  if (!options.test && window.fbq) {
    window.fbq("track", eventName, primitivePayload(payload), { eventID: eventId });
    pixelStatus = "sent";
  }

  if (!options.test) {
    if (window.gtag) window.gtag("event", eventName, payload);
    else window.dataLayer?.push({ event: eventName, ...payload });
  }

  try {
    const module = await import("@/lib/meta-conversions.functions");
    const request = {
      data: {
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        ...(attribution.fbp ? { fbp: attribution.fbp } : {}),
        ...(attribution.fbc ? { fbc: attribution.fbc } : {}),
        sessionId: getSessionId(),
        customData: primitivePayload(payload),
      },
    };
    const result = options.test
      ? await module.testMetaEvent(request)
      : await module.sendMetaConversion(request);
    apiStatus = result.status;
    metaError = "error" in result ? result.error : undefined;
  } catch (error) {
    apiStatus = "error";
    metaError = error instanceof Error ? error.message : "Falha ao enviar evento.";
  }

  await recordEvent(eventName, payload, {
    eventId,
    pixelStatus,
    apiStatus,
    ...(metaError ? { metaError } : {}),
    isTest: options.test ?? false,
  });
  return { eventId, pixelStatus, apiStatus, error: metaError };
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
  if (STANDARD_EVENTS.has(event as StandardEventName)) {
    return Boolean(await dispatchStandardEvent(event as StandardEventName, payload));
  }
  await initPublishedTracking();
  window.fbq?.("trackCustom", event, primitivePayload(payload));
  if (window.gtag) window.gtag("event", event, payload);
  else window.dataLayer?.push({ event, ...payload });
  return recordEvent(event, payload);
}

/**
 * Records product/funnel analytics only. These events feed the internal dashboard
 * and intentionally do not reach Meta Pixel, Conversions API, GA4 or GTM.
 */
export function trackFunnelEvent(event: string, payload: Payload = {}) {
  if (typeof window === "undefined") return Promise.resolve(false);
  return recordEvent(event, payload);
}

export function trackLead(payload: Payload = {}) {
  if (typeof window === "undefined") return;
  void dispatchStandardEvent("Lead", payload);
}

export function trackContact(payload: Payload = {}) {
  if (typeof window === "undefined") return;
  void dispatchStandardEvent("Contact", payload);
}

export async function trackCheckoutClick(payload: Payload = {}) {
  if (typeof window === "undefined") return false;
  const [metaResult, funnelResult] = await Promise.all([
    dispatchStandardEvent("InitiateCheckout", payload),
    trackFunnelEvent("checkout_iniciado", payload),
  ]);
  return Boolean(metaResult || funnelResult);
}

export function trackPurchase(value: number, currency = "BRL", payload: Payload = {}) {
  if (typeof window === "undefined") return;
  void dispatchStandardEvent("Purchase", { ...payload, value, currency });
}

export function testTrackingEvent(eventName: StandardEventName, payload: Payload = {}) {
  return dispatchStandardEvent(eventName, payload, { test: true });
}

export function whatsappLink(message: string, number = WHATSAPP_NUMBER) {
  const sanitizedNumber = number.replace(/\D/g, "") || WHATSAPP_NUMBER;
  return `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(message)}`;
}
