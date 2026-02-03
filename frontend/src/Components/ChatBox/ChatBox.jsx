import React, { useEffect, useState, useRef } from "react";
import socket from "../../socket.js";
import axios from "axios";

const DEFAULT_SUGGESTIONS = [
  "Hi, is this item still available?",
  "What's your last price?",
  "Can you do delivery?",
  "Can we meet today?",
];

const ChatBox = ({ currentUserId, sellerUserId, adTitle, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState("");
  const bottomRef = useRef(null);

  /* 🟢 Auto scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* 🟢 Load history + setup socket */
  useEffect(() => {
    if (!currentUserId || !sellerUserId) return;
    if (currentUserId === sellerUserId) return; // ❌ prevent self chat

    if (!socket.connected) socket.connect();
    socket.emit("joinRoom", currentUserId);

    const handleIncoming = (msg) => {
      // Append message only if belongs to this chat
      if (
        (msg.senderId === currentUserId && msg.receiverId === sellerUserId) ||
        (msg.senderId === sellerUserId && msg.receiverId === currentUserId)
      ) {
        setMessages((prev) => {
          const isDuplicate = prev.some(
            (m) =>
              m.senderId === msg.senderId &&
              m.receiverId === msg.receiverId &&
              m.message === msg.message &&
              Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 1500
          );
          return isDuplicate ? prev : [...prev, msg];
        });
      }
    };

    socket.on("receiveMessage", handleIncoming);

    // Load chat history
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `/api/messages/${currentUserId}/${sellerUserId}`
        );
        setMessages(res.data || []);
      } catch (err) {
        console.error("Error loading chat:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    return () => {
      socket.off("receiveMessage", handleIncoming);
    };
  }, [currentUserId, sellerUserId]);

  /* 🟢 Send message */
  const sendMessage = async () => {
    const finalText = text.trim() || selectedSuggestion.trim();
    if (!finalText) return;
    if (currentUserId === sellerUserId) return; // ❌ self chat block

    const msgData = {
      senderId: currentUserId,
      receiverId: sellerUserId,
      message: finalText,
      adTitle: adTitle || "Listing",
      createdAt: new Date().toISOString(),
    };

    try {
      // Optimistic push (instant UI)
      setMessages((prev) => [...prev, msgData]);

      // Send to socket
      socket.emit("sendMessage", msgData);

      // Save to DB
      await axios.post("/api/messages", msgData);

      setText("");
      setSelectedSuggestion("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] flex justify-center px-4 pb-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-[slideUp_0.25s_ease]">
        {/* HEADER */}
        <div className="flex items-start justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-[#2E3192] to-[#1f2370] text-white">
          <div>
            <p className="text-sm opacity-80">Chat about</p>
            <p className="text-base font-semibold leading-tight line-clamp-1">
              {adTitle || "Listing"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-sm font-medium"
          >
            ✕
          </button>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 max-h-64 overflow-y-auto p-4 space-y-3 bg-gray-50 text-sm">
          {loading ? (
            <div className="text-gray-500 text-center py-8 animate-pulse">
              Loading chat...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Start the conversation 👇
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div
                  key={`${i}-${msg.createdAt}`}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} w-full`}
                >
                  <div
                    className={`rounded-xl px-3 py-2 max-w-[75%] leading-snug ${
                      isMe
                        ? "bg-[#2E3192] text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-line break-words">
                      {msg.message}
                    </p>
                    <p className="text-[10px] mt-1 opacity-70 text-right">
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* QUICK SUGGESTIONS */}
        {selectedSuggestion === "" && (
          <div className="flex flex-wrap gap-2 px-4 py-3 border-t border-gray-200 bg-white">
            {DEFAULT_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSuggestion(s)}
                className="text-[11px] px-3 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200 hover:bg-gray-200"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* INPUT BOX */}
        <div className="flex items-center gap-2 p-4 border-t border-gray-200 bg-white">
          <input
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#2E3192] focus:border-[#2E3192]"
            placeholder="Type your message..."
            value={selectedSuggestion || text}
            onChange={(e) => {
              setSelectedSuggestion("");
              setText(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-[#2E3192] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1f2370] active:scale-95 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
