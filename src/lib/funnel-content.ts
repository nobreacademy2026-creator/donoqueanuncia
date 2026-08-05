import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FunnelDraft = {
  steps: Record<string, { title?: string; image?: string; audio?: string; options?: string[] }>;
  sales: {
    videoHeadline?: string;
    videoThumb?: string;
    vslUrl?: string;
    fullPrice?: string;
    promoPrice?: string;
    checkoutUrl?: string;
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

/** Persist the current content to the database (published version). */
export async function publishDraft(draft: FunnelDraft) {
  const { error } = await supabase
    .from("quiz_config")
    .upsert(
      { key: CONFIG_KEY, value: draft as any, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  if (error) throw error;
}

/** Load the published content from the database. */
export async function loadPublished(): Promise<FunnelDraft | null> {
  const { data, error } = await supabase
    .from("quiz_config")
    .select("value")
    .eq("key", CONFIG_KEY)
    .maybeSingle();
  if (error || !data?.value) return null;
  const parsed = data.value as FunnelDraft;
  return { steps: parsed.steps ?? {}, sales: parsed.sales ?? {}, tracking: parsed.tracking ?? {} };
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
  const [draft, setDraft] = useState<FunnelDraft>(EMPTY_DRAFT);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isPreview = params.get("preview") === "1";
    let active = true;

    const loadInitial = async () => {
      try {
        if (isPreview) {
          setDraft(readDraft());
        } else {
          // Check local cache first for instant load
          const cached = readDraft();
          if (cached && (Object.keys(cached.steps).length > 0 || Object.keys(cached.sales).length > 0)) {
            setDraft(cached);
          }

          let retries = 0;
          const MAX_RETRIES = 5;
          
          while (active && retries < MAX_RETRIES) {
            const published = await loadPublished();
            if (active && published) {
              setDraft(published);
              writeDraft(published); // Update cache
              console.log("[Funnel] Conteúdo publicado carregado com sucesso.");
              return;
            }
            retries++;
            if (active && retries < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, retries * 1000));
            }
          }
        }
      } catch (err) {
        console.error("[Funnel] Falha crítica no carregamento:", err);
      }
    };

    loadInitial();

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
    
    return () => { active = false; };
  }, []);

  return draft;
}
