import { createHash } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestIP } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { serverSessionMiddleware } from "@/lib/auth-middleware.server";

const ALLOWED_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "Lead",
  "Contact",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
]);

type MetaConversionInput = {
  eventName: string;
  eventId: string;
  eventSourceUrl: string;
  fbp?: string;
  fbc?: string;
  sessionId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  customData?: Record<string, string | number | boolean>;
};

function cleanOptional(value: unknown, maxLength = 500) {
  return typeof value === "string" && value.length > 0 ? value.slice(0, maxLength) : undefined;
}

function validateMetaInput(input: MetaConversionInput) {
  if (!ALLOWED_EVENTS.has(input.eventName)) throw new Error("Evento da Meta não permitido.");
  // Suaviza o regex para aceitar IDs gerados pelo webhook (prefixo wb_)
  if (!/^[a-zA-Z0-9_-]{3,120}$/.test(input.eventId)) throw new Error("event_id inválido.");

  const sourceUrl = new URL(input.eventSourceUrl);
  if (sourceUrl.protocol !== "https:" && sourceUrl.protocol !== "http:") {
    throw new Error("URL de origem inválida.");
  }

  const customData = Object.fromEntries(
    Object.entries(input.customData ?? {})
      .slice(0, 30)
      .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
      .map(([key, value]) => [
        key.slice(0, 80),
        typeof value === "string" ? value.slice(0, 500) : value,
      ]),
  );

  return {
    eventName: input.eventName,
    eventId: input.eventId,
    eventSourceUrl: sourceUrl.toString().slice(0, 2048),
    fbp: cleanOptional(input.fbp, 255),
    fbc: cleanOptional(input.fbc, 255),
    sessionId: cleanOptional(input.sessionId, 100),
    email: cleanOptional(input.email, 255),
    phone: cleanOptional(input.phone, 50),
    firstName: cleanOptional(input.firstName, 100),
    lastName: cleanOptional(input.lastName, 100),
    customData,
  };
}

function safeMetaError(raw: string) {
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: unknown; code?: unknown } };
    const message =
      typeof parsed.error?.message === "string"
        ? parsed.error.message.slice(0, 500)
        : "Evento rejeitado pela Meta.";
    const code =
      typeof parsed.error?.code === "number" || typeof parsed.error?.code === "string"
        ? String(parsed.error.code).slice(0, 30)
        : undefined;
    return code ? `${message} (código ${code})` : message;
  } catch {
    return "Evento rejeitado pela Meta.";
  }
}

