import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  Globe,
  Lightbulb,
  CheckCircle,
} from "lucide-react";

const About = () => {
  return (
    <div
      className="bg-[#F4F6FF] pt-24"
      style={{
        fontFamily: 'Bahnschrift, "Segoe UI", Tahoma, Arial, sans-serif',
        fontSize: "18px",
      }}
    >
      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-gradient-to-br from-[#F8FAFC] via-white to-[#F2F4FF] py-20 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#2E3192]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F9B233]/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto px-6 text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-5xl font-bold text-[#2E3192] mb-6"
          >
            About Zitheke
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-gray-600 text-lg max-w-3xl"
          >
            Zitheke.com is a Malawian community marketplace where people can buy,
            sell, and discover goods and services with ease and confidence.
          </motion.p>
        </div>
      </section>

      {/* ================= ABOUT CONTENT ================= */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
              A Marketplace Built for Malawi
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our platform connects everyday buyers and sellers — from
              individuals and small businesses to farmers, traders, artisans,
              and service providers — helping them trade safely and conveniently
              across Malawi.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Zitheke.com makes it possible for anyone to list an item, reach
              more customers, and grow their income — while buyers enjoy
              affordable prices and a wider choice of products and services.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-xl font-semibold text-[#2E3192] mb-4">
              What You Can Find on Zitheke
            </h3>
            <ul className="space-y-3 text-gray-600">
              {[
                "Household items, electronics, clothing & furniture",
                "Vehicles, spare parts & accessories",
                "Farm produce, livestock & equipment",
                "Property for rent or sale",
                "Jobs & services",
                "And much more",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-[#F9B233] mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ================= MISSION ================= */}
      <section className="bg-[#F8FAFC] py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-[#2E3192] mb-4"
          >
            Our Mission
          </motion.h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            To empower Malawians through digital trade by creating a safe,
            simple, and inclusive marketplace that connects people and unlocks
            economic opportunities.
          </p>
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-[#2E3192] text-center mb-12">
          Our Values
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <ShieldCheck size={28} />,
              title: "Trust & Safety",
              desc: "We promote secure and respectful trading.",
            },
            {
              icon: <Globe size={28} />,
              title: "Accessibility",
              desc: "Anyone, anywhere in Malawi can trade.",
            },
            {
              icon: <Lightbulb size={28} />,
              title: "Innovation",
              desc: "We use technology to make commerce easier.",
            },
            {
              icon: <Users size={28} />,
              title: "Community Impact",
              desc: "We support local businesses and livelihoods.",
            },
          ].map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 text-left"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#2E3192]/10 text-[#2E3192] mb-4">
                {v.icon}
              </div>
              <h3 className="font-semibold mb-2">{v.title}</h3>
              <p className="text-gray-600 text-sm">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

{/* ================= WHY ZITHEKE ================= */}
<section className="bg-gradient-to-r from-[#2E3192] to-[#1F2370] text-white py-16">
  <div className="max-w-5xl mx-auto px-6 text-center">

    <h2 className="text-3xl font-bold mb-12">
      Why Choose Zitheke.com?
    </h2>

    {/* ✅ Perfect 3x2 aligned grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-6 max-w-4xl mx-auto text-left">
      {[
        "Simple to use",
        "Affordable & accessible",
        "Wider market reach for sellers",
        "Convenient buying for customers",
        "Built for the Malawian market",
        "Trade smart. Trade local. Trade with confidence.",
      ].map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-3 whitespace-nowrap"
        >
          <CheckCircle
            size={20}
            className="text-[#F9B233] flex-shrink-0"
          />
          <span className="text-sm md:text-base font-medium">
            {item}
          </span>
        </div>
      ))}
    </div>

    {/* Footer */}
    <p className="mt-12 font-semibold text-lg">
      Zitheke.com — Zitheke basi.
    </p>
    <p className="mt-1 text-sm opacity-80">
      Powered by Zitheke Online Ltd
    </p>

  </div>
</section>


    </div>
  );
};

export default About;
