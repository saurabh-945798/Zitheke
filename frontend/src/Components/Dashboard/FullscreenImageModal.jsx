import React from "react";
import { X } from "lucide-react";

const FullscreenImageModal = ({ url, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white hover:text-red-400 transition"
      >
        <X size={28} />
      </button>

      {/* Image */}
      <img
        src={url}
        className="max-w-[90%] max-h-[85%] rounded-xl shadow-2xl animate-zoomIn"
        alt="fullscreen"
      />

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-zoomIn {
          animation: zoomIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FullscreenImageModal;
