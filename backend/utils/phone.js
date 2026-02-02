// utils/phone.js
export const normalizeMalawiPhone = (raw = "") => {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";

  let local = digits;
  if (local.startsWith("265")) {
    local = local.slice(3);
  } else if (local.startsWith("0")) {
    local = local.slice(1);
  }

  if (local.length !== 9) return "";
  return `+265${local}`;
};

export const isValidMalawiPhone = (phone = "") => /^\+265\d{9}$/.test(phone);
