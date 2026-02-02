// src/hooks/useChatSocket.js
import { useEffect, useRef } from "react";
import { connectSocket } from "../socket.js";

export const useChatSocket = ({
  userId,
  selectedChat,
  setMessages,
  setConversations,
  setTypingStatus,

  // ✅ optional helpers from useChatMessages.js (recommended)
  applyDelivered,
  applyRead,
}) => {
  const socketRef = useRef(null);

  // ✅ keep track of current joined room to leave/join correctly
  const joinedRoomRef = useRef(null);

  // ✅ typing throttle/debounce refs
  const typingEmitTimerRef = useRef(null); // throttle window
  const typingStopTimerRef = useRef(null); // auto stop emit

  useEffect(() => {
    if (!userId) return;

    /* =====================================================
       🔌 CONNECT SOCKET (ONLY ONCE PER SESSION)
    ===================================================== */
    if (!socketRef.current) {
      socketRef.current = connectSocket(userId);
    }

    const socket = socketRef.current;

    /* =====================================================
       🏠 ROOM JOIN GUARD (leave previous + join new)
    ===================================================== */
    const nextRoomId = selectedChat?.conversationId || null;

    if (joinedRoomRef.current && joinedRoomRef.current !== nextRoomId) {
      socket.emit("conversation:leave", joinedRoomRef.current);
      joinedRoomRef.current = null;
    }

    if (nextRoomId && joinedRoomRef.current !== nextRoomId) {
      socket.emit("conversation:join", { conversationId: nextRoomId });
      joinedRoomRef.current = nextRoomId;
    }

    /* =====================================================
       🧹 CLEAR OLD LISTENERS (VERY IMPORTANT)
    ===================================================== */
    socket.off("message:new");
    socket.off("typing:status");
    socket.off("message:deliver-batch");
    socket.off("message:deleted-everyone");
    socket.off("message:delivered");
    socket.off("message:read");

    /* =====================================================
       🔁 DEDUPE HELPER (_id OR clientTempId)
    ===================================================== */
    const isDuplicate = (prev, msg) =>
      prev.some(
        (m) =>
          (msg?._id && m._id === msg._id) ||
          (msg?.clientTempId &&
            m.clientTempId === msg.clientTempId)
      );

    const replaceTempIfNeeded = (prev, incoming) => {
      if (!incoming?.clientTempId) return prev;

      let replaced = false;
      const next = prev.map((m) => {
        if (
          m?.clientTempId &&
          m.clientTempId === incoming.clientTempId
        ) {
          replaced = true;
          return incoming;
        }
        return m;
      });

      return replaced ? next : prev;
    };

    /* =====================================================
       🟢 NEW MESSAGE (REAL-TIME)
       - dedupe by _id + clientTempId
       - if ack callback supported, respond success (optional)
    ===================================================== */
    socket.on("message:new", (msg, ackCb) => {
      // ✅ ACK HANDLING (so backend can mark delivered via ack if you implemented timeout/ack)
      if (typeof ackCb === "function") {
        try {
          ackCb({ success: true });
        } catch (e) {}
      }

      // Replace temp message if clientTempId matches
      setMessages((prev) => {
        const replacedPrev = replaceTempIfNeeded(prev, msg);

        // active chat only append (but still allow replaceTemp even if not active)
        const isActive =
          selectedChat?.conversationId === msg.conversationId;

        if (!isActive) return replacedPrev;

        if (isDuplicate(replacedPrev, msg)) return replacedPrev;
        return [...replacedPrev, msg];
      });

      // Update conversation list
      setConversations((prev) =>
        prev
          .map((c) =>
            c.conversationId === msg.conversationId
              ? {
                  ...c,
                  lastMessage: msg.isDeleted
                    ? "🚫 Message deleted"
                    : msg.message || "[Media]",
                  lastMessageAt: msg.createdAt,
                  unreadCount:
                    msg.receiverId === userId
                      ? (c.unreadCount || 0) + 1
                      : c.unreadCount,
                }
              : c
          )
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt) -
              new Date(a.lastMessageAt)
          )
      );
    });

    /* =====================================================
       🚫 DELETE FOR EVERYONE (REAL-TIME BOTH SIDES)
    ===================================================== */
    socket.on("message:deleted-everyone", (messageId) => {
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

      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === selectedChat?.conversationId
            ? { ...c, lastMessage: "🚫 Message deleted" }
            : c
        )
      );
    });

    /* =====================================================
       🟣 DELIVERY EVENT
       payload: { messageId, receiverId, deliveredAt }
    ===================================================== */
    socket.on("message:delivered", (payload) => {
      if (!payload?.messageId) return;

      // If you passed helper from useChatMessages, use it
      if (typeof applyDelivered === "function") {
        applyDelivered({
          messageId: payload.messageId,
          deliveredAt: payload.deliveredAt || new Date().toISOString(),
        });
        return;
      }

      // fallback: update here
      setMessages((prev) =>
        prev.map((m) =>
          m._id === payload.messageId
            ? {
                ...m,
                isDelivered: true,
                deliveredAt:
                  payload.deliveredAt || new Date().toISOString(),
              }
            : m
        )
      );
    });

    /* =====================================================
       🟦 READ EVENT (optional)
       payload: { conversationId?, messageId?, readAt }
    ===================================================== */
    socket.on("message:read", (payload) => {
      if (!payload) return;

      // If helper exists
      if (typeof applyRead === "function" && payload.messageId) {
        applyRead({
          messageId: payload.messageId,
          readAt: payload.readAt || new Date().toISOString(),
        });
        return;
      }

      // fallback: mark either one message or all in conversation
      if (payload.messageId) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === payload.messageId
              ? {
                  ...m,
                  isRead: true,
                  readAt:
                    payload.readAt || new Date().toISOString(),
                }
              : m
          )
        );
      } else if (payload.conversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.conversationId === payload.conversationId
              ? {
                  ...m,
                  isRead: true,
                  readAt:
                    payload.readAt || new Date().toISOString(),
                }
              : m
          )
        );
      }
    });

    /* =====================================================
       ✍️ TYPING INDICATOR (incoming)
    ===================================================== */
    socket.on("typing:status", ({ fromId, toId, isTyping }) => {
      if (
        selectedChat?.withUserId === fromId &&
        toId === userId
      ) {
        setTypingStatus(isTyping);
      }
    });

    /* =====================================================
       📨 OFFLINE MESSAGE DELIVERY (DEDUPED)
    ===================================================== */
    socket.on("message:deliver-batch", (batch) => {
      if (!Array.isArray(batch) || !batch.length) return;

      setMessages((prev) => {
        const merged = [...prev];
        for (const msg of batch) {
          // replace temp if any, else add if not dup
          const replaced = replaceTempIfNeeded(merged, msg);
          if (replaced !== merged) {
            // if replaced, update merged reference
            merged.length = 0;
            merged.push(...replaced);
            continue;
          }
          if (!isDuplicate(merged, msg)) merged.push(msg);
        }
        return merged;
      });
    });

    /* =====================================================
       🧹 CLEANUP (DO NOT DISCONNECT SOCKET)
    ===================================================== */
    return () => {
      // leave room on cleanup (selectedChat change/unmount)
      if (joinedRoomRef.current) {
        socket.emit("conversation:leave", joinedRoomRef.current);
        joinedRoomRef.current = null;
      }

      socket.off("message:new");
      socket.off("typing:status");
      socket.off("message:deliver-batch");
      socket.off("message:deleted-everyone");
      socket.off("message:delivered");
      socket.off("message:read");

      // clear timers
      if (typingEmitTimerRef.current) {
        clearTimeout(typingEmitTimerRef.current);
        typingEmitTimerRef.current = null;
      }
      if (typingStopTimerRef.current) {
        clearTimeout(typingStopTimerRef.current);
        typingStopTimerRef.current = null;
      }
    };
  }, [
    userId,
    selectedChat,
    setMessages,
    setConversations,
    setTypingStatus,
    applyDelivered,
    applyRead,
  ]);

  /* =====================================================
     ✅ TYPING EMITTER (debounced/throttled)
     - call from ChatInput: socketRef.current?.emitTyping(true/false)
     - throttle emit every 350ms + auto-stop after 900ms idle
  ===================================================== */
  const emitTyping = (isTyping) => {
    const socket = socketRef.current;
    if (!socket || !userId || !selectedChat?.withUserId) return;

    const payload = {
      fromId: userId,
      toId: selectedChat.withUserId,
      isTyping: !!isTyping,
    };

    // throttle: emit at most once per ~350ms
    if (!typingEmitTimerRef.current) {
      socket.emit("typing:status", payload);

      typingEmitTimerRef.current = setTimeout(() => {
        typingEmitTimerRef.current = null;
      }, 350);
    }

    // auto-stop after idle
    if (typingStopTimerRef.current) {
      clearTimeout(typingStopTimerRef.current);
    }
    if (isTyping) {
      typingStopTimerRef.current = setTimeout(() => {
        socket.emit("typing:status", {
          ...payload,
          isTyping: false,
        });
      }, 900);
    }
  };

  // ✅ attach helper to socketRef so you can use it anywhere
  socketRef.emitTyping = emitTyping;

  return socketRef;
};
