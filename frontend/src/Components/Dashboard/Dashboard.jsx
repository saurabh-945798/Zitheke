import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Heart,
  FolderOpen,
  MessageSquare,
  PlusCircle,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  CalendarDays,
  Search,
  ChevronRight,
} from "lucide-react";

import { Card, CardHeader, CardContent, CardFooter } from "../ui/card.jsx";
import ChatPreviewSection from "./ChatPreviewSection.jsx";
import FavoritesPreviewSection from "./FavoritesPreviewSection.jsx";


import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.jsx";
import { Separator } from "../ui/separator.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";

  const [ads, setAds] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all | active | sold
  const [chats, setChats] = useState([]);

  
  useEffect(() => {
    if (!user?.uid) return;
  
    const fetchData = async () => {
      try {
        setLoading(true);

        const adsReq = api.get(`${BASE_URL}/api/ads/user/${user.uid}`);
        const favReq = api.get(`${BASE_URL}/api/favorites/${user.uid}`);
        const convoReq = api.get(`/api/conversations/preview/${user.uid}`);

        const [adsRes, favRes, convoRes] = await Promise.all([
          adsReq,
          favReq,
          convoReq,
        ]);

        setAds(adsRes.data || []);
        setFavorites(favRes.data || []);
        const unreadTotal = Array.isArray(convoRes.data)
          ? convoRes.data.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
          : 0;
        setUnreadMessagesCount(unreadTotal);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.uid]);
  
  

  const totalViews = useMemo(
    () => ads.reduce((acc, ad) => acc + (ad.views || 0), 0),
    [ads]
  );
  const totalFavorites = useMemo(() => favorites.length, [favorites]);
  const activeAdsCount = useMemo(
    () => ads.filter((ad) => (ad.status || "Active") !== "Sold").length,
    [ads]
  );

  // unread chat count (dynamic)
  const messagesCount = unreadMessagesCount;

  const stats = useMemo(
    () => [
      {
        title: "Active Ads",
        value: activeAdsCount,
        icon: <FolderOpen className="w-5 h-5" />,
        gradient: "from-[#2E3192] via-[#2E3192] to-[#1F2370]",
        sub: "Running listings",
      },
      {
        title: "Messages",
        value: messagesCount,
        icon: <MessageSquare className="w-5 h-5" />,
        gradient: "from-[#5B66D6] via-[#3B46B4] to-[#2A2F8A]",
        sub: "New chats",
      },
      {
        title: "Favorites",
        value: totalFavorites,
        icon: <Heart className="w-5 h-5" />,
        gradient: "from-[#2E3192] via-[#2E3192] to-[#1F2370]",
        sub: "Saved items",
      },
      {
        title: "Total Views",
        value: totalViews,
        icon: <Eye className="w-5 h-5" />,
        gradient: "from-[#2E3192] via-[#2E3192] to-[#1F2370]",
        sub: "Across your ads",
      },
    ],
    [activeAdsCount, messagesCount, totalFavorites, totalViews]
  );

  const recentAds = useMemo(() => {
    const list = [...ads].reverse();
    return list.slice(0, 4);
  }, [ads]);

  const filteredAds = useMemo(() => {
    let list = [...ads].reverse();

    if (activeTab === "active") {
      list = list.filter((a) => (a.status || "Active") !== "Sold");
    }
    if (activeTab === "sold") {
      list = list.filter((a) => (a.status || "Active") === "Sold");
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          (a.title || "").toLowerCase().includes(q) ||
          (a.description || "").toLowerCase().includes(q) ||
          (a.category || "").toLowerCase().includes(q) ||
          (a.city || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [ads, activeTab, query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6FF] flex items-center justify-center">
        <div className="relative w-full max-w-sm px-6">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-70">
            <div className="w-64 h-64 rounded-full bg-[#2E3192]/25 absolute -top-16 -left-10" />
            <div className="w-72 h-72 rounded-full bg-[#A3A8E8]/25 absolute -bottom-16 -right-10" />
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2E3192] to-[#1F2370] shadow-lg shadow-[#2E3192]/30" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Loading</p>
                <p className="text-base font-semibold text-[#1F2370]">
                  Your dashboard
                </p>
              </div>
            </div>
            <div className="mt-5 h-2 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full w-1/2 bg-gradient-to-r from-[#2E3192] to-[#1F2370]"
                initial={{ x: "-50%" }}
                animate={{ x: "150%" }}
                transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
              />
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Fetching ads, favorites, and insights...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const statusBadgeClass = (status) => {
    const s = status || "Active";
    if (s === "Sold") return "bg-gray-200 text-gray-700";
    return "bg-[#E9EDFF] text-[#1A1D64]";
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6FF] font-[Poppins] text-gray-800">
      {/* âœ… Sidebar */}
      {/* <Sidebar /> */}

      {/* Main */}
      <div className="flex-1 lg:ml-64 relative overflow-hidden">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-32 w-[520px] h-[520px] bg-[#2E3192]/18 rounded-full blur-3xl" />
          <div className="absolute bottom-[-140px] left-[-120px] w-[520px] h-[520px] bg-[#A3A8E8]/18 rounded-full blur-3xl" />
          <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[900px] h-[280px] bg-white/40 rounded-[60px] blur-2xl" />
        </div>

        {/* Top Bar */}
        <div className="sticky top-0 z-20">
          <div className="bg-white/65 backdrop-blur-xl border-b border-white/50">
            <div className="px-4 sm:px-6 md:px-8 py-5 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-[#E9EDFF] text-[#1F2370] border border-white/60">
                    <Sparkles className="w-4 h-4" />
                    Zitheke Dashboard
                  </div>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-[#1A1D64] tracking-tight">
                    Welcome, {user?.displayName || "User"}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Your insights and recent activity, all in one place.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 bg-white/70 backdrop-blur-md shadow-sm hover:shadow-md transition"
                    onClick={() => navigate("/dashboard/my-ads")}
                  >
                    <CalendarDays className="w-4 h-4 text-[#2E3192]" />
                    <span className="text-sm font-medium">Manage ads</span>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#2E3192] to-[#1F2370] text-white rounded-full px-5 py-2.5 shadow-lg shadow-[#2E3192]/25 hover:shadow-xl transition"
                    onClick={() => navigate("/dashboard/createAd")}
                  >
                    <PlusCircle size={18} />
                    Post new ad
                  </motion.button>
                </div>
              </div>

              {/* Search + Filters row */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by title, description, city, or category"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2E3192]/30"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    { key: "all", label: "All" },
                    { key: "active", label: "Active" },
                    { key: "sold", label: "Sold" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                        activeTab === t.key
                          ? "bg-[#2E3192] text-white border-[#2E3192] shadow-md shadow-[#2E3192]/20"
                          : "bg-white/60 text-gray-700 border-white/60 hover:bg-white/80"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 sm:px-6 md:px-8 py-8 space-y-10">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 220 }}
                className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/55 backdrop-blur-xl shadow-lg"
              >
                <div
                  className={`absolute inset-0 opacity-90 bg-gradient-to-br ${stat.gradient}`}
                />
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
                <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white/20 blur-2xl" />

                <div className="relative p-5 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm/5 opacity-85">{stat.title}</p>
                      <div className="mt-1 flex items-end gap-2">
                        <h2 className="text-3xl font-bold">{stat.value}</h2>
                        <span className="text-xs opacity-80 pb-1">
                          {stat.sub}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md">
                      {stat.icon}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs opacity-85">
                      Live stats
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/15 border border-white/20 px-3 py-1 rounded-full">
                      Insights <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Ads + Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Ads */}
            <Card className="xl:col-span-2 shadow-xl border border-white/50 bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden">
              <CardHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-[#1A1D64] flex items-center gap-2">
                      Your Recent Ads
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Quick access to your latest listings.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="border-[#2E3192] text-[#2E3192] rounded-full px-4 hover:bg-[#E9EDFF]"
                    onClick={() => navigate("/dashboard/my-ads")}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                {recentAds.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {recentAds.map((ad) => (
                      <motion.div
                        key={ad._id}
                        whileHover={{ y: -3 }}
                        transition={{ type: "spring", stiffness: 170 }}
                        className="group rounded-3xl overflow-hidden border border-white/50 bg-white/70 backdrop-blur-md shadow-sm hover:shadow-2xl transition-all"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <motion.img
                            whileHover={{ scale: 1.06 }}
                            transition={{ duration: 0.35 }}
                            src={
                              ad.images?.[0] ||
                              "https://res.cloudinary.com/demo/image/upload/sample.jpg"
                            }
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-90" />

                          <Badge
                            className={`absolute top-3 left-3 rounded-full px-3 py-1 ${statusBadgeClass(
                              ad.status
                            )}`}
                          >
                            {ad.status || "Active"}
                          </Badge>

                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                            <div className="min-w-0">
                              <h3 className="text-white font-semibold text-lg truncate">
                                {ad.title}
                              </h3>
                              <p className="text-white/80 text-xs truncate">
                                {ad.category || "Category"} •{" "}
                                {ad.city || "City"}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 text-white/90 text-xs bg-white/10 border border-white/15 px-2.5 py-1 rounded-full backdrop-blur">
                              <Eye size={14} />
                              {ad.views || 0}
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {ad.description || "No description provided"}
                          </p>

                          <div className="mt-4 flex items-center justify-between">
                            <Button
                              variant="outline"
                              className="text-xs rounded-full px-3 border-[#2E3192] text-[#2E3192] hover:bg-[#E9EDFF]"
                              onClick={() => setSelectedAd(ad)}
                            >
                              Quick View
                            </Button>

                            <Button
                              className="text-xs rounded-full px-3 bg-[#2E3192] hover:bg-[#1F2370] text-white"
                              onClick={() => navigate(`/ad/${ad._id}`)}
                            >
                              Open <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/4076/4076508.png"
                      className="w-20 mb-4 opacity-80"
                      alt="no ads"
                    />
                    <p className="text-gray-600 font-medium">
                      No ads yet
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Post your first ad to see it here.
                    </p>
                    <Button
                      className="mt-5 rounded-full bg-[#2E3192] hover:bg-[#1F2370] text-white"
                      onClick={() => navigate("/dashboard/createAd")}
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Post new ad
                    </Button>
                  </div>
                )}
              </CardContent>
              <ChatPreviewSection />
              

            </Card>

            

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="p-6 rounded-3xl bg-gradient-to-br from-[#2E3192] to-[#1F2370] text-white shadow-xl border border-white/20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Quick Actions <TrendingUp size={18} />
                  </h3>
                  <Separator className="bg-white/40 w-24 h-[2px]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/dashboard/createAd")}
                    className="bg-white text-[#2E3192] rounded-2xl shadow-md px-5 py-3 font-semibold hover:bg-[#E9EDFF] flex items-center justify-between"
                  >
                    Post Ad
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/dashboard/my-ads")}
                    className="bg-white text-[#2E3192] rounded-2xl shadow-md px-5 py-3 font-semibold hover:bg-[#E9EDFF] flex items-center justify-between"
                  >
                    Manage ads
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/dashboard/favorites")}
                    className="bg-white text-[#2E3192] rounded-2xl shadow-md px-5 py-3 font-semibold hover:bg-[#E9EDFF] flex items-center justify-between"
                  >
                    Favorites
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </Card>
              {/* ðŸ”¹ Chat Preview Section */}


              {/* Compact â€œAll Adsâ€ Preview (advanced) */}
              <Card className="rounded-3xl shadow-xl border border-white/50 bg-white/60 backdrop-blur-xl overflow-hidden">
                <CardHeader className="px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1A1D64]">
                        Your Ads
                      </h3>
                      <p className="text-sm text-gray-600">
                      Showing:{" "}
                        <span className="font-medium">
                          {activeTab.toUpperCase()}
                        </span>
                        {query ? ` • "${query}"` : ""}
                      </p>
                    </div>
                    <Badge className="rounded-full bg-[#E9EDFF] text-[#1A1D64] px-3 py-1">
                      {filteredAds.length} items
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-6">
                  {filteredAds.length > 0 ? (
                    <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                      {filteredAds.slice(0, 6).map((ad) => (
                        <button
                          key={ad._id}
                          onClick={() => setSelectedAd(ad)}
                          className="w-full text-left group rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md hover:bg-white/90 transition shadow-sm hover:shadow-md p-3 flex items-center gap-3"
                        >
                          <img
                            src={
                              ad.images?.[0] ||
                              "https://res.cloudinary.com/demo/image/upload/sample.jpg"
                            }
                            alt={ad.title}
                            className="w-12 h-12 rounded-xl object-cover border border-white/70"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {ad.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {ad.category || "Category"} • {ad.city || "City"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              className={`rounded-full px-3 py-1 ${statusBadgeClass(
                                ad.status
                              )}`}
                            >
                              {ad.status || "Active"}
                            </Badge>
                            <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-[#2E3192]" />
                              {ad.views || 0}
                            </span>
                          </div>
                        </button>
                      ))}

                      {filteredAds.length > 6 && (
                        <Button
                          variant="outline"
                          className="w-full rounded-2xl border-[#2E3192] text-[#2E3192] hover:bg-[#E9EDFF]"
                          onClick={() => navigate("/dashboard/my-ads")}
                        >
                          View All Ads
                          <ArrowUpRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-gray-600 font-medium">
                        No ads match your filters
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Try changing tab or search query.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 rounded-full border-[#2E3192] text-[#2E3192] hover:bg-[#E9EDFF]"
                        onClick={() => {
                          setQuery("");
                          setActiveTab("all");
                        }}
                      >
                        Reset Filters
                      </Button>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="px-6 pb-6 pt-0">
                  <div className="w-full flex items-center justify-between text-xs text-gray-500">
                    <span>Tip: Click any item to open Quick View</span>
                    <span className="inline-flex items-center gap-1">
                      Powered by Zitheke UI
                      <Sparkles className="w-3.5 h-3.5 text-[#2E3192]" />
                    </span>
                  </div>
                </CardFooter>
              </Card>
              <FavoritesPreviewSection />

            </div>
          </div>
        </div>

        {/* Quick View Modal (same feature, upgraded UI) */}
        <AnimatePresence>
          {selectedAd && (
            <Dialog open={!!selectedAd} onOpenChange={() => setSelectedAd(null)}>
              <DialogContent className="max-w-2xl bg-white rounded-3xl shadow-2xl p-0 overflow-hidden border border-white/50">
                <DialogHeader className="px-6 pt-6 pb-3">
                  <DialogTitle className="text-[#1A1D64] font-semibold flex items-center justify-between gap-3">
                    <span className="truncate">{selectedAd.title}</span>
                    <Badge
                      className={`rounded-full px-3 py-1 ${statusBadgeClass(
                        selectedAd.status
                      )}`}
                    >
                      {selectedAd.status || "Active"}
                    </Badge>
                  </DialogTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedAd.category || "Category"} •{" "}
                    {selectedAd.city || "City"}
                  </p>
                </DialogHeader>

                <div className="relative">
                  <img
                    src={
                      selectedAd.images?.[0] ||
                      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
                    }
                    alt={selectedAd.title}
                    className="w-full h-72 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 backdrop-blur px-3 py-1.5 rounded-full text-white text-xs">
                      <Eye className="w-4 h-4" />
                      {selectedAd.views || 0} views
                    </div>

                    <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 backdrop-blur px-3 py-1.5 rounded-full text-white text-xs">
                      <Heart className="w-4 h-4" />
                      Favorites: {selectedAd.favouritesCount || 0}
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {selectedAd.description || "No description provided"}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      className="w-full bg-[#2E3192] hover:bg-[#1F2370] text-white rounded-2xl"
                      onClick={() => navigate(`/ad/${selectedAd._id}`)}
                    >
                      View Full Ad <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full rounded-2xl border-[#2E3192] text-[#2E3192] hover:bg-[#E9EDFF]"
                      onClick={() => {
                        setSelectedAd(null);
                        navigate("/dashboard/my-ads");
                      }}
                    >
                      Go to manage ads
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
