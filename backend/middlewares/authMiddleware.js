import jwt from "jsonwebtoken";
import Session from "../models/Session.js";
import { env } from "../config/env.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ❌ No token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Token missing.",
    });
  }

  try {
    const token = authHeader.split(" ")[1];

    // ✅ VERIFY TOKEN
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!decoded?.sid) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    const session = await Session.findOne({
      _id: decoded.sid,
      userUid: decoded.uid,
      revokedAt: null,
    }).select("_id");

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session revoked.",
      });
    }

    // ✅ IMPORTANT: NO ROLE CHECK HERE
    // role check will be done by roleMiddleware

    req.user = decoded; // { uid, role, email ... }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export default authMiddleware;
