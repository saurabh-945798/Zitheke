import React, { useEffect, useState } from "react";
import axios from "axios";
import { Heart, ChevronRight, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const FavoritesPreviewSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
    
        if (!token) {
          console.warn("No JWT token found");
          return;
        }
    
        const res = await axios.get(
          `${BASE_URL}/api/favorites/${user.uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
    
        setFavorites((res.data || []).slice(0, 4)); // preview limit
      } catch (err) {
        console.error("Favorites preview error:", err);
      } finally {
        setLoading(false);
      }
    };
    

    fetchFavorites();
  }, [user?.uid]);

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-xl p-6">
      {/* Teal glow */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#2E3192]/20 rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-[#1A1D64] flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#E9EDFF]">
            <Heart className="w-5 h-5 text-[#2E3192]" />
          </div>
          Favorites
        </h3>

        <button
          onClick={() => navigate("/dashboard/favorites")}
          className="text-sm font-medium text-[#2E3192] flex items-center gap-1 hover:underline"
        >
          View all <ChevronRight size={16} />
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-white/70 animate-pulse"
            />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {favorites.map((item) => (
            <motion.div
              key={item._id}
              whileHover={{ scale: 1.03, y: -2 }}
              onClick={() => navigate(`/ad/${item._id}`)}
              className="cursor-pointer rounded-2xl overflow-hidden border border-white/60 bg-white/70 hover:bg-white/90 shadow-sm hover:shadow-lg transition"
            >
              {/* Image */}
              <div className="relative h-24">
                <img
                  src={
                    item.images?.[0] ||
                    "https://res.cloudinary.com/demo/image/upload/sample.jpg"
                  }
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                {/* Favorite badge */}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-[#2E3192] text-white text-xs px-2 py-0.5">
                       ♥
                  </Badge>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-semibold truncate text-gray-800">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {item.category} â€¢ {item.city}
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2E3192]">
                    MK {item.price?.toLocaleString("en-MW")}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Eye size={12} />
                    {item.views || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Heart className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-600">
            No favorites yet
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Save ads to see them here
          </p>
        </div>
      )}
    </Card>
  );
};

export default FavoritesPreviewSection;
