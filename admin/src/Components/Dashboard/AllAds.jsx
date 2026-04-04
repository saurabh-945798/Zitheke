import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import adminApi from "../../api/adminApi.js";
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
  PencilLine,
  WandSparkles,
  Search,
  Save,
  ImagePlus,
  LayoutDashboard,
  Clock3,
  BadgeCheck,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation } from "swiper/modules";

const EMPTY_STATS = { total: 0, approved: 0, pending: 0, rejected: 0 };
const FALLBACK_MEDIA =
  "https://cdn-icons-png.flaticon.com/512/4076/4076500.png";
const CATEGORY_OPTIONS = {
  Vehicles: [
    "Cars",
    "Motorcycles",
    "Bikes",
    "Scooters",
    "Bicycles",
    "Electric Bikes",
    "Commercial Vehicles",
    "Spare Parts",
    "Vehicle Accessories",
  ],
  "Real Estate": [
    "For Sale: Houses & Apartments",
    "For Rent: Houses & Apartments",
    "Lands & Plots",
    "For Rent: Shops & Offices",
    "For Sale: Shops & Offices",
    "PG & Guest Houses",
  ],
  Mobiles: ["Mobile Phones", "Accessories", "Tablets"],
  Electronics: [
    "Computers & Laptops",
    "Computer Accessories",
    "Gaming Consoles & Accessories",
    "TVs & Home Entertainment",
    "Cameras & Lenses",
    "Smart Watches & Wearables",
    "Speakers & Headphones",
    "Kitchen Appliances",
    "Home Appliances",
    "Refrigerators",
    "Washing Machines",
    "ACs & Coolers",
    "Printers, Monitors & Hard Disks",
    "Smart Home Devices",
  ],
  Furniture: [
    "Beds",
    "Sofas",
    "Office Chairs",
    "Dining Tables",
    "Wardrobes",
    "Study Tables",
    "Office Tables",
    "TV Units",
    "Coffee Tables",
    "Storage Cabinets",
  ],
  Sports: [
    "Cricket Equipment",
    "Football Gear",
    "Badminton & Tennis",
    "Gym & Fitness Equipment",
    "Cycling",
    "Skating & Skateboards",
    "Swimming Gear",
    "Sportswear & Jerseys",
    "Yoga & Meditation Items",
    "Boxing & Martial Arts",
    "Camping & Trekking Gear",
    "Indoor Games (Chess, Carrom, etc.)",
  ],
  Fashion: [
    "Shirts",
    "Trouser",
    "Shorts",
    "Nightwear",
    "Shoes",
    "Undergarments",
    "Men",
    "Women",
    "Footwear",
    "Watches",
    "Bags",
    "Curtains",
    "Others",
  ],
  Stationary: ["Stationary"],
  Hardware: ["Other"],
  Music: [
    "Musical Instruments",
    "DJ Equipment",
    "Studio Equipment",
    "Sound Systems",
    "Microphones",
    "Keyboards & Pianos",
    "Guitars",
    "Drums & Percussion",
    "Amplifiers",
    "Accessories",
  ],
  "Kitchenware & Cookware": ["Kitchen utensils"],
  "Food & Beverages": [
    "Ice Cream",
    "Spices",
    "Fruits",
    "Vegetables",
    "Soft Drink",
    "Cakes",
  ],
  "Alcohol & Tobacco": ["Alcohol/Liquor"],
  "Hobbies & Entertainment": ["Music Instruments"],
  Services: [
    "Plumber",
    "Electrician",
    "Carpentry Services",
    "AC Repair & Services",
    "Refrigerator Repair",
    "Washing Machine Repair",
    "Painter",
    "Home Cleaning",
    "Pest Control",
    "Packers & Movers",
    "Driver Services",
    "Computer & Laptop Repair",
    "Mobile Repair",
    "Tutoring & Classes",
    "Fitness Trainer",
    "Beauty & Salon Services",
    "CCTV Installation & Repair",
    "Interior Design & Renovation",
    "Event & Wedding Services",
    "Travel & Tour Services",
  ],
  Jobs: [
    "Delivery Jobs",
    "Driver Jobs",
    "Data Entry Jobs",
    "Office Assistant",
    "Sales & Marketing",
    "Retail / Store Staff",
    "Hotel & Restaurant Jobs",
    "Cook / Chef",
    "Housekeeping",
    "Telecaller / BPO",
    "Teacher / Tutor",
    "Accountant",
  ],
  "Beauty & Personal Care": ["Makeup", "Skin Care", "Hair Care", "Fragrance", "Personal Care"],
  Agriculture: ["Seeds", "Fertilizers", "Pesticides", "Equipment", "Other Products"],
  Livestock: ["Chicken", "Goat", "Beef", "Fish", "Eggs", "Cows", "Pork Meat"],
};

