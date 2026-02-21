import path from "path";
import { fileURLToPath } from "url";

const nodeEnv = String(process.env.NODE_ENV || "development").trim();
const isProduction = nodeEnv === "production";
const configuredApiBaseUrl = String(
  process.env.API_BASE_URL || process.env.APP_BASE_URL || ""
).replace(/\/+$/, "");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsBaseDir = path.resolve(__dirname, "..", "uploads");

const sanitizeBaseUrl = (base) => String(base || "").replace(/\/+$/, "");

export const getBaseUrl = (req) => {
  if (isProduction && configuredApiBaseUrl) {
    return sanitizeBaseUrl(configuredApiBaseUrl);
  }

  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const forwardedHost = String(req.headers["x-forwarded-host"] || "").split(",")[0].trim();
  if (isProduction && forwardedProto && forwardedHost) {
    return sanitizeBaseUrl(`${forwardedProto}://${forwardedHost}`);
  }

  if (isProduction) {
    throw new Error(
      "Unable to resolve public API base URL in production. Set API_BASE_URL."
    );
  }

  // Development fallback.
  return sanitizeBaseUrl(`${req.protocol}://${req.get("host")}`);
};

export const toPublicUrl = (req, relativePath) => {
  const rel = String(relativePath || "").replace(/\\/g, "/");
  if (!rel) return "";
  if (rel.startsWith("http://") || rel.startsWith("https://")) return rel;
  const normalized = rel.startsWith("/") ? rel : `/${rel}`;
  return `${getBaseUrl(req)}${normalized}`;
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
