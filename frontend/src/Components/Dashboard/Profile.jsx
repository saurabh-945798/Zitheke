// src/pages/Dashboard/Profile.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase.js";
import axios from "axios";
import { User, Mail, Edit2, Phone, MapPin, Save, X } from "lucide-react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

// ShadCN UI components
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Separator } from "../ui/separator.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.jsx";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPhotoConfirm, setShowPhotoConfirm] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState("");
  const [pendingPhotoData, setPendingPhotoData] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(
    localStorage.getItem("profilePhoto") || user?.photoURL || ""
  );
  const BASE_URL = "/api";
  const [mergeNotice, setMergeNotice] = useState(
    localStorage.getItem("mergeNotice") || ""
  );
  const [form, setForm] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    location: "",
  });

  /* âœ… Fetch Profile */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `/api/users/${user.uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (res.data) {
          setForm({
            name: res.data.name,
            email: res.data.email,
            phone: res.data.phone || "",
            location: res.data.location || "",
          });
        }
      } catch (error) {
        console.log("â„¹ï¸ No profile found. Creating one...");
        const token = localStorage.getItem("token");

await axios.post(
  "/api/users/register",
  {
    uid: user.uid,
    name: user.displayName || user.email.split("@")[0],
    email: user.email,
    photoURL: user.photoURL,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPendingPhoto(previewUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingPhotoData(reader.result || "");
      setShowPhotoConfirm(true);
    };
    reader.readAsDataURL(file);
  };

  const confirmPhoto = async () => {
    if (!pendingPhotoData || !user?.uid) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${BASE_URL}/users/${user.uid}`,
        { photoData: pendingPhotoData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedPhoto = res.data?.user?.photoURL || pendingPhoto;
      setProfilePhoto(updatedPhoto);
      localStorage.setItem("profilePhoto", updatedPhoto);

      const authUserRaw = localStorage.getItem("authUser");
      if (authUserRaw) {
        const authUser = JSON.parse(authUserRaw);
        authUser.photoURL = updatedPhoto;
        localStorage.setItem("authUser", JSON.stringify(authUser));
      }
    } catch (err) {
      Swal.fire({
        title: "Upload failed",
        text: err.response?.data?.message || err.message,
        icon: "error",
        confirmButtonColor: "#2E3192",
      });
    } finally {
      setPendingPhoto("");
      setPendingPhotoData("");
      setShowPhotoConfirm(false);
    }
  };

  const cancelPhoto = () => {
    setPendingPhoto("");
    setPendingPhotoData("");
    setShowPhotoConfirm(false);
  };


  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

