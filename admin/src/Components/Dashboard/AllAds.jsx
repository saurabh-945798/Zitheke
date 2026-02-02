// ðŸ“ src/pages/AdminAds/AllAds.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import adminApi from "../../api/adminApi.js"; // path adjust karo
// âš ï¸ path wahi rakho jo Dashboard.jsx & Users.jsx me hai
import Swal from "sweetalert2";
import {
  CheckCircle,
  XCircle,
  Trash2,
  MapPin,
  Eye,
  Heart,
  EyeIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation } from "swiper/modules";

const AllAds = () => {
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState(null);
  const [modalSwiper, setModalSwiper] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  const timeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const posted = new Date(dateString);
    if (Number.isNaN(posted.getTime())) return "Just now";

    const now = new Date();
    let diff = Math.floor((now.getTime() - posted.getTime()) / 1000);
    if (diff < 0) diff = 0;

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  // =====================================================
  // FETCH ALL ADS + STATS
  // =====================================================
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const [adsRes, statsRes] = await Promise.all([
          adminApi.get("/ads"),
          adminApi.get("/ads/stats/summary"),
        ]);
  
        // âœ… ADS
        setAds(adsRes.data?.ads ?? []);
  
        // âœ… STATS (IMPORTANT FIX)
        setStats(
          statsRes.data?.stats ?? {
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
          }
        );
  
      } catch (err) {
        console.error("âŒ Error fetching ads:", err);
        Swal.fire("Error", "Failed to load ads", "error");
      } finally {
        setLoading(false);
      }
    };
  
    fetchAds();
  }, []);
  
  
  
  

  // =====================================================
  // APPROVE AD
  // =====================================================
  const handleApprove = async (id) => {
    const res = await Swal.fire({
      title: "Approve this Ad?",
      text: "Once approved, it becomes visible to all users.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
      confirmButtonColor: "#2ECC71",
    });

    if (res.isConfirmed) {
      await adminApi.patch(`/ads/${id}/approve`);
      setAds((prev) => prev.map((a) => (a._id === id ? { ...a, status: "Approved" } : a)));
      Swal.fire("Approved!", "The ad is now approved.", "success");
    }
  };

  // =====================================================
  // REJECT AD
  // =====================================================
  const handleReject = async (id) => {
    const res = await Swal.fire({
      title: "Reject Ad?",
      input: "text",
      inputPlaceholder: "Enter rejection reason...",
      showCancelButton: true,
      confirmButtonText: "Reject",
      confirmButtonColor: "#F1C40F",
      inputValidator: (v) => !v && "Reason required!",
    });
  
    if (!res.isConfirmed) return;
  
    try {
      // âœ… WAIT for backend
      await adminApi.patch(`/ads/${id}/reject`, {
        reason: res.value,
      });
  
      // âœ… Update UI after success
      setAds((prev) =>
        prev.map((ad) =>
          ad._id === id ? { ...ad, status: "Rejected" } : ad
        )
      );
  
      Swal.fire("Rejected", "The ad was rejected.", "error");
    } catch (error) {
      console.error("Reject Ad Error:", error);
  
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to reject ad",
        "error"
      );
    }
  };
  

  // =====================================================
  // DELETE AD
  // =====================================================
  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete Ad?",
      text: "Please provide a reason for deletion.",
      icon: "warning",
      input: "text",
      inputPlaceholder: "Enter deletion reason...",
      showCancelButton: true,
      confirmButtonColor: "#E53935",
      confirmButtonText: "Delete",
      inputValidator: (v) => !v && "Reason required!",
    });
  
    if (!res.isConfirmed) return;
  
    try {
      // âœ… WAIT for backend
      await adminApi.delete(`/ads/${id}`, {
        data: { note: res.value },
      });
  
      // âœ… Remove from UI after success
      setAds((prev) => prev.filter((ad) => ad._id !== id));
  
      Swal.fire("Deleted!", "Ad deleted successfully.", "success");
    } catch (error) {
      console.error("Delete Ad Error:", error);
  
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to delete ad",
        "error"
      );
    }
  };
  

  // =====================================================
  // LOADING SCREEN
  // =====================================================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-[#1A1D64] font-semibold">
        Loading ads...
      </div>
    );
  }

  const filteredAds = ads.filter((ad) => {
    if (statusFilter === "all") return true;
    return ad.status === statusFilter;
  });

  // =====================================================
  // FINAL UI
  // =====================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9EDFF] via-white to-[#F4F6FF] p-6 font-[Poppins]">

      {/* HEADER */}
      <div className="rounded-3xl bg-gradient-to-r from-[#2E3192] to-[#1A1D64] p-8 shadow-xl text-white mb-10">
        <h1 className="text-3xl font-bold">Ads Management Dashboard</h1>
        <p className="opacity-80 mt-1 text-sm">
          Review, approve, reject or delete ads posted by users.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        {[
          { label: "Total Ads", value: stats.total, color: "from-[#2E3192] to-[#1A1D64]" },
          { label: "Approved", value: stats.approved, color: "from-[#2E3192] to-[#1A1D64]" },
          { label: "Pending", value: stats.pending, color: "from-[#2E3192] to-[#1A1D64]" },
          { label: "Rejected", value: stats.rejected, color: "from-[#2E3192] to-[#1A1D64]" },
        ].map((card, i) => (
          <motion.div
            whileHover={{ scale: 1.05 }}
            key={i}
            className={`p-6 rounded-3xl text-white shadow-xl bg-gradient-to-br ${card.color}`}
          >
            <h3 className="text-sm opacity-90">{card.label}</h3>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* STATUS FILTERS */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {[
          { key: "all", label: "All Ads", count: stats.total },
          { key: "Approved", label: "Approved", count: stats.approved },
          { key: "Pending", label: "Pending", count: stats.pending },
          { key: "Rejected", label: "Rejected", count: stats.rejected },
        ].map((item) => {
          const isActive = statusFilter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#2E3192] text-white border-[#2E3192] shadow-md shadow-[#2E3192]/30"
                  : "bg-white text-[#1A1D64] border-[#2E3192]/20 hover:border-[#2E3192]/50 hover:bg-[#2E3192]/10"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`min-w-[28px] rounded-full px-2 py-0.5 text-xs font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[#2E3192]/10 text-[#2E3192]"
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TITLE */}
      <h2 className="text-2xl font-bold text-[#1A1D64] mb-6">
        {statusFilter === "all" ? "All Advertisements" : `${statusFilter} Ads`}
      </h2>

      {/* ADS GRID */}
      <AnimatePresence>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAds.length === 0 ? (
            <p className="text-center text-gray-600 col-span-full">No ads available.</p>
          ) : (
            filteredAds.map((ad) => (
              <motion.div
                key={ad._id}
                layout
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all"
              >
                {/* IMAGE */}
                <div className="relative">
                  <img
                    src={ad.images?.[0] || "https://cdn-icons-png.flaticon.com/512/4076/4076500.png"}
                    alt={ad.title}
                    className={`h-60 w-full object-cover transition ${
                      ad.status === "Pending" ? "opacity-70 grayscale" : ""
                    }`}
                  />
                  <span
                    className={`absolute top-4 left-4 px-4 py-1 rounded-full text-sm font-medium shadow ${
                      ad.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : ad.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {ad.status}
                  </span>
                </div>

                {/* DETAILS */}
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-[#1A1D64] truncate">{ad.title}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{ad.description}</p>

                  <div className="flex items-center justify-between gap-3 mt-3 text-gray-600 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={16} />
                      <span className="truncate">
                        {ad.city}, {ad.location}
                      </span>
                    </div>
                    <span className="text-xs bg-[#2E3192]/10 text-[#2E3192] px-2 py-0.5 rounded-full whitespace-nowrap">
                      {timeAgo(ad.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {!["Jobs", "Services"].includes(ad.category) && (
                      <p className="text-[#1A1D64] font-semibold">
                        MK {ad.price?.toLocaleString()}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                      <EyeIcon size={17} /> {ad.views || 0}
                      <Heart size={17} className="text-red-500" /> {ad.favouritesCount || 0}
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex justify-between mt-5 pt-4 border-t">
                    <button onClick={() => handleApprove(ad._id)} className="text-green-600 hover:text-green-800">
                      <CheckCircle size={24} />
                    </button>

                    <button onClick={() => handleReject(ad._id)} className="text-yellow-600 hover:text-yellow-800">
                      <XCircle size={24} />
                    </button>

                    <button onClick={() => handleDelete(ad._id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={24} />
                    </button>

                    <button onClick={() => setSelectedAd(ad)} className="text-blue-600 hover:text-blue-800">
                      <Eye size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>

      {/* =====================================================
          MODAL â€” AD DETAILS
      ===================================================== */}
      <AnimatePresence>
        {selectedAd && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-[28px] w-[95%] md:w-[85%] lg:w-[72%] max-h-[90vh] overflow-y-auto shadow-2xl relative border border-white/40"
            >
              {/* MODAL HEADER */}
              <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-6 md:px-8 py-5 flex items-center justify-between rounded-t-[28px]">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Ad Preview</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1A1D64] truncate">
                    {selectedAd.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedAd(null)}
                  className="h-10 w-10 rounded-full border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8">
                {/* IMAGE GALLERY */}
                <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <Swiper
                    slidesPerView={1}
                    loop
                    modules={[Navigation]}
                    onSwiper={setModalSwiper}
                    className="rounded-2xl"
                  >
                    {selectedAd.images?.length ? (
                      selectedAd.images.map((img, i) => (
                        <SwiperSlide key={`img-${i}`}>
                          <img
                            src={img}
                            className="w-full h-[520px] object-cover cursor-zoom-in"
                            onClick={() => {
                              setFullscreenIndex(i);
                              setShowFullscreen(true);
                            }}
                          />
                        </SwiperSlide>
                      ))
                    ) : (
                      <SwiperSlide>
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/4076/4076500.png"
                          className="w-full h-[520px] object-contain bg-gray-100"
                        />
                      </SwiperSlide>
                    )}
                    {selectedAd.video?.url && (
                      <SwiperSlide key="video">
                        <video
                          src={selectedAd.video.url}
                          controls
                          className="w-full h-[520px] object-contain bg-black"
                        />
                      </SwiperSlide>
                    )}
                  </Swiper>

                  {/* NAV ARROWS */}
                  <button
                    type="button"
                    onClick={() => modalSwiper?.slidePrev()}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white/95 border border-gray-200 shadow-lg flex items-center justify-center text-[#1A1D64] hover:bg-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => modalSwiper?.slideNext()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white/95 border border-gray-200 shadow-lg flex items-center justify-center text-[#1A1D64] hover:bg-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* DETAILS SECTION */}
                <div className="mt-6">
                  <p className="text-gray-700">{selectedAd.description}</p>

                  <div className="grid sm:grid-cols-2 gap-4 mt-6 text-sm">
                    <p><b>Category:</b> {selectedAd.category}</p>
                    {selectedAd.category !== "Agriculture" && (
                      <p><b>Condition:</b> {selectedAd.condition}</p>
                    )}
                    <p><b>Price:</b> {selectedAd.currency} {selectedAd.price?.toLocaleString()}</p>
                    <p><b>Location:</b> {selectedAd.city}, {selectedAd.location}</p>
                    {selectedAd.category === "Agriculture" && (
                      <>
                        <p><b>Quantity:</b> {selectedAd.quantity || "N/A"}</p>
                        <p><b>Unit:</b> {selectedAd.quantityUnit || "N/A"}</p>
                      </>
                    )}
                    <p>
                      <b>Status:</b>{" "}
                      <span
                        className={`font-semibold ${
                          selectedAd.status === "Approved"
                            ? "text-green-600"
                            : selectedAd.status === "Pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedAd.status}
                      </span>
                    </p>
                    {selectedAd.reportReason && (
                      <p><b>Rejection Reason:</b> {selectedAd.reportReason}</p>
                    )}
                  </div>
                </div>

                <hr className="my-6" />

                {/* OWNER INFO */}
                <h3 className="text-lg font-semibold text-[#1A1D64]">Owner Information</h3>
                <div className="grid sm:grid-cols-2 gap-3 mt-2 text-sm">
                  <p><b>Name:</b> {selectedAd.ownerName || "N/A"}</p>
                  <p><b>Email:</b> {selectedAd.ownerEmail || "N/A"}</p>
                  <p><b>Phone:</b> {selectedAd.ownerPhone || "N/A"}</p>
                </div>

                <hr className="my-6" />

                {/* STATS */}
                <div className="flex gap-8 text-gray-600 text-sm">
                  <p>Views: {selectedAd.views || 0}</p>
                  <p>Favorites: {selectedAd.favouritesCount || 0}</p>
                </div>
              </div>
            </motion.div>

            {showFullscreen && (
              <div
                className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
                onClick={() => setShowFullscreen(false)}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenIndex((prev) =>
                      prev === 0 ? (selectedAd.images?.length || 1) - 1 : prev - 1
                    );
                  }}
                  className="absolute left-5 text-white text-3xl p-3 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <ChevronLeft size={28} />
                </button>

                <img
                  src={selectedAd.images?.[fullscreenIndex]}
                  className="max-w-[92%] max-h-[92%] object-contain rounded-2xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenIndex((prev) =>
                      prev === (selectedAd.images?.length || 1) - 1 ? 0 : prev + 1
                    );
                  }}
                  className="absolute right-5 text-white text-3xl p-3 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <ChevronRight size={28} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullscreen(false);
                  }}
                  className="absolute top-5 right-5 text-white text-2xl p-2 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllAds;
