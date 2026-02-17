import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send, Smile, Paperclip, X, Loader2, Search } from "lucide-react";

/* âœ… Color system (CSS vars)
   You can also move these vars to your global CSS if you want.
*/
const CHAT_VARS = {
  "--chat-accent": "#2E3192",
  "--chat-bg": "rgba(255,255,255,0.75)",
  "--chat-border": "rgba(0,0,0,0.08)",
  "--chat-shadow": "0 10px 30px rgba(0,0,0,0.10)",
};

const EMOJI_CATEGORIES = [
  { key: "faces", label: "ðŸ™‚" },
  { key: "gestures", label: "ðŸ‘" },
  { key: "symbols", label: "â¤ï¸" },
  { key: "celebration", label: "ðŸŽ‰" },
];

const EMOJIS = {
  faces: ["ðŸ˜€", "ðŸ˜", "ðŸ˜‚", "ðŸ¤£", "ðŸ˜Š", "ðŸ˜", "ðŸ˜˜", "ðŸ˜Ž", "ðŸ˜¢", "ðŸ˜¡", "ðŸ˜­", "ðŸ˜´", "ðŸ˜…", "ðŸ¤©", "ðŸ¤”", "ðŸ˜‡", "ðŸ˜œ", "ðŸ¤—", "ðŸ¥³"],
  gestures: ["ðŸ‘", "ðŸ‘Ž", "ðŸ™", "ðŸ™Œ", "ðŸ¤", "ðŸ‘Œ"],
  symbols: ["ðŸ”¥", "â¤ï¸", "ðŸ’”", "âœ¨"],
  celebration: ["ðŸŽ‰"],
};

const QUICK_MESSAGES = [
  "Please call me",
  "Last price?",
  "Is this still available?",
  "Location please",
  "Delivery available?",  
  "I am interested",
];

