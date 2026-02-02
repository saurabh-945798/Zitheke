const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 10 * 60 * 1000;

const attemptsStore = new Map();

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();
const getKey = ({ email, ip }) => `${normalizeEmail(email)}|${ip || "unknown"}`;

const pruneAttempts = (entry, now) => {
  entry.attempts = entry.attempts.filter((ts) => now - ts <= WINDOW_MS);
};

export const checkEmailLogin = (req, res) => {
  const email = normalizeEmail(req.body?.email || "");
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const key = getKey({ email, ip: req.ip });
  const entry = attemptsStore.get(key);
  const now = Date.now();

  if (entry) {
    if (entry.lockedUntil && entry.lockedUntil > now) {
      const retryAfterSec = Math.ceil((entry.lockedUntil - now) / 1000);
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please try again later.",
        retryAfterSec,
      });
    }

    pruneAttempts(entry, now);
    attemptsStore.set(key, entry);
  }

  return res.status(200).json({ success: true, allowed: true });
};

export const recordEmailLoginFail = (req, res) => {
  const email = normalizeEmail(req.body?.email || "");
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const key = getKey({ email, ip: req.ip });
  const now = Date.now();
  const entry = attemptsStore.get(key) || { attempts: [], lockedUntil: null };

  pruneAttempts(entry, now);
  entry.attempts.push(now);

  if (entry.attempts.length >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCK_MS;
  }

  attemptsStore.set(key, entry);

  return res.status(200).json({
    success: true,
    attempts: entry.attempts.length,
    lockedUntil: entry.lockedUntil,
  });
};

export const recordEmailLoginSuccess = (req, res) => {
  const email = normalizeEmail(req.body?.email || "");
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const key = getKey({ email, ip: req.ip });
  attemptsStore.delete(key);

  return res.status(200).json({ success: true, cleared: true });
};
