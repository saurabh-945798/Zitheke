// src/utils/emailTemplates/adPosted.template.js
import { baseTemplate, htmlBlock } from "./base.template.js";

const escapeHtml = (str = "") =>
  String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const adPostedTemplate = ({
  name = "there",
  title = "your ad",
} = {}) => {
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(title);

  return baseTemplate({
    title: "Ad posted successfully",
    preheader: "Your ad is now pending review.",
    contentHtml: htmlBlock(`
      <div style="font-size:14px;line-height:22px;color:#111827;">
        <p style="margin:0 0 12px;">Hi <b>${safeName}</b>,</p>
        <p style="margin:0 0 12px;">
          Your ad <b>${safeTitle}</b> has been posted and is pending review.
        </p>
        <p style="margin:0 0 12px;">
          Our team will review it shortly. We will email you as soon as it is approved.
        </p>
        <p style="margin:0 0 12px;">
          You can make edits while it is under review from your dashboard.
        </p>
        <p style="margin:18px 0 0;color:#2E3192;font-weight:600;">Team Zitheke</p>
      </div>
    `),
  });
};
