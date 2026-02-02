// src/utils/getImageUrl.js

/**
 * ✅ Universal image handler for Cloudinary + fallback
 * Handles:
 *  - Full Cloudinary URLs
 *  - Relative paths (/uploads/...)
 *  - Empty or invalid values
 * 
 * Uses Cloud name from .env → VITE_CLOUDINARY_CLOUD_NAME
 */

export const getImageUrl = (url) => {
    const CLOUD_NAME =
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dxah12xl4"; // 🔹 fallback to your cloud
  
    // 🩵 Placeholder (if image missing)
    const FALLBACK_IMAGE =
      "https://cdn-icons-png.flaticon.com/512/2748/2748558.png";
  
    // 🛑 If no image
    if (!url) return FALLBACK_IMAGE;
  
    // 🌍 If it's already a full Cloudinary / external URL
    if (url.startsWith("http")) return url;
  
    // 📦 For relative paths (old uploads or stored file names)
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${url}`;
  };
  