export const normalizePhone = (value = "") =>
  String(value).replace(/[^\d+]/g, "").trim();

export const isValidPhone = (value = "") => normalizePhone(value).length >= 9;
