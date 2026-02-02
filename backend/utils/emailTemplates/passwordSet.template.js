// utils/emailTemplates/passwordSet.template.js
import { baseTemplate, htmlBlock } from "./base.template.js";

export const passwordSetTemplate = ({ name = "there", setLink = "" }) =>
  baseTemplate({
    title: "Set your password",
    preheader: "Create a password for your account.",
    contentHtml: htmlBlock(`
      <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">Hi ${name},</h2>
      <p style="margin:0 0 16px;color:#4b5563;font-size:14px;line-height:1.6;">
        You requested to set a password for your Zitheke account.
      </p>
      <div style="margin:20px 0;">
        <a href="${setLink}" style="display:inline-block;background:#2E3192;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600;">
          Set Password
        </a>
      </div>
      <p style="margin:0;color:#6b7280;font-size:12px;">
        If you did not request this, you can ignore this email.
      </p>
    `),
  });
