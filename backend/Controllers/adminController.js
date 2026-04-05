import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import User from "../models/User.js";
import Ad from "../models/Ad.js";
import { EmailService } from "../Services/email.service.js";
import { optimizeImageFile } from "../utils/optimizeImage.js";
import {
  isLocalUploadUrl,
  localAbsolutePathFromUrl,
  publicPathFromFile,
  toPublicUrl,
} from "../utils/uploadPath.js";

const MAX_IMAGES = 5;
const CATEGORY_HINTS = {
  Vehicles: ["vehicle", "car", "bike", "motorcycle", "pickup"],
  Electronics: ["electronics", "device", "gadget", "appliance"],
  Mobiles: ["mobile", "phone", "smartphone", "tablet"],
  Furniture: ["furniture", "home item", "office item"],
  Fashion: ["fashion item", "wear", "clothing"],
  "Real Estate": ["property", "space", "listing"],
  Agriculture: ["agriculture item", "farm product", "farm input"],
  Services: ["service offer", "service"],
  Jobs: ["job opening", "job listing"],
  Music: ["music item", "audio gear", "instrument"],
};

const normalizeConditionInput = (raw) => {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, value: undefined };
  }

  const normalized = String(raw).trim().toLowerCase();
  if (normalized === "new") return { ok: true, value: "New" };
  if (normalized === "used") return { ok: true, value: "Used" };
  if (normalized === "not applicable") {
    return { ok: true, value: "Not Applicable" };
  }

  return {
    ok: false,
    message: "Invalid condition. Allowed values are New, Used or Not Applicable.",
  };
};

const parseArrayField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const toSentenceCase = (value = "") => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const normalizeWhitespace = (value = "") =>
  String(value || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const cleanTitle = (title = "", category = "") => {
  const normalized = normalizeWhitespace(title)
    .replace(/[|]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*[-–—]+\s*/g, " - ");

  const words = normalized
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  const cappedWords = words.slice(0, 12);
  let result = cappedWords.join(" ");

  if (result && category && cappedWords.length < 4) {
    const fallbackHint = CATEGORY_HINTS[category]?.[0];
    if (fallbackHint && !result.toLowerCase().includes(fallbackHint)) {
      result = `${result} ${fallbackHint}`;
    }
  }

  return toSentenceCase(result.replace(/\s+-\s+/g, " - "));
};

const uniqueLines = (lines = []) => {
  const seen = new Set();
  return lines.filter((line) => {
    const key = line.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const splitDescriptionLines = (description = "") => {
  const normalized = normalizeWhitespace(description);
  return normalized
    .split(/\n+/)
    .flatMap((chunk) => chunk.split(/(?<=[.!?])\s+(?=[A-Z0-9*•\-])/))
    .map((line) =>
      line
        .replace(/^[•*\-–—\s]+/, "")
        .replace(/\s{2,}/g, " ")
        .trim()
    )
    .filter(Boolean);
};

const formatDescription = ({ title, description, category = "" }) => {
  const rawLines = splitDescriptionLines(description);
  const lines = uniqueLines(rawLines);
  const cleanedTitle = cleanTitle(title, category);
  const intro =
    cleanedTitle && !lines.some((line) => line.toLowerCase() === cleanedTitle.toLowerCase())
      ? `${cleanedTitle}.`
      : "";

  const bulletLines = lines.slice(0, 8).map((line) => {
    let cleaned = line.replace(/[*]+/g, "").trim();
    cleaned = cleaned.replace(/\s*:\s*/g, ": ");
    if (!/[.!?]$/.test(cleaned)) cleaned += ".";
    return `• ${toSentenceCase(cleaned)}`;
  });

  const hint =
    category && CATEGORY_HINTS[category]?.[0]
      ? `Category: ${CATEGORY_HINTS[category][0]}.`
      : "";

  return [intro, hint, ...bulletLines].filter(Boolean).join("\n");
};

const optimizeListingCopyLocal = async ({ title, description, category }) => ({
  title: cleanTitle(title, category),
  description: formatDescription({ title, description, category }),
});

const optimizeListingCopy = async ({ title, description, category }) => {
  return optimizeListingCopyLocal({ title, description, category });
};

const cleanupLocalImageVariants = async (url = "") => {
  if (!isLocalUploadUrl(url)) return;
  const localPath = localAbsolutePathFromUrl(url);
  if (!localPath) return;
  const dir = path.dirname(localPath);
  const file = path.basename(localPath);

  await Promise.all([
    fs.unlink(localPath).catch(() => {}),
    fs.unlink(path.join(dir, "medium", file)).catch(() => {}),
    fs.unlink(path.join(dir, "thumb", file)).catch(() => {}),
  ]);
};

/* ==========================================================
   👤 USER MANAGEMENT SECTION
========================================================== */

// ✅ Get All Users (Admin Dashboard)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "name email photoURL location status adsPosted verified role createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      users, // 🔥 FRONTEND EXPECTS THIS
    });
  } catch (error) {
    console.error("❌ Error fetching all users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};


// ✅ Get Single User Full Details
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id)
      .populate("favorites", "title price category")
      .select("-__v")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching user details:", error);
    res.status(500).json({
      message: "Server error while fetching user",
    });
  }
};

