// src/utils/emailTemplates/base.template.js
import { env } from "../../config/env.js";

const escapeHtml = (str = "") =>
  String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const baseTemplate = ({
  title = env.APP_NAME,
  preheader = "",
  contentHtml = "",
  footerNote = `© ${new Date().getFullYear()} ${env.APP_NAME}. All rights reserved.`,
} = {}) => {
  const safeTitle = escapeHtml(title);
  const safePreheader = escapeHtml(preheader);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${safePreheader}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:20px 22px;background:#2E3192;color:#ffffff;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;">
                <tr>
                  <td style="vertical-align:middle;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-right:10px;vertical-align:middle;">
                          <svg viewBox="0 0 24 24" fill="#F4B400" width="28" height="28" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 11l-9-9H3v9l9 9 9-9z" />
                          </svg>
                        </td>
                        <td style="vertical-align:middle;">
                          <div style="font-size:18px;font-weight:800;color:#FFFFFF;letter-spacing:-0.2px;">
                            Zitheke
                          </div>
                          <div style="font-size:12px;font-weight:600;color:#F4B400;margin-left:4px;margin-top:-2px;">
                            Buy. Sell. Connect.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="text-align:right;vertical-align:middle;">
                    <div style="font-size:16px;font-weight:700;color:#FFFFFF;">
                      ${safeTitle}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:22px;">
              ${contentHtml}
            </td>
          </tr>

          <tr>
            <td style="padding:16px 22px;background:#f9fafb;color:#6b7280;font-size:12px;">
              ${escapeHtml(footerNote)}
            </td>
          </tr>
        </table>

        <div style="max-width:640px;width:100%;margin-top:10px;color:#9ca3af;font-size:12px;">
          Need help? Reply to this email.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const htmlBlock = (inner) => inner; // tiny helper (readability)