const statusBadgeClass = (status) => {
  if (status === "Approved") return "bg-green-100 text-green-700";
  if (status === "Pending") return "bg-slate-900 text-white";
  return "bg-red-100 text-red-700";
};

const hidesConditionCategory = (category = "") =>
  ["Agriculture", "Jobs", "Services" , "Livestock" , "Alcohol"].includes(String(category || "").trim());

const isConditionOff = (condition = "") =>
  ["Not Applicable", "Condition Off"].includes(String(condition || "").trim());

const statusCardMeta = [
  {
    key: "total",
    label: "Total Ads",
    description: "All listings in the marketplace",
    icon: LayoutDashboard,
    tone: "bg-[#EEF1FF] text-[#2E3192]",
  },
  {
    key: "approved",
    label: "Approved",
    description: "Live listings already visible",
    icon: BadgeCheck,
    tone: "bg-green-100 text-green-700",
  },
  {
    key: "pending",
    label: "Pending",
    description: "Listings waiting for moderation",
    icon: Clock3,
    tone: "bg-slate-900 text-white",
  },
  {
    key: "rejected",
    label: "Rejected",
    description: "Listings blocked by admin review",
    icon: ShieldAlert,
    tone: "bg-red-100 text-red-700",
  },
];

const createEditForm = (ad) => ({
  title: ad?.title || "",
  description: ad?.description || "",
  category: ad?.category || "",
  subcategory: ad?.subcategory || "",
  condition: ad?.condition || "Not Applicable",
  price: ad?.price ?? "",
  city: ad?.city || "",
  location: ad?.location || "",
  state: ad?.state || "",
  ownerName: ad?.ownerName || "",
  ownerEmail: ad?.ownerEmail || "",
  ownerPhone: ad?.ownerPhone || "",
  status: ad?.status || "Pending",
  negotiable: Boolean(ad?.negotiable),
  deliveryAvailable: Boolean(ad?.deliveryAvailable),
  existingImages: Array.isArray(ad?.images) ? [...ad.images] : [],
  removedImages: [],
  newImages: [],
});

