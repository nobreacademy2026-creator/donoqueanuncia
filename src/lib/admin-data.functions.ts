import { createServerFn } from "@tanstack/react-start";
import { serverSessionMiddleware } from "./auth-middleware.server";
import type { FunnelDraft } from "./funnel-content";

// jsonb does not preserve key order, so compare structurally with sorted keys.
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
}

async function getVerifiedAdmin(
  userId: string | null | undefined,
  accessToken: string | null | undefined,
) {
  if (!userId || !accessToken) throw new Error("Sessão administrativa inválida.");
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseUrl = process.env["SUPABASE_URL"];
  const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!supabaseUrl || !publishableKey) {
    throw new Error("A conexão com o Supabase não está configurada no servidor.");
  }
  const authenticatedAdmin = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await authenticatedAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(`Falha ao verificar administrador: ${error.message}`);
  if (!data) throw new Error("Permissão administrativa negada.");
  return authenticatedAdmin;
}

export const loadAdminAnalytics = createServerFn({ method: "GET" })
  .middleware([serverSessionMiddleware])
  .handler(async ({ context }) => {
    const admin = await getVerifiedAdmin(context?.userId, context?.accessToken);
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
    const admin = await getVerifiedAdmin(context?.userId, context?.accessToken);
    const updatedAt = new Date().toISOString();
    const { error } = await admin.from("quiz_config").upsert(
      [
        { key: "funnel_content", value: draft as never, updated_at: updatedAt },
        { key: "funnel_draft", value: draft as never, updated_at: updatedAt },
      ],
      { onConflict: "key" },
    );
    if (error) throw new Error(`Falha ao publicar conteúdo: ${error.message}`);

    const { data: published, error: verifyError } = await admin
      .from("quiz_config")
      .select("value,updated_at")
      .eq("key", "funnel_content")
      .single();
    if (verifyError || !published || stableStringify(published.value) !== stableStringify(draft)) {
      throw new Error(
        `A publicação não pôde ser confirmada no banco: ${verifyError?.message ?? "conteúdo divergente"}`,
      );
    }
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
    // Use the authenticated admin session so this works on Vercel without
    // exposing or requiring a service-role key. Storage RLS validates the role.
    const admin = await getVerifiedAdmin(context?.userId, context?.accessToken);
    const storage = admin.storage;
    const { data: signed, error } = await storage
      .from("funnel-media")
      .createSignedUploadUrl(data.path);
    if (error || !signed?.token) {
      throw new Error(`Falha ao autorizar upload: ${error?.message ?? "token não gerado"}`);
    }
    const publicUrl = storage.from("funnel-media").getPublicUrl(signed.path).data.publicUrl;
    return { path: signed.path, token: signed.token, publicUrl };
  });

export const confirmAdminMediaUpload = createServerFn({ method: "POST" })
  .middleware([serverSessionMiddleware])
  .validator((input: UploadRequest) => input)
  .handler(async ({ context, data }) => {
    const admin = await getVerifiedAdmin(context?.userId, context?.accessToken);
    const storage = admin.storage;
    const { data: exists, error } = await storage.from("funnel-media").exists(data.path);
    if (error || !exists) {
      throw new Error(`O arquivo não foi encontrado após o upload: ${error?.message ?? data.path}`);
    }
    return storage.from("funnel-media").getPublicUrl(data.path).data.publicUrl;
  });

export const saveAdminDraft = createServerFn({ method: "POST" })
  .middleware([serverSessionMiddleware])
  .validator((draft: FunnelDraft) => draft)
  .handler(async ({ context, data: draft }) => {
    const admin = await getVerifiedAdmin(context?.userId, context?.accessToken);
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
