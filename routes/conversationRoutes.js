import express from "express";
import {
  getUserConversations,
  getConversationPreview,   // 🆕 dashboard preview
  markConversationRead,
  startConversation,
  deleteConversationHard,
} from "../Controllers/conversationController.js";

const router = express.Router();

/* =====================================================
   🟢 START / GET CONVERSATION
===================================================== */

// Start new or fetch existing conversation
router.post("/start", startConversation);

/* =====================================================
   🟢 DASHBOARD CHAT PREVIEW (LIGHTWEIGHT)
   GET /api/conversations/preview/:uid
===================================================== */
router.get("/preview/:uid", getConversationPreview);

/* =====================================================
   🟢 FULL CONVERSATION LIST (SIDEBAR / CHAT PAGE)
   GET /api/conversations/:uid
===================================================== */
router.get("/:uid", getUserConversations);

/* =====================================================
   🟢 MARK CONVERSATION AS READ
===================================================== */
router.put("/:conversationId/mark-read/:userId", markConversationRead);

/* =====================================================
   🟢 HARD DELETE CONVERSATION
===================================================== */
router.delete("/delete/:conversationId", deleteConversationHard);

export default router;
