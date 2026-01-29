// src/utils/emailTemplates/adRejected.template.js
import { baseTemplate, htmlBlock } from "./base.template.js";

const escapeHtml = (str = "") =>
  String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const adRejectedTemplate = ({
  name = "there",
  title = "your ad",
  reason = "No reason provided",
} = {}) => {
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(title);
  const safeReason = escapeHtml(reason);

  return baseTemplate({
    title: "Ad rejected",
    preheader: "Your ad didn’t pass our review.",
    contentHtml: htmlBlock(`
      <div style="font-size:14px;line-height:22px;color:#111827;">
        <p style="margin:0 0 12px;">Hi <b>${safeName}</b>,</p>
        <p style="margin:0 0 12px;">
          Unfortunately, your ad <b>${safeTitle}</b> was rejected.
        </p>
        <p style="margin:0 0 12px;">
          Reason: <b>${safeReason}</b>
        </p>
        <p style="margin:0 0 12px;">
          You can edit the listing to match our guidelines and post again.
        </p>
        <p style="margin:0 0 12px;">
          Make sure the title, photos, and description are clear and accurate.
        </p>
        <p style="margin:18px 0 0;color:#2E3192;font-weight:600;">Team Zitheke</p>
      </div>
    `),
  });
};
