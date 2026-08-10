const PUBLIC_STORAGE_PATH = "/storage/v1/object/public/";
const IMAGE_RENDER_PATH = "/storage/v1/render/image/public/";

export function optimizedImageUrl(source: string | undefined, width: number) {
  if (!source || !source.includes(PUBLIC_STORAGE_PATH)) return source;

  const separator = source.includes("?") ? "&" : "?";
  return `${source.replace(PUBLIC_STORAGE_PATH, IMAGE_RENDER_PATH)}${separator}width=${width}&quality=72&resize=contain`;
}

export function optimizedImageSrcSet(source: string | undefined) {
  if (!source?.includes(PUBLIC_STORAGE_PATH)) return undefined;

  return [640, 960, 1280]
    .map((width) => `${optimizedImageUrl(source, width)} ${width}w`)
    .join(", ");
}