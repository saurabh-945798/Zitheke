import express from "express";
import mongoose from "mongoose";
import Ad from "../models/Ad.js";

const router = express.Router();

const FRONTEND_BASE_URL =
  process.env.APP_BASE_URL ||
  process.env.FRONTEND_BASE_URL ||
  "https://zitheke.com";

const OG_FALLBACK_IMAGE = `${FRONTEND_BASE_URL}/logo.png`;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildAbsoluteImageUrl = (imagePath) => {
  const raw = String(imagePath || "").trim();
  if (!raw) return OG_FALLBACK_IMAGE;

  if (/^https?:\/\//i.test(raw)) {
    // Guard against accidentally leaked localhost URLs in production data.
    if (/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(raw)) {
      const idx = raw.indexOf("/uploads/");
      if (idx !== -1) return `${FRONTEND_BASE_URL}${raw.substring(idx)}`;
    }
    return raw;
  }

  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  return `${FRONTEND_BASE_URL}${normalized}`;
};

const getLocationText = (ad) =>
  [ad?.location, ad?.city, ad?.state].filter(Boolean).join(", ");

const getPriceText = (price) => {
  if (price === null || price === undefined || price === "") return "";
  const numeric = Number(price);
  if (!Number.isNaN(numeric)) return numeric.toLocaleString("en-US");
  return String(price);
};

const renderNotFoundHtml = () => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>404 - Listing not found</title>
  </head>
  <body>
    <h1>404 - Listing not found</h1>
  </body>
</html>`;

const renderOgHtml = ({ adId, title, description, image, url }) => {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeUrl = escapeHtml(url);
  const safeRedirectPath = `/ad/${escapeHtml(adId)}`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>

    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:type" content="website" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImage}" />

    <meta http-equiv="refresh" content="0;url=${safeRedirectPath}" />
  </head>
  <body>
    <script>
      window.location.href = "${safeRedirectPath}";
    </script>
    <noscript>
      <p>Redirecting to listing... <a href="${safeRedirectPath}">Open ad</a></p>
    </noscript>
  </body>
</html>`;
};

// Dynamic OG endpoint for every product page
router.get("/ad/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).type("html").send(renderNotFoundHtml());
  }

  try {
    const ad = await Ad.findById(id)
      .select("title price location city state images")
      .lean();

    if (!ad) {
      return res.status(404).type("html").send(renderNotFoundHtml());
    }

    const ogTitle = `${ad?.title || "Listing"} - ZITHEKE`;
    const locationText = getLocationText(ad);
    const priceText = getPriceText(ad?.price);
    const ogDescription =
      [priceText ? `MK ${priceText}` : "", locationText].filter(Boolean).join(" | ") ||
      "Find listings on ZITHEKE";
    const ogImage = buildAbsoluteImageUrl(ad?.images?.[0]);
    const ogUrl = `${FRONTEND_BASE_URL}/ad/${id}`;

    const html = renderOgHtml({
      adId: id,
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      url: ogUrl,
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60");
    return res.status(200).send(html);
  } catch (error) {
    console.error("OG preview route error:", error?.message || error);
    return res
      .status(500)
      .type("html")
      .send(
        "<!doctype html><html><head><title>Server Error</title></head><body><h1>500 - Internal server error</h1></body></html>"
      );
  }
});

export default router;