// ✅ Ban User
export const banUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === "Suspended") {
      return res.status(400).json({
        message: "User is already suspended",
      });
    }

    user.status = "Suspended";
    await user.save();

    res.status(200).json({
      message: "User banned successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Error banning user:", error);
    res.status(500).json({
      message: "Server error while banning user",
    });
  }
};

// ✅ Unban / Reactivate User
export const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === "Active") {
      return res.status(400).json({
        message: "User is already active",
      });
    }

    user.status = "Active";
    await user.save();

    res.status(200).json({
      message: "User unbanned successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Error unbanning user:", error);
    res.status(500).json({
      message: "Server error while unbanning user",
    });
  }
};

/* ==========================================================
   📦 ADS MANAGEMENT SECTION (ADMIN)
========================================================== */

export const getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      ads,
    });
  } catch (error) {
    console.error("❌ Error fetching ads:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching ads",
    });
  }
};


// ✅ Get Single Ad
export const getAdById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ad ID" });
    }

    const ad = await Ad.findById(id).lean();
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    res.status(200).json(ad);
  } catch (error) {
    console.error("❌ Error fetching ad:", error);
    res.status(500).json({
      message: "Server error while fetching ad",
    });
  }
};

// ✅ Approve Ad
export const approveAd = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findByIdAndUpdate(
      id,
      { status: "Approved", reportReason: "" },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    if (ad.ownerEmail || ad.ownerPhone) {
      EmailService.sendTemplate({
        to: ad.ownerEmail,
        template: "AD_APPROVED",
        data: {
          name: ad.ownerName || "there",
          title: ad.title,
          recipientPhone: ad.ownerPhone || "",
        },
      }).catch((err) => {
        console.error("Ad approved email failed:", err?.message || err);
      });
    }

    res.status(200).json({
      message: "Ad approved successfully",
      ad,
    });
  } catch (error) {
    console.error("❌ Error approving ad:", error);
    res.status(500).json({
      message: "Server error while approving ad",
    });
  }
};

// ✅ Reject Ad
export const rejectAd = async (req, res) => {
  try {
    const { reason } = req.body;

    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      {
        status: "Rejected",
        reportReason: reason || "No reason provided",
      },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    if (ad.ownerEmail || ad.ownerPhone) {
      EmailService.sendTemplate({
        to: ad.ownerEmail,
        template: "AD_REJECTED",
        data: {
          name: ad.ownerName || "there",
          title: ad.title,
          reason: ad.reportReason || reason || "No reason provided",
          recipientPhone: ad.ownerPhone || "",
        },
      }).catch((err) => {
        console.error("Ad rejected email failed:", err?.message || err);
      });
    }

    res.status(200).json({
      message: "Ad rejected successfully",
      ad,
    });
  } catch (error) {
    console.error("❌ Error rejecting ad:", error);
    res.status(500).json({
      message: "Server error while rejecting ad",
    });
  }
};

// ✅ Delete Ad
export const deleteAdByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // 🧹 Delete images
    if (Array.isArray(ad.images)) {
      for (const img of ad.images) {
        if (!isLocalUploadUrl(img)) continue;
        await cleanupLocalImageVariants(img);
      }
    }

    // 🧹 Delete video
    if (ad.video?.url && isLocalUploadUrl(ad.video.url)) {
      const localVideoPath = localAbsolutePathFromUrl(ad.video.url);
      if (localVideoPath) {
        await fs.unlink(localVideoPath).catch(() => {});
      }
    }

    await ad.deleteOne();

    // 📧 Notify ad owner (best-effort)
    if (ad.ownerEmail || ad.ownerPhone) {
      const adminNote =
        req.body?.note ||
        "Please contact support if you have any questions.";

      EmailService.sendTemplate({
        to: ad.ownerEmail,
        template: "AD_DELETED_BY_ADMIN",
        data: {
          name: ad.ownerName || "there",
          adTitle: ad.title,
          adminNote,
          recipientPhone: ad.ownerPhone || "",
        },
      }).catch((err) => {
        console.error("Ad deleted email failed:", err?.message || err);
      });
    }

    res.status(200).json({
      message: "Ad deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting ad:", error);
    res.status(500).json({
      message: "Server error while deleting ad",
    });
  }
};

