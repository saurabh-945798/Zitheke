import express from "express";
import {
  submitContactForm,
  getAllContactMessages,
  markMessageAsRead,
  deleteContactMessage,
} from "../Controllers/contactController.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

/* USER */
router.post("/submit", submitContactForm);

/* ADMIN */
router.get("/admin/messages", adminAuthMiddleware, getAllContactMessages);
router.put("/admin/messages/:id/read", adminAuthMiddleware, markMessageAsRead);
router.delete(
  "/admin/messages/:id",
  adminAuthMiddleware,
  deleteContactMessage
);

export default router;
