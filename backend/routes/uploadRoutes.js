import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { mediaUpload } from "../middlewares/localUpload.js";
import multerErrorHandler from "../middlewares/multerErrorHandler.js";
import { optimizeImageFile } from "../utils/optimizeImage.js";
import { publicPathFromFile, toPublicUrl } from "../utils/uploadPath.js";

const router = express.Router();

router.post(
  "/media",
  authMiddleware,
  mediaUpload,
  multerErrorHandler,
  async (req, res) => {
    try {
      const imageFiles = req.files?.images || [];
      const videoFiles = req.files?.video || [];

      const imageUrls = [];
      for (const file of imageFiles) {
        const optimizedPath = await optimizeImageFile(file.path, file.mimetype);
        if (optimizedPath !== file.path) {
          file.path = optimizedPath;
          file.filename = optimizedPath.split(/[/\\]/).pop();
        }
        imageUrls.push(toPublicUrl(req, publicPathFromFile(file)));
      }

      const videoUrls = videoFiles.map((file) =>
        toPublicUrl(req, publicPathFromFile(file))
      );

      return res.status(200).json({
        success: true,
        images: imageUrls,
        videos: videoUrls,
      });
    } catch (error) {
      console.error("Media upload failed:", error);
      return res.status(500).json({
        success: false,
        message: "Media upload failed",
      });
    }
  }
);

export default router;
