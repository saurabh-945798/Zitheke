import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const DashboardStats = ({ stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 220 }}
          className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/55 backdrop-blur-xl shadow-lg"
        >
          <div
            className={`absolute inset-0 opacity-90 bg-gradient-to-br ${stat.gradient}`}
          />
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white/20 blur-2xl" />

          <div className="relative p-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm/5 opacity-85">{stat.title}</p>
                <div className="mt-1 flex items-end gap-2">
                  <h2 className="text-3xl font-bold">{stat.value}</h2>
                  <span className="text-xs opacity-80 pb-1">{stat.sub}</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md">
                {stat.icon}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs opacity-85">Live stats</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/15 border border-white/20 px-3 py-1 rounded-full">
                Insights <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardStats;

