// utils/emailTemplates/accountDeleteConfirm.template.js
import { baseTemplate, htmlBlock } from "./base.template.js";

export const accountDeleteConfirmTemplate = ({
  name = "there",
  deleteLink = "",
}) =>
  baseTemplate({
    title: "Confirm account deletion",
    preheader: "Confirm your account deletion request.",
    contentHtml: htmlBlock(`
      <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">Hi ${name},</h2>
      <p style="margin:0 0 16px;color:#4b5563;font-size:14px;line-height:1.6;">
        You requested to delete your Zitheke account. This action cannot be undone.
      </p>
      <div style="margin:20px 0;">
        <a href="${deleteLink}" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600;">
          Confirm Account Deletion
        </a>
      </div>
      <p style="margin:0;color:#6b7280;font-size:12px;">
        If you did not request this, you can ignore this email and your account will remain active.
      </p>
    `),
  });
