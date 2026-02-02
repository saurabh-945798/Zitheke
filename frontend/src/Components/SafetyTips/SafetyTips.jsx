import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, MessageSquare, HandCoins } from "lucide-react";

const tips = [
  {
    title: "Meet in Public Places",
    desc: "Always arrange to meet in a safe, well-lit public area like a cafe or mall when finalizing a deal.",
    icon: ShieldCheck,
    color: "text-[#2E3192]",
    bg: "bg-[#E8EAF6]",
  },
  {
    title: "Chat Safely on Zitheke",
    desc: "Avoid sharing personal details. Keep all your conversations within Zitheke’s chat system for extra protection.",
    icon: MessageSquare,
    color: "text-[#F9B233]",
    bg: "bg-[#FFF4E5]",
  },
  {
    title: "Pay Securely",
    desc: "Never send money in advance. Inspect the item and make payments only after verifying the deal in person.",
    icon: HandCoins,
    color: "text-[#2E3192]",
    bg: "bg-[#E8EAF6]",
  },
];

const SafetyTips = () => {
  return (
    <section className="py-20 bg-[#F8FAFC]" id="safety-tips">
      <div className="max-w-7xl mx-auto px-6 md:px-10 font-[Poppins]">
        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-[#2E3192] mb-3"
          >
            Stay Safe on Zitheke
          </motion.h2>
          <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
            Follow these simple safety tips to ensure a secure and hassle-free
            buying or selling experience.
          </p>
        </div>

        {/* Safety Tips Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tips.map((tip, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
              className={`rounded-2xl p-8 shadow-md hover:shadow-xl transition-all ${tip.bg}`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`p-4 rounded-full ${tip.bg} ${tip.color} bg-opacity-80 mb-5`}
                >
                  <tip.icon size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-[#2E3192] mb-2">
                  {tip.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Safety CTA */}
        <div className="text-center mt-16">
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-[#2E3192] text-white px-8 py-3 rounded-lg shadow hover:bg-[#251f7b] font-medium transition"
          >
            Learn More Safety Tips
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default SafetyTips;
