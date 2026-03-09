const FALLBACK_IMAGE = "/no-image.svg";

const getApiBaseUrl = () => {
  const envBase = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  if (envBase) return envBase.replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    const host = String(window.location.hostname || "").toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000";
    }
  }

  return "https://api.zitheke.com";
};

const toAbsoluteUploadUrl = (url) => {
  const normalized = String(url || "");
  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (!normalized.startsWith("/uploads/")) return normalized;
  return `${getApiBaseUrl()}${normalized}`;
};

const isString = (value) => typeof value === "string" && value.trim().length > 0;

const normalizeSource = (url) => {
  if (!isString(url)) return "";
  return url.trim().replace(/\\/g, "/");
};

const toOriginalBasePath = (url) => {
  const normalized = normalizeSource(url);
  if (!normalized) return "";

  // If DB stores just a filename, normalize to uploads original path.
  if (
    !normalized.includes("/uploads/images/") &&
    !/^https?:\/\//i.test(normalized) &&
    !normalized.startsWith("/")
  ) {
    return `/uploads/images/${normalized}`;
  }

  if (normalized.startsWith("uploads/images/")) {
    return `/${normalized}`;
  }

  // Normalize any variant path back to the canonical original path.
  // /uploads/images/medium/file.jpg -> /uploads/images/file.jpg
  // /uploads/images/thumb/file.jpg  -> /uploads/images/file.jpg
  // /uploads/images/original/file.jpg -> /uploads/images/file.jpg
  return normalized.replace(
    /\/uploads\/images\/(medium|thumb|original)\//i,
    "/uploads/images/"
  );
};

export const toThumb = (url) => {
  const base = toOriginalBasePath(url);
  if (!base) return FALLBACK_IMAGE;
  const variantPath = base.includes("/uploads/images/")
    ? base.replace("/uploads/images/", "/uploads/images/thumb/")
    : base;
  return toAbsoluteUploadUrl(variantPath);
};

export const toMedium = (url) => {
  const base = toOriginalBasePath(url);
  if (!base) return FALLBACK_IMAGE;
  const variantPath = base.includes("/uploads/images/")
    ? base.replace("/uploads/images/", "/uploads/images/medium/")
    : base;
  return toAbsoluteUploadUrl(variantPath);
};

export const toOriginal = (url) => {
  const base = toOriginalBasePath(url);
  if (!base) return FALLBACK_IMAGE;
  return toAbsoluteUploadUrl(base);
};

export const getPrimaryImage = (imagesOrProduct) => {
  if (Array.isArray(imagesOrProduct)) {
    if (imagesOrProduct.length === 0) return "";
    const first = imagesOrProduct[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && typeof first.url === "string") {
      return first.url;
    }
    return "";
  }
  if (imagesOrProduct && typeof imagesOrProduct === "object") {
    if (Array.isArray(imagesOrProduct.images) && imagesOrProduct.images.length > 0) {
      const first = imagesOrProduct.images[0];
      if (typeof first === "string") return first;
      if (first && typeof first === "object" && typeof first.url === "string") {
        return first.url;
      }
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

  const sourceKey = normalizeSource(sourceUrl) || "__empty__";
  if (el.dataset.fallbackSource !== sourceKey) {
    el.dataset.fallbackSource = sourceKey;
    el.dataset.fallbackStep = "0";
  }

  const chain = buildVariantChain(sourceUrl, primary);
  const currentStep = Number(el.dataset.fallbackStep || "0");
  const currentSrc = normalizeSource(el.currentSrc || el.src);
  const chainIndex = chain.findIndex(
    (item) => normalizeSource(item) === currentSrc
  );
  const nextStep = (chainIndex >= 0 ? chainIndex : currentStep) + 1;

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
