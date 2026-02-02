import React from "react";

const ConversationItem = ({ chat, onClick, selected }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-100 transition 
        ${selected ? "bg-[#E8EBFF]" : "hover:bg-gray-50"}`}
    >
      <img
        src={chat.withUserPhoto}
        className="w-11 h-11 rounded-full object-cover border border-gray-200"
      />

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-[14px] text-gray-900 truncate">
            {chat.withUserName}
          </p>
          <span className="text-[10px] text-gray-500">
            {chat.lastMessageAt &&
              new Date(chat.lastMessageAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
          </span>
        </div>

        <p
          className={`text-xs truncate ${
            chat.unreadCount > 0 ? "text-[#2E3192] font-semibold" : "text-gray-500"
          }`}
        >
          {chat.lastMessage || chat.productTitle}
        </p>
      </div>

      {chat.unreadCount > 0 && (
        <span className="bg-[#2E3192] text-white rounded-full px-2 py-[2px] text-[10px] font-medium">
          {chat.unreadCount}
        </span>
      )}
    </div>
  );
};

export default ConversationItem;
