import mongoose from "mongoose";
import Ad from "../models/Ad.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

/* ================================
   🧠 CLOUDINARY CONFIG
================================ */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // 5️⃣ Boolean normalization
    body.negotiable =
      body.negotiable === "true" || body.negotiable === true;

    body.deliveryAvailable =
      body.deliveryAvailable === "true" || body.deliveryAvailable === true;

    // 6️⃣ Images from Cloudinary / Multer
    const imagePaths = req.files?.images
      ? req.files.images.map((f) => f.path || f.secure_url)
      : [];

// 7️⃣ 🎥 VIDEO UPLOAD (OPTIONAL — MAX 30 SEC)
let videoData = {};

if (req.files?.video?.[0]) {
  const videoFile = req.files.video[0];

  const uploadedVideo = await cloudinary.uploader.upload(videoFile.path, {
    resource_type: "video",
    folder: "alinafe/videos",
  });

  // ✅ Thumbnail (Cloudinary way) - format safe
  const thumbnailUrl = cloudinary.url(uploadedVideo.public_id, {
    resource_type: "video",
    format: "jpg",
  });

  // ⛔ HARD LIMIT: 30 seconds (cleanup too)
  if (uploadedVideo.duration > 30) {
    // ✅ delete uploaded video to avoid junk
    await cloudinary.uploader.destroy(uploadedVideo.public_id, {
      resource_type: "video",
    });

    return res.status(400).json({
      success: false,
      message: "Video duration must be 30 seconds or less",
    });
  }

  videoData = {
    url: uploadedVideo.secure_url,
    thumbnail: thumbnailUrl,
    duration: uploadedVideo.duration,
    size: uploadedVideo.bytes,
    format: uploadedVideo.format,
    publicId: uploadedVideo.public_id,
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
    const ads = await Ad.find({ ownerUid: uid }).sort({ createdAt: -1 });
    res.status(200).json(ads);
  } catch (error) {
    console.error("Error fetching user ads:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ================================
   🌍 GET ALL ADS
================================ */
export const getAllAds = async (req, res) => {
  try {
    const filters = { status: "Approved" };

    if (req.query.category) filters.category = req.query.category;
    if (req.query.city) filters.city = req.query.city;

    const ads = await Ad.find(filters).sort({ createdAt: -1 });
    res.status(200).json(ads);
  } catch (error) {
    console.error("❌ Error fetching ads:", error);
    res.status(500).json({
      message: "Server error while fetching ads",
      error: error.message,
    });
  }
};

/* ================================
   ✏️ UPDATE AD
================================ */
export const updateAd = async (req, res) => {
  try {
    const updates = { ...req.body };

    // 🖼️ Update images
    const imagePaths = req.files?.images
      ? req.files.images.map((f) => f.path || f.secure_url)
      : [];

    if (imagePaths.length > 0) updates.images = imagePaths;

   // 🎥 Replace video if uploaded
if (req.files?.video?.[0]) {
  const videoFile = req.files.video[0];

  const uploadedVideo = await cloudinary.uploader.upload(videoFile.path, {
    resource_type: "video",
    folder: "alinafe/videos",
  });

  const thumbnailUrl = cloudinary.url(uploadedVideo.public_id, {
    resource_type: "video",
    format: "jpg",
  });

  if (uploadedVideo.duration > 30) {
    // ✅ delete uploaded video to avoid junk
    await cloudinary.uploader.destroy(uploadedVideo.public_id, {
      resource_type: "video",
    });

    return res.status(400).json({
      success: false,
      message: "Video duration must be 30 seconds or less",
    });
  }

  updates.video = {
    url: uploadedVideo.secure_url,
    thumbnail: thumbnailUrl,
    duration: uploadedVideo.duration,
    size: uploadedVideo.bytes,
    format: uploadedVideo.format,
    publicId: uploadedVideo.public_id,
  };
}


    const updatedAd = await Ad.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!updatedAd) {
      return res.status(404).json({ message: "Ad not found" });
    }

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

    // 🗑️ Delete video from Cloudinary if exists
    if (ad.video?.publicId) {
      await cloudinary.uploader.destroy(ad.video.publicId, {
        resource_type: "video",
      });
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
