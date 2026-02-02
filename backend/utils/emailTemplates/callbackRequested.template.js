// src/utils/emailTemplates/callbackRequested.template.js
import { baseTemplate, htmlBlock } from "./base.template.js";

const escapeHtml = (str = "") =>
  String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const callbackRequestedTemplate = ({
  name = "there",
  senderName = "Someone",
  title = "your listing",
  phone = "",
  message = "",
} = {}) => {
  const safeName = escapeHtml(name);
  const safeSender = escapeHtml(senderName);
  const safeTitle = escapeHtml(title);
  const safePhone = escapeHtml(phone);
  const safeMessage = escapeHtml(message);

  return baseTemplate({
    title: "Callback request",
    preheader: "A buyer requested a call back.",
    contentHtml: htmlBlock(`
      <div style="font-size:14px;line-height:22px;color:#111827;">
        <p style="margin:0 0 12px;">Hi <b>${safeName}</b>,</p>
        <p style="margin:0 0 12px;">
          <b>${safeSender}</b> requested a call back for <b>${safeTitle}</b>.
        </p>
        ${safePhone ? `<p style="margin:0 0 12px;"><b>Phone:</b> ${safePhone}</p>` : ""}
        ${safeMessage ? `<p style="margin:0 0 12px;"><b>Message:</b><br/>${safeMessage}</p>` : ""}
        <p style="margin:0 0 12px;">
          Please respond as soon as possible to increase your chances of closing the deal.
        </p>
        <p style="margin:18px 0 0;color:#2E3192;font-weight:600;">Team Zitheke</p>
      </div>
    `),
  });
};
