// src/config/otpSmsTemplate.js

// Carrier-approved OTP template for Malawi TNM.
// Keep this frozen to prevent accidental edits in service/controller files.
export const OTP_SMS_TEMPLATE = Object.freeze({
  text: "ZITHEKE login code {OTP}. Valid 5 minutes.",
});

export const buildOtpMessage = (otp) => {
  const code = String(otp || "").trim();
  if (!/^\d{6}$/.test(code)) {
    const err = new Error("Invalid OTP format. OTP must be 6 digits.");
    err.status = 400;
    throw err;
  }
  return OTP_SMS_TEMPLATE.text.replace("{OTP}", code);
};

