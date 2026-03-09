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

export const toOriginal = (url) => normalizeSource(url) || FALLBACK_IMAGE;

export const getPrimaryImage = (imagesOrProduct) => {
  if (Array.isArray(imagesOrProduct)) {
    return imagesOrProduct.length > 0 ? imagesOrProduct[0] : "";
  }
  if (imagesOrProduct && typeof imagesOrProduct === "object") {
    if (Array.isArray(imagesOrProduct.images) && imagesOrProduct.images.length > 0) {
      return imagesOrProduct.images[0];
    }
    if (typeof imagesOrProduct.image === "string") {
      return imagesOrProduct.image;
    }
  }
  return "";
};

export const getThumbOrFallback = (images, fallback = FALLBACK_IMAGE) => {
  const source = getPrimaryImage(images);
  return source ? toThumb(source) : fallback;
};

export const getMediumOrFallback = (images, fallback = FALLBACK_IMAGE) => {
  const source = getPrimaryImage(images);
  return source ? toMedium(source) : fallback;
};

export const buildVariantChain = (sourceUrl, primary = "thumb") => {
  const normalized = normalizeSource(sourceUrl);
  if (!normalized) return [FALLBACK_IMAGE];

  const chain =
    primary === "medium"
      ? [toMedium(normalized), toOriginal(normalized), toThumb(normalized)]
      : [toThumb(normalized), toOriginal(normalized), toMedium(normalized)];

  return [...new Set(chain.filter(Boolean)), FALLBACK_IMAGE];
};

export const handleImageFallback = (event, sourceUrl, primary = "thumb") => {
  const el = event?.currentTarget;
  if (!el) return;

  const chain = buildVariantChain(sourceUrl, primary);
  const currentStep = Number(el.dataset.fallbackStep || "0");
  const nextStep = currentStep + 1;

  if (nextStep >= chain.length) {
    el.onerror = null;
    el.src = FALLBACK_IMAGE;
    return;
  }

  el.dataset.fallbackStep = String(nextStep);
  el.src = chain[nextStep];
};

// Recommended for product cards:
// medium -> original -> thumb -> placeholder
export const getCardImageOrFallback = (imagesOrProduct, fallback = FALLBACK_IMAGE) => {
  const source = getPrimaryImage(imagesOrProduct);
  return source ? toMedium(source) : fallback;
};
