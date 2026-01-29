// src/utils/emailTemplates/welcome.template.js
import { baseTemplate, htmlBlock } from "./base.template.js";

const escapeHtml = (str = "") =>
  String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const welcomeTemplate = ({ name = "there" } = {}) => {
  const safeName = escapeHtml(name);

  const content = htmlBlock(`
    <div style="font-size:14px;line-height:22px;color:#111827;">
      <p style="margin:0 0 12px;">Hi <b>${safeName}</b>,</p>
      <p style="margin:0 0 12px;">
        Welcome to Zitheke! Your account is ready.
      </p>
      <p style="margin:0 0 12px;">
        You can now explore listings, post your own ads, and chat directly with buyers & sellers.
      </p>
      <p style="margin:0 0 12px;">
        If you didn’t sign up, please ignore this email.
      </p>
      <p style="margin:18px 0 0;color:#2E3192;font-weight:600;">Team Zitheke</p>
    </div>
  `);

  return baseTemplate({
    title: "Welcome to Zitheke",
    preheader: "Your account is ready.",
    contentHtml: content,
  });
};
