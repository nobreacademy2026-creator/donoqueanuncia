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

async function ensurePublicMediaBucket(admin: Awaited<ReturnType<typeof getVerifiedAdmin>>) {
  const { data: bucket, error: bucketError } = await admin.storage.getBucket("funnel-media");

  if (!bucket) {
    const { error: createError } = await admin.storage.createBucket("funnel-media", {
      public: true,
      fileSizeLimit: 500 * 1024 * 1024,
      allowedMimeTypes: ["image/*", "audio/*", "video/*"],
    });
    if (createError) {
      throw new Error(
        `Falha ao preparar armazenamento: ${createError.message || bucketError?.message}`,
      );
    }
    return;
  }

  if (bucket.file_size_limit !== 500 * 1024 * 1024 || !bucket.public) {
    const { error: updateError } = await admin.storage.updateBucket("funnel-media", {
      public: true,
      fileSizeLimit: 500 * 1024 * 1024,
      allowedMimeTypes: ["image/*", "audio/*", "video/*"],
    });
    if (updateError) {
      throw new Error(`Falha ao liberar a mídia publicada: ${updateError.message}`);
    }
  }
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
    const updatedAt = new Date().toISOString();
    const { error } = await admin.from("quiz_config").upsert(
      [
        { key: "funnel_content", value: draft as never, updated_at: updatedAt },
        { key: "funnel_draft", value: draft as never, updated_at: updatedAt },
      ],
      { onConflict: "key" },
    );
    if (error) throw new Error(`Falha ao publicar conteúdo: ${error.message}`);
    return { success: true, updatedAt };
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
    await ensurePublicMediaBucket(admin);
    const { data: signed, error } = await admin.storage
      .from("funnel-media")
      .createSignedUploadUrl(data.path);
    if (error || !signed?.token) {
      throw new Error(`Falha ao autorizar upload: ${error?.message ?? "token não gerado"}`);
    }
    const publicUrl = admin.storage.from("funnel-media").getPublicUrl(signed.path).data.publicUrl;
    return { path: signed.path, token: signed.token, publicUrl };
  });

export const confirmAdminMediaUpload = createServerFn({ method: "POST" })
  .middleware([serverSessionMiddleware])
  .validator((input: UploadRequest) => input)
  .handler(async ({ context, data }) => {
    const admin = await getVerifiedAdmin(context?.userId);
    await ensurePublicMediaBucket(admin);
    const { data: exists, error } = await admin.storage.from("funnel-media").exists(data.path);
    if (error || !exists) {
      throw new Error(`O arquivo não foi encontrado após o upload: ${error?.message ?? data.path}`);
    }
    return admin.storage.from("funnel-media").getPublicUrl(data.path).data.publicUrl;
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
