import crypto from "crypto";
import jwt from "jsonwebtoken";
import Session from "../models/Session.js";
import { env } from "../config/env.js";

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const createSessionAndTokens = async (user, req) => {
  const refreshToken = jwt.sign(
    { uid: user.uid, type: "refresh" },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );

  const userAgent = req?.headers?.["user-agent"] || "";
  const ip = req?.ip || req?.headers?.["x-forwarded-for"] || "";

  // Reuse existing session for same device (userAgent + ip)
  let session = await Session.findOne({
    userUid: user.uid,
    userAgent,
    ip,
    revokedAt: null,
  });

  if (!session) {
    session = await Session.create({
      userUid: user.uid,
      refreshTokenHash: hashToken(refreshToken),
      userAgent,
      ip,
    });
  } else {
    session.refreshTokenHash = hashToken(refreshToken);
    session.lastUsedAt = new Date();
    await session.save();
  }

  const accessToken = jwt.sign(
    { uid: user.uid, email: user.email, role: user.role, sid: session._id },
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  return { accessToken, refreshToken, sessionId: session._id };
};

export const rotateRefreshToken = async (session, user) => {
  const refreshToken = jwt.sign(
    { uid: user.uid, type: "refresh" },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );

  session.refreshTokenHash = hashToken(refreshToken);
  session.lastUsedAt = new Date();
  await session.save();

  const accessToken = jwt.sign(
    { uid: user.uid, email: user.email, role: user.role, sid: session._id },
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (decoded?.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }
  return decoded;
};

export const hashRefreshToken = hashToken;
