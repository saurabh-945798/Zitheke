import jwt from "jsonwebtoken";
import Session from "../models/Session.js";
import User from "../models/User.js";
import { env } from "../config/env.js";
import {
  hashRefreshToken,
  rotateRefreshToken,
  verifyRefreshToken,
} from "../Services/authTokens.service.js";

export const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = verifyRefreshToken(refreshToken);

    const session = await Session.findOne({
      userUid: decoded.uid,
      refreshTokenHash: hashRefreshToken(refreshToken),
      revokedAt: null,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid or revoked refresh token",
      });
    }

    const user = await User.findOne({ uid: decoded.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { accessToken, refreshToken: newRefresh } =
      await rotateRefreshToken(session, user);

    return res.status(200).json({
      success: true,
      token: accessToken,
      refreshToken: newRefresh,
      sessionId: session._id,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err?.message || "Refresh token invalid",
    });
  }
};

export const logoutSession = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    let sessionId = req.user?.sid || null;

    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      const session = await Session.findOne({
        userUid: decoded.uid,
        refreshTokenHash: hashRefreshToken(refreshToken),
        revokedAt: null,
      });
      if (session) sessionId = session._id;
    }

    if (!sessionId) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const decodedAccess = jwt.verify(
            authHeader.split(" ")[1],
            env.JWT_SECRET
          );
          sessionId = decodedAccess?.sid || null;
        } catch {
          sessionId = null;
        }
      }
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session not found",
      });
    }

    await Session.updateOne(
      { _id: sessionId },
      { $set: { revokedAt: new Date() } }
    );

    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err?.message || "Logout failed",
    });
  }
};

export const listSessions = async (req, res) => {
  try {
    const uid = req.user?.uid;
    const sessions = await Session.find({ userUid: uid })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      sessions: sessions.map((s) => ({
        id: s._id,
        userAgent: s.userAgent,
        ip: s.ip,
        createdAt: s.createdAt,
        lastUsedAt: s.lastUsedAt,
        revokedAt: s.revokedAt,
        current: String(s._id) === String(req.user?.sid),
      })),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to load sessions",
    });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const uid = req.user?.uid;
    const { id } = req.params;

    const session = await Session.findOne({ _id: id, userUid: uid });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (!session.revokedAt) {
      session.revokedAt = new Date();
      await session.save();
    }

    return res.status(200).json({ success: true, message: "Session revoked" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to revoke session",
    });
  }
};

export const revokeOtherSessions = async (req, res) => {
  try {
    const uid = req.user?.uid;
    const currentSid = req.user?.sid;

    await Session.updateMany(
      {
        userUid: uid,
        _id: { $ne: currentSid },
        revokedAt: null,
      },
      { $set: { revokedAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message: "Other sessions revoked",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to revoke other sessions",
    });
  }
};
