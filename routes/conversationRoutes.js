// routes/conversationRoutes.js
import express from "express";
import {
  getUserConversations,
  getConversationCount,
  markConversationRead,
  startConversation,
  deleteConversationHard,
} from "../Controllers/conversationController.js";

const router = express.Router();

/* =====================================================
   🟢 START or GET conversation
===================================================== */
router.post("/start", startConversation);

/* =====================================================
   🟢 GET total conversation count (Dashboard / Stats)
   IMPORTANT: Keep this ABOVE "/:uid"
===================================================== */
router.get("/count/:uid", getConversationCount);

/* =====================================================
   🟢 GET all conversations of a user (Sidebar / Chat list)
===================================================== */
router.get("/:uid", getUserConversations);

/* =====================================================
   🟢 Mark conversation as read
===================================================== */
router.put("/:conversationId/mark-read/:userId", markConversationRead);

/* =====================================================
   🟢 Hard delete a conversation
===================================================== */
router.delete("/delete/:conversationId", deleteConversationHard);

export default router;
