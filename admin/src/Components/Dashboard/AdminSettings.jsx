import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Lock, Save, Mail, Phone, User } from "lucide-react";

const AdminSettings = () => {
  const [form, setForm] = useState({
    name: "Admin User",
    email: "dkumaralinafeonline@gmail.com",
    phone: "+91 9457982221",
    profilePhoto: "https://res.cloudinary.com/dxah12xl4/image/upload/v1763808552/zitheke/users/c42ec9yxbuxbabhai0dh.jpg",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        profilePhoto: URL.createObjectURL(file),
      });
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    alert("Settings updated successfully!");
    console.log(form);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-[#2E3192] mb-8"
      >
        Admin Settings
      </motion.h1>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Profile Information
        </h2>

        {/* Photo Upload */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <img
              src={form.profilePhoto}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-sm"
            />

            <label
              htmlFor="photoInput"
              className="absolute bottom-0 right-0 bg-[#2E3192] p-2 rounded-full text-white cursor-pointer hover:bg-[#1F2370]"
            >
              <Camera size={18} />
            </label>

            <input
              id="photoInput"
              type="file"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <div>
            <p className="text-gray-700 font-medium">Profile Photo</p>
            <p className="text-gray-500 text-sm">Upload a clear square image</p>
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="text-gray-600 font-medium flex gap-2 mb-1">
            <User size={18} /> Full Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#2E3192]"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-gray-600 font-medium flex gap-2 mb-1">
            <Mail size={18} /> Email Address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#2E3192]"
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="text-gray-600 font-medium flex gap-2 mb-1">
            <Phone size={18} /> Phone Number
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#2E3192]"
          />
        </div>
      </motion.div>

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Change Password
        </h2>

        {/* Old Password */}
        <div className="mb-4">
          <label className="text-gray-600 font-medium flex gap-2 mb-1">
            <Lock size={18} /> Old Password
          </label>
          <input
            type="password"
            name="oldPassword"
            value={form.oldPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#2E3192]"
          />
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label className="text-gray-600 font-medium flex gap-2 mb-1">
            <Lock size={18} /> New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#2E3192]"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="text-gray-600 font-medium flex gap-2 mb-1">
            <Lock size={18} /> Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#2E3192]"
          />
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSave}
        className="mt-6 w-full bg-[#2E3192] text-white py-3 rounded-xl shadow-md font-semibold flex items-center justify-center gap-2 hover:bg-[#1F2370]"
      >
        <Save size={20} /> Save Changes
      </motion.button>
    </div>
  );
};

export default AdminSettings;
