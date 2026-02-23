import mongoose from "mongoose";
import fs from "fs/promises";
import Ad from "../models/Ad.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { EmailService } from "../Services/email.service.js";
import { normalizeMalawiPhone, isValidMalawiPhone } from "../utils/phone.js";
import { optimizeImageFile } from "../utils/optimizeImage.js";
import {
  isCloudinaryUrl,
  isLocalUploadUrl,
  localAbsolutePathFromUrl,
  publicPathFromFile,
  toPublicUrl,
} from "../utils/uploadPath.js";

const normalizePhone = (raw = "") => normalizeMalawiPhone(raw);
const isValidPhone = (phone) => isValidMalawiPhone(phone);
const normalizeConditionInput = (raw) => {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, value: undefined };
  }

  const normalized = String(raw).trim().toLowerCase();
  if (normalized === "new") return { ok: true, value: "New" };
  if (normalized === "used") return { ok: true, value: "Used" };

  return {
    ok: false,
    message: "Invalid condition. Allowed values are New or Used.",
  };
};

/* ================================
   🟢 CREATE AD (Pending by default)
================================ */
export const createAd = async (req, res) => {
  try {
    // 1️⃣ Clone body (DO NOT destructure)
    const body = { ...req.body };

    console.log("REQ BODY 🔥", body);

    // 2️⃣ Required fields check
    if (!body.ownerUid || !body.title || !body.description || !body.category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // 3️⃣ Remove empty values (SAFE CLEANUP)
    Object.keys(body).forEach((key) => {
      if (body[key] === "" || body[key] === null || body[key] === undefined) {
        delete body[key];
      }
    });

    // 4️⃣ Fetch owner details if missing
    if (!body.ownerName || !body.ownerEmail || !body.ownerPhone) {
      const user = await User.findOne({ uid: body.ownerUid });
      if (user) {
        body.ownerName = body.ownerName || user.name;
        body.ownerEmail = body.ownerEmail || user.email;
        body.ownerPhone = body.ownerPhone || user.phone;
      }
    }

    // 4.5️⃣ Ensure owner phone exists + Malawi format
    if (!body.ownerPhone) {
      return res.status(400).json({
        success: false,
        message: "Owner phone number is required",
      });
    }

    const normalizedOwnerPhone = normalizePhone(body.ownerPhone);
    if (!isValidPhone(normalizedOwnerPhone)) {
      return res.status(400).json({
        success: false,
        message: "Use phone number with country code like +265XXXXXXXXX",
      });
    }
    body.ownerPhone = normalizedOwnerPhone;

    // 5️⃣ Boolean normalization
    body.negotiable =
      body.negotiable === "true" || body.negotiable === true;

    body.deliveryAvailable =
      body.deliveryAvailable === "true" || body.deliveryAvailable === true;

    // 5.5️⃣ Condition normalization (schema-safe)
    const normalizedCondition = normalizeConditionInput(body.condition);
    if (!normalizedCondition.ok) {
      return res.status(400).json({
        success: false,
        message: normalizedCondition.message,
      });
    }
    if (normalizedCondition.value) {
      body.condition = normalizedCondition.value;
    }

    // 6️⃣ Images from local uploads (new uploads only)
    const imageFiles = req.files?.images || [];
    const imagePaths = [];

    for (const file of imageFiles) {
      try {
        const optimizedPath = await optimizeImageFile(file.path, file.mimetype);
        if (optimizedPath !== file.path) {
          file.path = optimizedPath;
          file.filename = optimizedPath.split(/[/\\]/).pop();
        }
        const publicPath = publicPathFromFile(file);
        imagePaths.push(toPublicUrl(req, publicPath));
      } catch (imgErr) {
        await fs.unlink(file.path).catch(() => {});
        return res.status(400).json({
          success: false,
          message: "Image optimization failed. Please upload a valid image.",
        });
      }
    }

    if (imagePaths.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    /* ==================================================
       🔎 6.5️⃣ AUTO TAG GENERATION (ROOT SEARCH FIX)
       - category
       - subcategory
       - title keywords
       - existing tags (if any)
    ================================================== */
    const autoTags = new Set();

    // from title
    if (body.title) {
      body.title
        .toLowerCase()
        .split(" ")
        .forEach((word) => {
          if (word.length > 2) autoTags.add(word);
        });
    }

    // from category & subcategory
    if (body.category) autoTags.add(body.category.toLowerCase());
    if (body.subcategory) autoTags.add(body.subcategory.toLowerCase());

    // preserve incoming tags if any
    if (Array.isArray(body.tags)) {
      body.tags.forEach((t) => autoTags.add(t.toLowerCase()));
    }

    body.tags = Array.from(autoTags);

    // 7️⃣ 🎥 VIDEO UPLOAD (OPTIONAL)
    let videoData = {};

    if (req.files?.video?.[0]) {
      const videoFile = req.files.video[0];
      const publicPath = publicPathFromFile(videoFile);

      videoData = {
        url: toPublicUrl(req, publicPath),
        thumbnail: "",
        duration: 0,
        size: videoFile.size || 0,
        format: "mp4",
        publicId: "",
      };
    }

    // 8️⃣ Create Ad
    const newAd = await Ad.create({
      ...body,
      images: imagePaths,
      video: videoData,
      status: "Pending",
      reportReason: "",
    });

    // 8.5️⃣ Email: Ad posted (queued)
    if (newAd.ownerEmail || newAd.ownerPhone) {
      EmailService.sendTemplate({
        to: newAd.ownerEmail,
        template: "AD_POSTED",
        data: {
          name: newAd.ownerName || "there",
          title: newAd.title,
          recipientPhone: newAd.ownerPhone || "",
        },
      }).catch((err) => {
        console.error("Ad posted email failed:", err?.message || err);
      });
    }

    // 9️⃣ Update user city / location (safe)
    const updateFields = {};

    if (body.city && body.city.trim() !== "") {
      updateFields.city = body.city.trim();
    }

    if (body.location && body.location.trim() !== "") {
      updateFields.location = body.location.trim();
    }

    if (Object.keys(updateFields).length > 0) {
      await User.updateOne({ uid: body.ownerUid }, { $set: updateFields });
    }

    // 9.5️⃣ If user profile phone is empty, store from ad
    if (body.ownerPhone) {
      await User.updateOne(
        { uid: body.ownerUid, $or: [{ phone: null }, { phone: "" }] },
        { $set: { phone: body.ownerPhone } }
      );
    }

    // 🔟 Final response
    return res.status(201).json({
      success: true,
      message: "Ad submitted successfully and is pending admin approval.",
      ad: newAd,
    });
  } catch (error) {
    console.error("❌ CREATE AD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating ad",
      error: error.message,
    });
  }
};


/* ================================
   👤 GET USER ADS
================================ */
export const getUserAds = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ message: "Missing user uid" });
    }

    // Prevent cross-user reads when token uid and path uid differ.
    if (req.user?.uid && req.user.uid !== uid) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const {
      q = "",
      status = "All",
      sort = "newest",
      page = 1,
      limit = 18,
    } = req.query;

    const normalizedPage = Math.max(parseInt(page, 10) || 1, 1);
    const normalizedLimit = Math.min(Math.max(parseInt(limit, 10) || 18, 1), 100);
    const trimmedQuery = String(q || "").trim();
    const trimmedStatus = String(status || "All").trim();

    const filters = { ownerUid: uid };
    if (trimmedStatus && trimmedStatus !== "All") {
      filters.status = trimmedStatus;
    }
    if (trimmedQuery) {
      filters.title = { $regex: trimmedQuery, $options: "i" };
    }

    let sortStage = { createdAt: -1 };
    if (sort === "oldest") sortStage = { createdAt: 1 };
    if (sort === "views_desc") sortStage = { views: -1, createdAt: -1 };
    if (sort === "views_asc") sortStage = { views: 1, createdAt: -1 };

    const skip = (normalizedPage - 1) * normalizedLimit;

    const [ads, total] = await Promise.all([
      Ad.find(filters).sort(sortStage).skip(skip).limit(normalizedLimit),
      Ad.countDocuments(filters),
    ]);

    const adIds = ads.map((ad) => ad._id).filter(Boolean);
    const kpiByAdId = {};

    if (adIds.length > 0) {
      const conversations = await Conversation.find({
        adId: { $in: adIds },
        participants: uid,
      }).select("_id adId");

      const convToAdMap = new Map();
      const conversationIds = [];
      for (const convo of conversations) {
        const convoId = String(convo._id);
        conversationIds.push(convo._id);
        convToAdMap.set(convoId, String(convo.adId));
      }

      let messageCountByConversation = {};
      if (conversationIds.length > 0) {
        const messageAgg = await Message.aggregate([
          { $match: { conversationId: { $in: conversationIds }, isDeleted: { $ne: true } } },
          { $group: { _id: "$conversationId", count: { $sum: 1 } } },
        ]);
        messageCountByConversation = messageAgg.reduce((acc, row) => {
          acc[String(row._id)] = row.count || 0;
          return acc;
        }, {});
      }

      for (const adId of adIds) {
        const key = String(adId);
        kpiByAdId[key] = { messageCount: 0 };
      }

      for (const convo of conversations) {
        const convoId = String(convo._id);
        const adKey = convToAdMap.get(convoId);
        if (!adKey) continue;
        const count = messageCountByConversation[convoId] || 0;
        kpiByAdId[adKey].messageCount += count;
      }
    }

    const adsWithKpis = ads.map((ad) => {
      const adObj = ad.toObject();
      const kpis = kpiByAdId[String(ad._id)] || { messageCount: 0 };
      return {
        ...adObj,
        messageCount: kpis.messageCount,
      };
    });

    return res.status(200).json({
      ads: adsWithKpis,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total,
        pages: Math.ceil(total / normalizedLimit),
        hasMore: normalizedPage * normalizedLimit < total,
      },
      filters: {
        q: trimmedQuery,
        status: trimmedStatus,
        sort,
      },
    });
  } catch (error) {
    console.error("Error fetching user ads:", {
      uid: req.params?.uid,
      message: error?.message,
      stack: error?.stack,
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




/* ================================
   ⭐ GET PROMO ADS (HOMEPAGE)
   - Approved / Active only
   - Limited items
   - Lightweight fields
================================ */
export const getPromoAds = async (req, res) => {
  try {
    const { category, limit = 3 } = req.query;

    const filters = {
      status: { $in: ["Approved", "Active"] },
    };

    if (category) {
      filters.category = category;
    }

      const ads = await Ad.find(filters)
        .sort({ createdAt: -1 }) // latest first
        .limit(Number(limit))
       .select(
    "_id title price images condition category city location ownerName negotiable"
  );


    res.status(200).json({
      success: true,
      ads,
    });
  } catch (error) {
    console.error("PROMO ADS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch promo ads",
    });
  }
};



/* ================================
   🌍 GET ALL ADS
================================ */
export const getAllAds = async (req, res) => {
  try {
    let {
      q = "",
      location = "",
      category,
      page = 1,
      limit = 20,
    } = req.query;

    q = q.trim();
    location = location.trim();

    const filters = {
      status: { $in: ["Approved", "Active"] },
    };

    if (location) {
      filters.city = { $regex: `^${location}`, $options: "i" };
    }

    if (category) {
      filters.category = category;
    }

    if (q) {
      filters.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { subcategory: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [ads, total] = await Promise.all([
      Ad.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "title description price images category subcategory " +
            "city location state " +
            "ownerName status views favouritesCount negotiable featured createdAt " +
            "condition brand model storage year mileage fuelType warranty " +
            " partName partCategory originalType workingStatus accessoryType vehicleType accessoryCondition " +
            "bedrooms bathrooms area furnishing floorNumber totalFloors parking washroom roomType plotArea plotType facing  " +
            "salary experience company quantity seedType variety fertilizerType form pesticideType targetCrop toolName powerType serviceType availability serviceArea sportType weight brand " +
            "size color type " +
            "age breed gender " +
            "fileType accessType"
        ),
      Ad.countDocuments(filters),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      ads,
    });
  } catch (err) {
    console.error("ADS FETCH ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch ads" });
  }
};


/* ================================
   ✏️ UPDATE AD
================================ */
export const updateAd = async (req, res) => {
  try {
    const updates = { ...req.body };
    const MAX_IMAGES = 5;
    const existingAd = await Ad.findById(req.params.id);
    if (!existingAd) {
      return res.status(404).json({ message: "Ad not found" });
    }

    if (Object.prototype.hasOwnProperty.call(updates, "condition")) {
      const normalizedCondition = normalizeConditionInput(updates.condition);
      if (!normalizedCondition.ok) {
        return res.status(400).json({
          success: false,
          message: normalizedCondition.message,
        });
      }
      if (normalizedCondition.value) {
        updates.condition = normalizedCondition.value;
      } else {
        delete updates.condition;
      }
    }

    // 🖼️ Update images (local upload + sharp optimize)
    const imageFiles = req.files?.images || [];
    const imagePaths = [];
    for (const file of imageFiles) {
      try {
        const optimizedPath = await optimizeImageFile(file.path, file.mimetype);
        if (optimizedPath !== file.path) {
          file.path = optimizedPath;
          file.filename = optimizedPath.split(/[/\\]/).pop();
        }
        imagePaths.push(toPublicUrl(req, publicPathFromFile(file)));
      } catch (imgErr) {
        await fs.unlink(file.path).catch(() => {});
        return res.status(400).json({
          success: false,
          message: "Image optimization failed. Please upload a valid image.",
        });
      }
    }

    if (imagePaths.length > 0) updates.images = imagePaths;

    // Enforce max 5 images for update flow (including JSON body updates)
    if (Array.isArray(updates.images) && updates.images.length > MAX_IMAGES) {
      return res.status(400).json({
        success: false,
        message: "You have already uploaded 5 images.",
      });
    }

    /* ==================================================
       🔁 AUTO TAG UPDATE (IF TITLE / CATEGORY / SUBCATEGORY CHANGED)
    ================================================== */
    const updatedTags = new Set();

    // from title
    if (updates.title) {
      updates.title
        .toLowerCase()
        .split(" ")
        .forEach((word) => {
          if (word.length > 2) updatedTags.add(word);
        });
    }

    // from category & subcategory
    if (updates.category) updatedTags.add(updates.category.toLowerCase());
    if (updates.subcategory)
      updatedTags.add(updates.subcategory.toLowerCase());

    // preserve manual tags if any
    if (Array.isArray(updates.tags)) {
      updates.tags.forEach((t) => updatedTags.add(t.toLowerCase()));
    }

    if (updatedTags.size > 0) {
      updates.tags = Array.from(updatedTags);
    }

    // 🎥 Replace video if uploaded
    if (req.files?.video?.[0]) {
      const videoFile = req.files.video[0];
      const publicPath = publicPathFromFile(videoFile);

      updates.video = {
        url: toPublicUrl(req, publicPath),
        thumbnail: "",
        duration: 0,
        size: videoFile.size || 0,
        format: "mp4",
        publicId: "",
      };

      if (isLocalUploadUrl(existingAd.video?.url)) {
        const oldVideoPath = localAbsolutePathFromUrl(existingAd.video.url);
        if (oldVideoPath) await fs.unlink(oldVideoPath).catch(() => {});
      }
    }

    const updatedAd = await Ad.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.status(200).json({
      message: "Ad updated successfully",
      ad: updatedAd,
    });
  } catch (error) {
    console.error("Error updating ad:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/* ================================
   ❌ DELETE AD
================================ */
export const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    // Best-effort local file cleanup (existing Cloudinary URLs are untouched)
    if (Array.isArray(ad.images)) {
      for (const imgUrl of ad.images) {
        if (isCloudinaryUrl(imgUrl)) continue;
        if (isLocalUploadUrl(imgUrl)) {
          const localPath = localAbsolutePathFromUrl(imgUrl);
          if (localPath) await fs.unlink(localPath).catch(() => {});
        }
      }
    }
    if (ad.video?.url && isLocalUploadUrl(ad.video.url)) {
      const localVideoPath = localAbsolutePathFromUrl(ad.video.url);
      if (localVideoPath) await fs.unlink(localVideoPath).catch(() => {});
    }

    await ad.deleteOne();
    res.status(200).json({ message: "Ad deleted successfully" });
  } catch (error) {
    console.error("Error deleting ad:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ================================
   💰 MARK AS SOLD
================================ */
export const markAsSold = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    ad.status = "Sold";
    await ad.save();

    res.status(200).json({ message: "Ad marked as sold", ad });
  } catch (error) {
    console.error("Error marking ad as sold:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ================================
   👁️ INCREMENT AD VIEW COUNT
================================ */
export const incrementView = async (req, res) => {
  try {
    const { userId, guestId } = req.body;
    const uniqueViewer = userId || guestId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Ad ID" });
    }

    const ad = await Ad.findById(id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    if (userId && ad.ownerUid === userId) {
      return res.json({ message: "Owner viewed — no increment" });
    }

    if (uniqueViewer && ad.viewedBy.includes(uniqueViewer)) {
      return res.json({ message: "Already viewed", views: ad.views });
    }

    ad.views = (ad.views || 0) + 1;
    if (uniqueViewer) ad.viewedBy.push(uniqueViewer);

    await ad.save();
    res.json({ message: "View incremented", views: ad.views });
  } catch (error) {
    console.error("❌ Error updating view count:", error);
    res.status(500).json({
      message: "Server error while updating view count",
      error: error.message,
    });
  }
};

/* ================================
   ⚙️ CHANGE AD STATUS
================================ */
export const changeAdStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Active", "Hidden", "Expired", "Sold"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    ad.status = status;
    await ad.save();

    res.status(200).json({ message: `Ad status changed to ${status}`, ad });
  } catch (error) {
    console.error("Error changing ad status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ================================
   🟣 GET SINGLE AD BY ID (WITH SELLER)
================================ */
export const getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    const seller = await User.findOne({ uid: ad.ownerUid }).select(
      "name email phone"
    );

    res.status(200).json({
      ...ad.toObject(),
      seller: seller || null,
    });
  } catch (error) {
    console.error("Error fetching ad:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ================================
   ❤️ FAVORITES COUNT
================================ */
export const updateFavoriteCount = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const ad = await Ad.findById(id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    if (action === "add") ad.favouritesCount = (ad.favouritesCount || 0) + 1;
    if (action === "remove" && ad.favouritesCount > 0)
      ad.favouritesCount -= 1;

    await ad.save();
    res.status(200).json({
      message: "Favorites updated",
      favouritesCount: ad.favouritesCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ================================
   🔎 SEARCH ADS
================================ */
export const searchAds = async (req, res) => {
  try {
    const { query, location } = req.query;

    const filters = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { subcategory: { $regex: query, $options: "i" } },
      ],
    };

    if (location && location !== "All Malawi") {
      filters.city = { $regex: location, $options: "i" };
    }

    const ads = await Ad.find(filters).sort({ createdAt: -1 });
    res.json(ads);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
