import { createHash } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestIP } from "@tanstack/react-start/server";

const ALLOWED_EVENTS = new Set(["PageView", "Lead", "InitiateCheckout"]);

type MetaConversionInput = {
  eventName: string;
  eventId: string;
  eventSourceUrl: string;
  fbp?: string;
  fbc?: string;
  sessionId?: string;
  customData?: Record<string, string | number | boolean>;
};

function cleanOptional(value: unknown, maxLength = 500) {
  return typeof value === "string" && value.length > 0 ? value.slice(0, maxLength) : undefined;
}

export const sendMetaConversion = createServerFn({ method: "POST" })
  .validator((input: MetaConversionInput) => {
    if (!ALLOWED_EVENTS.has(input.eventName)) throw new Error("Evento da Meta não permitido.");
    if (!/^[a-zA-Z0-9_-]{8,100}$/.test(input.eventId)) throw new Error("event_id inválido.");

    const sourceUrl = new URL(input.eventSourceUrl);
    if (sourceUrl.protocol !== "https:" && sourceUrl.protocol !== "http:") {
      throw new Error("URL de origem inválida.");
    }

    return {
      eventName: input.eventName,
      eventId: input.eventId,
      eventSourceUrl: sourceUrl.toString().slice(0, 2048),
      fbp: cleanOptional(input.fbp, 255),
      fbc: cleanOptional(input.fbc, 255),
      sessionId: cleanOptional(input.sessionId, 100),
      customData: input.customData ?? {},
    };
  })
  .handler(async ({ data }) => {
    const pixelId = process.env["META_PIXEL_ID"] ?? process.env["VITE_META_PIXEL_ID"];
    const accessToken = process.env["META_CONVERSIONS_ACCESS_TOKEN"];
    const apiVersion = process.env["META_GRAPH_API_VERSION"] ?? "v25.0";

    if (!pixelId || !accessToken) {
      return { sent: false, reason: "not_configured" as const };
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

    const response = await fetch(
      `https://graph.facebook.com/${encodeURIComponent(apiVersion)}/${encodeURIComponent(pixelId)}/events`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          access_token: accessToken,
          ...(process.env["META_TEST_EVENT_CODE"]
            ? { test_event_code: process.env["META_TEST_EVENT_CODE"] }
            : {}),
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
      const details = (await response.text()).slice(0, 1000);
      console.error("[Meta CAPI] Evento rejeitado", {
        eventName: data.eventName,
        status: response.status,
        details,
      });
      return { sent: false, reason: "api_error" as const };
    }

    return { sent: true };
  });
