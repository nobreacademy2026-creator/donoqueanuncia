import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FunnelDraft = {
  steps: Record<
    string,
    {
      title?: string;
      description?: string;
      image?: string;
      images?: string[];
      audio?: string;
      options?: string[];
    }
  >;
  sales: {
    videoHeadline?: string;
    videoThumb?: string;
    vslUrl?: string;
    fullPrice?: string;
    promoPrice?: string;
    checkoutUrl?: string;
    whatsappNumber?: string;
    whatsappMessage?: string;
  };
  tracking?: {
    metaPixelId?: string;
    ga4Id?: string;
    gtmId?: string;
  };
};

export const EMPTY_DRAFT: FunnelDraft = { steps: {}, sales: {}, tracking: {} };
export const DRAFT_KEY = "dqa_funnel_draft";
export const DRAFT_EVENT = "dqa:funnel-draft";
export const CONFIG_KEY = "funnel_content";
export const DRAFT_DB_KEY = "funnel_draft";

/** Persist a draft to the database (not published). */
export async function saveDraftToServer(draft: FunnelDraft) {
  const { saveAdminDraft } = await import("./admin-data.functions");
  await saveAdminDraft({ data: draft });
}

/** Load a draft from the database. */
export async function loadDraftFromServer(): Promise<FunnelDraft | null> {
  try {
    const { data, error } = await supabase
      .from("quiz_config")
      .select("value")
      .eq("key", DRAFT_DB_KEY)
      .maybeSingle();

    if (error) return null;
    if (!data?.value) return null;

    const parsed = data.value as FunnelDraft;
    return {
      steps: parsed.steps ?? {},
      sales: parsed.sales ?? {},
      tracking: parsed.tracking ?? {},
    };
  } catch {
    return null;
  }
}

/** Persist the current content to the database (published version). */
export async function publishDraft(draft: FunnelDraft) {
  const { publishAdminFunnel } = await import("./admin-data.functions");
  return publishAdminFunnel({ data: draft });
}

/** Load the published content from the database. */
export async function loadPublished(): Promise<FunnelDraft | null> {
  try {
    const { data, error } = await supabase
      .from("quiz_config")
      .select("value")
      .eq("key", CONFIG_KEY)
      .maybeSingle();

    if (error) {
      console.error("[Funnel] Database fetch error:", error);
      return null;
    }

    if (!data?.value) {
      console.warn("[Funnel] No data found for key:", CONFIG_KEY);
      return null;
    }

    const parsed = data.value as FunnelDraft;
    return {
      steps: parsed.steps ?? {},
      sales: parsed.sales ?? {},
      tracking: parsed.tracking ?? {},
    };
  } catch (err) {
    console.error("[Funnel] Catch-all load error:", err);
    return null;
  }
}

export function readDraft(): FunnelDraft {
  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as FunnelDraft;
    return {
      steps: parsed.steps ?? {},
      sales: parsed.sales ?? {},
      tracking: parsed.tracking ?? {},
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

export function writeDraft(draft: FunnelDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore quota errors */
  }
  window.dispatchEvent(new CustomEvent(DRAFT_EVENT, { detail: draft }));
  document.querySelectorAll("iframe[data-funnel-preview]").forEach((frame) => {
    (frame as HTMLIFrameElement).contentWindow?.postMessage(
      { type: DRAFT_EVENT, draft },
      window.location.origin,
    );
  });
}

/** Live draft inside the admin preview (?preview=1); published content otherwise. */
export function useFunnelDraft(): FunnelDraft {
  const [draft, setDraft] = useState<FunnelDraft>(() => {
    if (typeof window === "undefined") return EMPTY_DRAFT;
    const isPreview = new URLSearchParams(window.location.search).get("preview") === "1";
    return isPreview ? readDraft() : EMPTY_DRAFT;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isPreview = params.get("preview") === "1";
    let active = true;

    const loadInitial = async () => {
      try {
        if (isPreview) {
          setDraft(readDraft());
        } else {
          let retries = 0;
          const MAX_RETRIES = 5;

          while (active && retries < MAX_RETRIES) {
            const published = await loadPublished();
            if (active && published) {
              setDraft(published);
              console.log("[Funnel] Conteúdo publicado carregado com sucesso.");
              return;
            }
            retries++;
            if (active && retries < MAX_RETRIES) {
              await new Promise((resolve) => setTimeout(resolve, retries * 1000));
            }
          }
        }
      } catch (err) {
        console.error("[Funnel] Falha crítica no carregamento:", err);
      }
    };

    loadInitial();

    const publishedChannel = !isPreview
      ? supabase
          .channel("published-funnel-content")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "quiz_config",
              filter: `key=eq.${CONFIG_KEY}`,
            },
            (payload) => {
              const value = (payload.new as { value?: FunnelDraft }).value;
              if (!active || !value) return;
              const published: FunnelDraft = {
                steps: value.steps ?? {},
                sales: value.sales ?? {},
                tracking: value.tracking ?? {},
              };
              setDraft(published);
            },
          )
          .subscribe((status, error) => {
            if (error)
              console.error("[Funnel] Falha na atualização em tempo real", { status, error });
          })
      : null;

    const refreshPublished = async () => {
      if (!active || isPreview) return;
      const published = await loadPublished();
      if (active && published) setDraft(published);
    };
    const refreshTimer = !isPreview
      ? window.setInterval(() => void refreshPublished(), 60_000)
      : null;
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshPublished();
    };
    if (!isPreview) document.addEventListener("visibilitychange", onVisibilityChange);

    if (isPreview) {
      const onCustom = (event: Event) =>
        setDraft((event as CustomEvent<FunnelDraft>).detail ?? readDraft());
      const onStorage = (event: StorageEvent) => {
        if (event.key === DRAFT_KEY) setDraft(readDraft());
      };
      const onMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === DRAFT_EVENT && event.data.draft)
          setDraft(event.data.draft as FunnelDraft);
      };

      window.addEventListener(DRAFT_EVENT, onCustom);
      window.addEventListener("storage", onStorage);
      window.addEventListener("message", onMessage);
      return () => {
        active = false;
        window.removeEventListener(DRAFT_EVENT, onCustom);
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("message", onMessage);
      };
    }

    return () => {
      active = false;
      if (refreshTimer !== null) window.clearInterval(refreshTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (publishedChannel) void supabase.removeChannel(publishedChannel);
    };
  }, []);

  return draft;
}
