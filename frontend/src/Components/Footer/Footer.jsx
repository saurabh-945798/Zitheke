import React from "react";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-[#ffffff] via-[#F8FAFC] to-[#F2F4FF] text-[#2E3192] pt-16 pb-8 overflow-hidden font-[Poppins]">
      {/* Floating background glows */}
      <div className="absolute -top-20 left-0 w-72 h-72 bg-[#F9B233]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#2E3192]/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* 1️⃣ Brand Info */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-3">Zitheke</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Your trusted marketplace to buy, sell, and connect locally with
              people around you. Safe, simple, and smart.
            </p>

            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-[#2E3192]/10 rounded-full">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 bg-[#2E3192]/10 rounded-full">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2 bg-[#2E3192]/10 rounded-full">
                <Instagram size={18} />
              </a>
            </div>
          </motion.div>

          {/* 2️⃣ Quick Links */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <a
                  href="/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer hover:text-[#2E3192]"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer hover:text-[#2E3192]"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer hover:text-[#2E3192]"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer hover:text-[#2E3192]"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </motion.div>

          {/* 3️⃣ Popular Categories */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="font-semibold text-lg mb-3">Popular Categories</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <a
                  href="/category/Mobiles"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer hover:text-[#2E3192]"
                >
                  Mobiles & Tablets
                </a>
              </li>
              <li>
                <a
                  href="/category/Electronics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer hover:text-[#2E3192]"
                >
                  Electronics
                </a>
              </li>
              <li>
                <a
                  href="/category/Vehicles"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer hover:text-[#2E3192]"
                >
                  Vehicles
                </a>
              </li>
              <li>
                <a
                  href="/category/Furniture"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer hover:text-[#2E3192]"
                >
                  Furniture

                </a>
              </li>
            </ul>
          </motion.div>

          {/* 4️⃣ Contact */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9 }}
          >
            <h3 className="font-semibold text-lg mb-3">Contact Us</h3>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li className="flex gap-2">
                <MapPin size={16} /> Lilongwe, Malawi
              </li>
              <li className="flex gap-2">
                <Mail size={16} /> support@zitheke.com
              </li>
              <li className="flex gap-2">
                <Phone size={16} /> +265 980634536
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


