import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import axios from "axios";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Textarea } from "../ui/textarea.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.jsx";
import { Badge } from "../ui/badge.jsx";
import { Separator } from "../ui/separator.jsx";

const HIDE_CONDITION_CATEGORIES = new Set(["Agriculture", "Jobs", "Services"]);

const MyAds = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = "/api";

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAd, setEditingAd] = useState(null);
  const [updatedForm, setUpdatedForm] = useState({});
  const [filter, setFilter] = useState("All");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalAds, setTotalAds] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const resolveImageSrc = (image) => {
    if (!image) return "/no-image.svg";

    // Cloudinary / remote URLs
    if (/^https?:\/\//i.test(image)) return image;

    // Local uploaded assets served by backend static middleware
    if (image.startsWith("/uploads/")) return image;
    if (image.startsWith("uploads/")) return `/${image}`;

    // Fallback for any relative path
    return image.startsWith("/") ? image : `/${image}`;
  };

  const fetchAds = async ({ nextPage = 1, append = false } = {}) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No JWT token found");
        setLoading(false);
        return;
      }

      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await axios.get(`${BASE_URL}/ads/user/${user.uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: nextPage,
          limit: 18,
          status: filter,
        },
      });

      const payload = res?.data;
      const nextAds = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.ads)
        ? payload.ads
        : [];

      const pagination = payload?.pagination || {};

      setAds((prev) => (append ? [...prev, ...nextAds] : nextAds));
      setPage(pagination?.page || nextPage);
      setHasMore(
        typeof pagination?.hasMore === "boolean"
          ? pagination.hasMore
          : false
      );
      if (typeof pagination?.total === "number") {
        setTotalAds(pagination.total);
      } else {
        setTotalAds((prev) => (append ? (Number(prev) || 0) + nextAds.length : nextAds.length));
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      if (!append) setAds([]);
      if (!append) setHasMore(false);
      if (!append) setTotalAds(0);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (user?.uid) fetchAds({ nextPage: 1, append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, filter]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete this ad?",
      text: "Once deleted, this cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3192",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/ads/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        setAds((prev) => prev.filter((ad) => ad._id !== id));
        Swal.fire("Deleted!", "Your ad has been removed.", "success");
      } catch {
        Swal.fire("Error", "Failed to delete ad", "error");
      }
    } 
  };

  const handleMarkSold = async (id) => {
    try {
      await axios.put(
        `${BASE_URL}/ads/${id}/sold`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
            setAds((prev) =>
        prev.map((ad) => (ad._id === id ? { ...ad, status: "Sold" } : ad))
      );
      Swal.fire("Done!", "Ad marked as sold.", "success");
    } catch {
      Swal.fire("Error", "Failed to mark as sold.", "error");
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setUpdatedForm({
      title: ad.title,
      description: ad.description,
      price: ad.price,
      condition: ad.condition,
      city: ad.city,
      location: ad.location,
      images: Array.isArray(ad.images) ? [...ad.images] : [],
    });
    setNewImageUrl("");
  };

  const handleUpdateAd = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await axios.put(
        `${BASE_URL}/ads/${editingAd._id}`,
        updatedForm,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
            setAds((prev) =>
        prev.map((ad) =>
          ad._id === editingAd._id ? { ...ad, ...updatedForm } : ad
        )
      );
      Swal.fire("Updated!", "Ad updated successfully.", "success");
      setEditingAd(null);
    } catch {
      Swal.fire("Error", "Update failed.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    setUpdatedForm({ ...updatedForm, [e.target.name]: e.target.value });
  };

  const addImageUrl = () => {
    const next = newImageUrl.trim();
    if (!next) return;
    const current = updatedForm.images || [];
    if (current.length >= 5) {
      Swal.fire("Limit reached", "You have already uploaded 5 images.", "warning");
      return;
    }
    if (!/^https?:\/\//i.test(next) && !next.startsWith("/")) {
      Swal.fire("Invalid URL", "Image URL must start with http(s):// or /", "info");
      return;
    }
    setUpdatedForm((prev) => ({ ...prev, images: [...(prev.images || []), next] }));
    setNewImageUrl("");
  };

  const removeImage = (index) => {
    setUpdatedForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const safeAds = Array.isArray(ads) ? ads : [];
  const filteredAds =
    filter === "All" ? safeAds : safeAds.filter((ad) => ad.status === filter);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-[#2E3192] text-lg font-semibold">
        <Loader2 className="animate-spin mr-2" /> Fetching your ads...
      </div>
    );

  const filters = ["All", "Approved", "Pending", "Rejected", "Sold"];

  return (
    <div className="flex h-screen overflow-hidden font-[Poppins] bg-gradient-to-br from-[#E9EDFF] via-[#F2F4FF] to-[#ffffff] text-gray-800 relative">
      {/* Background glow blobs */}
      <div className="absolute -top-20 right-[-8rem] w-96 h-96 bg-[#2E3192]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-6rem] left-[-5rem] w-72 h-72 bg-[#A3A8E8]/30 rounded-full blur-3xl"></div>

      {/* Sidebar */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-64 overflow-y-auto overflow-x-hidden no-scrollbar p-8 relative z-10">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-semibold bg-gradient-to-r from-[#2E3192] to-[#1F2370] bg-clip-text text-transparent"
            >
              Manage Your Ads !!
            </motion.h1>
            <p className="text-gray-500 text-sm mt-1">
              Keep track of your listings, edits, and performance insights.
            </p>
          </div>

          <Button
            onClick={() => navigate("/dashboard/createAd")}
            className="flex items-center gap-2 bg-gradient-to-r from-[#2E3192] to-[#1F2370] hover:scale-105 transition-transform text-white rounded-full px-5 py-2 shadow-md"
          >
            <PlusCircle size={18} /> Post New Ad
          </Button>
        </div>

        {/* FILTER BAR */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          {filters.map((status) => (
            <motion.button
              key={status}
              onClick={() => setFilter(status)}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all ${
                filter === status
                  ? "bg-[#2E3192] text-white shadow-md"
                  : "border-[#2E3192] text-[#2E3192] hover:bg-[#E9EDFF]"
              }`}
            >
              {status}
            </motion.button>
          ))}
        </motion.div>

        <Separator className="mb-6" />

        {/* EMPTY STATE */}
        {filteredAds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076509.png"
              alt="no ads"
              className="w-32 mb-5 opacity-80 drop-shadow-md"
            />
            <h2 className="text-xl font-semibold text-[#2E3192] mb-1">
              No {filter !== "All" ? filter : ""} Ads Found
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              Try posting new ads or selecting a different category.
            </p>
            <Button
              onClick={() => navigate("/dashboard/createAd")}
              className="bg-[#2E3192] hover:bg-[#1F2370] text-white rounded-full px-5 py-2"
            >
              <PlusCircle size={18} className="mr-1" /> Create Ad
            </Button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {filteredAds.map((ad) => (
              <motion.div
                key={ad._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="group overflow-hidden border border-white/50 shadow-md hover:shadow-2xl transition-all rounded-3xl bg-white/80 backdrop-blur-md">
                  <CardHeader className="relative p-0">
                    <img
                      src={resolveImageSrc(ad.images?.[0])}
                      alt={ad.title}
                      className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge
                      className={`absolute top-3 left-3 capitalize px-3 py-1 text-xs font-medium shadow-sm ${
                        ad.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : ad.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : ad.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : ad.status === "Sold"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {ad.status}
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-5">
                    <h3 className="text-lg font-semibold text-[#1F2370] mb-1 line-clamp-1">
                      {ad.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {ad.description}
                    </p>
                    {ad.price && (
                      <p className="text-[#2E3192] font-semibold text-lg mb-2">
                         MK {Number(ad.price).toLocaleString()}
                        {ad.negotiable && (
                          <span className="text-xs text-green-600 ml-1">
                            (Negotiable)
                          </span>
                        )}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 mb-3">
                      {ad.city && ad.location
                        ? `${ad.city}, ${ad.location}`
                        : ad.city || ad.location || ""}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye size={14} /> {ad.views || 0} views
                      </span>
                      <span className="capitalize">{ad.category}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center gap-2 px-5 pb-5 pt-0">
                    <Button
                      variant="outline"
                      className="text-xs rounded-full px-3 border-[#2E3192] text-[#2E3192] hover:bg-[#E9EDFF]"
                      onClick={() => handleEdit(ad)}
                    >
                      <Edit3 size={16} /> Edit
                    </Button>

                    <Button
                      variant="outline"
                      disabled={ad.status === "Sold"}
                      className={`text-xs rounded-full px-3 border-[#2E3192] text-[#2E3192] hover:bg-[#E9EDFF] ${
                        ad.status === "Sold" && "opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() => handleMarkSold(ad._id)}
                    >
                      <CheckCircle size={16} /> Sold
                    </Button>

                    <Button
                      variant="outline"
                      className="text-xs rounded-full px-3 border-red-500 text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(ad._id)}
                    >
                      <Trash2 size={16} /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && filteredAds.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-sm text-gray-500">
              Showing {filteredAds.length} of {totalAds || filteredAds.length} ads
            </p>
            {hasMore && (
              <Button
                type="button"
                onClick={() => fetchAds({ nextPage: page + 1, append: true })}
                disabled={loadingMore}
                className="bg-[#2E3192] hover:bg-[#1F2370] text-white rounded-full px-6 py-2"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            )}
          </div>
        )}

        {/* EDIT DIALOG */}
        <AnimatePresence>
          {editingAd && (
            <Dialog
              open={!!editingAd}
              onOpenChange={(open) => {
                if (!open) setEditingAd(null);
              }}
            >
              <DialogContent className="w-[95vw] max-w-5xl h-[88vh] max-h-[88vh] bg-white rounded-2xl shadow-xl border border-gray-100 p-0 overflow-hidden flex flex-col">
                <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
                  <DialogTitle className="text-[#2E3192] text-xl font-semibold">
                    Edit Ad Details
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateAd} className="flex flex-col flex-1 min-h-0">
                  <div className="px-5 py-4 flex-1 min-h-0 overflow-y-scroll overscroll-contain pr-3 [scrollbar-gutter:stable] [scrollbar-width:auto] [scrollbar-color:#6F7DE8_#E7EAFE] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-[#E7EAFE] [&::-webkit-scrollbar-thumb]:bg-[#6F7DE8] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-[#E7EAFE]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
                        <Input
                          name="title"
                          value={updatedForm.title || ""}
                          onChange={handleChange}
                          placeholder="Title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Price</label>
                        <Input
                          name="price"
                          type="number"
                          value={updatedForm.price || ""}
                          onChange={handleChange}
                          placeholder="Price"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                        <Textarea
                          name="description"
                          value={updatedForm.description || ""}
                          onChange={handleChange}
                          placeholder="Description"
                          rows="4"
                        />
                      </div>

                      {!HIDE_CONDITION_CATEGORIES.has(editingAd?.category || "") && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Condition</label>
                          <select
                            name="condition"
                            value={updatedForm.condition || "Used"}
                            onChange={handleChange}
                            className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                          >
                            <option value="New">New</option>
                            <option value="Used">Used</option>
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                        <Input
                          name="city"
                          value={updatedForm.city || ""}
                          onChange={handleChange}
                          placeholder="City"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                        <Input
                          name="location"
                          value={updatedForm.location || ""}
                          onChange={handleChange}
                          placeholder="Location"
                        />
                      </div>

                      <div className="md:col-span-2 rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-[#2E3192]">Images</p>
                          <p className="text-xs text-gray-500">{(updatedForm.images || []).length}/5</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 mb-3">
                          <Input
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="https://... or /uploads/..."
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addImageUrl}
                            disabled={(updatedForm.images || []).length >= 5}
                            className="sm:w-auto"
                          >
                            <ImagePlus size={16} className="mr-1" /> Add
                          </Button>
                        </div>

                        <div className="mb-3 flex gap-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory pb-2 [scrollbar-width:thin] [scrollbar-color:#9EA7F8_#EEF0FF] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#EEF0FF] [&::-webkit-scrollbar-thumb]:bg-[#9EA7F8] [&::-webkit-scrollbar-thumb]:rounded-full">
                          {(updatedForm.images || []).map((img, index) => (
                            <div
                              key={`${img}-${index}`}
                              className="relative shrink-0 snap-start min-w-[220px] h-40 rounded-xl overflow-hidden border bg-gray-50"
                            >
                              <img
                                src={resolveImageSrc(img)}
                                alt={`Ad ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/75 text-white rounded-full p-1.5"
                                aria-label={`Remove image ${index + 1}`}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sticky bottom-0 border-t bg-white p-4 flex flex-col sm:flex-row sm:justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingAd(null)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-gradient-to-r from-[#2E3192] to-[#1F2370] text-white font-semibold rounded-full hover:scale-[1.02] transition-transform"
                    >
                      {isSaving ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default MyAds;
