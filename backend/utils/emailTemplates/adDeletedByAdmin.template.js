// src/utils/emailTemplates/adDeletedByAdmin.template.js
import { baseTemplate, htmlBlock } from "./base.template.js";

const escapeHtml = (str = "") =>
  String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const adDeletedByAdminTemplate = ({
  name = "there",
  adTitle = "your ad",
  adminNote = "",
} = {}) => {
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(adTitle);
  const safeNote = escapeHtml(adminNote);

  return baseTemplate({
    title: "Ad removed",
    preheader: "Your ad was removed by the Zitheke team.",
    contentHtml: htmlBlock(`
      <div style="font-size:14px;line-height:22px;color:#111827;">
        <p style="margin:0 0 12px;">Hi <b>${safeName}</b>,</p>
        <p style="margin:0 0 12px;">
          We removed your ad <b>${safeTitle}</b> because it did not meet our posting guidelines.
        </p>
        ${safeNote ? `<p style="margin:0 0 12px;"><b>Reason:</b> ${safeNote}</p>` : ""}
        <p style="margin:0 0 12px;">
          You can edit and repost the ad after updating the details.
        </p>
        <p style="margin:0 0 12px;">
          If you believe this was a mistake, contact support and we will help you.
        </p>
        <p style="margin:18px 0 0;color:#2E3192;font-weight:600;">Team Zitheke</p>
      </div>
    `),
  });
};
