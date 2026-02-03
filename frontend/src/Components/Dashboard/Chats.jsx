// src/pages/Chats/Chats.jsx
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar.jsx";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext.jsx";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Menu,
  ChevronLeft,
  Dot,
  Circle,
  Image as ImageIcon,
} from "lucide-react";

import MessageBubble from "../../Components/Dashboard/MessageBubble.jsx";
import ChatInput from "../../Components/Dashboard/ChatInput.jsx";
import { useChatSocket } from "../../hooks/useChatSocket.js";
import { useChatMessages } from "../../hooks/useChatMessages.js";

/* ------------------------------------------
  Utils
------------------------------------------- */
const safe = (v, fallback = "") => (v === undefined || v === null ? fallback : v);

const timeAgoShort = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  let diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 0) diff = 0;

  const m = Math.floor(diff / 60);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString();
};

const formatMK = (n) => {
  const num = Number(n);
  if (!isFinite(num)) return "";
  return num.toLocaleString("en-MW", { maximumFractionDigits: 0 });
};

const avatarUrl = (photoUrl) => safe(photoUrl, "");

/* ------------------------------------------
  Empty State Illustration
------------------------------------------- */
const EmptyState = ({ onOpenSidebar }) => {
  return (
    <div className="relative flex-1 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="rounded-3xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-8">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-[#2E3192]/20 via-[#3B82F6]/10 to-[#A855F7]/10 border border-white/60 backdrop-blur-xl shadow-inner" />
              <div className="absolute -right-3 -top-3 h-10 w-10 rounded-2xl bg-white/70 border border-white/60 backdrop-blur-xl flex items-center justify-center shadow">
                <ImageIcon className="text-slate-700" size={18} />
              </div>
              <div className="absolute -left-3 -bottom-3 h-10 w-10 rounded-2xl bg-white/70 border border-white/60 backdrop-blur-xl flex items-center justify-center shadow">
                <Circle className="text-[#2E3192]" size={18} />
              </div>
            </div>
          </div>

          <h2 className="mt-6 text-xl font-semibold text-slate-900 text-center">
            Your messages live here
          </h2>
          <p className="mt-2 text-sm text-slate-600 text-center leading-relaxed">
            Pick a conversation from the left panel to start chatting. Youâ€™ll see the ad context,
            online status, and live typing updates.
          </p>

          <div className="mt-6 flex items-center justify-center">
            <button
              onClick={onOpenSidebar}
              className="inline-flex lg:hidden items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-sm font-medium shadow hover:shadow-md active:scale-[0.99] transition"
            >
              <Menu size={16} />
              Open conversations
            </button>
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-[#2E3192]" />
              Select a chat to begin
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------
  Typing Indicator (dots + subtitle â€œtypingâ€¦â€)
------------------------------------------- */
const TypingIndicator = () => {
  return (
    <div className="flex items-end gap-3 px-2 py-1">
      <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/60 shadow px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="sr-only">typing</span>
          <motion.span
            className="h-2 w-2 rounded-full bg-slate-700/70"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="h-2 w-2 rounded-full bg-slate-700/70"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.12 }}
          />
          <motion.span
            className="h-2 w-2 rounded-full bg-slate-700/70"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.24 }}
          />
        </div>
        <div className="mt-2 text-[11px] text-slate-500">typingâ€¦</div>
      </div>
    </div>
  );
};