async function deliverMetaConversion(
  data: ReturnType<typeof validateMetaInput>,
  options: { test: boolean },
) {
  const pixelId = process.env["META_PIXEL_ID"] || process.env["VITE_META_PIXEL_ID"] || "";
  const accessToken = process.env["META_CONVERSIONS_ACCESS_TOKEN"];
  const apiVersion = process.env["META_GRAPH_API_VERSION"] ?? "v25.0";
  const testEventCode = process.env["META_TEST_EVENT_CODE"];

  if (!pixelId || !accessToken) {
    return { sent: false, status: "not_sent" as const, reason: "not_configured" as const };
  }
  if (options.test && !testEventCode) {
    return { sent: false, status: "not_sent" as const, reason: "test_not_configured" as const };
  }

  const request = getRequest();
  const clientIpAddress = getRequestIP({ xForwardedFor: true });
  const clientUserAgent = request.headers.get("user-agent") ?? undefined;
  const externalId = data.sessionId
    ? createHash("sha256").update(data.sessionId).digest("hex")
    : undefined;

  const userData = Object.fromEntries(
    Object.entries({
      client_ip_address: clientIpAddress,
      client_user_agent: clientUserAgent,
      fbp: data.fbp,
      fbc: data.fbc,
      external_id: externalId ? [externalId] : undefined,
    }).filter(([, value]) => value !== undefined),
  );

  try {
    const response = await fetch(
      `https://graph.facebook.com/${encodeURIComponent(apiVersion)}/${encodeURIComponent(pixelId)}/events`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          access_token: accessToken,
          ...(options.test && testEventCode ? { test_event_code: testEventCode } : {}),
          data: [
            {
              event_name: data.eventName,
              event_time: Math.floor(Date.now() / 1000),
              event_id: data.eventId,
              event_source_url: data.eventSourceUrl,
              action_source: "website",
              user_data: userData,
              custom_data: data.customData,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const error = safeMetaError((await response.text()).slice(0, 4000));
      console.error("[Meta CAPI] Evento rejeitado", {
        eventName: data.eventName,
        eventId: data.eventId,
        status: response.status,
        error,
      });
      return { sent: false, status: "error" as const, reason: "api_error" as const, error };
    }

    return { sent: true, status: "sent" as const };
  } catch (cause) {
    const error = cause instanceof Error ? cause.message.slice(0, 500) : "Falha de rede.";
    console.error("[Meta CAPI] Falha de rede", {
      eventName: data.eventName,
      eventId: data.eventId,
      error,
    });
    return { sent: false, status: "error" as const, reason: "network_error" as const, error };
  }
}

function isSameOriginSource(eventSourceUrl: string) {
  try {
    const request = getRequest();
    const browserOrigin = request.headers.get("origin") ?? request.headers.get("referer");
    
    // Se não houver cabeçalho de origem (direto ou proxy), ou se for o próprio servidor/webhook
    // permitimos para não bloquear webhooks legítimos ou navegações diretas.
    if (!browserOrigin) return true;

    const sourceOrigin = new URL(eventSourceUrl).origin;
    const requestOrigin = new URL(browserOrigin).origin;
    
    // Se a origem da URL do evento for a mesma do request, é seguro.
    if (sourceOrigin === requestOrigin) return true;

    // Permitir se o evento vier da URL do próprio projeto (importante para webhooks e redirecionamentos)
    const projectUrl = process.env["VITE_PROJECT_URL"] || request.headers.get("host");
    if (projectUrl && sourceOrigin.includes(projectUrl)) return true;

    return false;
  } catch {
    return false;
  }
}

async function assertAdmin(userId: string | null, accessToken: string | null) {
  if (!userId || !accessToken) throw new Error("Não autenticado.");
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Configuração do servidor indisponível.");

  const client = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || data?.role !== "admin") throw new Error("Acesso administrativo necessário.");
}

export const sendMetaConversion = createServerFn({ method: "POST" })
  .validator(validateMetaInput)
  .handler(async ({ data }) => {
    // Webhooks de plataformas (Cacto, etc) e chamadas diretas do servidor não possuem headers de navegador.
    const request = getRequest();
    const isWebhook = !request.headers.get("origin") && !request.headers.get("referer");
    
    if (!isWebhook && !isSameOriginSource(data.eventSourceUrl)) {
      console.warn("[Meta CAPI] Origem divergente, evento ignorado", data.eventSourceUrl);
      return { sent: false, status: "skipped" as const, reason: "invalid_origin" as const };
    }
    return deliverMetaConversion(data, { test: false });
  });

export const testMetaEvent = createServerFn({ method: "POST" })
  .middleware([serverSessionMiddleware])
  .validator(validateMetaInput)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId, context.accessToken);
    return deliverMetaConversion(data, { test: true });
  });

export const getMetaIntegrationStatus = createServerFn({ method: "GET" })
  .middleware([serverSessionMiddleware])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId, context.accessToken);
    const pixelId = process.env["META_PIXEL_ID"] ?? process.env["VITE_META_PIXEL_ID"] ?? "";
    const capiConfigured = Boolean(process.env["META_CONVERSIONS_ACCESS_TOKEN"] && pixelId);
    return {
      pixelConfigured: Boolean(pixelId),
      capiConfigured,
      testModeConfigured: Boolean(process.env["META_TEST_EVENT_CODE"]),
      maskedPixelId: pixelId ? `••••••••${pixelId.slice(-4)}` : null,
      apiVersion: process.env["META_GRAPH_API_VERSION"] ?? "v25.0",
    };
  });
