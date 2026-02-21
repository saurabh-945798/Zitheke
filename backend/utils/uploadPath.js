import path from "path";
import { fileURLToPath } from "url";

const appBaseUrl = String(process.env.APP_BASE_URL || "").replace(/\/+$/, "");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsBaseDir = path.resolve(__dirname, "..", "uploads");

export const toPublicUrl = (req, relativePath) => {
  const rel = String(relativePath || "").replace(/\\/g, "/");
  if (!rel) return "";
  if (rel.startsWith("http://") || rel.startsWith("https://")) return rel;
  const normalized = rel.startsWith("/") ? rel : `/${rel}`;
  const fallbackBase = `${req.protocol}://${req.get("host")}`;
  return `${appBaseUrl || fallbackBase}${normalized}`;
};

export const publicPathFromFile = (file) => {
  const folder = path.basename(file.destination || "");
  const filename = file.filename || path.basename(file.path || "");
  return `/uploads/${folder}/${filename}`;
};

export const isCloudinaryUrl = (url = "") =>
  String(url).includes("res.cloudinary.com");

export const isLocalUploadUrl = (url = "") =>
  /\/uploads\/(images|videos)\//.test(String(url));

export const localAbsolutePathFromUrl = (url = "") => {
  const raw = String(url || "");
  const marker = "/uploads/";
  const idx = raw.indexOf(marker);
  if (idx === -1) return "";
  const rel = raw.slice(idx + marker.length).replace(/\//g, path.sep);
  return path.join(uploadsBaseDir, rel);
};
