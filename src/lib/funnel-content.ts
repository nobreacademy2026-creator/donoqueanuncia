import { useEffect, useState } from "react";

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
};

export const EMPTY_DRAFT: FunnelDraft = { steps: {}, sales: {} };
export const DRAFT_KEY = "dqa_funnel_draft";
export const DRAFT_EVENT = "dqa:funnel-draft";

export function readDraft(): FunnelDraft {
  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as FunnelDraft;
    return { steps: parsed.steps ?? {}, sales: parsed.sales ?? {} };
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
    (frame as HTMLIFrameElement).contentWindow?.postMessage({ type: DRAFT_EVENT, draft }, window.location.origin);
  });
}

/** Live draft content — only applied inside the admin preview (?preview=1). */
export function useFunnelDraft(): FunnelDraft {
  const [draft, setDraft] = useState<FunnelDraft>(EMPTY_DRAFT);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("preview") !== "1") return;

    setDraft(readDraft());

    const onCustom = (event: Event) => setDraft((event as CustomEvent<FunnelDraft>).detail ?? readDraft());
    const onStorage = (event: StorageEvent) => {
      if (event.key === DRAFT_KEY) setDraft(readDraft());
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === DRAFT_EVENT && event.data.draft) setDraft(event.data.draft as FunnelDraft);
    };

    window.addEventListener(DRAFT_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener(DRAFT_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return draft;
}
