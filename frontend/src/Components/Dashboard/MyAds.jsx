import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import axios from "axios";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  Loader2,
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

const MyAds = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAd, setEditingAd] = useState(null);
  const [updatedForm, setUpdatedForm] = useState({});
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const token = localStorage.getItem("token");
    
        if (!token) {
          console.warn("No JWT token found");
          return;
        }
    
        const res = await axios.get(
          `${BASE_URL}/api/ads/user/${user.uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
    
        setAds(res.data || []);
      } catch (error) {
        console.error("Error fetching ads:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.uid) fetchAds();
  }, [user]);

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
        await axios.delete(`${BASE_URL}/api/ads/${id}`, {
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
        `${BASE_URL}/api/ads/${id}/sold`,
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
    });
  };

  const handleUpdateAd = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${BASE_URL}/api/ads/${editingAd._id}`,
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
    }
  };

  const handleChange = (e) => {
    setUpdatedForm({ ...updatedForm, [e.target.name]: e.target.value });
  };

  const filteredAds =
    filter === "All" ? ads : ads.filter((ad) => ad.status === filter);

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
              Manage Your Ads âœ¨
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
                      src={
                        ad.images?.[0]
                          ? ad.images[0].startsWith("http")
                            ? ad.images[0]
                            : `${BASE_URL}${ad.images[0]}`
                          : "https://via.placeholder.com/400x300?text=No+Image"
                      }
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

        {/* EDIT DIALOG */}
        <AnimatePresence>
          {editingAd && (
            <Dialog open={!!editingAd} onOpenChange={() => setEditingAd(null)}>
              <DialogContent className="max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                <DialogHeader>
                  <DialogTitle className="text-[#2E3192] text-xl font-semibold">
                    âœï¸ Edit Ad Details
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateAd} className="space-y-4 mt-3">
                  <Input
                    name="title"
                    value={updatedForm.title || ""}
                    onChange={handleChange}
                    placeholder="Title"
                  />
                  <Textarea
                    name="description"
                    value={updatedForm.description || ""}
                    onChange={handleChange}
                    placeholder="Description"
                    rows="3"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="price"
                      type="number"
                      value={updatedForm.price || ""}
                      onChange={handleChange}
                      placeholder="Price"
                    />
                    <Input
                      name="condition"
                      value={updatedForm.condition || "Used"}
                      onChange={handleChange}
                      placeholder="Condition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="city"
                      value={updatedForm.city || ""}
                      onChange={handleChange}
                      placeholder="City"
                    />
                    <Input
                      name="location"
                      value={updatedForm.location || ""}
                      onChange={handleChange}
                      placeholder="Location"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#2E3192] to-[#1F2370] text-white font-semibold rounded-full mt-3 hover:scale-[1.02] transition-transform"
                  >
                    Save Changes
                  </Button>
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
