import React, { useState, useMemo } from "react";
import {
  Check,
  CheckCheck,
  FileText,
  File,
  Trash2,
  Ban,
  Lock,
  ImageOff,
  VideoOff,
  MoreHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import FullscreenImageModal from "./FullscreenImageModal.jsx";

const MessageBubble = ({
  msg,
  uid,
  onDeleteMe,
  onDeleteEveryone,

  // âœ… optional (for grouping)
  prevMsg = null,
  nextMsg = null,
}) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const isMe = msg.senderId === uid;

  const type = msg.type || "text";
  const isDeleted = msg.isDeleted || type === "deleted";

  const isTemp = useMemo(() => {
    const id = String(msg?._id || "");
    const temp = String(msg?.clientTempId || "");
    if (!id) return !!temp;
    if (id.startsWith("tmp_")) return true;
    return !!temp && id === temp;
  }, [msg]);

  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const isMedia = !isDeleted && type !== "text";

  // âœ… tighter spacing + grouping logic
  const prevSameSender =
    prevMsg &&
    String(prevMsg.senderId || "") === String(msg.senderId || "") &&
    Boolean(prevMsg.createdAt || prevMsg._id);

  const nextSameSender =
    nextMsg &&
    String(nextMsg.senderId || "") === String(msg.senderId || "") &&
    Boolean(nextMsg.createdAt || nextMsg._id);

  const confirmDelete = (actionType) => {
    actionType === "everyone"
      ? onDeleteEveryone(msg._id)
      : onDeleteMe(msg._id);

    setMenuOpen(false);
  };

  /* Delivery/read ticks */
  const StatusIcon = () => {
    if (!isMe) return null;
    if (msg.isRead) return <CheckCheck size={13} className="text-teal-300" />;
    if (msg.isDelivered) return <CheckCheck size={13} className="text-white" />;
    return <Check size={13} className="text-white" />;
  };

  /* ðŸŽ¨ Brand palette */
  const meBubbleSurface =
    "bg-gradient-to-br from-[#2E3192] via-[#2E3192] to-[#1F2370] text-white";
  const otherBubbleSurface =
    "bg-white/55 backdrop-blur-xl text-gray-900";

  /* ðŸ§© Asymmetric radius (chat-like) + grouping */
  const radiusMe = [
    "rounded-t-2xl",
    prevSameSender ? "rounded-tr-lg rounded-tl-2xl" : "rounded-tr-2xl rounded-tl-2xl",
    nextSameSender ? "rounded-br-lg" : "rounded-br-sm", // tail corner tight
    "rounded-bl-2xl",
  ].join(" ");

  const radiusOther = [
    "rounded-t-2xl",
    prevSameSender ? "rounded-tl-lg rounded-tr-2xl" : "rounded-tl-2xl rounded-tr-2xl",
    "rounded-br-2xl",
    nextSameSender ? "rounded-bl-lg" : "rounded-bl-sm", // tail corner tight
  ].join(" ");

  /* ðŸ§± Bubble base (responsive width + thinner borders) */
  const bubbleBase =
    "relative group px-3 py-2 pb-7 max-w-[92%] sm:max-w-[78%] lg:max-w-[62%] xl:max-w-[54%] " +
    "shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5 transition";

  const bubbleDeleted =
    "bg-gray-200 text-gray-700 ring-1 ring-black/10";

  const bubbleClass = isDeleted
    ? `${bubbleDeleted} ${isMe ? "bg-[#2E3192]/20 text-white/80 ring-white/20" : ""} ${
        isMe ? radiusMe : radiusOther
      }`
    : isMe
    ? `${meBubbleSurface} ${radiusMe}`
    : `${otherBubbleSurface} ${radiusOther} ring-1 ring-black/5`;

  const tempClass = isTemp && !isDeleted ? "opacity-80" : "";

  /* âœ… meta badge inside bubble bottom-right */
  const metaBadgeClass = isDeleted
    ? isMe
      ? "bg-black/35 text-white ring-1 ring-black/20"
      : "bg-white text-gray-800 ring-1 ring-black/10"
    : isMe
    ? "bg-black/35 text-white ring-1 ring-black/20"
    : "bg-white text-teal-700 ring-1 ring-black/10";

  /* ðŸ–¼ï¸ media frame */
  const mediaFrameBase =
    "relative overflow-hidden rounded-xl ring-1 ring-black/10 shadow-inner " +
    (isMe ? "bg-white/10" : "bg-white/70");

  const mediaLift =
    "will-change-transform transform-gpu transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)]";

  const entryAnim = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 6 },
    transition: { duration: 0.18, ease: "easeOut" },
  };

  const menuAnim = {
    initial: { opacity: 0, scale: 0.96, filter: "blur(8px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.98, filter: "blur(10px)" },
    transition: { duration: 0.14, ease: "easeOut" },
  };

  return (
    <>
      <div
        className={`flex ${isMe ? "justify-end" : "justify-start"} ${
          prevSameSender ? "mt-0.5" : "mt-1"
        } mb-0.5`}
      >
        <motion.div
          {...entryAnim}
          whileHover={isMedia ? { y: -1 } : undefined}
          className={`${bubbleBase} ${bubbleClass} ${tempClass} ${
            isMedia ? mediaLift : ""
          }`}
        >
          {/* âœ… HOVER "MORE" CHIP (replaces â‹®) */}
          {!isDeleted && (
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className={`absolute top-1 ${
                isMe ? "left-1" : "right-1"
              } z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition`}
              aria-label="Message menu"
            >
              <span
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px]
                ${
                  isMedia
                    ? "bg-black/60 text-white ring-1 ring-black/40"
                    : isMe
                    ? "bg-black/35 text-white ring-1 ring-black/20"
                    : "bg-white/90 text-gray-800 ring-1 ring-black/10"
                }
                backdrop-blur-md hover:scale-[1.03] active:scale-[0.98] transition`}
              >
                <MoreHorizontal size={14} />
              </span>
            </button>
          )}



          {/* ----- DELETED (muted pill + icon, layout consistent) ----- */}
{isDeleted ? (
  <div className="flex items-center gap-2">
    <div
      className={`flex items-center justify-center w-7 h-7 rounded-full ${
        isMe
          ? "bg-white/10 ring-1 ring-white/10"
          : "bg-white/80 ring-1 ring-black/5"
      }`}
    >
      <Lock
        size={14}
        className={isMe ? "text-white/70" : "text-gray-500"}
      />
    </div>

    <p
      className={`text-sm italic ${
        isMe ? "text-white/80" : "text-gray-700"
      }`}
    >
      This message was deleted
    </p>
  </div>
) : (
  <>
    {/* IMAGE */}
    {type === "image" && (
      <>
        {!imgError ? (
          <div className={mediaFrameBase}>
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="relative block w-full"
              aria-label="Open image"
            >
              <img
                src={msg.mediaUrl}
                className="w-full max-h-64 object-cover transform-gpu transition duration-300 group-hover:scale-[1.02]"
                onError={() => setImgError(true)}
                alt="attachment"
                loading="lazy"
              />

              <div className="pointer-events-none absolute inset-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-[11px] bg-white/80 text-gray-900 ring-1 ring-black/10">
                  Click to zoom
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl ring-1 ${
              isMe
                ? "bg-white/10 ring-white/10"
                : "bg-white/70 ring-black/5"
            }`}
          >
            <ImageOff
              size={18}
              className={isMe ? "text-white/70" : "text-gray-500"}
            />
            <span
              className={`text-sm ${
                isMe ? "text-white/70" : "text-gray-600"
              }`}
            >
              Image failed to load
            </span>
          </div>
        )}
      </>
    )}

    {/* VIDEO */}
    {type === "video" && (
      <>
        {!videoError ? (
          <div className={mediaFrameBase}>
            <video
              src={msg.mediaUrl}
              controls
              className="w-full max-h-72 object-cover"
              onError={() => setVideoError(true)}
            />
          </div>
        ) : (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl ring-1 ${
              isMe
                ? "bg-white/10 ring-white/10"
                : "bg-white/70 ring-black/5"
            }`}
          >
            <VideoOff
              size={18}
              className={isMe ? "text-white/70" : "text-gray-500"}
            />
            <span
              className={`text-sm ${
                isMe ? "text-white/70" : "text-gray-600"
              }`}
            >
              Video failed to load
            </span>
          </div>
        )}
      </>
    )}

    {/* PDF */}
    {type === "pdf" && (
      <a
        href={msg.mediaUrl}
        target="_blank"
        rel="noreferrer"
        className={`flex items-center gap-2 p-2.5 rounded-xl ring-1 ${mediaFrameBase} ${
          isMe ? "text-white" : "text-gray-900"
        }`}
      >
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-lg ring-1 ${
            isMe
              ? "bg-white/10 ring-white/10"
              : "bg-white/80 ring-black/5"
          }`}
        >
          <FileText
            size={18}
            className={isMe ? "text-white/80" : "text-red-600"}
          />
        </div>

        <div className="min-w-0">
          <div
            className={`text-sm font-medium truncate ${
              isMe ? "text-white" : "text-gray-900"
            }`}
          >
            {msg.mediaName || "PDF file"}
          </div>
          <div
            className={`text-[11px] truncate ${
              isMe ? "text-white/70" : "text-gray-600"
            }`}
          >
            Tap to open
          </div>
        </div>
      </a>
    )}

    {/* FILE */}
    {type === "file" && (
      <a
        href={msg.mediaUrl}
        download
        className={`flex items-center gap-2 p-2.5 rounded-xl ring-1 ${mediaFrameBase} ${
          isMe ? "text-white" : "text-gray-900"
        }`}
      >
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-lg ring-1 ${
            isMe
              ? "bg-white/10 ring-white/10"
              : "bg-white/80 ring-black/5"
          }`}
        >
          <File
            size={18}
            className={isMe ? "text-white/80" : "text-gray-800"}
          />
        </div>

        <div className="min-w-0">
          <div
            className={`text-sm font-medium truncate ${
              isMe ? "text-white" : "text-gray-900"
            }`}
          >
            {msg.mediaName || "Attachment"}
          </div>
          <div
            className={`text-[11px] truncate ${
              isMe ? "text-white/70" : "text-gray-600"
            }`}
          >
            Download
          </div>
        </div>
      </a>
    )}

    {/* TEXT */}
    {type === "text" && (
      <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px] sm:text-[16px]">
        {msg.message}
      </p>
    )}
  </>
)}


          {/* âœ… compact meta badge inside bubble (bottom-right) */}
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-2">
            {/* TEMP STATUS LABEL */}
            {!isDeleted && isMe && isTemp && !msg.isDelivered && !msg.isRead && (
              <span
                className={`px-2 py-1 rounded-full text-[11px] tabular-nums ${metaBadgeClass}`}
              >
                Sending...
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] tabular-nums whitespace-nowrap ${metaBadgeClass}`}
            >
              <span>{time}</span>
              {!isDeleted && <StatusIcon />}
            </span>
          </div>
        </motion.div>
      </div>

      {/* DELETE MODAL (portal so it is not trapped inside media transforms) */}
      {menuOpen &&
        createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              {...menuAnim}
              className="w-[90%] max-w-sm rounded-2xl bg-white text-gray-900 shadow-2xl ring-1 ring-black/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">Delete message</p>
                <p className="text-xs text-gray-500 mt-1">Choose an option below.</p>
              </div>

              <div className="p-3 space-y-2">
                <button
                  onClick={() => confirmDelete("me")}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl hover:bg-gray-100 transition"
                >
                  <Trash2 size={16} />
                  Delete for me
                </button>

                {isMe && (
                  <button
                    onClick={() => confirmDelete("everyone")}
                    className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition"
                  >
                    <Ban size={16} />
                    Delete for everyone
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}

      {/* FULLSCREEN IMAGE */}
      {showImageModal && (
        <FullscreenImageModal
          url={msg.mediaUrl}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </>
  );
};

export default MessageBubble;
