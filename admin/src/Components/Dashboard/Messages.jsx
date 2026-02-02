// src/Components/Dashboard/Messages.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi"; // âœ… JWT INCLUDED
import { motion } from "framer-motion";
import {
  Search,
  MessageSquare,
  Clock,
  User,
  ArrowLeft,
} from "lucide-react";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");

  /* ======================================================
        FETCH ALL CONVERSATIONS (ADMIN AUTH)
  ====================================================== */
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await adminApi.get("/conversations");

        setConversations(
          Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.conversations)
            ? res.data.conversations
            : []
        );
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, []);

  /* ======================================================
        FETCH MESSAGES FOR SELECTED CHAT
  ====================================================== */
  const openConversation = async (convId) => {
    setSelectedConv(convId);
    setMessages([]);

    try {
      const res = await adminApi.get(`/messages/${convId}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  /* ======================================================
        FILTER CONVERSATIONS
  ====================================================== */
  const filteredConversations = conversations.filter((conv) => {
    const searchLower = search.toLowerCase();
    return (
      conv.userA?.name?.toLowerCase().includes(searchLower) ||
      conv.userB?.name?.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.toLowerCase().includes(searchLower)
    );
  });

  /* ======================================================
        UI RENDER
  ====================================================== */
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#E9EDFF] via-white to-[#E9EDFF] font-[Poppins]">

      {/* ------------------------------------------
            LEFT SIDEBAR â€” CONVERSATIONS
      ------------------------------------------- */}
      <div className="w-1/3 border-r bg-white/80 backdrop-blur-xl shadow-xl flex flex-col">

        {/* SEARCH */}
        <div className="p-4 flex items-center border-b bg-[#E9EDFF]/60 shadow-sm">
          <Search className="text-[#1F2370] mr-2" size={18} />
          <input
            type="text"
            placeholder="Search user or message..."
            className="flex-1 bg-transparent outline-none text-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* CONVERSATION LIST */}
        <div className="overflow-y-auto flex-1 p-3 space-y-3 bg-gradient-to-b from-white to-[#E9EDFF]">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <motion.div
                key={conv._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => openConversation(conv._id)}
                className={`flex justify-between items-center p-4 rounded-2xl cursor-pointer transition-all border
                  ${
                    selectedConv === conv._id
                      ? "bg-[#2E3192]/15 border-[#2E3192]/40 shadow-md"
                      : "bg-white hover:bg-[#2E3192]/10 hover:border-[#2E3192]/30"
                  }`}
              >
                {/* USER INFO */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2E3192] to-[#1A1D64] text-white flex items-center justify-center font-semibold shadow">
                      {conv.userA?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>

                  <div>
                    <p className="font-semibold text-[#1A1D64]">
                      {conv.userA?.name} — {conv.userB?.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate max-w-[150px]">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>

                {/* TIME */}
                <div className="text-right text-xs text-gray-500">
                  {conv.updatedAt &&
                    new Date(conv.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  <Clock className="text-[#1F2370] mt-1 mx-auto" size={14} />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare size={28} />
              <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------
            RIGHT SIDE â€” CHAT WINDOW
      ------------------------------------------- */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-[#E9EDFF]">

        {selectedConv ? (
          <>
            {/* HEADER */}
            <div className="p-4 border-b bg-white/90 backdrop-blur-md shadow flex items-center gap-3">
              <button onClick={() => setSelectedConv(null)} className="lg:hidden">
                <ArrowLeft size={20} className="text-[#1F2370]" />
              </button>

              <User size={22} className="text-[#2E3192]" />

              <div>
                <p className="font-semibold text-[#1A1D64]">
                  {conversations.find((c) => c._id === selectedConv)?.userA?.name}
                  {" — "}
                  {conversations.find((c) => c._id === selectedConv)?.userB?.name}
                </p>
                <p className="text-xs text-gray-500">Conversation View</p>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((msg) => {
                  const conv = conversations.find(
                    (c) => c._id === selectedConv
                  );
                  const isSenderA = msg.senderId === conv?.userA?._id;

                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        isSenderA ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-2xl shadow text-sm ${
                          isSenderA
                            ? "bg-[#2E3192] text-white"
                            : "bg-[#E9EDFF] text-[#1A1D64]"
                        }`}
                      >
                        {msg.message || msg.text}
                        <p className="text-[10px] opacity-80 mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <MessageSquare size={26} />
                  <span className="ml-2">No messages yet</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-gray-400">
            <MessageSquare size={40} />
            <p>Select a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
