// src/hooks/useChatMessages.js
import axios from "axios";

const BASE = "/api";

/**
 * useChatMessages
 * --------------------------------------------------
 * ✅ Pagination (before + limit + append)
 * ✅ Optimistic UI (tempId)
 * ✅ Dedupe (by _id OR clientTempId)
 * ✅ Socket + HTTP fallback
 * ✅ Delivery / Read helpers (exported for useChatSocket)
 */
export const useChatMessages = ({
  userId,
  setMessages,
  setConversations,
  socketRef,
}) => {
  const authHeader = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  /* =====================================================
     🔁 HELPERS
  ===================================================== */

  // 🔹 Prevent duplicate messages
  const isDuplicate = (prev, newMsg) =>
    prev.some(
      (m) =>
        (newMsg._id && m._id === newMsg._id) ||
        (newMsg.clientTempId &&
          m.clientTempId === newMsg.clientTempId)
    );

  // 🔹 Replace temp message with real one
  const replaceTempMessage = (prev, realMsg) =>
    prev.map((m) =>
      m.clientTempId &&
      realMsg.clientTempId &&
      m.clientTempId === realMsg.clientTempId
        ? realMsg
        : m
    );

  /* =====================================================
     📩 LOAD MESSAGES (PAGINATION)
     loadMessages({ conversationId, before, limit, append })
  ===================================================== */
  const loadMessages = async ({
    conversationId,
    before,
    limit = 30,
    append = false,
  }) => {
    if (!conversationId) return;

    const qs = new URLSearchParams();
    if (before) qs.append("before", before);
    if (limit) qs.append("limit", limit);

    const res = await axios.get(
      `${BASE}/messages/${conversationId}?${qs.toString()}`,
      authHeader
    );

    const fetched = res.data || [];

    setMessages((prev) => {
      if (!append) return fetched;

      // prepend older messages
      const merged = [...fetched, ...prev];
      const deduped = [];
      for (const m of merged) {
        if (!isDuplicate(deduped, m)) deduped.push(m);
      }
      return deduped;
    });

    // 🔹 mark as read
    await axios.put(
      `${BASE}/conversations/${conversationId}/mark-read/${userId}`,
      {},
      authHeader
    );

    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === conversationId
          ? { ...c, unreadCount: 0 }
          : c
      )
    );
  };

  /* =====================================================
     📤 SEND MESSAGE
     - Optimistic UI + tempId
     - Socket primary, HTTP fallback
  ===================================================== */
  const sendMessage = async ({
    text,
    payload,
    selectedChat,
    clearText,
  }) => {
    if (!selectedChat || !userId) return;

    let finalPayload = payload;

    // TEXT fallback
    if (!finalPayload) {
      if (!text || !text.trim()) return;
      finalPayload = {
        type: "text",
        message: text.trim(),
      };
    }

    const tempId = "tmp_" + Date.now();

    const data = {
      senderId: userId,
      receiverId: selectedChat.withUserId,
      adId: selectedChat.adId || null,
      productTitle: selectedChat.productTitle || "Listing",
      productImage: selectedChat.productImage || "",
      type: finalPayload.type || "text",
      message: finalPayload.message || "",
      mediaUrl: finalPayload.mediaUrl || "",
      clientTempId: tempId,
    };

    // 🔥 OPTIMISTIC UI (push temp msg)
    const tempMessage = {
      ...data,
      _id: tempId,
      clientTempId: tempId,
      createdAt: new Date().toISOString(),
      isDelivered: false,
      isRead: false,
    };

    setMessages((prev) =>
      isDuplicate(prev, tempMessage)
        ? prev
        : [...prev, tempMessage]
    );

    clearText?.();

    /* =========================
       1️⃣ SOCKET SEND (PRIMARY)
    ========================= */
    if (socketRef?.current && socketRef.current.connected) {
      socketRef.current.emit("message:send", data, (ack) => {
        if (!ack || !ack.success || !ack.message) {
          console.warn("❌ Socket send failed", ack);
          return;
        }

        setMessages((prev) => {
          const replaced = replaceTempMessage(prev, ack.message);
          if (replaced !== prev) return replaced;
          if (isDuplicate(prev, ack.message)) return prev;
          return [...prev, ack.message];
        });
      });

      return;
    }

    /* =========================
       2️⃣ HTTP FALLBACK
    ========================= */
    try {
      const res = await axios.post(
        `${BASE}/messages`,
        data,
        authHeader
      );

      if (res?.data) {
        setMessages((prev) => {
          const replaced = replaceTempMessage(prev, res.data);
          if (replaced !== prev) return replaced;
          if (isDuplicate(prev, res.data)) return prev;
          return [...prev, res.data];
        });
      }
    } catch (err) {
      console.error("❌ HTTP send failed:", err);
    }
  };

  /* =====================================================
     🗑️ DELETE FOR ME
  ===================================================== */
  const deleteForMe = async (messageId) => {
    await axios.put(
      `${BASE}/messages/delete-me/${messageId}`,
      {},
      authHeader
    );

    setMessages((prev) =>
      prev.filter((m) => m._id !== messageId)
    );
  };

  /* =====================================================
     🚫 DELETE FOR EVERYONE (OPTIMISTIC)
  ===================================================== */
  const deleteForEveryone = async (messageId) => {
    if (socketRef?.current) {
      socketRef.current.emit("message:delete-everyone", messageId);
    }

    // optimistic UI
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId
          ? {
              ...m,
              isDeleted: true,
              type: "deleted",
              message: "This message was deleted",
            }
          : m
      )
    );

    // backend confirm
    try {
      await axios.put(
        `${BASE}/messages/delete-everyone/${messageId}`,
        {},
        authHeader
      );
    } catch (err) {
      console.error("Delete for everyone failed:", err);
    }
  };

  /* =====================================================
     📦 DELIVERY / READ HELPERS
     (used by useChatSocket.js)
  ===================================================== */

  const applyDelivered = ({ messageId, deliveredAt }) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId
          ? { ...m, isDelivered: true, deliveredAt }
          : m
      )
    );
  };

  const applyRead = ({ messageId, readAt }) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId
          ? { ...m, isRead: true, readAt }
          : m
      )
    );
  };

  return {
    loadMessages,
    sendMessage,
    deleteForMe,
    deleteForEveryone,

    // 🔥 export helpers for socket handlers
    applyDelivered,
    applyRead,
  };
};
