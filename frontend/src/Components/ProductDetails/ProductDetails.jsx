// src/pages/ProductDetails/ProductDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import axios from "axios"; // sirf public APIs ke liye
import { motion } from "framer-motion";
import { formatPrice } from "../../utils/formatPrice";
import CATEGORY_FIELDS from "../Dashboard/CategoryFields.js";

import {
  MapPin,
  Heart,
  Eye,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  MessageSquare,
  Gauge,
  Calendar,
  Tag,
  Home,
  Briefcase,
  Shirt,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

const normalizePhone = (number) => {
  if (number === null || number === undefined) return "";
  let cleaned = String(number).trim();
  if (!cleaned) return "";

  cleaned = cleaned
    .replace(/[\s\-()]/g, "")
    .replace(/^\+/, "")
    .replace(/^00/, "");

  if (!/^\d+$/.test(cleaned)) return "";
  if (cleaned.length < 8 || cleaned.length > 15) return "";
  return cleaned;
};

const buildWhatsappMessage = ({ title, price, link }) => {
  const lines = [
    "🟦 ZITHEKE Marketplace",
    "",
    "Hello 👋",
    "",
    "I’m interested in your listing on ZITHEKE:",
    "",
    title ? `📦 Product: ${title}` : "",
    price ? `💰 Price: MK ${price}` : "",
    "",
    link ? "🔗 View Ad:" : "",
    link || "",
    "",
    "Is this item still available?",
    "",
    "— Sent via ZITHEKE Marketplace",
  ].filter(Boolean);

  return lines.join("\n");
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const fromChat = searchParams.get("from") === "chat";
  const backConversationId = searchParams.get("conversationId");

  const BASE_URL = "/api";
  const [ad, setAd] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [activeMediaType, setActiveMediaType] = useState("image");
  const [isFav, setIsFav] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [fullImageIndex, setFullImageIndex] = useState(0);
  const [sellerStats, setSellerStats] = useState(null);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [callbackForm, setCallbackForm] = useState({
    name: "",
    phone: "",
    message: "Hi, I am interested. Please call me back.",
  });
  const [reportForm, setReportForm] = useState({
    reason: "",
    message: "",
    file: null,
  });

  const getPostedAgo = (createdAt) => {
    if (!createdAt) return "Recently added";

    const now = Date.now();
    const postedAt = new Date(createdAt).getTime();
    if (Number.isNaN(postedAt)) return "Recently added";

    const diffMs = Math.max(0, now - postedAt);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Posted just now";
    if (minutes < 60)
      return `Posted ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    if (hours < 24) return `Posted ${hours} hour${hours === 1 ? "" : "s"} ago`;
    return `Posted ${days} day${days === 1 ? "" : "s"} ago`;
  };

  // SAFE phone extraction

  /* Fetch Ad Details */
  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        const res = await axios.get(`${BASE_URL}/ads/${id}`);
        setAd(res.data);
        setActiveImage(
          res.data?.images?.length
            ? res.data.images[0].startsWith("http")
              ? res.data.images[0]
              : `${BASE_URL}${res.data.images[0]}`
            : "https://cdn-icons-png.flaticon.com/512/4076/4076500.png"
        );

        setActiveMediaType("image");
      } catch (error) {
        console.error("Error fetching ad details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [id, user]);

  /* 🧩 Fetch Seller Stats */
  useEffect(() => {
    if (!ad?.ownerUid) return;

    const fetchSellerStats = async () => {
      try {
        const res = await api.get(`/sellers/${ad.ownerUid}/stats`);
        setSellerStats(res.data || null);
      } catch (err) {
        console.error("Seller stats fetch error:", err);
        setSellerStats(null);
      }
    };

    fetchSellerStats();
  }, [ad?.ownerUid]);

  /* Increment View */
  useEffect(() => {
    const incrementView = async () => {
      if (!id) return;

      let guestId = localStorage.getItem("guest_id");
      if (!guestId) {
        guestId = "guest_" + Math.random().toString(36).substring(2, 10);
        localStorage.setItem("guest_id", guestId);
      }
      try {
        const res = await axios.put(`${BASE_URL}/ads/${id}/view`, {
          userId: user?.uid || null,
          guestId,
        });
        if (res.data.message === "View incremented") {
          setAd((prev) => ({ ...prev, views: (prev?.views || 0) + 1 }));
        }
      } catch (err) {
        console.error("View increment error:", err);
      }
    };
    incrementView();
  }, [id, user]);

  useEffect(() => {
    if (!ad?.category || !ad?._id) return;

    const fetchRelated = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/ads?category=${encodeURIComponent(
            ad.category
          )}&limit=8`
        );

        const json = await res.json();

        const ads = Array.isArray(json?.ads) ? json.ads : [];

        // ❗ SAME AD REMOVE
        const filtered = ads.filter((a) => a._id !== ad._id);

        setRelated(filtered);
      } catch (err) {
        console.error("Related ads error:", err);
        setRelated([]);
      }
    };

    fetchRelated();
  }, [ad?._id, ad?.category]);

  /* Favorites */
  const handleAddToFav = async () => {
    if (!user) {
      Swal.fire("Login required", "Please login to manage favorites", "info");
      return;
    }

    try {
      // ✅ PROTECTED API → api (interceptor)
      const res = await api.put("/favorites/toggle", {
        adId: ad._id,
      });

      setIsFav(res.data.status);

      Swal.fire({
        icon: res.data.status ? "success" : "info",
        title: res.data.status ? "Added to Favorites ❤️" : "Removed 💔",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error(
        "Favorite toggle error:",
        err?.response?.data || err.message
      );

      Swal.fire(
        "Error",
        err?.response?.data?.message || "Something went wrong",
        "error"
      );
    }
  };

  /* Start Chat */
  const handleStartChat = async () => {
    if (!user) {
      Swal.fire("Login required", "Please login to start chat", "info");
      return;
    }

    if (user.uid === ad?.ownerUid) {
      Swal.fire("You can't chat with yourself", "", "warning");
      return;
    }

    try {
      const res = await api.post("/messages", {
        senderId: user.uid,
        receiverId: ad.ownerUid,

        senderName: user.displayName || user.email.split("@")[0],
        senderEmail: user.email,
        senderPhoto: user.photoURL || null,

        receiverName: ad.ownerName,
        receiverPhoto: ad.ownerImage || null,

        adId: ad._id,
        productTitle: ad.title,
        productImage: ad.images?.[0] || "",

        message: "Hi, I’m interested in this ad.",
      });

      const convoId = res.data?.conversationId || res.data?._id;
      navigate(`/chats?conversationId=${convoId}&receiverId=${ad.ownerUid}`);
    } catch (error) {
      Swal.fire("Error", "Failed to start chat", "error");
    }
  };

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setReportForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReportFileChange = (e) => {
    setReportForm((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmitReport = async () => {
    if (!user) {
      Swal.fire("Login required", "Please login to report an ad", "info");
      return;
    }

    if (!reportForm.reason || !reportForm.message) {
      Swal.fire("Missing fields", "Please fill all details.", "warning");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Session expired", "Please login again.", "warning");
      navigate("/login");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("adId", ad._id);
      formData.append("adTitle", ad.title);
      formData.append("sellerId", ad.ownerUid);
      formData.append("reporterId", user.uid);
      formData.append("reporterName", user.displayName || user.email);
      formData.append("reason", reportForm.reason);
      formData.append("message", reportForm.message);
      if (reportForm.file) formData.append("file", reportForm.file);

      await axios.post(`${BASE_URL}/reports`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        icon: "success",
        title: "Report submitted",
        text: "Your complaint has been sent for review.",
        confirmButtonColor: "#008080",
      });

      setShowReportModal(false);
      setReportForm({ reason: "", message: "", file: null });
    } catch (err) {
      console.error("Error submitting report:", err);

      if (err.response?.status === 401) {
        Swal.fire("Session expired", "Please login again.", "warning");
        navigate("/login");
      } else {
        Swal.fire("Error", "Failed to submit report", "error");
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-[#2E3192] font-semibold text-xl animate-pulse">
        Loading product details...
      </div>
    );

  if (!ad)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Product not found.
      </div>
    );
  // ✅ COMBINED MEDIA LIST (IMAGES + VIDEO)
  const mediaList = [
    ...(ad?.images || []).map((img) => ({
      type: "image",
      src: img.startsWith("http") ? img : `${BASE_URL}${img}`,
    })),
    ...(ad?.video?.url
      ? [
          {
            type: "video",
            src: ad.video.url,
          },
        ]
      : []),
  ];

  const hidePriceAndDetails = ["Jobs", "Services"].includes(ad?.category);

  /* Category fields */
  const renderCategoryFields = () => {
    if (hidePriceAndDetails) return null;
    const agricultureFields = [
      { name: "seedType", label: "Crop Name" },
      { name: "variety", label: "Variety / Hybrid" },
      { name: "quantity", label: "Quantity" },
      { name: "fertilizerType", label: "Fertilizer Type" },
      { name: "weight", label: "Weight" },
      { name: "form", label: "Form" },
      { name: "pesticideType", label: "Pesticide Type" },
      { name: "targetCrop", label: "Target Crop" },
      { name: "toolName", label: "Tool Name" },
      { name: "powerType", label: "Power Type" },
    ];

    const fields =
      ad.category === "Agriculture"
        ? agricultureFields
        : CATEGORY_FIELDS[ad.category];
    if (!fields || fields.length === 0) return null;

    return (
      <div className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Additional Details
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-gray-700">
          {ad?.condition &&
            ad.condition !== "Not Applicable" &&
            ad.category !== "Agriculture" &&
            ad.category !== "Real Estate" && (
            <div className="flex items-center gap-2 bg-[#F9FAFB] border border-gray-200 rounded-xl p-3">
              {/* <Tag size={16} className="text-[#0E9F9F]" /> */}
              <span className="text-sm font-medium text-gray-800">
                Condition:{" "}
                <strong className="font-semibold">{ad.condition}</strong>
              </span>
            </div>
          )}
          {fields.map((field) => {
            if (
              field.name === "conditionNote" ||
              field.label === "Condition Details" ||
              field.placeholder === "Condition Details"
            ) {
              return null;
            }
            const value = ad[field.name];
            if (!value) return null;

            const Icon = field.icon;
            const displayValue =
              field.name === "quantity" && ad.quantityUnit
                ? `${value} ${ad.quantityUnit}`
                : value;

            return (
              <div
                key={field.name}
                className="flex items-center gap-2 bg-[#F9FAFB] border border-gray-200 rounded-xl p-3"
              >
                {Icon && <Icon size={16} className="text-[#2E3192]" />}

                <span className="text-sm font-medium text-gray-800">
                  {field.label || field.placeholder}:{" "}
                  <strong className="font-semibold">
                    {field.format === "price"
                      ? formatPrice(displayValue, "MK ")
                      : field.type === "date"
                      ? new Date(displayValue).toLocaleDateString()
                      : `${displayValue}${field.suffix || ""}`}
                  </strong>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const resolveSellerWhatsappRaw = (product) => {
    if (!product) return "";

    const directMatch =
      product?.seller?.whatsappNumber ||
      product?.user?.whatsappNumber ||
      product?.postedBy?.whatsappNumber ||
      product?.whatsappNumber ||
      product?.ownerWhatsapp ||
      product?.ownerPhone ||
      product?.owner?.phone ||
      product?.phone ||
      product?.contactNumber;

    if (directMatch) return directMatch;

    const whatsappSameAsPhone =
      product?.whatsappSameAsPhone === true ||
      product?.seller?.whatsappSameAsPhone === true ||
      product?.user?.whatsappSameAsPhone === true ||
      product?.postedBy?.whatsappSameAsPhone === true;

    if (!whatsappSameAsPhone) return "";
    return product?.seller?.phone || product?.phone || "";
  };

  const sellerWhatsappNumber = normalizePhone(resolveSellerWhatsappRaw(ad));
  const isWhatsappAvailable = Boolean(sellerWhatsappNumber);

  const openWhatsAppChat = () => {
    if (!isWhatsappAvailable) return;

    const priceText =
      ad?.price !== null && ad?.price !== undefined && ad?.price !== ""
        ? Number(ad.price).toLocaleString()
        : "";
    const productLink = typeof window !== "undefined" ? window.location.href : "";

    const message = buildWhatsappMessage({
      title: ad?.title || "",
      price: priceText,
      link: productLink,
    });

    const waUrl = `https://wa.me/${sellerWhatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-white to-[#EEF0FF] px-4 sm:px-10 pt-28 pb-32 font-[Poppins]">
      {/* 🔙 Back */}
      <motion.button
        onClick={() => {
          if (fromChat) {
            const target = backConversationId
              ? `/chats?conversationId=${backConversationId}`
              : "/chats";
            navigate(target);
            return;
          }
          navigate(-1);
        }}
        whileHover={{ x: -5 }}
        className="flex items-center text-[#2E3192] mb-8 font-medium hover:underline"
      >
        <ArrowLeft size={18} className="mr-2" />
        {fromChat ? "Back to chat" : "Back to Listings"}
      </motion.button>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* LEFT: Gallery */}
        {/* 🖼️ MAIN PRODUCT IMAGE + THUMBNAILS SECTION */}
        <div className="bg-white rounded-3xl shadow-md p-6">
          {/* MAIN BIG IMAGE */}
          <div className="relative w-full aspect-video sm:h-[480px] rounded-2xl overflow-hidden bg-black">
            {activeMediaType === "image" ? (
              <img
                src={activeImage}
                alt={ad.title}
                onClick={() => setShowFullImage(true)}
                className="w-full h-full object-cover cursor-pointer"
              />
            ) : (
              <video
                src={ad.video?.url}
                controls
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            )}
          </div>

          {/* THUMBNAILS */}
          <div className="flex gap-3 mt-5 overflow-x-auto scrollbar-hide">
            {/* 🎥 VIDEO THUMBNAIL */}
            {ad.video?.url && (
              <div
                onClick={() => {
                  setActiveMediaType("video");
                  setFullImageIndex(mediaList.length - 1);
                }}
                className="relative w-20 h-20 rounded-lg border cursor-pointer overflow-hidden"
              >
                <img
                  src={
                    ad.video.thumbnail ||
                    "https://cdn-icons-png.flaticon.com/512/1179/1179120.png"
                  }
                  alt="video-thumb"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-xl">▶</span>
                </div>
              </div>
            )}

            {ad.images?.length ? (
              ad.images.map((img, i) => {
                const src = img.startsWith("http") ? img : `${BASE_URL}${img}`;
                return (
                  <img
                    key={i}
                    src={src}
                    alt={`thumb-${i}`}
                    onClick={() => {
                      setActiveMediaType("image");
                      setActiveImage(src);
                      setFullImageIndex(i);
                      setShowFullImage(true);
                    }}
                    className={`w-20 h-20 rounded-lg border cursor-pointer object-cover transition ${
                      i === fullImageIndex
                        ? "border-[#2E3192] border-2"
                        : "border-gray-200 hover:border-[#2E3192]/50"
                    }`}
                  />
                );
              })
            ) : (
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076500.png"
                alt="default"
                className="w-20 h-20 rounded-lg border object-contain"
              />
            )}
          </div>
        </div>

        {/* FULLSCREEN IMAGE VIEWER (ADVANCED LIGHTBOX) */}
        {showFullImage && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowFullImage(false)} // close when clicking background
          >
            {/* LEFT ARROW */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullImageIndex((prev) =>
                  prev === 0 ? mediaList.length - 1 : prev - 1
                );
              }}
              className="absolute left-5 text-white text-4xl p-3 rounded-full bg-black/40 hover:bg-black/60 transition"
            >
              ❮
            </button>

            {/* FULL IMAGE */}
            {mediaList[fullImageIndex]?.type === "image" ? (
              <img
                src={mediaList[fullImageIndex].src}
                alt="Full View"
                className="max-w-[90%] max-h-[90%] rounded-2xl shadow-xl pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <video
                src={mediaList[fullImageIndex].src}
                controls
                autoPlay
                playsInline
                className="max-w-[90%] max-h-[90%] rounded-2xl bg-black pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* RIGHT ARROW */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullImageIndex((prev) =>
                  prev === mediaList.length - 1 ? 0 : prev + 1
                );
              }}
              className="absolute right-5 text-white text-4xl p-3 rounded-full bg-black/40 hover:bg-black/60 transition"
            >
              ❯
            </button>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-5 right-5 bg-white text-black p-2 rounded-full shadow-md hover:bg-gray-200 transition"
            >
              ✕
            </button>
          </div>
        )}

        {/* RIGHT: Info */}
        <div className="bg-white rounded-3xl shadow-md p-8">
          {/* 🏷️ Product Title & Price Section */}
          <div className="bg-gradient-to-br from-white via-[#FAFBFF] to-[#F2F4FF] rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] mb-6 transition-all duration-300 hover:shadow-[0_6px_25px_rgba(0,0,0,0.08)]">
            {/* Product Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                {ad.title || "Untitled Product"}
              </h1>

              {/* Optional Featured or Verified Badge */}
              {ad.isFeatured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold bg-[#2E3192]/10 text-[#2E3192] rounded-full shadow-sm">
                  ⭐ Featured
                </span>
              )}
              {ad.isVerified && !ad.isFeatured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold bg-green-50 text-green-700 border border-green-200 rounded-full shadow-sm">
                  ✅ Verified
                </span>
              )}
            </div>

            {/* Price Block */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              {!hidePriceAndDetails && (
                <p className="text-4xl font-extrabold text-[#2E3192] bg-[#2E3192]/5 px-4 py-2 rounded-2xl shadow-inner">
                  {formatPrice(ad.price, "MK ")}
                </p>
              )}

              {/* Optional Category Tag */}
              {ad.category && (
                <span className="text-sm text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full font-medium">
                  {ad.category}
                </span>
              )}
            </div>

            {/* Posted Date */}
            <div className="mt-3 text-gray-500 text-sm flex items-center gap-2">
              <Clock className="text-[#2E3192]" size={15} />
              {getPostedAgo(ad.createdAt)}
            </div>
          </div>

          {/* ❤️ Favorite Button Section */}
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -2 }}
              onClick={handleAddToFav}
              className={`relative px-6 py-2.5 rounded-full text-sm font-semibold border flex items-center gap-2 shadow-sm transition-all duration-300 ${
                isFav
                  ? "bg-gradient-to-r from-[#2E3192] to-[#2E3192] text-white border-[#2E3192] shadow-[0_4px_15px_rgba(14,159,159,0.3)]"
                  : "border-[#2E3192] text-[#2E3192] hover:bg-[#2E3192] hover:text-white hover:shadow-[0_4px_15px_rgba(14,159,159,0.25)]"
              }`}
            >
              {/* Animated Heart Icon */}
              <motion.div
                animate={
                  isFav ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}
                }
                transition={{ duration: 0.4 }}
              >
                <Heart
                  size={18}
                  fill={isFav ? "white" : "none"}
                  stroke={isFav ? "white" : "#2E3192"}
                />
              </motion.div>

              {isFav ? "Added to Favorites" : "Add to Favorites"}

              {/* Tooltip hint */}
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-300">
                {isFav ? "Remove from favorites" : "Save this ad"}
              </span>
            </motion.button>
          </div>

          {renderCategoryFields()}
          {/* 📝 Description Section */}
          <div className="mt-8 bg-gradient-to-br from-white via-[#FAFBFF] to-[#F4F6FF] border border-[#2E3192]/10 rounded-2xl shadow-[0_3px_10px_rgba(0,0,0,0.03)] p-6 transition-all duration-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-[#2E3192]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 6h13M8 12h13m-7 6h7M3 6h.01M3 12h.01M3 18h.01"
                />
              </svg>
              Description
            </h2>

            {(() => {
              const description =
                ad.description || "No description provided by seller.";
              const lines = description
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean);
              const isOrdered =
                lines.length > 1 &&
                lines.every((line) => /^\d+[\).]\s+/.test(line));
              const cleanedLines = isOrdered
                ? lines.map((line) => line.replace(/^\d+[\).]\s+/, ""))
                : lines;

              if (cleanedLines.length <= 1) {
                return (
                  <p className="text-gray-600 leading-relaxed text-[15px] border-l-4 border-[#2E3192]/20 pl-4">
                    {description}
                  </p>
                );
              }

              return isOrdered ? (
                <ol className="text-gray-600 leading-relaxed text-[15px] border-l-4 border-[#2E3192]/20 pl-6 list-decimal space-y-2">
                  {cleanedLines.map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ol>
              ) : (
                <ul className="text-gray-600 leading-relaxed text-[15px] border-l-4 border-[#2E3192]/20 pl-6 list-disc space-y-2">
                  {cleanedLines.map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              );
            })()}
          </div>

          {/* 📍 Product Meta Info */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-600 mt-6">
            <span className="flex items-center gap-1.5 hover:text-[#2E3192] transition-colors duration-200">
              <MapPin size={16} className="text-[#2E3192]" />
              {ad.city || "Unknown"}, {ad.location}
            </span>

            <span className="flex items-center gap-1.5 hover:text-[#2E3192] transition-colors duration-200">
              <Eye size={16} className="text-[#2E3192]" />
              {ad.views || 0} views
            </span>

            <span className="flex items-center gap-1.5 hover:text-[#2E3192] transition-colors duration-200">
              <Heart size={16} className="text-[#2E3192]" />
              {ad.favouritesCount || 0} favorites
            </span>
          </div>

          {/* 🧩 Seller Information Section */}
          {/* 🧩 Seller Information Section */}
          {/* 🧩 Seller Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-12 bg-gradient-to-br from-[#FAFBFF] via-[#F5F6FF] to-[#EEF0FF] 
  border border-[#2E3192]/20 rounded-3xl p-6 
  shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-[Poppins]"
          >
            {/* Header */}
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-6 text-xl">
              <ShieldCheck className="text-[#2E3192]" size={22} />
              Seller Information
            </h3>

            {/* Seller Details */}
            <div className="flex flex-col gap-6 p-4 bg-white rounded-xl shadow-sm">
              {/* TOP ROW */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                {/* LEFT SIDE */}
                <div
                  onClick={() => navigate(`/profile/${ad.ownerUid}`)}
                  className="flex items-center gap-4 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={
                        ad.ownerImage ||
                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      }
                      alt="seller"
                      className="w-16 h-16 rounded-full border-2 border-[#2E3192]/30 
            object-cover shadow-sm group-hover:scale-105 transition"
                    />
                    <span
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 
            bg-green-500 border-2 border-white rounded-full"
                    ></span>
                  </div>

                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-[#2E3192] transition">
                      {ad.ownerName || "Unknown Seller"}
                    </p>

                    {ad.ownerCity && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin size={14} className="text-[#2E3192]" />
                        {ad.ownerCity}
                      </p>
                    )}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={openWhatsAppChat}
                    disabled={!isWhatsappAvailable}
                    aria-label="Chat on WhatsApp"
                    className={`flex items-center justify-center gap-2 whitespace-nowrap py-2.5 px-4 rounded-xl font-medium shadow-sm transition ${
                      isWhatsappAvailable
                        ? "bg-[#25D366] text-white hover:bg-[#1DA851]"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <MessageCircle size={18} />
                   WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={handleStartChat}
                    className="flex items-center justify-center gap-2 whitespace-nowrap bg-[#2E3192] text-white py-2.5 px-4 rounded-xl font-medium hover:bg-[#1F2370] shadow-sm"
                  >
                    <MessageSquare size={18} />
                    Start Chat
                  </button>
                </div>
              </div>
              

              {/* SECONDARY CALLBACK LINK */}
              <div className="pt-2 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500 mb-1">
                  Need the seller to call you?
                </p>
                <button
                  onClick={() => {
                    if (!user) {
                      Swal.fire(
                        "Login required",
                        "Please login to request a call back",
                        "info"
                      );
                      return;
                    }

                    if (user.uid === ad.ownerUid) {
                      Swal.fire(
                        "Not allowed",
                        "You can't request a call back on your own ad",
                        "warning"
                      );
                      return;
                    }

                    setCallbackForm({
                      name: user.displayName || user.email.split("@")[0],
                      phone: user.phoneNumber || "",
                      message: "Hi, I am interested. Please call me back.",
                    });
                    setShowCallbackModal(true);
                  }}
                  className="text-sm font-medium text-[#2E3192] hover:underline"
                >
                  Request a call back →
                </button>
              </div>

              {/* 🔽 SELLER TRUST STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                {/* MEMBER SINCE */}
                <div className="flex items-center gap-3 bg-[#F1F3FF] p-4 rounded-xl">
                  <Calendar size={20} className="text-[#2E3192]" />
                  <div>
                    <p className="text-xs text-gray-500">Member since</p>
                    <p className="font-semibold text-gray-800">
                      {sellerStats
                        ? new Date(sellerStats.joinedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* TOTAL ADS */}
                <div className="flex items-center gap-3 bg-[#F1F3FF] p-4 rounded-xl">
                  <Layers size={20} className="text-[#2E3192]" />
                  <div>
                    <p className="text-xs text-gray-500">Total ads posted</p>
                    <p className="font-semibold text-gray-800">
                      {sellerStats?.totalAds ?? "—"} Ads
                    </p>

                    {sellerStats?.isTrustedSeller && (
                      <span className="inline-block mt-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        ✔ Trusted Seller
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* VERIFIED HINT */}
              {sellerStats?.totalAds >= 5 && (
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  ✅ Verified active seller
                </div>
              )}
            </div>
          </motion.div>

          {/* ⚠️ Report Ad Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -2 }}
            onClick={() => {
              if (!user) {
                Swal.fire(
                  "Login required",
                  "Please login to report an ad",
                  "info"
                );
                return;
              }
              setShowReportModal(true);
            }}
            className="relative flex items-center justify-center gap-2 w-full mt-8 py-3 rounded-xl text-[15px] font-semibold text-red-600 border border-red-400 bg-gradient-to-br from-[#FFF5F5] via-[#FFF9F9] to-[#FFEAEA] shadow-[0_4px_15px_rgba(255,0,0,0.1)] transition-all duration-300 hover:bg-gradient-to-r hover:from-[#FF4D4D] hover:to-[#E82E2E] hover:text-white hover:shadow-[0_8px_25px_rgba(255,77,77,0.3)]"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-lg"
            >
              🚫
            </motion.span>
            Report this Ad
          </motion.button>
        </div>
      </div>

      {/* Safety Tips */}
      {/* 🌟 Safety Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-gradient-to-br from-[#FFFFFF] via-[#FAFBFF] to-[#E9EDFF] rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 mt-20 overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#2E3192]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#2E3192]/10 rounded-full blur-3xl"></div>

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#2E3192]/10 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-[#2E3192]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 11c.656 0 1.186-.53 1.186-1.186V5.186C13.186 4.53 12.656 4 12 4s-1.186.53-1.186 1.186v4.628C10.814 10.47 11.344 11 12 11zM12 17.25a.938.938 0 100-1.875.938.938 0 000 1.875z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 21.75c5.108 0 9.25-4.142 9.25-9.25S17.108 3.25 12 3.25 2.75 7.392 2.75 12.5 6.892 21.75 12 21.75z"
              />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#2E3192]">
            Safety Tips for Buyers
          </h2>
        </div>

        {/* Tips List */}
        <ul className="relative z-10 space-y-3 text-gray-700 font-medium">
          {[
            "Meet the seller in a safe, public place.",
            "Inspect the item carefully before making any payment.",
            "Avoid sharing personal or banking details.",
            "Beware of unrealistic offers or deals that sound too good to be true.",
            "Communicate only through verified channels.",
          ].map((tip, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 bg-white/70 p-3 rounded-xl hover:bg-[#2E3192]/5 transition-all duration-200"
            >
              <div className="mt-1 flex-shrink-0 w-5 h-5 bg-[#2E3192] text-white flex items-center justify-center rounded-full text-sm font-bold shadow-sm">
                ✓
              </div>
              <span>{tip}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* 💫 Related Products Section */}
      {/* 💫 Related Products Section */}
      {/* 💫 Related Products Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mt-20 font-[Poppins]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-[#2E3192]">
            You may also like
          </h2>

          <button
            onClick={() =>
              ad?.category &&
              navigate(`/category/${encodeURIComponent(ad.category)}`)
            }
            className="text-[#2E3192] text-sm font-medium hover:underline"
          >
            View all →
          </button>
        </div>

        {related.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {related.map((item) => (
              <motion.div
                key={item._id}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                onClick={() => navigate(`/ad/${item._id}`)}
                className="relative bg-white rounded-3xl shadow hover:shadow-xl cursor-pointer overflow-hidden group"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={
                      item.images?.[0]
                        ? item.images[0].startsWith("http")
                          ? item.images[0]
                          : `${BASE_URL}${item.images[0].replace(/\\/g, "/")}`
                        : "https://cdn-icons-png.flaticon.com/512/4076/4076500.png"
                    }
                    alt={item.title}
                    className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="px-4 py-2 rounded-full bg-white/90 text-[#2E3192] text-sm font-semibold shadow-lg backdrop-blur-sm transform translate-y-3 group-hover:translate-y-0 group-hover:scale-105 transition-all duration-500">
                      View Details
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-lg font-semibold truncate">
                    {item.title}
                  </h3>

                  {/* 🔥 DESCRIPTION (NEW) */}
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.description || "No description available"}
                  </p>

                  {/* Price + City */}
                  <div className="flex justify-between items-center mt-3">
                    {!["Jobs", "Services"].includes(item.category) && (
                      <p className="text-[#2E3192] font-bold">
                        {formatPrice(item.price, "MK ")}
                      </p>
                    )}
                    <span className="text-sm text-gray-500">{item.city}</span>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-gray-400 mt-2">
                    {getPostedAgo(item.createdAt)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center text-sm">
            No related products found.
          </p>
        )}
      </motion.div>

      {showCallbackModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Request Call Back
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={callbackForm.name}
                onChange={(e) =>
                  setCallbackForm({ ...callbackForm, name: e.target.value })
                }
                className="w-full border rounded-xl px-4 py-2"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={callbackForm.phone}
                onChange={(e) =>
                  setCallbackForm({ ...callbackForm, phone: e.target.value })
                }
                className="w-full border rounded-xl px-4 py-2"
              />

              <textarea
                rows="3"
                value={callbackForm.message}
                onChange={(e) =>
                  setCallbackForm({ ...callbackForm, message: e.target.value })
                }
                className="w-full border rounded-xl px-4 py-2"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCallbackModal(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    const finalMessage = `📞 Request Call Back\n\nName: ${callbackForm.name}\nPhone: ${callbackForm.phone}\n\nMessage: ${callbackForm.message}`;
                    const res = await api.post("/messages", {
                      senderId: user.uid,
                      receiverId: ad.ownerUid,

                      // ✅ buyer
                      senderName: user.displayName || user.email.split("@")[0],
                      senderEmail: user.email,
                      senderPhoto: user.photoURL || null,

                      // ✅ seller
                      receiverName: ad.ownerName,
                      receiverPhoto: ad.ownerImage || null,

                      // ✅ AD CONTEXT (IMPORTANT)
                      adId: ad._id,
                      productTitle: ad.title,
                      productImage: ad.images?.[0] || "",

                      message: finalMessage,
                    });

                    const convoId = res.data?.conversationId || res.data?._id;

                    setShowCallbackModal(false);

                    navigate(
                      `/chats?conversationId=${convoId}&receiverId=${ad.ownerUid}`
                    );
                  } catch (err) {
                    Swal.fire("Error", "Failed to send request", "error");
                  }
                }}
                className="px-5 py-2 bg-[#2E3192] text-white rounded-lg hover:bg-[#1F2370]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#00BFA6]/10 text-[#006D77] rounded-xl">
                <FileText size={28} />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#006D77]">
                  Report this Ad
                </h2>
                <p className="text-sm text-gray-500">
                  Help us keep the community safe.
                </p>
              </div>
            </div>

            <div className="mb-6 bg-[#00BFA6]/5 border border-[#00BFA6]/10 rounded-lg p-3 text-gray-700 text-sm">
              <strong>Ad Title:</strong> {ad.title}
            </div>

            <div className="space-y-6">
              <select
                name="reason"
                value={reportForm.reason}
                onChange={handleReportChange}
                className="w-full border rounded-xl px-4 py-2"
              >
                <option value="">Select Reason</option>
                <option value="Offensive content">Offensive content</option>
                <option value="Fraud">Fraud</option>
                <option value="Duplicate ad">Duplicate ad</option>
                <option value="Product already sold">
                  Product already sold
                </option>
                <option value="Other">Other</option>
              </select>

              <textarea
                name="message"
                value={reportForm.message}
                onChange={handleReportChange}
                rows="5"
                className="w-full border rounded-xl px-4 py-2"
                placeholder="Explain your concern..."
              />

              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleReportFileChange}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitReport}
                className="px-5 py-2 bg-[#2E3192] text-white rounded-lg hover:bg-[#1F2370]"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductDetails;
