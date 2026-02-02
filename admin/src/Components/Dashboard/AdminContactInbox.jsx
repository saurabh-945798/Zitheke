import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  User,
  MessageSquare,
  CheckCircle,
  Clock,
} from "lucide-react";

const AdminContactInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMessage, setActiveMessage] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/contact/admin/messages"
      );
      setMessages(res.data.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/contact/admin/messages/${id}/read`
      );
      fetchMessages();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9EDFF] via-white to-[#F4F6FF] p-6 font-[Poppins]">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-[#2E3192]">
           Inbox
        </h1>
        <p className="text-gray-600 mt-1">
          Messages sent by users via Contact Support
        </p>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: MESSAGE LIST */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b font-semibold text-[#2E3192]">
            All Messages
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No messages found
            </div>
          ) : (
            <div className="divide-y max-h-[70vh] overflow-y-auto">
              {messages.map((msg) => (
                <motion.div
                  key={msg._id}
                  whileHover={{ backgroundColor: "#E9EDFF" }}
                  onClick={() => {
                    setActiveMessage(msg);
                    if (!msg.isRead) markAsRead(msg._id);
                  }}
                  className={`p-4 cursor-pointer transition ${
                    activeMessage?._id === msg._id
                      ? "bg-[#E9EDFF]"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm">
                      {msg.name}
                    </h3>

                    {msg.isRead ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <Clock size={16} className="text-orange-400" />
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {msg.subject}
                  </p>

                  <p className="text-[11px] text-gray-400 mt-1">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: MESSAGE DETAILS */}
        <div className="lg:col-span-2">
          <AnimatePresence>
            {activeMessage ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-md p-8 h-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <User className="text-[#2E3192]" />
                  <div>
                    <h2 className="text-lg font-semibold">
                      {activeMessage.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {activeMessage.email}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 text-[#2E3192] mb-1">
                    <Mail size={16} />
                    <span className="font-medium">Subject</span>
                  </div>
                  <p className="text-gray-700">
                    {activeMessage.subject}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[#2E3192] mb-2">
                    <MessageSquare size={16} />
                    <span className="font-medium">Message</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {activeMessage.message}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-8 flex items-center justify-center h-full text-gray-500">
                Select a message to view details
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminContactInbox;
