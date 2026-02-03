// src/pages/SellerProfile/SellerProfile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Layers,
  Calendar,
  ArrowLeft,
  Share2,
  ShieldCheck,
  Zap,
  BadgeCheck,
  MessageCircle,
  PhoneCall,
  Mail,
  Eye,
} from "lucide-react";

const SellerProfile = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const BASE_URL = "/api";

  const [seller, setSeller] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [contactOpen, setContactOpen] = useState(false);

  /* ----------------------------------
     Fetch Seller Ads + Seller Info
  ---------------------------------- */
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);

        // ✅ 1️⃣ Seller ads (NEW CONTROLLER)
        const adsRes = await axios.get(
          `${BASE_URL}/public/sellers/${sellerId}/ads`
        );

        const sellerAds = adsRes.data || [];
        setAds(sellerAds);

        // ❌ Agar seller ne koi ad post nahi ki
        if (sellerAds.length === 0) {
          setSeller(null);
          return;
        }

        // ✅ 2️⃣ Seller info first ad se
        const firstAd = sellerAds[0];

        setSeller({
          uid: sellerId,
          name: firstAd.ownerName,
          email: firstAd.ownerEmail,
          phone: firstAd.ownerPhone,
          image: firstAd.ownerImage,
          city: firstAd.city || firstAd.ownerCity,
          totalAds: sellerAds.length,
          joinedAt: new Date(firstAd.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),

          // Optional trust fields (if your backend ever adds them)
          verified:
            firstAd.ownerVerified ??
            firstAd.verifiedSeller ??
            firstAd.isVerified ??
            false,
          fastResponder:
            firstAd.ownerFastResponder ??
            firstAd.fastResponder ??
            firstAd.isFastResponder ??
            false,
          activeSeller:
            firstAd.ownerActiveSeller ??
            firstAd.activeSeller ??
            firstAd.isActiveSeller ??
            false,
        });
      } catch (err) {
        console.error("Seller profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId]);

  /* ----------------------------------
     Share Profile (Copy)
  ---------------------------------- */
  const handleCopyProfile = async () => {
    try {
      const profileUrl = `${window.location.origin}/profile/${sellerId}`;
      await navigator.clipboard.writeText(profileUrl);
      alert("Seller profile link copied to clipboard!");
    } catch (err) {
      alert("Failed to copy profile link");
    }
  };

  /* ----------------------------------
     Share Profile (WhatsApp)
  ---------------------------------- */
  const handleWhatsAppShare = () => {
    const profileUrl = `${window.location.origin}/profile/${sellerId}`;
    const message = `Check out this seller profile:\n${profileUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  /* ----------------------------------
     Derived UI helpers
  ---------------------------------- */
  const fallbackAvatar =
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  const trustBadges = useMemo(() => {
    if (!seller) return [];
    const badges = [];

    // If data exists, show it. If not, show light “best guess” fallback from activity.
    const inferredActive = ads.length >= 3; // tiny inference; remove if you don’t want assumptions

    if (seller.verified) {
      badges.push({
        key: "verified",
        label: "Verified",
        icon: BadgeCheck,
        tone: "text-[#1F2370] bg-[#2E3192]/10 border-[#2E3192]/20",
        dot: "bg-[#F9B233]", // tiny gold highlight
      });
    }

    if (seller.fastResponder) {
      badges.push({
        key: "fast",
        label: "Fast Responder",
        icon: Zap,
        tone: "text-[#1F2370] bg-[#2E3192]/10 border-[#2E3192]/20",
        dot: "bg-[#F9B233]",
      });
    }

    if (seller.activeSeller || inferredActive) {
      badges.push({
        key: "active",
        label: "Active Seller",
        icon: ShieldCheck,
        tone: "text-[#1F2370] bg-[#2E3192]/10 border-[#2E3192]/20",
        dot: "bg-[#F9B233]",
      });
    }

    return badges;
  }, [seller, ads.length]);

  /* ----------------------------------
     Skeletons
  ---------------------------------- */
  const ProfileSkeleton = () => {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24">
        <div className="h-10 w-32 rounded-xl bg-slate-200 animate-pulse mb-6" />

        {/* Hero skeleton */}
        <div className="relative rounded-3xl overflow-hidden border bg-white shadow-sm">
          <div className="h-44 sm:h-56 bg-slate-200 animate-pulse" />
          <div className="px-4 sm:px-6 pb-6">
            <div className="-mt-10 sm:-mt-14 flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-200 animate-pulse border" />
              <div className="flex-1">
                <div className="h-6 w-52 bg-slate-200 animate-pulse rounded-lg mb-2" />
                <div className="h-4 w-72 bg-slate-200 animate-pulse rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <div className="h-5 w-40 bg-slate-200 animate-pulse rounded-lg mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-200 animate-pulse rounded-lg" />
                <div className="h-4 w-5/6 bg-slate-200 animate-pulse rounded-lg" />
                <div className="h-4 w-2/3 bg-slate-200 animate-pulse rounded-lg" />
              </div>
              <div className="mt-6 flex gap-3">
                <div className="h-10 w-40 bg-slate-200 animate-pulse rounded-full" />
                <div className="h-10 w-40 bg-slate-200 animate-pulse rounded-full" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-24 bg-white border rounded-2xl shadow-sm">
                <div className="h-full w-full bg-slate-200 animate-pulse rounded-2xl" />
              </div>
              <div className="h-24 bg-white border rounded-2xl shadow-sm">
                <div className="h-full w-full bg-slate-200 animate-pulse rounded-2xl" />
              </div>
              <div className="h-24 bg-white border rounded-2xl shadow-sm">
                <div className="h-full w-full bg-slate-200 animate-pulse rounded-2xl" />
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <div className="h-6 w-60 bg-slate-200 animate-pulse rounded-lg mb-5" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-56 bg-slate-200 animate-pulse rounded-2xl"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* mobile sticky skeleton bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 border-t bg-white/85 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex gap-3">
            <div className="h-11 flex-1 bg-slate-200 animate-pulse rounded-2xl" />
            <div className="h-11 flex-1 bg-slate-200 animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    );
  };

  /* ----------------------------------
     UI States
  ---------------------------------- */
  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Seller not found
      </div>
    );
  }

  /* ----------------------------------
     UI
  ---------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F8FF] via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24">
        {/* 🔙 Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#2E3192] mb-6"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* ================= HERO HEADER ================= */}
        <div className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
          {/* soft blue gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2E3192]/15 via-white to-[#2E3192]/5" />
          {/* subtle pattern */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(46,49,146,1) 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />
          {/* glow blobs */}
          <div className="absolute -top-16 -left-16 w-72 h-72 bg-[#2E3192]/15 blur-3xl rounded-full" />
          <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-[#2E3192]/10 blur-3xl rounded-full" />

          <div className="relative px-4 sm:px-6 pt-7 sm:pt-10 pb-8">
            <div className="flex items-center justify-between gap-4">
              <div className="text-[#1F2370]">
                <p className="text-sm font-medium opacity-80">Seller Profile</p>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {seller.name}
                </h1>
                {seller.city ? (
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-[#1F2370]/80">
                    <MapPin size={16} className="text-[#2E3192]" />
                    {seller.city}
                  </p>
                ) : null}
              </div>

              {/* Floating glass card (avatar + name) */}
              <div className="hidden sm:block">
                <div className="rounded-2xl border border-white/40 bg-white/35 backdrop-blur-xl shadow-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={seller.image || fallbackAvatar}
                      alt="seller"
                      className="w-12 h-12 rounded-xl object-cover border border-white/50"
                    />
                    <div className="leading-tight">
                      <p className="font-semibold text-[#1F2370] line-clamp-1">
                        {seller.name}
                      </p>
                      <p className="text-xs text-[#1F2370]/70">
                        Zitheke Seller
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile glass card */}
            <div className="sm:hidden mt-5">
              <div className="rounded-2xl border border-white/40 bg-white/35 backdrop-blur-xl shadow-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={seller.image || fallbackAvatar}
                    alt="seller"
                    className="w-14 h-14 rounded-2xl object-cover border border-white/50"
                  />
                  <div className="leading-tight">
                    <p className="font-semibold text-[#1F2370] line-clamp-1">
                      {seller.name}
                    </p>
                    {seller.city ? (
                      <p className="mt-1 inline-flex items-center gap-2 text-xs text-[#1F2370]/70">
                        <MapPin size={14} className="text-[#2E3192]" />
                        {seller.city}
                      </p>
                    ) : (
                      <p className="text-xs text-[#1F2370]/70">Zitheke Seller</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* subtle divider */}
            <div className="mt-7 border-t border-[#2E3192]/10" />
          </div>
        </div>

        {/* ================= TWO COLUMN LAYOUT ================= */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: seller profile card */}
          <div className="lg:col-span-5">
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-[#1F2370]">
                  About Seller
                </h2>

                <div className="mt-5 flex items-center gap-4">
                  <img
                    src={seller.image || fallbackAvatar}
                    alt="seller"
                    className="w-16 h-16 rounded-2xl object-cover border"
                  />
                  <div className="min-w-0">
                    <p className="text-xl font-semibold text-gray-900 line-clamp-1">
                      {seller.name}
                    </p>
                    <p className="text-sm text-[#1F2370]/70">
                      Zitheke marketplace seller
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {seller.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 break-all">
                      <Mail size={16} className="text-[#2E3192]" />
                      {seller.email}
                    </div>
                  )}

                  {seller.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <PhoneCall size={16} className="text-[#2E3192]" />
                      {seller.phone}
                    </div>
                  )}

                  {seller.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin size={16} className="text-[#2E3192]" />
                      {seller.city}
                    </div>
                  )}
                </div>

                {/* Seller Trust */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-[#1F2370]">
                    Seller Trust
                  </h3>

                  {trustBadges.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-500">
                      No trust signals available yet.
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {trustBadges.map((b) => {
                        const Icon = b.icon;
                        return (
                          <span
                            key={b.key}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold ${b.tone}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${b.dot}`}
                            ></span>
                            <Icon size={14} className="text-[#2E3192]" />
                            {b.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Desktop actions */}
                <div className="mt-7 hidden lg:flex flex-wrap gap-3">
                  <button
                    onClick={handleCopyProfile}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-full 
                               border border-[#2E3192] text-[#2E3192]
                               hover:bg-[#2E3192] hover:text-white transition"
                  >
                    <Share2 size={16} />
                    Copy Profile Link
                  </button>

                  <button
                    onClick={handleWhatsAppShare}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-full 
                               bg-[#1F2370] text-white
                               hover:bg-[#2E3192] transition"
                  >
                    <MessageCircle size={16} />
                    Share on WhatsApp
                  </button>

                  <button
                    onClick={() => setContactOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-full 
                               bg-[#2E3192] text-white
                               hover:bg-[#1F2370] transition"
                  >
                    <PhoneCall size={16} />
                    Contact
                  </button>
                </div>
              </div>

              <div className="border-t bg-gradient-to-r from-[#2E3192]/5 via-white to-[#2E3192]/5 px-6 py-4">
                <p className="text-xs text-[#1F2370]/70">
                  Tip: Always meet in a safe public place and verify items
                  before payment.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: stats + listings */}
          <div className="lg:col-span-7 space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#2E3192]/10 flex items-center justify-center">
                    <Layers size={18} className="text-[#2E3192]" />
                  </span>
                  <div>
                    <p className="text-xs text-gray-500">Ads Posted</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {seller.totalAds}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#2E3192]/10 flex items-center justify-center">
                    <Calendar size={18} className="text-[#2E3192]" />
                  </span>
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {seller.joinedAt}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#2E3192]/10 flex items-center justify-center">
                    <MapPin size={18} className="text-[#2E3192]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {seller.city || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Listings */}
            <div className="bg-white border rounded-2xl shadow-sm p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#1F2370]">
                    Listings by Seller
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Browse all ads posted by {seller.name}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-[#1F2370]/70">
                  <span className="w-2 h-2 rounded-full bg-[#F9B233]"></span>
                  Gold is used as tiny highlight only
                </div>
              </div>

              <div className="mt-5 border-t border-[#2E3192]/10" />

              {ads.length === 0 ? (
                <p className="text-gray-500 mt-5">No ads posted yet.</p>
              ) : (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {ads.map((ad) => (
                    <div
                      key={ad._id}
                      onClick={() => navigate(`/ad/${ad._id}`)}
                      className="group cursor-pointer rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                    >
                      <div className="relative">
                        <img
                          src={ad.images?.[0] || fallbackAvatar}
                          alt={ad.title}
                          className="w-full h-44 object-cover"
                        />

                        {/* image overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-90" />

                        {/* View pill */}
                        <div className="absolute top-3 right-3">
                          <span
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
                                       bg-white/90 text-[#2E3192] text-xs font-semibold
                                       border border-white/60 backdrop-blur
                                       group-hover:bg-[#2E3192] group-hover:text-white transition"
                          >
                            <Eye size={14} />
                            View
                          </span>
                        </div>

                        {/* title on image */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-white font-semibold line-clamp-1">
                            {ad.title}
                          </p>
                          <p className="text-white/90 text-sm font-semibold mt-1">
                            MK {ad.price?.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-gray-700 line-clamp-1">
                            {ad.category || ad.mainCategory || "Listing"}
                          </p>
                          <span className="text-xs px-2 py-1 rounded-full bg-[#2E3192]/10 text-[#1F2370] border border-[#2E3192]/15">
                            Zitheke
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/ad/${ad._id}`);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl 
                                       bg-[#2E3192] text-white text-sm font-semibold
                                       hover:bg-[#1F2370] transition"
                          >
                            <Eye size={16} />
                            Open
                          </button>

                          <span className="text-xs text-gray-500">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F9B233] mr-2"></span>
                            Tap to view details
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column actions (desktop/tablet) */}
            <div className="hidden lg:block">
              <div className="bg-white border rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-[#1F2370]">
                  Actions
                </h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={handleCopyProfile}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-full 
                               border border-[#2E3192] text-[#2E3192]
                               hover:bg-[#2E3192] hover:text-white transition"
                  >
                    <Share2 size={16} />
                    Copy Profile Link
                  </button>

                  <button
                    onClick={handleWhatsAppShare}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-full 
                               bg-[#1F2370] text-white
                               hover:bg-[#2E3192] transition"
                  >
                    <MessageCircle size={16} />
                    WhatsApp Share
                  </button>

                  <button
                    onClick={() => setContactOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-full 
                               bg-[#2E3192] text-white
                               hover:bg-[#1F2370] transition"
                  >
                    <PhoneCall size={16} />
                    Contact Seller
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONTACT MODAL ================= */}
        {contactOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setContactOpen(false)}
            />
            <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl border shadow-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1F2370]">
                    Contact {seller.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose a contact method
                  </p>
                </div>
                <button
                  onClick={() => setContactOpen(false)}
                  className="text-gray-500 hover:text-[#2E3192] text-sm font-semibold"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                {seller.phone ? (
                  <a
                    href={`tel:${seller.phone}`}
                    className="flex items-center justify-between gap-3 p-4 rounded-2xl border hover:border-[#2E3192]/40 hover:bg-[#2E3192]/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-[#2E3192]/10 flex items-center justify-center">
                        <PhoneCall size={18} className="text-[#2E3192]" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Call
                        </p>
                        <p className="text-xs text-gray-500">{seller.phone}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#2E3192]">
                      Tap
                    </span>
                  </a>
                ) : null}

                {seller.email ? (
                  <a
                    href={`mailto:${seller.email}`}
                    className="flex items-center justify-between gap-3 p-4 rounded-2xl border hover:border-[#2E3192]/40 hover:bg-[#2E3192]/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-[#2E3192]/10 flex items-center justify-center">
                        <Mail size={18} className="text-[#2E3192]" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          Email
                        </p>
                        <p className="text-xs text-gray-500 break-all line-clamp-1">
                          {seller.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#2E3192]">
                      Tap
                    </span>
                  </a>
                ) : null}

                <button
                  onClick={() => {
                    handleWhatsAppShare();
                    setContactOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 p-4 rounded-2xl border hover:border-[#2E3192]/40 hover:bg-[#2E3192]/5 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#2E3192]/10 flex items-center justify-center">
                      <MessageCircle size={18} className="text-[#2E3192]" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        WhatsApp share
                      </p>
                      <p className="text-xs text-gray-500">
                        Share profile link
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#2E3192]">
                    Open
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MOBILE STICKY ACTION BAR ================= */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 border-t bg-white/85 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex gap-3">
            <button
              onClick={handleCopyProfile}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl
                         border border-[#2E3192] text-[#2E3192] font-semibold text-sm
                         hover:bg-[#2E3192] hover:text-white transition"
            >
              <Share2 size={18} />
              Share
            </button>

            <button
              onClick={() => setContactOpen(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl
                         bg-[#2E3192] text-white font-semibold text-sm
                         hover:bg-[#1F2370] transition"
            >
              <PhoneCall size={18} />
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
