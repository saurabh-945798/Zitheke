import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import authMiddleware from "../middlewares/authMiddleware.js";
import multerErrorHandler from "../middlewares/multerErrorHandler.js";

import {
  createReport,
  getUserReports,
} from "../Controllers/report.user.controller.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reportsDir = path.resolve(__dirname, "..", "uploads", "reports");

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const sanitizeBaseName = (name = "") =>
  String(name)
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "report-file";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, reportsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".bin";
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    cb(null, `${sanitizeBaseName(file.originalname)}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowed = new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ]);
    if (!allowed.has(file.mimetype)) {
      return cb(new Error("Only jpg, jpeg, png, webp images and pdf files are allowed."));
    }
    cb(null, true);
  },
});

router.post("/", authMiddleware, upload.single("file"), multerErrorHandler, createReport);
router.get("/user/:userId", authMiddleware, getUserReports);

export default router;