const Chats = () => {
  const { user } = useAuth();
  const BASE = "/api";

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // ðŸŸ¦ AD CONTEXT STATE
  const [activeAd, setActiveAd] = useState(null);

  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState(false);

  // Search
  const [search, setSearch] = useState("");

  // Input typing
  const [text, setText] = useState("");

  // Mobile: collapsible sidebar (slide-over)
  const [mobileConvoOpen, setMobileConvoOpen] = useState(false);

  // socket
  const socketRef = useChatSocket({
    userId: user?.uid,
    selectedChat,
    setMessages,
    setConversations,
    setTypingStatus,
  });

  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const autoOpenedRef = useRef(false);

  const [searchParams] = useSearchParams();
  const autoChatId = searchParams.get("conversationId");
  const navigate = useNavigate();

  /* ------------------------------------------
     ðŸ”µ  . Fetch Conversations
  ------------------------------------------- */
  const fetchConvos = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const res = await axios.get(`${BASE}/conversations/${user.uid}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setConversations(res.data || []);
    } catch (e) {
      console.error("Conversation fetch error:", e);
    }
  }, [BASE, user?.uid]);

  /* ------------------------------------------
     ðŸš€ 3. Load Conversations
  ------------------------------------------- */
  useEffect(() => {
    fetchConvos();
  }, [fetchConvos]);

  /* ------------------------------------------
     ðŸ“© 4. Load Messages
  ------------------------------------------- */
  const { loadMessages, sendMessage, deleteForMe, deleteForEveryone } =
    useChatMessages({
      userId: user?.uid,
      setMessages,
      setConversations,
      socketRef,
    });

  /* ------------------------------------------
   ðŸ” AUTO OPEN CHAT FROM URL
------------------------------------------- */
  useEffect(() => {
    if (!autoChatId || conversations.length === 0 || autoOpenedRef.current) return;

    const chatToOpen = conversations.find((c) => c.conversationId === autoChatId);
    if (!chatToOpen) return;

    autoOpenedRef.current = true;

    setSelectedChat(chatToOpen);
    loadMessages({ conversationId: chatToOpen.conversationId });

    axios.put(
      `${BASE}/conversations/${chatToOpen.conversationId}/mark-read/${user.uid}`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    setActiveAd(
      chatToOpen.adId
        ? {
            adId: chatToOpen.adId,
            title: chatToOpen.productTitle,
            image: chatToOpen.productImage,
            price: chatToOpen.productPrice,
          }
        : null
    );

    // mobile: close drawer after auto open
    setMobileConvoOpen(false);
  }, [autoChatId, conversations, loadMessages, BASE, user?.uid]);

  /* ------------------------------------------
     âœï¸ 5. Typing
  ------------------------------------------- */
  const handleTyping = (e) => {
    setText(e.target.value);
    if (!selectedChat) return;

    socketRef.current.emit("typing:update", {
      fromId: user.uid,
      toId: selectedChat.withUserId,
      isTyping: true,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current.emit("typing:update", {
        fromId: user.uid,
        toId: selectedChat.withUserId,
        isTyping: false,
      });
    }, 1200);
  };

  /* ------------------------------------------
     ðŸ—‘ï¸ 7. Delete Chat
  ------------------------------------------- */
  const handleDeleteChat = async () => {
    const confirm = await Swal.fire({
      title: "Delete conversation?",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${BASE}/conversations/delete/${selectedChat.conversationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setConversations((prev) =>
        prev.filter((c) => c.conversationId !== selectedChat.conversationId)
      );

      setMessages([]);
      setSelectedChat(null);
      setActiveAd(null);
    } catch (e) {
      console.error("âŒ Delete chat error:", e);
    }
  };

  /* ------------------------------------------
     ðŸŸ¢ Auto Scroll
  ------------------------------------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingStatus]);

  /* ------------------------------------------
     ðŸ” Search Filter
  ------------------------------------------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      safe(c.withUserName, "").toLowerCase().includes(q)
    );
  }, [conversations, search]);

  /* ------------------------------------------
     Derived Header Info
  ------------------------------------------- */
  const headerName = safe(selectedChat?.withUserName, "Chat");
  const headerOnline = !!selectedChat?.isOnline;
  const headerLastSeen =
    headerOnline
      ? "Online"
      : selectedChat?.lastSeen
      ? `Last seen ${timeAgoShort(selectedChat.lastSeen)} ago`
      : selectedChat?.updatedAt
      ? `Last seen ${timeAgoShort(selectedChat.updatedAt)} ago`
      : "Last seen recently";

  const adPillTitle = safe(selectedChat?.productTitle, safe(activeAd?.title, ""));
  const adPillPriceRaw =
    selectedChat?.productPrice ??
    activeAd?.price ??
    selectedChat?.price ??
    selectedChat?.amount;

  const adPillPrice =
    adPillPriceRaw !== undefined && adPillPriceRaw !== null && adPillPriceRaw !== ""
      ? `MK ${formatMK(adPillPriceRaw)}`
      : "";

  /* ------------------------------------------
     Handlers
  ------------------------------------------- */
  const openChat = async (chat) => {
    setSelectedChat(chat);
    loadMessages({ conversationId: chat.conversationId });

    // mark read
    axios.put(
      `${BASE}/conversations/${chat.conversationId}/mark-read/${user.uid}`,
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    // ðŸŸ¦ SET AD CONTEXT
    setActiveAd(
      chat.adId
        ? {
            adId: chat.adId,
            title: chat.productTitle,
            image: chat.productImage,
            price: chat.productPrice,
          }
        : null
    );

    // mobile: close slide-over
    setMobileConvoOpen(false);
  };

  /* ------------------------------------------
     Motion Variants (fade/slide + stagger)
  ------------------------------------------- */
  const listWrap = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.05, delayChildren: 0.03 },
    },
  };

  const listItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: 8, transition: { duration: 0.18 } },
  };

  const panelReveal = {
    hidden: { opacity: 0, x: 14 },
    show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, x: 14, transition: { duration: 0.18 } },
  };

  /* ------------------------------------------
     UI
  ------------------------------------------- */
  return (
    <div className="min-h-screen font-[Poppins] bg-[#F8FAFC]">
      {/* Soft blur background on right panel area (global) */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E3192]/10 via-[#3B82F6]/8 to-[#A855F7]/10" />
        <div className="absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full bg-[#2E3192]/15 blur-3xl" />
        <div className="absolute top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[#3B82F6]/12 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[520px] w-[520px] rounded-full bg-[#A855F7]/10 blur-3xl" />
      </div>

      {/* Desktop Sidebar stays as-is */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:ml-64 p-3 sm:p-4">
        {/* Split layout upgrade: left glass + right soft blur */}
        <div className="relative flex h-[88vh] overflow-hidden rounded-[28px] shadow-[0_18px_60px_rgba(15,23,42,0.12)] border border-white/60">
          {/* LEFT PANEL (glassmorphism + subtle gradient) */}
          <div className="hidden lg:flex w-[360px] shrink-0 flex-col bg-white/40 backdrop-blur-xl border-r border-white/60">
            {/* Search bar: floating pill style with icon + clear button, shadow on focus */}
            <div className="p-4 pb-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  className="w-full rounded-2xl bg-white/70 backdrop-blur-xl border border-white/70 pl-11 pr-11 py-3 text-sm text-slate-800 placeholder:text-slate-500 shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-[#2E3192]/25"
                  placeholder="Search conversationsâ€¦"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search?.length > 0 && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-white/80 border border-white/70 backdrop-blur-xl flex items-center justify-center shadow hover:shadow-md transition"
                    aria-label="Clear search"
                  >
                    <X size={14} className="text-slate-700" />
                  </button>
                )}
              </div>
            </div>

            {/* Conversation list: avatars + status dot + unread badge pills + hover highlight + compact timestamp */}
            <div className="flex-1 overflow-y-auto px-2 pb-3">
              <motion.div variants={listWrap} initial="hidden" animate="show" className="space-y-1">
                <AnimatePresence initial={false}>
                  {filtered.map((chat) => {
                    const isSelected = selectedChat?.conversationId === chat.conversationId;

                    const name = safe(chat.withUserName, "User");
                    const lastMsg = safe(chat.lastMessage, safe(chat.lastMessageText, "Say hiâ€¦"));
                    const unread = Number(chat.unreadCount || chat.unread || 0);
                    const time =
                      timeAgoShort(chat.lastMessageAt || chat.updatedAt || chat.createdAt);

                    const online = !!chat.isOnline;

                    return (
                      <motion.button
                        key={chat.conversationId}
                        variants={listItem}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        onClick={() => openChat(chat)}
                        className={[
                          "w-full text-left rounded-2xl px-3 py-3 transition relative",
                          "hover:bg-white/60 hover:shadow-sm",
                          isSelected ? "bg-white/75 shadow-sm border border-white/70" : "border border-transparent",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <img
                              src={avatarUrl(chat.withUserPhoto)}
                              alt={name}
                              className="h-11 w-11 rounded-2xl object-cover border border-white/70 shadow-sm"
                              loading="lazy"
                            />
                            {/* Status dot */}
                            <span
                              className={[
                                "absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white",
                                online ? "bg-emerald-500" : "bg-slate-300",
                              ].join(" ")}
                              title={online ? "Online" : "Offline"}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {name}
                              </p>
                              <span className="text-[11px] text-slate-500 shrink-0">
                                {time}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center justify-between gap-2">
                              <p className="text-[12px] text-slate-600 truncate">
                                {lastMsg}
                              </p>

                              {/* Unread badge pills */}
                              {unread > 0 && (
                                <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#2E3192]/15 text-[#2E3192] border border-white/70">
                                  {unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* MOBILE: collapsible sidebar slide-over */}
          <AnimatePresence>
            {mobileConvoOpen && (
              <motion.div
                className="lg:hidden absolute inset-0 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.18 } }}
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
              >
                <div
                  className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                  onClick={() => setMobileConvoOpen(false)}
                />
                <motion.div
                  className="absolute left-0 top-0 h-full w-[88%] max-w-[360px] bg-white/55 backdrop-blur-xl border-r border-white/60 shadow-2xl"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, transition: { duration: 0.22 } }}
                  exit={{ x: -30, opacity: 0, transition: { duration: 0.18 } }}
                >
                  <div className="p-3 flex items-center justify-between border-b border-white/60">
                    <button
                      className="h-11 w-11 rounded-2xl bg-white/70 border border-white/70 backdrop-blur-xl shadow-sm flex items-center justify-center active:scale-[0.99] transition"
                      onClick={() => setMobileConvoOpen(false)}
                      aria-label="Close conversations"
                    >
                      <ChevronLeft size={18} className="text-slate-800" />
                    </button>
                    <div className="text-sm font-semibold text-slate-900">Conversations</div>
                    <div className="w-11" />
                  </div>

                  {/* Floating search */}
                  <div className="p-4 pb-3">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        className="w-full rounded-2xl bg-white/70 backdrop-blur-xl border border-white/70 pl-11 pr-11 py-3 text-sm text-slate-800 placeholder:text-slate-500 shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-[#2E3192]/25"
                        placeholder="Search conversationsâ€¦"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      {search?.length > 0 && (
                        <button
                          onClick={() => setSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-white/80 border border-white/70 backdrop-blur-xl flex items-center justify-center shadow hover:shadow-md transition"
                          aria-label="Clear search"
                        >
                          <X size={14} className="text-slate-700" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-2 pb-4">
                    <motion.div variants={listWrap} initial="hidden" animate="show" className="space-y-1">
                      <AnimatePresence initial={false}>
                        {filtered.map((chat) => {
                          const isSelected = selectedChat?.conversationId === chat.conversationId;

                          const name = safe(chat.withUserName, "User");
                          const lastMsg = safe(chat.lastMessage, safe(chat.lastMessageText, "Say hiâ€¦"));
                          const unread = Number(chat.unreadCount || chat.unread || 0);
                          const time =
                            timeAgoShort(chat.lastMessageAt || chat.updatedAt || chat.createdAt);
                          const online = !!chat.isOnline;

                          return (
                            <motion.button
                              key={chat.conversationId}
                              variants={listItem}
                              initial="hidden"
                              animate="show"
                              exit="exit"
                              onClick={() => openChat(chat)}
                              className={[
                                "w-full text-left rounded-2xl px-3 py-3 transition relative",
                                "hover:bg-white/60 hover:shadow-sm",
                                isSelected ? "bg-white/75 shadow-sm border border-white/70" : "border border-transparent",
                              ].join(" ")}
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                  <img
                                    src={avatarUrl(chat.withUserPhoto)}
                                    alt={name}
                                    className="h-12 w-12 rounded-2xl object-cover border border-white/70 shadow-sm"
                                    loading="lazy"
                                  />
                                  <span
                                    className={[
                                      "absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white",
                                      online ? "bg-emerald-500" : "bg-slate-300",
                                    ].join(" ")}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                      {name}
                                    </p>
                                    <span className="text-[11px] text-slate-500 shrink-0">
                                      {time}
                                    </span>
                                  </div>
                                  <div className="mt-0.5 flex items-center justify-between gap-2">
                                    <p className="text-[12px] text-slate-600 truncate">
                                      {lastMsg}
                                    </p>
                                    {unread > 0 && (
                                      <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#2E3192]/15 text-[#2E3192] border border-white/70">
                                        {unread}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RIGHT PANEL (soft blur background) */}
          <div className="flex-1 flex flex-col bg-white/25 backdrop-blur-xl">
            {/* Sticky header: pinned with shadow + blur, shows online status, last seen, ad pill */}
            <div className="sticky top-0 z-20">
              <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-3 bg-white/55 backdrop-blur-xl border-b border-white/60 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile menu for conversations */}
                  <button
                    className="lg:hidden h-11 w-11 rounded-2xl bg-white/70 border border-white/70 backdrop-blur-xl shadow-sm flex items-center justify-center active:scale-[0.99] transition"
                    onClick={() => setMobileConvoOpen(true)}
                    aria-label="Open conversations"
                  >
                    <Menu size={18} className="text-slate-900" />
                  </button>

                  {/* Header identity */}
                  <div className="flex items-center gap-3 min-w-0">
                    {selectedChat ? (
                      <>
                        <div className="relative shrink-0">
                          <img
                            src={avatarUrl(selectedChat?.withUserPhoto)}
                            alt={headerName}
                            className="h-11 w-11 rounded-2xl object-cover border border-white/70 shadow-sm"
                          />
                          <span
                            className={[
                              "absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white",
                              headerOnline ? "bg-emerald-500" : "bg-slate-300",
                            ].join(" ")}
                            title={headerOnline ? "Online" : "Offline"}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                              {headerName}
                            </p>
                            {headerOnline && (
                              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-white/70">
                                <Dot size={18} className="-ml-2 -mr-2" />
                                Online
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-600 truncate">
                            {headerLastSeen}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-semibold text-slate-900">
                          Chats
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600">
                          Select a conversation to start
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ad pill in header */}
                {selectedChat && (adPillTitle || adPillPrice) ? (
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-white/70 backdrop-blur-xl shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-[#2E3192]" />
                      <span className="text-[12px] font-medium text-slate-800 max-w-[180px] truncate">
                        {adPillTitle || "Ad"}
                      </span>
                      {adPillPrice && (
                        <span className="text-[12px] font-semibold text-[#2E3192]">
                          {adPillPrice}
                        </span>
                      )}
                    </span>

                    {/* Delete / actions keep bigger tap targets */}
                    <button
                      onClick={handleDeleteChat}
                      className="h-10 px-4 rounded-2xl bg-slate-900 text-white text-sm font-medium shadow hover:shadow-md active:scale-[0.99] transition"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  selectedChat && (
                    <button
                      onClick={handleDeleteChat}
                      className="hidden sm:inline-flex h-10 px-4 rounded-2xl bg-slate-900 text-white text-sm font-medium shadow hover:shadow-md active:scale-[0.99] transition"
                    >
                      Delete
                    </button>
                  )
                )}
              </div>

              {/* Context bar: ad preview card with image + title + price tag (front-only) */}
              {activeAd && (
                <div className="px-3 sm:px-4 py-3 border-b border-white/60 bg-white/45 backdrop-blur-xl">
                  <div className="rounded-3xl bg-white/65 backdrop-blur-xl border border-white/70 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-4 p-3">
                      <div className="relative shrink-0">
                        <img
                          src={
                            activeAd.image ||
                            "https://cdn-icons-png.flaticon.com/512/4076/4076500.png"
                          }
                          className="w-16 h-16 rounded-2xl object-cover border border-white/70 shadow-sm"
                          alt={safe(activeAd.title, "Ad")}
                        />
                        {/* price tag (front-only) */}
                        {activeAd.price !== undefined && activeAd.price !== null && activeAd.price !== "" && (
                          <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold shadow">
                            MK {formatMK(activeAd.price)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-slate-500">Chat related to</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {safe(activeAd.title, "Ad")}
                        </p>
                      </div>

                      {activeAd.adId && (
                        <button
                          onClick={() =>
                            navigate(
                              `/ad/${activeAd.adId}?from=chat&conversationId=${selectedChat?.conversationId || ""}`
                            )
                          }
                          className="h-11 px-4 rounded-2xl bg-[#2E3192] text-white text-sm font-semibold shadow hover:shadow-md active:scale-[0.99] transition"
                        >
                          View Ad
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message area: soft patterned background (noise/mesh), padding + max-width */}
            {!selectedChat ? (
              <EmptyState onOpenSidebar={() => setMobileConvoOpen(true)} />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedChat?.conversationId}
                  variants={panelReveal}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="relative flex-1 overflow-y-auto overflow-x-hidden"
                >
                  {/* Pattern overlay */}
                  <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.08)_1px,transparent_0)] [background-size:18px_18px]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/20" />
                  </div>

                  {/* Content container (readability max-width) */}
                  <div className="relative px-2 sm:px-4 py-3 sm:py-4">
                    <div className="mx-auto w-full max-w-[920px] space-y-1.5 sm:space-y-2">
                      <AnimatePresence initial={false}>
                        {messages.map((msg, i) => (
                          <motion.div
                            key={msg._id || i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0, transition: { duration: 0.22 } }}
                            exit={{ opacity: 0, y: 8, transition: { duration: 0.18 } }}
                          >
                            <MessageBubble
                              msg={msg}
                              uid={user.uid}
                              onDeleteMe={deleteForMe}
                              onDeleteEveryone={deleteForEveryone}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {typingStatus && <TypingIndicator />}

                      <div ref={bottomRef} />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Mobile: sticky input + larger tap targets (ChatInput already; wrapper makes it sticky) */}
            {selectedChat && (
              <div className="sticky bottom-0 z-20 px-3 sm:px-4 pb-3 pt-2 bg-white/55 backdrop-blur-xl border-t border-white/60 shadow-[0_-10px_30px_rgba(15,23,42,0.06)]">
                <div className="mx-auto w-full max-w-[920px]">
                  <ChatInput
                    value={text}
                    onChange={handleTyping}
                    onSend={({ payload, clearText }) =>
                      sendMessage({
                        payload: {
                          ...payload,
                          // ðŸ”¥ keep your ad-context on send
                          adId: selectedChat?.adId || null,
                          productTitle: selectedChat?.productTitle || "",
                          productImage: selectedChat?.productImage || "",
                        },
                        selectedChat,
                        clearText,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: add the original Sidebar (if you want) as a bottom-safe area (optional) */}
        <div className="lg:hidden mt-3">
          {/* Keep Sidebar available for other navigation; user asked slide-over for conversations specifically */}
          <div className="rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm overflow-hidden">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chats;
