import { createServerFn } from "@tanstack/react-start";
import { serverSessionMiddleware } from "./auth-middleware.server";
import type { FunnelDraft } from "./funnel-content";

async function getVerifiedAdmin(userId: string | null | undefined) {
  if (!userId) throw new Error("Sessão administrativa inválida.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(`Falha ao verificar administrador: ${error.message}`);
  if (!data) throw new Error("Permissão administrativa negada.");
  return supabaseAdmin;
}

export const loadAdminAnalytics = createServerFn({ method: "GET" })
  .middleware([serverSessionMiddleware])
  .handler(async ({ context }) => {
    const admin = await getVerifiedAdmin(context?.userId);
    const { data, error } = await admin
      .from("analytics_events")
      .select("id,event_name,payload,session_id,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Falha ao carregar métricas: ${error.message}`);
    return data ?? [];
  });

export const publishAdminFunnel = createServerFn({ method: "POST" })
  .middleware([serverSessionMiddleware])
  .validator((draft: FunnelDraft) => draft)
  .handler(async ({ context, data: draft }) => {
    const admin = await getVerifiedAdmin(context?.userId);
    const { error } = await admin.from("quiz_config").upsert(
      {
        key: "funnel_content",
        value: draft as never,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error) throw new Error(`Falha ao publicar conteúdo: ${error.message}`);
    return { success: true };
  });

type UploadRequest = { path: string };

export const createAdminMediaUpload = createServerFn({ method: "POST" })
  .middleware([serverSessionMiddleware])
  .validator((input: UploadRequest) => {
    if (!input.path || input.path.includes("..") || input.path.startsWith("/")) {
      throw new Error("Caminho de upload inválido.");
    }
    return input;
  })
  .handler(async ({ context, data }) => {
    const admin = await getVerifiedAdmin(context?.userId);
    const { data: signed, error } = await admin.storage
      .from("funnel-media")
      .createSignedUploadUrl(data.path);
    if (error || !signed?.token) {
      throw new Error(`Falha ao autorizar upload: ${error?.message ?? "token não gerado"}`);
    }
    return { path: data.path, token: signed.token };
  });

export const saveAdminDraft = createServerFn({ method: "POST" })
  .middleware([serverSessionMiddleware])
  .validator((draft: FunnelDraft) => draft)
  .handler(async ({ context, data: draft }) => {
    const admin = await getVerifiedAdmin(context?.userId);
    const { error } = await admin.from("quiz_config").upsert(
      {
        key: "funnel_draft",
        value: draft as never,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error) throw new Error(`Falha ao salvar rascunho no servidor: ${error.message}`);
    return { success: true };
  });

