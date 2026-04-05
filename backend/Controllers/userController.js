// Controllers/userController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { EmailService } from "../Services/email.service.js";
import { env } from "../config/env.js";
import { firebaseAdmin } from "../config/firebaseAdmin.js";
import { normalizeMalawiPhone, isValidMalawiPhone } from "../utils/phone.js";
import Ad from "../models/Ad.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Report from "../models/Report.js";
import { createSessionAndTokens } from "../Services/authTokens.service.js";
import PhoneSignupToken from "../models/PhoneSignupToken.js";
import { optimizeImageFile } from "../utils/optimizeImage.js";
import { isLocalUploadUrl, localAbsolutePathFromUrl, toPublicUrl } from "../utils/uploadPath.js";

const normalizePhone = (raw = "") => normalizeMalawiPhone(raw);
const isValidPhone = (phone) => isValidMalawiPhone(phone);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");
const avatarDir = path.join(uploadsDir, "avatars");
const ALLOWED_PROFILE_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const sanitizeBaseName = (name = "") =>
  String(name)
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "avatar";

const cleanupLocalAvatarVariants = async (photoUrl = "") => {
  if (!isLocalUploadUrl(photoUrl) || !String(photoUrl).includes("/uploads/avatars/")) {
    return;
  }

  const originalPath = localAbsolutePathFromUrl(photoUrl);
  if (!originalPath) return;

  const dir = path.dirname(originalPath);
  const fileName = path.basename(originalPath);
  const variantPaths = [
    originalPath,
    path.join(dir, "medium", fileName),
    path.join(dir, "thumb", fileName),
  ];

  await Promise.all(variantPaths.map((filePath) => fs.unlink(filePath).catch(() => {})));
};

const saveProfilePhotoData = async (req, uid, photoData) => {
  const match = String(photoData || "").match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid profile image payload");
  }

  const mimeType = match[1].toLowerCase();
  const base64Payload = match[2];

  if (!ALLOWED_PROFILE_IMAGE_MIMES.has(mimeType)) {
    throw new Error("Unsupported profile image type");
  }

  const buffer = Buffer.from(base64Payload, "base64");
  if (!buffer.length) {
    throw new Error("Empty profile image payload");
  }

  await fs.mkdir(avatarDir, { recursive: true });

  const ext =
    mimeType === "image/png"
      ? ".png"
      : mimeType === "image/webp"
      ? ".webp"
      : ".jpg";
  const fileName = `${sanitizeBaseName(uid)}-${Date.now()}-${crypto
    .randomBytes(6)
    .toString("hex")}${ext}`;
  const tempPath = path.join(avatarDir, fileName);

  await fs.writeFile(tempPath, buffer);
  const optimizedPath = await optimizeImageFile(tempPath, mimeType);

  return toPublicUrl(req, `/uploads/avatars/${path.basename(optimizedPath)}`);
};

const findUserByPhone = async (phone) => {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return await User.findOne({ phone: normalized });
};

const mergeUserData = async ({ fromUser, toUser }) => {
  const fromUid = fromUser.uid;
  const toUid = toUser.uid;

  if (!fromUid || !toUid || fromUid === toUid) return;

  await Ad.updateMany(
    { ownerUid: fromUid },
    {
      $set: {
        ownerUid: toUid,
        userId: toUid,
        ownerName: toUser.name || "",
        ownerEmail: toUser.email || "",
        ownerPhone: toUser.phone || "",
      },
    }
  );

  await Ad.updateMany({ userId: fromUid }, { $set: { userId: toUid } });

  await Message.updateMany(
    { senderId: fromUid },
    { $set: { senderId: toUid } }
  );
  await Message.updateMany(
    { receiverId: fromUid },
    { $set: { receiverId: toUid } }
  );

  await Conversation.updateMany(
    { participants: fromUid },
    { $set: { "participants.$[p]": toUid } },
    { arrayFilters: [{ p: fromUid }] }
  );

  await Conversation.updateMany(
    { lastSenderId: fromUid },
    { $set: { lastSenderId: toUid } }
  );

  const convos = await Conversation.find({ participants: toUid });
  for (const convo of convos) {
    const unread = convo.unreadCounts || new Map();
    if (unread.has(fromUid)) {
      const fromCount = unread.get(fromUid) || 0;
      const toCount = unread.get(toUid) || 0;
      unread.set(toUid, fromCount + toCount);
      unread.delete(fromUid);
      convo.unreadCounts = unread;
      await convo.save();
    }
  }

  await Report.updateMany(
    { sellerId: fromUid },
    { $set: { sellerId: toUid } }
  );
  await Report.updateMany(
    { reporterId: fromUid },
    { $set: { reporterId: toUid } }
  );

  const mergedFavorites = Array.from(
    new Set([
      ...(toUser.favorites || []),
      ...(fromUser.favorites || []),
    ])
  );
  toUser.favorites = mergedFavorites;
  await toUser.save();

  await User.deleteOne({ _id: fromUser._id });
};

