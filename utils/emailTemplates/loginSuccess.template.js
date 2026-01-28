// src/utils/emailTemplates/loginSuccess.template.js
import { baseTemplate, htmlBlock } from "./base.template.js";

const escapeHtml = (str = "") =>
  String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const loginSuccessTemplate = ({ name = "there" } = {}) => {
  const safeName = escapeHtml(name);

  return baseTemplate({
    title: "Login successful",
    preheader: "You’re logged in to Zitheke.",
    contentHtml: htmlBlock(`
      <div style="font-size:14px;line-height:22px;color:#111827;">
        <p style="margin:0 0 12px;">Hi <b>${safeName}</b>,</p>
        <p style="margin:0 0 12px;">
          You have successfully logged in to your Zitheke account.
        </p>
        <p style="margin:18px 0 0;">Team Zitheke</p>
      </div>
    `),
  });
};
