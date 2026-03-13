import defaultAvatarPng from "../images/—Pngtree—user profile avatar_13369988.png";

export const DEFAULT_AVATAR_SRC = defaultAvatarPng;

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const getStoredProfilePhoto = () => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("profilePhoto") || "";
};

export const getAvatarSrc = (candidate, fallback = DEFAULT_AVATAR_SRC) => {
  if (isNonEmptyString(candidate)) return candidate.trim();
  return fallback;
};

export const getUserAvatarSrc = (user, fallback = DEFAULT_AVATAR_SRC) => {
  const storedPhoto = getStoredProfilePhoto();
  return getAvatarSrc(storedPhoto || user?.photoURL || user?.image || "", fallback);
};

export const handleAvatarFallback = (
  event,
  fallback = DEFAULT_AVATAR_SRC
) => {
  const target = event?.currentTarget;
  if (!target) return;
  if (target.dataset.avatarFallbackApplied === "true") return;
  target.dataset.avatarFallbackApplied = "true";
  target.src = fallback;
};
