export const formatPrice = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "MK 0";
  return `MK ${amount.toLocaleString()}`;
};
