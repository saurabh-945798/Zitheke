import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
} from "lucide-react";
import axios from "axios";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const BASE_URL = "http://localhost:5000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/api/contact/submit`, form);
      setStatus({
        type: "success",
        message: res.data?.message || "Message submitted successfully",
      });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to submit. Please try again.";
      setStatus({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-[Poppins] bg-[#F4F6FF] pt-24">
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-white via-[#F4F6FF] to-[#E9EDFF] py-20 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#2E3192]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2E3192]/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-[#2E3192] mb-6"
          >
            Contact Support
          </motion.h1>

          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Need help or have a question? Our support team is here to assist
            you. Reach out to Zitheke anytime.
          </p>
        </div>
      </section>

      {/* ================= CONTACT INFO ================= */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-md p-8 text-center"
          >
            <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-[#2E3192]/10 text-[#2E3192] mb-4">
              <Mail size={26} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Email Support</h3>
            <p className="text-gray-600 text-sm">
              support@Zitheke.com
            </p>
          </motion.div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-md p-8 text-center"
          >
            <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-[#2E3192]/10 text-[#2E3192] mb-4">
              <Phone size={26} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Phone</h3>
            <p className="text-gray-600 text-sm">
              +265 265 98 0 63 45 36
            </p>
          </motion.div>

          {/* Address */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-md p-8 text-center"
          >
            <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-[#2E3192]/10 text-[#2E3192] mb-4">
              <MapPin size={26} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Office Address</h3>
            <p className="text-gray-600 text-sm">
              Colby Road, Area 3<br />
              Lilongwe, Malawi
            </p>
          </motion.div>
        </div>

        {/* ================= CONTACT FORM ================= */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-md p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="text-[#2E3192]" />
              <h2 className="text-2xl font-semibold text-[#2E3192]">
                Send Us a Message
              </h2>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#2E3192]/40"
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#2E3192]/40"
                />
              </div>

              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#2E3192]/40"
              />

              <textarea
                rows="5"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Your Message"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#2E3192]/40"
              ></textarea>

              {status.message && (
                <p
                  className={`text-sm ${
                    status.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {status.message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-[#2E3192] text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Message"}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
