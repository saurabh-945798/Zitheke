import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

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
  const baseName = path.basename(filePath, path.extname(filePath));
  const finalPath = path.join(dir, `${baseName}.jpg`);
  const tempPath = path.join(
    dir,
    `${baseName}.tmp-${crypto.randomBytes(6).toString("hex")}.jpg`
  );

  try {
    await sharp(filePath)
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 75, mozjpeg: true })
      .toFile(tempPath);

    await fs.unlink(filePath).catch(() => {});

    // If a stale file already exists at final path, replace it safely.
    if (tempPath !== finalPath) {
      await fs.unlink(finalPath).catch(() => {});
      await fs.rename(tempPath, finalPath);
    }

    return finalPath;
  } catch (err) {
    await fs.unlink(tempPath).catch(() => {});
    throw err;
  }
};
