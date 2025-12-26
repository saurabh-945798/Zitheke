import express from "express";
import multer from "multer";
import {
  createAd,
  getUserAds,
  getAllAds,
  getAdById,
  updateAd,
  deleteAd,
  markAsSold,
  incrementView,
  updateFavoriteCount,
  searchAds,
} from "../Controllers/adController.js";

// 🔹 Cloudinary Integration
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// 🔥 Multer Error Handler
import multerErrorHandler from "../middlewares/multerErrorHandler.js";

const router = express.Router();

/* =============================
   🔧 CLOUDINARY CONFIG
============================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =============================
   📦 CLOUDINARY STORAGE
   (Images + Video)
============================= */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // 🎥 VIDEO CONFIG
    if (file.mimetype.startsWith("video")) {
      return {
        folder: "zitheke_uploads/videos",
        resource_type: "video",
        allowed_formats: ["mp4", "webm", "mov"],
      };
    }

    // 🖼️ IMAGE CONFIG
    return {
      folder: "zitheke_uploads/images",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    };
  },
});

/* =============================
   📤 MULTER CONFIG
============================= */
const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // ⛔ 30MB max (video limit)
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error("Only image and video files are allowed"),
        false
      );
    }
  },
});

/* =============================
        🔹 ROUTES START
============================= */

// 🟢 CREATE New Ad (Images + Optional Video)
router.post(
  "/create",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  multerErrorHandler, // ✅ VERY IMPORTANT (user-friendly error)
  createAd
);

// 👤 Get Ads created by specific user
router.get("/user/:uid", getUserAds);

// 🌍 Get ALL Approved Ads
router.get("/", getAllAds);

// 🔎 Search Ads (query + location)
router.get("/search/ads", searchAds);

// 🟣 Get Single Ad by ID
router.get("/:id", getAdById);

// 👁️ Increment View Count
router.put("/:id/view", incrementView);

// ❤️ Update Favorite Count
router.put("/:id/favorite", updateFavoriteCount);

// 💰 Mark Ad as SOLD
router.put("/:id/sold", markAsSold);

// ✏️ Update Ad (Images + Optional Video Replace)
router.put(
  "/:id",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  multerErrorHandler, // ✅ SAME handler here
  updateAd
);

// ❌ Delete Ad
router.delete("/:id", deleteAd);

/* =============================
        🔹 ROUTES END
============================= */

export default router;
