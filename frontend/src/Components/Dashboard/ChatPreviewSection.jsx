import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MessageSquare,
  ChevronRight,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

/* ðŸ”¹ Time Ago Utility */
const timeAgo = (date) => {
  if (!date) return "";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const ChatPreviewSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = "/api";

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("token");
    
        if (!token) {
          console.warn("No JWT token found");
          return;
        }
    
        const res = await axios.get(
          `${BASE_URL}/conversations/preview/${user.uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
    
        setChats(res.data || []);
      } catch (err) {
        console.error("Chat preview error:", err);
      } finally {
        setLoading(false);
      }
    };
    

    fetchChats();
  }, [user?.uid]);

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-xl p-6">
      {/* Gradient glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#2E3192]/20 rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-[#1A1D64] flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#E9EDFF]">
            <MessageSquare className="w-5 h-5 text-[#2E3192]" />
          </div>
          Recent Chats
        </h3>

        <button
          onClick={() => navigate("/chats")}
          className="text-sm font-medium text-[#2E3192] flex items-center gap-1 hover:underline"
        >
          View all <ChevronRight size={16} />
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-2xl bg-white/70 animate-pulse"
            />
          ))}
        </div>
      ) : chats.length > 0 ? (
        <div className="space-y-3">
          {chats.map((chat) => {
            const isUnread = chat.unreadCount > 0;

            return (
              <motion.button
                key={chat.conversationId}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  navigate(`/chats?cid=${chat.conversationId}`)
                }
                className={`
                  group relative w-full flex items-center gap-4 rounded-2xl p-4
                  border transition shadow-sm hover:shadow-lg
                  ${
                    isUnread
                      ? "bg-[#EEF0FF] border-[#2E3192]/40"
                      : "bg-white/70 border-white/60 hover:bg-white/90"
                  }
                `}
              >
                {/* LEFT UNREAD INDICATOR */}
                {isUnread && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-[#2E3192] animate-pulse" />
                )}

                {/* Avatar */}
                <div className="relative">
                  {chat.withUserPhoto ? (
                    <img
                      src={chat.withUserPhoto}
                      alt={chat.withUserName}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2E3192] to-[#1F2370] text-white flex items-center justify-center font-semibold">
                      {chat.withUserName?.charAt(0) || "U"}
                    </div>
                  )}

                  {/* Unread dot */}
                  {isUnread && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#2E3192] rounded-full animate-pulse" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm truncate ${
                        isUnread
                          ? "font-bold text-[#1A1D64]"
                          : "font-semibold text-gray-800"
                      }`}
                    >
                      {chat.withUserName}
                    </p>

                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} />
                      {timeAgo(chat.lastMessageAt)}
                    </span>
                  </div>

                  <p
                    className={`text-xs truncate mt-0.5 ${
                      isUnread
                        ? "font-semibold text-[#1F2370]"
                        : "text-gray-500"
                    }`}
                  >
                    {chat.lastMessage || "No messages yet"}
                  </p>
                </div>

                {/* Unread count */}
                {isUnread && (
                  <Badge className="bg-[#2E3192] text-white rounded-full px-2.5 py-0.5 text-xs shadow-md">
                    {chat.unreadCount}
                  </Badge>
                )}
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-600">
            No conversations yet
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Start chatting by opening an ad
          </p>
        </div>
      )}
    </Card>
  );
};

export default ChatPreviewSection;
