// src/utils/emailTemplates/adApproved.template.js
import { baseTemplate, htmlBlock } from "./base.template.js";

const escapeHtml = (str = "") =>
  String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const adApprovedTemplate = ({
  name = "there",
  title = "your ad",
} = {}) => {
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(title);

  return baseTemplate({
    title: "Ad approved",
    preheader: "Your ad is live on Zitheke.",
    contentHtml: htmlBlock(`
      <div style="font-size:14px;line-height:22px;color:#111827;">
        <p style="margin:0 0 12px;">Hi <b>${safeName}</b>,</p>
        <p style="margin:0 0 12px;">
          Great news! Your ad <b>${safeTitle}</b> has been approved and is now live on Zitheke.
        </p>
        <p style="margin:0 0 12px;">
          Tips to get faster responses: add clear photos, set a fair price, and reply quickly to chats.
        </p>
        <p style="margin:0 0 12px;">
          You can edit or manage your ad anytime from your dashboard.
        </p>
        <p style="margin:18px 0 0;color:#2E3192;font-weight:600;">Team Zitheke</p>
      </div>
    `),
  });
};
