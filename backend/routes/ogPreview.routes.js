import express from "express";
import mongoose from "mongoose";
import Ad from "../models/Ad.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const FRONTEND_BASE_URL =
  process.env.APP_BASE_URL ||
  process.env.FRONTEND_BASE_URL ||
  "https://zitheke.com";

const API_BASE_URL =
  process.env.API_BASE_URL ||
  "https://api.zitheke.com";

const OG_FALLBACK_IMAGE = `${FRONTEND_BASE_URL}/logo.png`;

/*
|--------------------------------------------------------------------------
| SOCIAL CRAWLER DETECTION
|--------------------------------------------------------------------------
*/

const CRAWLER_UA_REGEX =
  /(facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|TelegramBot|Slackbot|Discordbot|Pinterest|Googlebot)/i;

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

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
    return raw;
  }

  if (raw.startsWith("/uploads")) {
    return `${API_BASE_URL}${raw}`;
  }

  if (raw.startsWith("/")) {
    return `${FRONTEND_BASE_URL}${raw}`;
  }

  return `${API_BASE_URL}/uploads/${raw}`;
};

const getLocationText = (ad) =>
  [ad?.location, ad?.city, ad?.state]
    .filter(Boolean)
    .join(", ");

const getPriceText = (price) => {
  if (!price) return "";

  const numeric = Number(price);

  if (!Number.isNaN(numeric)) {
    return numeric.toLocaleString("en-US");
  }

  return String(price);
};

/*
|--------------------------------------------------------------------------
| HTML TEMPLATES
|--------------------------------------------------------------------------
*/

const renderNotFoundHtml = () => `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Listing not found</title>
</head>
<body>
<h1>404 - Listing not found</h1>
</body>
</html>
`;

const renderOgHtml = ({
  title,
  description,
  image,
  url
}) => {

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeUrl = escapeHtml(url);

  return `
<!doctype html>
<html lang="en">
<head>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>${safeTitle}</title>

<link rel="canonical" href="${safeUrl}" />

<meta property="og:type" content="website" />
<meta property="og:site_name" content="ZITHEKE Marketplace" />

<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDescription}" />
<meta property="og:url" content="${safeUrl}" />

<meta property="og:image" content="${safeImage}" />
<meta property="og:image:secure_url" content="${safeImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${safeTitle}" />
<meta name="twitter:description" content="${safeDescription}" />
<meta name="twitter:image" content="${safeImage}" />

<meta http-equiv="refresh" content="0; url=${safeUrl}" />

</head>

<body>

<p>Redirecting to listing...</p>

<script>
window.location.replace("${safeUrl}");
</script>

</body>
</html>
`;
};

/*
|--------------------------------------------------------------------------
| ROUTE
|--------------------------------------------------------------------------
*/

router.get("/ad/:id", async (req, res, next) => {

  const { id } = req.params;

  const userAgent = req.headers["user-agent"] || "";

  const isCrawler = CRAWLER_UA_REGEX.test(userAgent);

  /*
  |--------------------------------------------------------------------------
  | NORMAL BROWSER → SPA
  |--------------------------------------------------------------------------
  */

  if (!isCrawler) {
    return res.redirect(`${FRONTEND_BASE_URL}/ad/${id}`);
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE OBJECT ID
  |--------------------------------------------------------------------------
  */

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .type("html")
      .send(renderNotFoundHtml());
  }

  try {

    const ad = await Ad.findById(id)
      .select("title price location city state images")
      .lean();

    if (!ad) {
      return res
        .status(404)
        .type("html")
        .send(renderNotFoundHtml());
    }

    const ogTitle = `${ad.title || "Listing"} - ZITHEKE`;

    const locationText = getLocationText(ad);

    const priceText = getPriceText(ad.price);

    const ogDescription =
      [
        priceText ? `MK ${priceText}` : "",
        locationText
      ]
        .filter(Boolean)
        .join(" | ") ||
      "Find listings on ZITHEKE";

    const ogImage = buildAbsoluteImageUrl(ad?.images?.[0]);

    const ogUrl = `${FRONTEND_BASE_URL}/ad/${id}`;

    const html = renderOgHtml({
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      url: ogUrl
    });

    res.setHeader(
      "Content-Type",
      "text/html; charset=utf-8"
    );

    res.setHeader(
      "Cache-Control",
      "public, max-age=300"
    );

    return res.status(200).send(html);

  } catch (error) {

    console.error(
      "OG preview route error:",
      error?.message || error
    );

    return res
      .status(500)
      .type("html")
      .send(`
<!doctype html>
<html>
<head>
<title>Server Error</title>
</head>
<body>
<h1>500 - Internal server error</h1>
</body>
</html>
`);
  }

});
 