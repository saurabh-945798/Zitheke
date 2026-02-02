import React from "react";
import "./typing.css"; // ❗IMPORTANT — CSS IMPORT

const TypingDots = () => {
    return (
      <div className="flex items-center gap-1 ml-3 translate-y-[-3px]">
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
      </div>
    );
  };
  

export default TypingDots;
