import React from "react";
import { ArrowLeft, Trash2, Tag } from "lucide-react";
import { motion as Motion } from "framer-motion";

const ChatHeader = ({
  chat,
  typingStatus,
  onDelete,
  adTitle,
  adPrice,
}) => {
  /* ---------------------------
     Avatar Fallback
  ---------------------------- */
  const getAvatar = () =>
    chat?.withUserPhoto && chat.withUserPhoto.trim() !== ""
      ? chat.withUserPhoto
      : "/default-user.png";

  /* ---------------------------
     Last Seen Formatter
  ---------------------------- */
  const formatLastSeen = (ts) => {
    if (!ts) return "Online";
    const date = new Date(ts);
    return `Last seen at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const isOnline = chat?.isOnline;

  return (
    <Motion.div
      key={chat?.conversationId}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="
        sticky top-0 z-30
        px-4 py-3
        flex items-center justify-between
        bg-white/60 backdrop-blur-xl
        border-b border-white/40
        shadow-[0_8px_30px_rgba(0,0,0,0.08)]
      "
    >
      {/* ================= LEFT ================= */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar with Gradient Ring */}
        <div className="relative shrink-0">
          <div className="
            p-[2px] rounded-full
            bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600
          ">
            <img
              src={getAvatar()}
              alt="User Avatar"
              className="w-11 h-11 rounded-full object-cover bg-white"
            />
          </div>

          {/* Online Dot with Glow */}
          {isOnline && (
            <span className="
              absolute -bottom-0.5 -right-0.5
              w-3 h-3 rounded-full
              bg-green-500
              ring-2 ring-white
              shadow-[0_0_8px_rgba(34,197,94,0.9)]
            " />
          )}
        </div>

        {/* Name + Status */}
        <div className="min-w-0">
          <p className="
            text-[16px] font-semibold text-gray-900
            leading-tight truncate
          ">
            {chat?.withUserName}
          </p>

          {/* Status Chip */}
          <span className="
            inline-flex items-center
            mt-0.5 px-2 py-[2px]
            rounded-full
            text-[11px] font-medium
            bg-gray-100 text-gray-600
          ">
            {typingStatus
              ? "typingâ€¦"
              : isOnline
              ? "Online"
              : formatLastSeen(chat?.lastSeen)}
          </span>
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="flex items-center gap-3">
        {/* Ad Context Pill */}
        {(adTitle || adPrice) && (
          <div className="
            hidden sm:flex items-center gap-1.5
            px-3 py-1.5
            rounded-full
            bg-white/70 backdrop-blur
            border border-white/50
            text-[12px] text-gray-800
            shadow-sm
          ">
            <Tag size={13} className="text-teal-600" />
            <span className="max-w-[140px] truncate font-medium">
              {adTitle}
            </span>
            {adPrice && (
              <span className="font-semibold text-teal-600">
                MK {adPrice}
              </span>
            )}
          </div>
        )}

        {/* Delete Button */}
        <Motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          title="Delete chat"
          onClick={onDelete}
          className="
            w-11 h-11
            flex items-center justify-center
            rounded-xl
            text-gray-500
            hover:text-red-600
            hover:bg-red-50
            transition
          "
        >
          <Trash2 size={18} />
        </Motion.button>

        {/* Mobile Back Button */}
        <Motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          title="Back"
          onClick={() => window.history.back()}
          className="
            w-11 h-11
            flex items-center justify-center
            rounded-xl
            text-gray-500
            hover:text-gray-800
            hover:bg-gray-100
            transition
            lg:hidden
          "
        >
          <ArrowLeft size={20} />
        </Motion.button>
      </div>
    </Motion.div>
  );
};

export default ChatHeader;
