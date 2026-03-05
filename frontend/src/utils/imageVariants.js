const FALLBACK_IMAGE = "/no-image.svg";

const isString = (value) => typeof value === "string" && value.trim().length > 0;

const normalizeSource = (url) => {
  if (!isString(url)) return "";
  return url.trim().replace(/\\/g, "/");
};

export const toThumb = (url) => {
  const normalized = normalizeSource(url);
  if (!normalized) return FALLBACK_IMAGE;
  return normalized.includes("/uploads/images/")
    ? normalized.replace("/uploads/images/", "/uploads/images/thumb/")
    : normalized;
};

export const toMedium = (url) => {
  const normalized = normalizeSource(url);
  if (!normalized) return FALLBACK_IMAGE;
  return normalized.includes("/uploads/images/")
    ? normalized.replace("/uploads/images/", "/uploads/images/medium/")
    : normalized;
};

export const getPrimaryImage = (images) =>
  Array.isArray(images) && images.length > 0 ? images[0] : "";

export const getThumbOrFallback = (images, fallback = FALLBACK_IMAGE) => {
  const source = getPrimaryImage(images);
  return source ? toThumb(source) : fallback;
};

export const getMediumOrFallback = (images, fallback = FALLBACK_IMAGE) => {
  const source = getPrimaryImage(images);
  return source ? toMedium(source) : fallback;
};