/* âœ… Save Changes */
const handleSave = async () => {
  try {
    // ðŸ” JWT token
    const token = localStorage.getItem("token");

    // 1ï¸âƒ£ Update Firebase display name only if Firebase session exists
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: form.name,
      });
    }

    // 2ï¸âƒ£ Update backend profile (JWT protected)
    await axios.put(
      `/api/users/${user.uid}`,
      {
        name: form.name,
        phone: form.phone,
        location: form.location,
        photoURL: user.photoURL,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // âœ… Success popup
    Swal.fire({
      title: "Profile Updated âœ…",
      text: "Your profile has been saved successfully!",
      icon: "success",
      timer: 1800,
      showConfirmButton: false,
      background: "#F8FAFC",
    });

    setIsEditing(false);
    setShowConfirm(false);
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: error.response?.data?.message || error.message,
      icon: "error",
      confirmButtonColor: "#2E3192",
    });
  }
};


  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-[#2E3192] text-xl font-semibold">
        Loading your profile...
      </div>
    );

  const joinedDate = new Date(
    user?.metadata?.creationTime || Date.now()
  ).toLocaleDateString();

  return (
    <div className="flex bg-[#F4F6FF] min-h-screen font-[Poppins] text-gray-800">
      <Sidebar />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex justify-center items-center lg:ml-64 p-6 md:p-10"
      >
        <Card className="w-full max-w-3xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
          {mergeNotice && (
            <div className="mb-5 rounded-xl border border-[#2E3192]/20 bg-[#F3F5FF] px-4 py-3 text-sm text-[#2E3192] flex items-start justify-between gap-3">
              <span>{mergeNotice}</span>
              <button
                type="button"
                className="text-[#2E3192] font-semibold"
                onClick={() => {
                  localStorage.removeItem("mergeNotice");
                  setMergeNotice("");
                }}
              >
                Dismiss
              </button>
            </div>
          )}
          {/* Header */}
          <CardHeader className="text-center mb-6">
            <h1 className="text-3xl font-semibold text-[#2E3192] flex justify-center items-center gap-2">
              <User className="w-7 h-7" /> My Profile
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Manage your personal information and preferences.
            </p>
          </CardHeader>

          <Separator className="mb-6" />

          {/* Avatar & Basic Info */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover shadow-lg border border-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2E3192] to-[#1F2370] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {form.name[0]}
                </div>
              )}
              <label
                htmlFor="profilePhotoInput"
                className="absolute -bottom-1 -right-1 bg-white shadow rounded-full border border-gray-200 hover:bg-[#E9EDFF] w-9 h-9 flex items-center justify-center cursor-pointer"
              >
                <Edit2 className="w-4 h-4 text-[#2E3192]" />
              </label>
              <input
                id="profilePhotoInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            <h2 className="text-xl font-semibold text-[#2E3192] mt-3">
              {form.name}
            </h2>
            <p className="flex items-center justify-center gap-2 text-gray-600 text-sm mt-1">
              <Mail className="w-4 h-4" /> {form.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Member since {joinedDate}
            </p>
          </div>

          {/* Profile Details */}
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="text-sm text-gray-500">Full Name</label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`mt-1 ${
                    isEditing
                      ? "border-[#2E3192] focus:ring-[#2E3192]"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Email</label>
                <Input
                  value={form.email}
                  disabled
                  className="mt-1 border-gray-200 bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Phone (read-only)</label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mt-1 bg-white">
                  <Phone className="w-4 h-4 text-[#2E3192]" />
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    placeholder="+265XXXXXXXXX"
                    onChange={handleChange}
                    disabled
                    className="w-full outline-none bg-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Location</label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mt-1 bg-white">
                  <MapPin className="w-4 h-4 text-[#2E3192]" />
                  <input
                    type="text"
                    name="location"
                    placeholder="Delhi, India"
                    value={form.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full outline-none bg-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>

          {/* Buttons */}
          <CardFooter className="flex justify-center mt-8">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-[#2E3192] to-[#1F2370] text-white rounded-full px-6 py-2 shadow hover:opacity-90"
              >
                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            ) : (
              <Button
                onClick={() => setShowConfirm(true)}
                className="bg-emerald-600 text-white rounded-full px-6 py-2 shadow hover:bg-emerald-700"
              >
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      {/* Save Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md bg-white rounded-2xl shadow-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-[#2E3192] font-semibold">
              Confirm Save Changes
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mb-4">
            Are you sure you want to save the updates to your profile?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#2E3192] text-white rounded-full"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Confirmation Dialog */}
      <Dialog open={showPhotoConfirm} onOpenChange={setShowPhotoConfirm}>
        <DialogContent className="max-w-md bg-white rounded-2xl shadow-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-[#2E3192] font-semibold">
              Use this as your profile image?
            </DialogTitle>
          </DialogHeader>
          {pendingPhoto && (
            <div className="flex justify-center my-4">
              <img
                src={pendingPhoto}
                alt="Preview"
                className="w-28 h-28 rounded-full object-cover border"
              />
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={cancelPhoto}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmPhoto}
              className="bg-[#2E3192] text-white rounded-full"
            >
              Yes, use it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
