import fs from "fs/promises";
import path from "path";

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

let sharpLib = null;
let sharpLoadAttempted = false;

const getSharp = async () => {
  if (sharpLib) return sharpLib;
  if (sharpLoadAttempted) return null;
  sharpLoadAttempted = true;
  try {
    const mod = await import("sharp");
    sharpLib = mod?.default || mod;
    return sharpLib;
  } catch (err) {
    console.warn("sharp not available, skipping image optimization:", err?.message || err);
    return null;
  }
};

export const optimizeImageFile = async (filePath, mimeType = "") => {
  if (!filePath) throw new Error("Image file path is required");
  if (!ALLOWED_IMAGE_MIMES.has(mimeType)) {
    throw new Error("Unsupported image mime type");
  }

  const sharp = await getSharp();
  if (!sharp) {
    // Graceful fallback: keep original uploaded image if sharp is unavailable.
    return filePath;
  }

  const dir = path.dirname(filePath);
  const name = path.basename(filePath, path.extname(filePath));
  const optimizedPath = path.join(dir, `${name}.jpg`);

  await sharp(filePath)
    .rotate()
    .resize({ width: 1400, withoutEnlargement: true })
    .jpeg({ quality: 75, mozjpeg: true })
    .toFile(optimizedPath);

  if (optimizedPath !== filePath) {
    await fs.unlink(filePath).catch(() => {});
  }

  return optimizedPath;
};
