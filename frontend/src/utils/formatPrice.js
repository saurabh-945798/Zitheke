// src/utils/formatPrice.js
export const formatPrice = (price, currency = "MK") => {
    if (!price || isNaN(price)) return `${currency} —`;
  
    // ✅ Format according to en-MW (Malawi) locale
    const formatted = Number(price).toLocaleString("en-MW", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  
    return `${currency} ${formatted}`;
  };
  