const AllAds = () => {
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState(null);
  const [editAd, setEditAd] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [optimizingCopy, setOptimizingCopy] = useState(false);
  const [modalSwiper, setModalSwiper] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  const timeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const posted = new Date(dateString);
    if (Number.isNaN(posted.getTime())) return "Just now";
    const diff = Math.max(0, Math.floor((Date.now() - posted.getTime()) / 1000));
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const fetchAds = async () => {
    try {
      const [adsRes, statsRes] = await Promise.all([
        adminApi.get("/ads"),
        adminApi.get("/ads/stats/summary"),
      ]);
      setAds(adsRes.data?.ads ?? []);
      setStats(statsRes.data?.stats ?? EMPTY_STATS);
    } catch (err) {
      console.error("❌ Error fetching ads:", err);
      Swal.fire("Error", "Failed to load ads", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const filteredAds = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return ads.filter((ad) => {
      const statusMatch = statusFilter === "all" || ad.status === statusFilter;
      const queryMatch =
        !normalized ||
        [ad.title, ad.category, ad.ownerName, ad.city, ad.location]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalized));
      return statusMatch && queryMatch;
    });
  }, [ads, query, statusFilter]);

  const handleApprove = async (id) => {
    const currentAd = ads.find((ad) => ad._id === id);
    if (currentAd?.status === "Approved") {
      Swal.fire("Already approved", "This ad is already approved.", "warning");
      return;
    }

    const res = await Swal.fire({
      title: "Approve this ad?",
      text: "Once approved, it becomes visible to all users.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
      confirmButtonColor: "#2ECC71",
    });
    if (!res.isConfirmed) return;
    await adminApi.patch(`/ads/${id}/approve`);
    setAds((prev) => prev.map((ad) => (ad._id === id ? { ...ad, status: "Approved" } : ad)));
    Swal.fire("Approved!", "The ad is now approved.", "success");
  };

  const handleReject = async (id) => {
    const res = await Swal.fire({
      title: "Reject ad?",
      input: "text",
      inputPlaceholder: "Enter rejection reason...",
      showCancelButton: true,
      confirmButtonText: "Reject",
      confirmButtonColor: "#F1C40F",
      inputValidator: (value) => !value && "Reason required!",
    });
    if (!res.isConfirmed) return;

    try {
      await adminApi.patch(`/ads/${id}/reject`, { reason: res.value });
      setAds((prev) =>
        prev.map((ad) =>
          ad._id === id ? { ...ad, status: "Rejected", reportReason: res.value } : ad
        )
      );
      Swal.fire("Rejected", "The ad was rejected.", "error");
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to reject ad",
        "error"
      );
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete ad?",
      text: "Please provide a reason for deletion.",
      icon: "warning",
      input: "text",
      inputPlaceholder: "Enter deletion reason...",
      showCancelButton: true,
      confirmButtonColor: "#E53935",
      confirmButtonText: "Delete",
      inputValidator: (value) => !value && "Reason required!",
    });
    if (!res.isConfirmed) return;

    try {
      await adminApi.delete(`/ads/${id}`, { data: { note: res.value } });
      setAds((prev) => prev.filter((ad) => ad._id !== id));
      setSelectedAd((prev) => (prev?._id === id ? null : prev));
      setEditAd((prev) => (prev?._id === id ? null : prev));
      Swal.fire("Deleted!", "Ad deleted successfully.", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to delete ad",
        "error"
      );
    }
  };

  const openEdit = (ad) => {
    setEditAd(ad);
    setEditForm(createEditForm(ad));
  };

  const closeEdit = () => {
    setEditAd(null);
    setEditForm(null);
  };

  const updateEditField = (event) => {
    const { name, value, type, checked, files } = event.target;
    setEditForm((prev) => {
      if (!prev) return prev;
      if (type === "file") {
        const incomingFiles = Array.from(files || []);
        const remainingSlots = Math.max(0, 5 - prev.existingImages.length - prev.newImages.length);
        if (incomingFiles.length > remainingSlots) {
          Swal.fire(
            "Image limit reached",
            `This ad can only keep 5 images in total. You can add ${remainingSlots} more.`,
            "warning"
          );
        }
        return {
          ...prev,
          newImages: [...prev.newImages, ...incomingFiles].slice(0, prev.newImages.length + remainingSlots),
        };
      }
      const nextValue = type === "checkbox" ? checked : value;
      const nextForm = {
        ...prev,
        [name]: nextValue,
        ...(name === "category" ? { subcategory: "" } : {}),
      };
      if (name === "category" && hidesConditionCategory(nextValue)) {
        nextForm.condition = "Not Applicable";
      }
      return nextForm;
    });
    if (type === "file") {
      event.target.value = "";
    }
  };

  const removeExistingImage = (imageUrl) => {
    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            existingImages: prev.existingImages.filter((img) => img !== imageUrl),
            removedImages: [...new Set([...prev.removedImages, imageUrl])],
          }
        : prev
    );
  };

  const removeNewImage = (index) => {
    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            newImages: prev.newImages.filter((_, currentIndex) => currentIndex !== index),
          }
        : prev
    );
  };

  const availableSubcategories = CATEGORY_OPTIONS[editForm?.category] || [];

  const enhanceEditCopy = async () => {
    if (!editForm) return;
    const title = String(editForm.title || "").trim();
    const description = String(editForm.description || "").trim();

    if (title.length < 3) {
      Swal.fire("Title required", "Please enter a stronger title first.", "warning");
      return;
    }

    if (description.length < 10) {
      Swal.fire(
        "Description required",
        "Please enter a more detailed description first.",
        "warning"
      );
      return;
    }

    setOptimizingCopy(true);
    try {
      const res = await adminApi.post("/ads/optimize-copy", {
        title,
        description,
        category: editForm.category || "",
      });
      const result = res.data?.result;
      if (!result?.title || !result?.description) {
        throw new Error("Incomplete optimizer response");
      }

      setEditForm((prev) =>
        prev
          ? {
              ...prev,
              title: result.title,
              description: result.description,
            }
          : prev
      );

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Ad copy enhanced",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (error) {
      Swal.fire(
        "Optimizer unavailable",
        error?.response?.data?.message || "Failed to enhance ad copy.",
        "error"
      );
    } finally {
      setOptimizingCopy(false);
    }
  };

  const cardImage = (ad) => ad.images?.[0] || FALLBACK_MEDIA;

  const saveEdit = async () => {
    if (!editAd || !editForm) return;
    if (!editForm.title.trim() || !editForm.description.trim()) {
      Swal.fire("Missing fields", "Title and description are required.", "warning");
      return;
    }
    if (editForm.existingImages.length + editForm.newImages.length === 0) {
      Swal.fire("Images required", "Keep at least one image.", "warning");
      return;
    }

    const formData = new FormData();
    [
      "title",
      "description",
      "category",
      "subcategory",
      "price",
      "city",
      "location",
      "state",
      "ownerName",
      "ownerEmail",
      "ownerPhone",
      "status",
    ].forEach((field) => formData.append(field, editForm[field] ?? ""));

    formData.append(
      "condition",
      hidesConditionCategory(editForm.category) ? "Not Applicable" : editForm.condition ?? ""
    );

    formData.append("negotiable", String(editForm.negotiable));
    formData.append("deliveryAvailable", String(editForm.deliveryAvailable));
    formData.append("existingImages", JSON.stringify(editForm.existingImages));
    formData.append("removedImages", JSON.stringify(editForm.removedImages));
    editForm.newImages.forEach((file) => formData.append("images", file));

    setSavingEdit(true);
    try {
      const res = await adminApi.put(`/ads/${editAd._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedAd = res.data?.ad;
      if (updatedAd) {
        setAds((prev) => prev.map((ad) => (ad._id === updatedAd._id ? updatedAd : ad)));
        setSelectedAd((prev) => (prev?._id === updatedAd._id ? updatedAd : prev));
      }
      closeEdit();
      Swal.fire("Saved", "Ad updated successfully.", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to update ad",
        "error"
      );
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl font-semibold text-[#1A1D64]">
        Loading ads...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(46,49,146,0.14),_transparent_34%),linear-gradient(180deg,#f8faff_0%,#eef2ff_100%)] p-5 font-[Poppins] md:p-7">
      <div className="mb-8 overflow-hidden rounded-[32px] border border-white/70 bg-gradient-to-r from-[#1A1D64] via-[#232780] to-[#2E3192] p-8 text-white shadow-[0_30px_80px_rgba(46,49,146,0.24)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">
              Admin Moderation
            </p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">
              Review, approve, and refine every marketplace ad from one clean control room.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/78 md:text-base">
              Search listings fast, review pending inventory, and open the full preview to edit user-submitted ads with complete admin control.
            </p>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur md:min-w-[320px]">
            <div className="flex items-center justify-between text-sm text-white/75">
              <span>Review Queue</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                {stats.pending} pending
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-white/65">Approved Today View</p>
                <p className="mt-2 text-2xl font-bold">{stats.approved}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-white/65">Rejected Items</p>
                <p className="mt-2 text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statusCardMeta.map((card) => {
          const Icon = card.icon;
          return (
          <motion.div
            key={card.key}
            whileHover={{ y: -4 }}
            className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-500">{card.label}</h3>
                <p className="mt-2 text-3xl font-bold text-[#1A1D64]">{stats[card.key]}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{card.description}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.tone}`}>
                <Icon size={22} />
              </div>
            </div>
          </motion.div>
        )})}
      </div>

      <div className="mb-6 rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF1FF] text-[#2E3192]">
                <SlidersHorizontal size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1A1D64]">Moderation Filters</h2>
                <p className="text-sm text-slate-500">Refine the queue and find ads fast.</p>
              </div>
            </div>
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, category, owner, location..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm outline-none focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "All Ads", count: stats.total },
              { key: "Approved", label: "Approved", count: stats.approved },
              { key: "Pending", label: "Pending", count: stats.pending },
              { key: "Rejected", label: "Rejected", count: stats.rejected },
            ].map((item) => {
              const active = statusFilter === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setStatusFilter(item.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-[#2E3192] bg-[#2E3192] text-white shadow-[0_10px_25px_rgba(46,49,146,0.22)]"
                      : "border-slate-200 bg-white text-[#1A1D64] hover:bg-[#EEF1FF]"
                  }`}
                >
                  {item.label} ({item.count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredAds.length === 0 ? (
          <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-14 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#1A1D64]">No ads match the current filters.</p>
            <p className="mt-2 text-sm text-slate-500">Try switching status tabs or broadening the search query.</p>
          </div>
        ) : (
          filteredAds.map((ad) => (
            <motion.div
              key={ad._id}
              layout
              whileHover={{ scale: 1.02 }}
              className={`overflow-hidden rounded-3xl border shadow-xl transition ${
                ad.status === "Pending"
                  ? "border-slate-300 bg-slate-50 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                  : "border-white bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
              }`}
            >
              <div className={`relative ${ad.status === "Pending" ? "grayscale" : ""}`}>
                <img
                  src={cardImage(ad)}
                  alt={ad.title}
                  className="h-60 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_MEDIA;
                  }}
                />
                <span
                  className={`absolute left-4 top-4 rounded-full px-4 py-1 text-sm font-medium shadow ${statusBadgeClass(
                    ad.status
                  )}`}
                >
                  {ad.status}
                </span>
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-[#1A1D64]">{ad.title}</h3>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      {ad.category || "General"}{ad.subcategory ? ` • ${ad.subcategory}` : ""}
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{ad.description}</p>

                <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-500">
                  <div className="flex min-w-0 items-center gap-2">
                    <MapPin size={16} />
                    <span className="truncate">
                      {[ad.city, ad.location].filter(Boolean).join(", ")}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#EEF1FF] px-3 py-1 text-xs font-semibold text-[#2E3192]">
                    {timeAgo(ad.createdAt)}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {!["Jobs", "Services"].includes(ad.category) && (
                    <p className="font-semibold text-[#1A1D64]">
                      MK {ad.price?.toLocaleString()}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1"><EyeIcon size={16} /> {ad.views || 0}</span>
                    <span className="inline-flex items-center gap-1"><Heart size={16} className="text-rose-500" /> {ad.favouritesCount || 0}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {ad.ownerName || "Unknown Seller"}
                  </span>
                  <span className="rounded-full bg-[#EEF1FF] px-3 py-1 text-xs font-semibold text-[#2E3192]">
                    {ad.currency || "MK"}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-4">
                  <button onClick={() => handleApprove(ad._id)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-100">
                    <CheckCircle size={18} /> Approve
                  </button>
                  <button onClick={() => handleReject(ad._id)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-700 hover:bg-yellow-100">
                    <XCircle size={18} /> Reject
                  </button>
                  <button onClick={() => setSelectedAd(ad)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#EEF1FF] px-4 py-3 text-sm font-semibold text-[#2E3192] hover:bg-[#E0E5FF]">
                    <Eye size={18} /> View
                  </button>
                  <button onClick={() => handleDelete(ad._id)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100">
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedAd && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative max-h-[90vh] w-[95%] overflow-y-auto rounded-[28px] bg-white shadow-2xl md:w-[82%] xl:w-[72%]">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-white/95 px-6 py-5 backdrop-blur">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Ad Preview</p>
                  <div className="mt-1 flex items-center gap-3">
                    <h2 className="truncate text-2xl font-bold text-[#1A1D64]">{selectedAd.title}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(selectedAd.status)}`}>
                      {selectedAd.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEdit(selectedAd)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#2E3192] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#242776]"
                  >
                    <PencilLine size={16} /> Edit Ad
                  </button>
                  <button onClick={() => setSelectedAd(null)} className="flex h-10 w-10 items-center justify-center rounded-full border text-slate-500 hover:bg-slate-50">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="relative overflow-hidden rounded-2xl border shadow-sm">
                  <Swiper slidesPerView={1} loop modules={[Navigation]} onSwiper={setModalSwiper}>
                    {selectedAd.images?.length ? selectedAd.images.map((img, index) => (
                      <SwiperSlide key={img}>
                        <img
                          src={img}
                          className="h-[480px] w-full cursor-zoom-in object-cover"
                          onClick={() => {
                            setFullscreenIndex(index);
                            setShowFullscreen(true);
                          }}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = FALLBACK_MEDIA;
                          }}
                          alt={selectedAd.title}
                        />
                      </SwiperSlide>
                    )) : (
                      <SwiperSlide>
                        <img src={FALLBACK_MEDIA} className="h-[480px] w-full object-contain bg-slate-100" alt="No media" />
                      </SwiperSlide>
                    )}
                    {selectedAd.video?.url && (
                      <SwiperSlide key="video">
                        <video src={selectedAd.video.url} controls className="h-[480px] w-full object-contain bg-black" />
                      </SwiperSlide>
                    )}
                  </Swiper>
                  <button onClick={() => modalSwiper?.slidePrev()} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-3 shadow-lg">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => modalSwiper?.slideNext()} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-3 shadow-lg">
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-[#1A1D64]">Ad Details</h3>
                    <p className="mt-4 text-sm text-slate-600">{selectedAd.description}</p>
                    <div className="mt-5 grid gap-3 text-sm">
                      <p><b>Category:</b> {selectedAd.category}</p>
                      <p><b>Subcategory:</b> {selectedAd.subcategory || "N/A"}</p>
                      {!hidesConditionCategory(selectedAd.category) &&
                        !isConditionOff(selectedAd.condition) && (
                        <p><b>Condition:</b> {selectedAd.condition || "N/A"}</p>
                      )}
                      <p><b>Price:</b> {selectedAd.currency} {selectedAd.price?.toLocaleString() || "0"}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-[#1A1D64]">Owner & Stats</h3>
                    <div className="mt-4 grid gap-3 text-sm">
                      <p><b>Name:</b> {selectedAd.ownerName || "N/A"}</p>
                      <p><b>Email:</b> {selectedAd.ownerEmail || "N/A"}</p>
                      <p><b>Phone:</b> {selectedAd.ownerPhone || "N/A"}</p>
                      <p><b>State:</b> {selectedAd.state || "N/A"}</p>
                      <p><b>Views:</b> {selectedAd.views || 0}</p>
                      <p><b>Favorites:</b> {selectedAd.favouritesCount || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {showFullscreen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={() => setShowFullscreen(false)}>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setFullscreenIndex((prev) => prev === 0 ? (selectedAd.images?.length || 1) - 1 : prev - 1);
                  }}
                  className="absolute left-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                >
                  <ChevronLeft size={28} />
                </button>
                <img
                  src={selectedAd.images?.[fullscreenIndex] || FALLBACK_MEDIA}
                  className="max-h-[92%] max-w-[92%] object-contain"
                  onClick={(event) => event.stopPropagation()}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_MEDIA;
                  }}
                  alt={selectedAd.title}
                />
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setFullscreenIndex((prev) => prev === (selectedAd.images?.length || 1) - 1 ? 0 : prev + 1);
                  }}
                  className="absolute right-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                >
                  <ChevronRight size={28} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editAd && editForm && (
          <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} className="flex h-[92vh] w-[96%] max-w-6xl flex-col overflow-hidden rounded-[30px] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b px-6 py-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Admin Edit Mode</p>
                  <h2 className="text-2xl font-bold text-[#1A1D64]">Edit Ad</h2>
                </div>
                <button onClick={closeEdit} className="flex h-10 w-10 items-center justify-center rounded-full border text-slate-500 hover:bg-slate-50">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="space-y-6">
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-[#1A1D64]">Basic Information</h3>
                        <button
                          type="button"
                          onClick={enhanceEditCopy}
                          disabled={optimizingCopy}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2E3192] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#242776] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {optimizingCopy ? (
                            <>Enhancing...</>
                          ) : (
                            <>
                              <WandSparkles size={16} /> Enhance with AI
                            </>
                          )}
                        </button>
                      </div>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <label className="md:col-span-2"><span className="mb-2 block text-sm text-slate-600">Title</span><input name="title" value={editForm.title} onChange={updateEditField} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10" /></label>
                        <label className="md:col-span-2"><span className="mb-2 block text-sm text-slate-600">Description</span><textarea name="description" rows="5" value={editForm.description} onChange={updateEditField} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10" /></label>
                        <label><span className="mb-2 block text-sm text-slate-600">Category</span><select name="category" value={editForm.category} onChange={updateEditField} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10"><option value="">Select category</option>{Object.keys(CATEGORY_OPTIONS).map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
                        <label><span className="mb-2 block text-sm text-slate-600">Subcategory</span><select name="subcategory" value={editForm.subcategory} onChange={updateEditField} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10" disabled={!editForm.category}><option value="">Select subcategory</option>{availableSubcategories.map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}</select></label>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5">
                      <h3 className="text-lg font-semibold text-[#1A1D64]">Pricing & Owner</h3>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <label><span className="mb-2 block text-sm text-slate-600">Price</span><input name="price" type="number" value={editForm.price} onChange={updateEditField} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10" /></label>
                        <label><span className="mb-2 block text-sm text-slate-600">Status</span><select name="status" value={editForm.status} onChange={updateEditField} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10"><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option><option value="Sold">Sold</option></select></label>
                        {!hidesConditionCategory(editForm.category) && (
                          <label><span className="mb-2 block text-sm text-slate-600">Condition</span><select name="condition" value={editForm.condition} onChange={updateEditField} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10"><option value="New">New</option><option value="Used">Used</option><option value="Not Applicable">Condition Off</option></select></label>
                        )}
                        <label><span className="mb-2 block text-sm text-slate-600">City</span><input name="city" value={editForm.city} onChange={updateEditField} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10" /></label>
                        <label><span className="mb-2 block text-sm text-slate-600">Location</span><input name="location" value={editForm.location} onChange={updateEditField} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10" /></label>
                        <label><span className="mb-2 block text-sm text-slate-600">State</span><input name="state" value={editForm.state} onChange={updateEditField} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10" /></label>
                        <label><span className="mb-2 block text-sm text-slate-600">Owner Name</span><input name="ownerName" value={editForm.ownerName} onChange={updateEditField} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10" /></label>
                        <label><span className="mb-2 block text-sm text-slate-600">Owner Email</span><input name="ownerEmail" value={editForm.ownerEmail} onChange={updateEditField} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10" /></label>
                        <label><span className="mb-2 block text-sm text-slate-600">Owner Phone</span><input name="ownerPhone" value={editForm.ownerPhone} onChange={updateEditField} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10" /></label>
                        <label className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-4 text-sm font-medium text-slate-700"><input name="negotiable" type="checkbox" checked={editForm.negotiable} onChange={updateEditField} className="h-4 w-4 rounded border-slate-300 text-[#2E3192] focus:ring-[#2E3192]" /> Negotiable</label>
                        <label className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-4 text-sm font-medium text-slate-700"><input name="deliveryAvailable" type="checkbox" checked={editForm.deliveryAvailable} onChange={updateEditField} className="h-4 w-4 rounded border-slate-300 text-[#2E3192] focus:ring-[#2E3192]" /> Delivery Available</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-[#1A1D64]">Images</h3>
                        <span className="rounded-full bg-[#EEF1FF] px-3 py-1 text-xs font-semibold text-[#2E3192]">{editForm.existingImages.length + editForm.newImages.length}/5</span>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {editForm.existingImages.map((imageUrl) => (
                          <div key={imageUrl} className="overflow-hidden rounded-2xl border bg-white">
                            <img src={imageUrl} alt="Existing ad" className="h-32 w-full object-cover" onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = FALLBACK_MEDIA;
                            }} />
                            <button onClick={() => removeExistingImage(imageUrl)} className="flex w-full items-center justify-center gap-2 border-t px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">
                              <Trash2 size={16} /> Remove
                            </button>
                          </div>
                        ))}

                        {editForm.newImages.map((file, index) => (
                          <div key={`${file.name}-${index}`} className="overflow-hidden rounded-2xl border bg-white">
                            <img src={URL.createObjectURL(file)} alt={file.name} className="h-32 w-full object-cover" />
                            <button onClick={() => removeNewImage(index)} className="flex w-full items-center justify-center gap-2 border-t px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">
                              <Trash2 size={16} /> Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#2E3192]/25 bg-white px-5 py-4 text-sm font-semibold text-[#2E3192] hover:bg-[#F7F8FF]">
                        <ImagePlus size={18} /> Add images
                        <input type="file" name="images" accept="image/*" multiple className="hidden" onChange={updateEditField} />
                      </label>
                      <p className="mt-3 text-xs text-slate-500">
                        Admin can remove current images and replace them with up to 5 images total.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#F7F8FF] p-5">
                      <p className="text-sm leading-6 text-slate-500">
                        Admin can directly update ad content, location, and image set. Keep at least one image on the ad.
                      </p>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <button onClick={closeEdit} className="rounded-2xl border bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                          Cancel
                        </button>
                        <button onClick={saveEdit} disabled={savingEdit} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2E3192] px-5 py-3 text-sm font-semibold text-white hover:bg-[#242776] disabled:opacity-70">
                          <Save size={16} /> {savingEdit ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllAds;