export const updateAdByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ad ID" });
    }

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    const existingImages = parseArrayField(req.body.existingImages);
    const removedImages = parseArrayField(req.body.removedImages);
    const uploadedImages = [];

    for (const file of req.files?.images || []) {
      try {
        const optimizedPath = await optimizeImageFile(file.path, file.mimetype);
        if (optimizedPath !== file.path) {
          file.path = optimizedPath;
          file.filename = optimizedPath.split(/[/\\]/).pop();
        }
        uploadedImages.push(toPublicUrl(req, publicPathFromFile(file)));
      } catch (imgErr) {
        await fs.unlink(file.path).catch(() => {});
        return res.status(400).json({
          message: "Image optimization failed. Please upload a valid image.",
        });
      }
    }

    const finalImages = [...existingImages, ...uploadedImages].filter(Boolean);
    if (finalImages.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }
    if (finalImages.length > MAX_IMAGES) {
      return res.status(400).json({ message: "Maximum 5 images are allowed." });
    }

    const normalizedCondition = normalizeConditionInput(req.body.condition);
    if (!normalizedCondition.ok) {
      return res.status(400).json({ message: normalizedCondition.message });
    }

    const updates = {
      title: req.body.title?.trim() || ad.title,
      description: req.body.description?.trim() || ad.description,
      category: req.body.category?.trim() || ad.category,
      subcategory: req.body.subcategory?.trim() || "",
      city: req.body.city?.trim() || "",
      location: req.body.location?.trim() || "",
      state: req.body.state?.trim() || "",
      ownerName: req.body.ownerName?.trim() || ad.ownerName,
      ownerEmail: req.body.ownerEmail?.trim() || ad.ownerEmail,
      ownerPhone: req.body.ownerPhone?.trim() || ad.ownerPhone,
      status: req.body.status?.trim() || ad.status,
      negotiable:
        req.body.negotiable === undefined
          ? ad.negotiable
          : req.body.negotiable === "true" || req.body.negotiable === true,
      deliveryAvailable:
        req.body.deliveryAvailable === undefined
          ? ad.deliveryAvailable
          : req.body.deliveryAvailable === "true" ||
            req.body.deliveryAvailable === true,
      images: finalImages,
    };

    if (normalizedCondition.value) {
      updates.condition = normalizedCondition.value;
    } else {
      updates.condition = "Not Applicable";
    }

    if (req.body.price !== undefined && req.body.price !== "") {
      const parsedPrice = Number(req.body.price);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ message: "Price must be a valid number." });
      }
      updates.price = parsedPrice;
    } else {
      updates.price = null;
    }

    const previousImages = Array.isArray(ad.images) ? ad.images : [];
    const imagesToDelete = previousImages.filter(
      (imgUrl) => removedImages.includes(imgUrl) || !finalImages.includes(imgUrl)
    );

    Object.assign(ad, updates);
    await ad.save();

    for (const imageUrl of imagesToDelete) {
      if (isLocalUploadUrl(imageUrl)) {
        await cleanupLocalImageVariants(imageUrl);
      }
    }

    return res.status(200).json({
      message: "Ad updated successfully",
      ad,
    });
  } catch (error) {
    console.error("❌ Error updating ad by admin:", error);
    return res.status(500).json({
      message: "Server error while updating ad",
    });
  }
};

export const optimizeAdCopyByAdmin = async (req, res) => {
  try {
    const title = String(req.body?.title || "").trim();
    const description = String(req.body?.description || "").trim();
    const category = String(req.body?.category || "").trim();

    if (title.length < 3) {
      return res.status(400).json({ message: "Title must be at least 3 characters long." });
    }

    if (description.length < 10) {
      return res
        .status(400)
        .json({ message: "Description must be at least 10 characters long." });
    }

    const result = await optimizeListingCopy({ title, description, category });
    if (!result?.title || !result?.description) {
      return res.status(502).json({ message: "Optimizer returned an incomplete response." });
    }

    return res.status(200).json({
      message: "Copy optimized successfully",
      result,
    });
  } catch (error) {
    console.error("ADMIN_OPTIMIZE_AD_COPY_ERROR:", error);
    return res.status(500).json({ message: "Failed to optimize ad copy." });
  }
};

// ✅ Ads Summary Stats
export const getAdsStats = async (req, res) => {
  try {
    const total = await Ad.countDocuments();
    const approved = await Ad.countDocuments({ status: "Approved" });
    const pending = await Ad.countDocuments({ status: "Pending" });
    const rejected = await Ad.countDocuments({ status: "Rejected" });

    return res.status(200).json({
      success: true,
      stats: {
        total,
        approved,
        pending,
        rejected,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching ad stats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching ad stats",
    });
  }
};