/* =====================================================
   🔹 REGISTER / SYNC USER (PUBLIC)
   Firebase login ke baad call hota hai
===================================================== */
export const registerUser = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: "Missing Firebase ID token",
      });
    }

    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email;
    const name = decoded.name;
    const photoURL = decoded.picture;
    const emailVerified = decoded.email_verified === true;

    if (!emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    // ✅ BASIC VALIDATION
    if (!uid || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const emailLower = String(email).trim().toLowerCase();

    const existingByEmail = await User.findOne({ email: emailLower });
    const existingProviders = Array.isArray(existingByEmail?.authProviders)
      ? existingByEmail.authProviders
      : [];
    const existingHasPassword =
      existingProviders.includes("password") ||
      existingByEmail?.authProvider === "password";
    if (existingByEmail && existingHasPassword && existingByEmail.uid !== uid) {
      return res.status(409).json({
        success: false,
        errorCode: "PASSWORD_ACCOUNT",
        message: "This account was created using email/password. Please log in with email and password.",
      });
    }

    const incomingPhone = normalizePhone(req.body?.phone || "");
    if (incomingPhone && !isValidPhone(incomingPhone)) {
      return res.status(400).json({
        success: false,
        message: "Use phone number with country code like +265XXXXXXXXX",
      });
    }

    let user = await User.findOne({ uid });
    let created = false;
    let linkedPhoneUser = false;

    // ✅ CREATE OR UPDATE USER
    const fallbackName = name || email.split("@")[0];
    const desiredPhoto =
      user?.photoURL ||
      photoURL ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}`;

    if (!user) {
      try {
        user = await User.create({
          uid,
          name: fallbackName,
          email: emailLower,
          phone: incomingPhone || null,
          photoURL: desiredPhoto,
          passwordHash: "",
          authProvider: "google",
          authProviders: ["google"],
          verified: true,
          emailVerified: emailVerified,
          phoneVerified: false,
          lastLogin: new Date(),
        });
        created = true;
      } catch (err) {
        if (err?.code === 11000) {
          user = await User.findOne({ uid });
        } else {
          throw err;
        }
      }

      if (created) {
        console.log("🆕 New user registered:", email);
        try {
          await EmailService.sendTemplate({
            to: emailLower,
            template: "WELCOME",
            data: { name: fallbackName },
          });
        } catch (err) {
          console.error("Welcome email failed:", err?.message || err);
          return res.status(err?.status || 502).json({
            success: false,
            message: "Welcome email failed",
          });
        }
      }
    } else {
      user.lastLogin = new Date();
      user.email = emailLower;
      user.authProvider = "google";
      const providers = Array.isArray(user.authProviders)
        ? user.authProviders
        : [];
      if (!providers.includes("google")) providers.push("google");
      user.authProviders = providers;
      if (!user.passwordHash) user.passwordHash = "";
      if (!user.photoURL && photoURL) user.photoURL = photoURL;
      user.verified = true;
      user.emailVerified = emailVerified;
      await user.save();
      console.log("👤 Existing user updated:", email);
    }

    if (incomingPhone) {
      const phoneUser = await findUserByPhone(incomingPhone);
      if (phoneUser && phoneUser.uid !== user.uid) {
        if (phoneUser.email && phoneUser.email !== email) {
          return res.status(409).json({
            success: false,
            message: "Phone number already linked to another account",
          });
        }

        user.phone = incomingPhone;
        user.phoneVerified = true;
        const providers = Array.isArray(user.authProviders)
          ? user.authProviders
          : [];
        if (!providers.includes("google")) providers.push("google");
        if (phoneUser.passwordHash && !providers.includes("password")) {
          providers.push("password");
        }
        user.authProviders = providers;
        await user.save();
        await mergeUserData({ fromUser: phoneUser, toUser: user });
        linkedPhoneUser = true;
      } else if (!user.phone) {
        user.phone = incomingPhone;
        user.phoneVerified = true;
        const providers = Array.isArray(user.authProviders)
          ? user.authProviders
          : [];
        if (!providers.includes("google")) providers.push("google");
        user.authProviders = providers;
        await user.save();
      }
    }

    // 🔐 ✅ CREATE JWT TOKEN (MOST IMPORTANT)
    const { accessToken, refreshToken, sessionId } =
      await createSessionAndTokens(user, req);

    // ✅ FINAL RESPONSE
    return res.status(200).json({
      success: true,
      message: "User synced successfully",
      user,
      linkedPhoneUser,
      token: accessToken,
      refreshToken,
      sessionId,
    });
  } catch (error) {
    console.error("❌ Error syncing user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   📱 REGISTER / SYNC USER BY PHONE (PUBLIC)
===================================================== */
export const registerUserByPhone = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: "Phone-only signup is disabled. Please sign up with email, phone, and password.",
  });
};

/* =====================================================
   👤 GET USER PROFILE (PRIVATE)
===================================================== */
export const getUserProfile = async (req, res) => {
  try {
    // 🔐 Security check
    if (req.user.uid !== req.params.uid) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   ✏️ UPDATE USER PROFILE (PRIVATE)
===================================================== */
export const updateUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;

    // 🔐 Security check
    if (req.user.uid !== uid) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, phone, location, photoData } = req.body;
    const normalizedPhone = normalizePhone(phone || "");

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (normalizedPhone && !isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Use phone number with country code like +265XXXXXXXXX",
      });
    }

    user.name = name || user.name;
    user.location = location || user.location;
    user.lastLogin = new Date();

    if (photoData && typeof photoData === "string" && photoData.startsWith("data:")) {
      try {
        const previousPhotoUrl = user.photoURL || "";
        const savedPhotoUrl = await saveProfilePhotoData(req, uid, photoData);
        user.photoURL = savedPhotoUrl;
        await cleanupLocalAvatarVariants(previousPhotoUrl);
      } catch (imgErr) {
        console.error("Profile photo upload failed:", imgErr?.message || imgErr);
        return res.status(400).json({
          success: false,
          message: "Failed to upload profile image",
        });
      }
    }

    if (normalizedPhone && normalizedPhone !== user.phone) {
      const phoneUser = await findUserByPhone(normalizedPhone);
      if (phoneUser && phoneUser.uid !== user.uid) {
        if (phoneUser.email && phoneUser.email !== user.email) {
          return res.status(409).json({
            success: false,
            message: "Phone number already linked to another account",
          });
        }

        user.phone = normalizedPhone;
        user.phoneVerified = false;
        await user.save();
        await mergeUserData({ fromUser: phoneUser, toUser: user });
      } else {
        user.phone = normalizedPhone;
        user.phoneVerified = false;
        await user.save();
      }
    } else {
      await user.save();
    }

    const updatedUser = await User.findOne({ uid });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   dY` LOGOUT USER (PUBLIC)
===================================================== */
export const logoutUser = async (req, res) => {
  try {
    const { uid, email, name } = req.body;

    if (!uid && !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const user = uid
      ? await User.findOne({ uid })
      : await User.findOne({ email: String(email).trim().toLowerCase() });

    if (!user || !user.email) {
      return res.status(400).json({
        success: false,
        message: "User email not found for logout",
      });
    }

    const recipientName = name || user.name || user.email.split("@")[0];

    try {
      await EmailService.sendTemplate({
        to: user.email,
        template: "LOGOUT_SUCCESS",
        data: { name: recipientName },
      });
    } catch (err) {
      console.error("Logout email failed:", err?.message || err);
      return res.status(err?.status || 502).json({
        success: false,
        message: "Logout email failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Logout email queued",
    });
  } catch (error) {
    console.error("ƒ?O Error logging out user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};