const formatBytes = (bytes) => {  
  if (!bytes && bytes !== 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const val = bytes / Math.pow(k, i);
  return `${val.toFixed(val >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
};

const ChatInput = ({ value, onChange, onSend }) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [emojiTab, setEmojiTab] = useState("faces");
  const [emojiQuery, setEmojiQuery] = useState("");

  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPopoverRef = useRef(null);
  const barRef = useRef(null);

  /* =====================================================
     â™¿ Accessibility helpers
  ===================================================== */
  const focusRing =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--chat-accent)] focus-visible:ring-offset-white";

  /* =====================================================
     ðŸ”’ Close emoji popover on outside click / ESC
  ===================================================== */
  useEffect(() => {
    const onDown = (e) => {
      if (!showEmoji) return;
      if (
        !emojiPopoverRef.current?.contains(e.target) &&
        !barRef.current?.contains(e.target)
      ) {
        setShowEmoji(false);
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") setShowEmoji(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [showEmoji]);

  /* =====================================================
     ðŸ§¼ Clean preview URL on unmount / change
  ===================================================== */
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* =====================================================
     ðŸ˜„ Emoji list (search + tabs)
  ===================================================== */
  const emojiList = useMemo(() => {
    const all = Object.entries(EMOJIS).flatMap(([cat, arr]) =>
      arr.map((e) => ({ cat, e }))
    );

    const inTab = EMOJIS[emojiTab]?.map((e) => ({ cat: emojiTab, e })) || [];
    const base = emojiQuery.trim() ? all : inTab;

    if (!emojiQuery.trim()) return base;

    // simple filter: since emoji don't have names here, filter by "includes" doesn't help much,
    // but still supports paste exact emoji or partial match in future if you add names.
    const q = emojiQuery.trim();
    return base.filter((x) => x.e.includes(q));
  }, [emojiTab, emojiQuery]);

  /* =====================================================
     INSERT EMOJI
  ===================================================== */
  const insertEmoji = (emoji) => {
    const el = inputRef.current;
    if (!el) return;

    const cursor = el.selectionStart ?? value.length;
    const newText = value.slice(0, cursor) + emoji + value.slice(cursor);
    onChange({ target: { value: newText } });

    setTimeout(() => {
      el.selectionStart = cursor + emoji.length;
      el.selectionEnd = cursor + emoji.length;
      el.focus();
    }, 20);
  };

  /* =====================================================
     FILE SELECT â†’ PREVIEW
  ===================================================== */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // revoke old url
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    // reset input so selecting same file again works
    e.target.value = "";
  };

  /* =====================================================
     SEND ATTACHMENT (Cloudinary)
  ===================================================== */
  const sendAttachment = async () => {
    if (!previewFile) return;
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", previewFile);
      form.append("upload_preset", "alinafe_uploads");

      const res = await fetch("https://api.cloudinary.com/v1_1/dxah12xl4/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      let msgType = "file";
      if (previewFile.type.startsWith("image")) msgType = "image";
      else if (previewFile.type.startsWith("video")) msgType = "video";
      else if (previewFile.type === "application/pdf") msgType = "pdf";

      onSend({
        payload: {
          type: msgType,
          mediaUrl: data.secure_url,
          mediaName: previewFile.name,
        },
        clearText: () => {},
      });

      setPreviewFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed!");
    }

    setUploading(false);
  };

  /* =====================================================
     SEND TEXT
     âœ… Press Enter to send
     âœ… Shift+Enter -> newline
  ===================================================== */
  const sendText = () => {
    if (!value.trim()) return;

    onSend({
      payload: {
        type: "text",
        message: value.trim(),
      },
      clearText: () => onChange({ target: { value: "" } }),
    });
  };

  /* =====================================================
     Keyboard handling
  ===================================================== */
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  /* =====================================================
     Quick reply click
  ===================================================== */
  const applyQuick = (msg) => {
    onChange({ target: { value: msg } });
    setTimeout(() => inputRef.current?.focus(), 20);
  };

  const hasText = value?.trim()?.length > 0;

  const autoResizeTextarea = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 140);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > 140 ? "auto" : "hidden";
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [value]);

  return (
    <div
      className="w-full"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* âœ… Floating input bar container */}
      <div
        ref={barRef}
        className="relative mx-1.5 sm:mx-4 mb-2 sm:mb-3"
        style={CHAT_VARS}
      >
        {/* Quick replies (horizontal scroll pills) */}
        <div className="mb-2 hidden sm:block">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar snap-x snap-mandatory">
            {QUICK_MESSAGES.map((msg, idx) => (
              <button
                key={idx}
                onClick={() => applyQuick(msg)}
                className={`shrink-0 snap-start px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs border bg-white/60 backdrop-blur
                  hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 transition
                  ${focusRing}`}
                style={{
                  borderColor: "rgba(46,49,146,0.35)",
                  boxShadow: "inset 0 0 0 1px rgba(46,49,146,0.10)",
                }}
                aria-label={`Quick reply: ${msg}`}
              >
                <span
                  className="px-0.5"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(46,49,146,0.12), rgba(46,49,146,0.02))",
                    borderRadius: 9999,
                  }}
                >
                  {msg}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* File preview card */}
        {previewFile && (
          <div
            className="mb-2 p-2.5 sm:p-3 rounded-2xl border bg-white/70 backdrop-blur"
            style={{
              borderColor: "var(--chat-border)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Thumbnail */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border bg-white flex items-center justify-center shrink-0">
                {previewFile.type.startsWith("image") ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : previewFile.type.startsWith("video") ? (
                  <video
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <div className="text-xs text-gray-600 px-2 text-center">
                    {previewFile.type === "application/pdf" ? "PDF" : "FILE"}
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                  {previewFile.name}
                </div>
                <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  {formatBytes(previewFile.size)}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      setPreviewFile(null);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl("");
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border
                      hover:bg-red-50 hover:text-red-600 transition ${focusRing}`}
                    style={{ borderColor: "rgba(220,38,38,0.25)" }}
                    aria-label="Remove attachment"
                  >
                    <X size={16} /> Remove
                  </button>

                  <button
                    onClick={sendAttachment}
                    disabled={uploading}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-1 rounded-full text-xs text-white
                      disabled:opacity-60 disabled:cursor-not-allowed transition ${focusRing}`}
                    style={{ background: "var(--chat-accent)" }}
                    aria-label="Send attachment"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploadingâ€¦
                      </>
                    ) : (
                      "Send"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating bar (blur + rounded full + subtle shadow) */}
        <div
          className="w-full rounded-[24px] sm:rounded-[999px] border backdrop-blur-md bg-[var(--chat-bg)]"
          style={{
            borderColor: "var(--chat-border)",
            boxShadow: "var(--chat-shadow)",
          }}
        >
          {/* Structured layout: left (attach), center (text), right (send + emoji) */}
          <div className="flex items-end gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2">
            {/* LEFT: Attach */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full grid place-items-center text-gray-600 shrink-0
                hover:bg-white/60 transition active:scale-95 ${focusRing}`}
              aria-label="Attach file"
              title="Attach"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "rotate(-6deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "rotate(0deg)";
              }}
            >
              <Paperclip size={18} className="sm:w-[22px] sm:h-[22px]" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              aria-label="File input"
            />

            {/* CENTER: Text Field */}
            <div className="flex-1 min-w-0 px-0.5 sm:px-1">
              <textarea
                ref={inputRef}
                className={`w-full resize-none bg-transparent outline-none text-sm sm:text-[15px] leading-5
                  placeholder:text-gray-400 py-2.5 sm:py-3 px-2.5 sm:px-3 rounded-2xl
                  ${focusRing}`}
                placeholder="Message"
                value={value}
                onChange={onChange}
                onInput={autoResizeTextarea}
                onKeyDown={onKeyDown}
                rows={1}
                aria-label="Message input"
                style={{
                  minHeight: "44px",
                  maxHeight: "140px",
                }}
              />
              {/* Typing support hint */}
              <div className="hidden sm:block px-3 pb-1 -mt-2">
                <span className="text-[11px] text-gray-500">
                  Press <b>Enter</b> to send â€¢ <b>Shift</b>+<b>Enter</b> for new line
                </span>
              </div>
            </div>

            {/* RIGHT: Emoji + Send */}
            <div className="flex items-center gap-1 pr-0.5 sm:pr-1 shrink-0">
              <button
                onClick={() => setShowEmoji((s) => !s)}
                className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full grid place-items-center text-gray-700
                  hover:bg-white/60 transition active:scale-95 ${focusRing}`}
                aria-label="Open emoji picker"
                title="Emoji"
              >
                <Smile size={18} className="sm:w-[22px] sm:h-[22px]" />
              </button>

              <button
                onClick={sendText}
                disabled={!hasText}
                className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full grid place-items-center text-white
                  disabled:opacity-60 disabled:cursor-not-allowed transition ${focusRing}`}
                style={{ background: "var(--chat-accent)" }}
                aria-label="Send message"
                title="Send"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <Send size={17} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
          </div>
        </div>

        {/* EMOJI PICKER (popover w/ search + tabs) */}
        {showEmoji && (
          <div
            ref={emojiPopoverRef}
            className="absolute bottom-[78px] left-0 right-0 sm:left-4 sm:right-auto w-auto sm:w-[320px] max-w-[96vw] bg-white border rounded-2xl shadow-xl p-3 z-50"
            style={{
              transformOrigin: "bottom left",
              animation: "emojiPop 140ms ease-out",
            }}
            role="dialog"
            aria-label="Emoji picker"
          >
            {/* micro motion keyframes */}
            <style>{`
              @keyframes emojiPop {
                from { opacity: 0; transform: translateY(6px) scale(0.98); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>

            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-gray-50">
              <Search size={16} className="text-gray-500" />
              <input
                value={emojiQuery}
                onChange={(e) => setEmojiQuery(e.target.value)}
                className={`w-full bg-transparent outline-none text-sm ${focusRing}`}
                placeholder="Search (optional)"
                aria-label="Search emoji"
              />
              {emojiQuery && (
                <button
                  onClick={() => setEmojiQuery("")}
                  className={`text-gray-500 hover:text-gray-700 ${focusRing}`}
                  aria-label="Clear emoji search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
              {EMOJI_CATEGORIES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setEmojiTab(t.key);
                    setEmojiQuery("");
                  }}
                  className={`px-3 py-1 rounded-full text-sm border transition ${focusRing}
                    ${emojiTab === t.key ? "bg-gray-900 text-white border-gray-900" : "bg-white hover:bg-gray-50"}`}
                  aria-label={`Emoji category ${t.key}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="mt-3 grid grid-cols-7 sm:grid-cols-8 gap-2">
              {emojiList.map((x, i) => (
                <button
                  key={`${x.cat}-${x.e}-${i}`}
                  onClick={() => insertEmoji(x.e)}
                  className={`text-xl w-9 h-9 rounded-xl hover:bg-gray-100 active:scale-95 transition ${focusRing}`}
                  aria-label={`Emoji ${x.e}`}
                >
                  {x.e}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
