import { supabase } from "@/integrations/supabase/client";
import { createAdminMediaUpload } from "./admin-data.functions";

export async function uploadAdminMedia(file: File) {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const path = `admin/${crypto.randomUUID()}-${safeName}`;
  const signed = await createAdminMediaUpload({ data: { path } });
  const { error } = await supabase.storage
    .from("funnel-media")
    .uploadToSignedUrl(signed.path, signed.token, file, {
      contentType: file.type,
      cacheControl: "3600",
    });
  if (error) throw error;
  return supabase.storage.from("funnel-media").getPublicUrl(signed.path).data.publicUrl;
}
