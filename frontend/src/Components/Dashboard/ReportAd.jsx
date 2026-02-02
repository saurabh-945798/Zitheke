// src/Components/Dashboard/ReportAd.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { FileText, UploadCloud, Send } from "lucide-react";

const ReportAd = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();

  const [form, setForm] = useState({
    reason: "",
    message: "",
    file: null,
  });

  const BASE_URL = "http://localhost:5000";

  if (!state?.adId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg font-medium">
        Invalid Report Request.
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      Swal.fire("Login required", "Please login to report this ad.", "info");
      return;
    }

    if (!form.reason || !form.message) {
      Swal.fire("Missing fields", "Please fill all details.", "warning");
      return;
    }

    // 🔐 JWT TOKEN (IMPORTANT)
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire("Session expired", "Please login again.", "warning");
      navigate("/login");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("adId", state.adId);
      formData.append("adTitle", state.adTitle);
      formData.append("sellerId", state.sellerId);
      formData.append("reporterId", user.uid);
      formData.append("reporterName", user.displayName || user.email);
      formData.append("reason", form.reason);
      formData.append("message", form.message);
      if (form.file) formData.append("file", form.file);

      await axios.post(`${BASE_URL}/api/reports`, formData, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ FIX
        },
      });

      Swal.fire({
        icon: "success",
        title: "Report Submitted ✅",
        text: "Your complaint has been sent for review.",
        confirmButtonColor: "#008080",
      });

      navigate("/dashboard");
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

  return (
    <section className="relative min-h-screen flex justify-center items-center bg-gradient-to-br from-[#e0f7f7] via-[#f8fffe] to-[#d9f2f1] py-20 px-4 font-[Poppins] overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-2xl bg-white/70 backdrop-blur-2xl border border-[#00BFA6]/10 shadow-lg rounded-3xl p-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#00BFA6]/10 text-[#006D77] rounded-xl">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#006D77]">
              Report this Ad
            </h1>
            <p className="text-sm text-gray-500">
              Help us keep the Zitheke community safe.
            </p>
          </div>
        </div>

        <div className="mb-6 bg-[#00BFA6]/5 border border-[#00BFA6]/10 rounded-lg p-3 text-gray-700 text-sm">
          <strong>Ad Title:</strong> {state.adTitle}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <select
            name="reason"
            value={form.reason}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2"
          >
            <option value="">Select Reason</option>
            <option value="Fake Listing">Fake Listing</option>
            <option value="Fraudulent Seller">Fraudulent Seller</option>
            <option value="Inappropriate Content">Inappropriate Content</option>
            <option value="Scam / Misleading Info">
              Scam / Misleading Info
            </option>
          </select>

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows="5"
            className="w-full border rounded-xl px-4 py-2"
            placeholder="Explain your concern..."
          />

          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="w-full bg-gradient-to-r from-[#00BFA6] to-[#006D77] text-white py-3 rounded-xl"
          >
            <Send size={18} /> Submit Report
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
};

export default ReportAd;
