// 📁 src/pages/DashboardSections.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageCircle,
  TrendingUp,
  MapPin,
  BarChart3,
} from "lucide-react";
import { Line, Bar, Pie } from "react-chartjs-2";

const DashboardSections = ({ stats, lineData, userData, adStatusData }) => {
  const cards = [
    { title: "Total Users", value: stats.totalUsers, icon: <Users /> },
    { title: "Total Ads", value: stats.totalAds, icon: <FolderOpen /> },
    { title: "Approved Ads", value: stats.approvedAds, icon: <CheckCircle /> },
    { title: "Pending Ads", value: stats.pendingAds, icon: <Clock /> },
    { title: "Rejected Ads", value: stats.rejectedAds, icon: <AlertTriangle /> },
    { title: "Messages", value: stats.totalMessages, icon: <MessageCircle /> },
  ];

  return (
    <section className="min-h-screen bg-[#F8FAFF] px-6 py-10 font-[Poppins]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-[#2563EB]" size={28} />
            <h1 className="text-3xl font-bold text-[#1E293B]">
              Admin Overview
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Last Updated: {new Date(stats.lastUpdated).toLocaleString()}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-14">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl p-5 shadow-md border border-gray-100"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-sm text-gray-600">{c.title}</h4>
                <div className="p-2 rounded-full bg-blue-50 text-[#2563EB]">
                  {c.icon}
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mt-2">
                {c.value?.toLocaleString()}
              </h2>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-5 rounded-2xl shadow border">
            <h3 className="font-semibold text-[#2563EB] mb-3 flex gap-2">
              <TrendingUp size={18} /> Monthly Ads Growth
            </h3>
            <div className="h-56">
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow border">
            <h3 className="font-semibold text-[#2563EB] mb-3 flex gap-2">
              <Users size={18} /> Monthly Users
            </h3>
            <div className="h-56">
              <Bar data={userData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow border">
            <h3 className="font-semibold text-center text-[#2563EB] mb-3">
              Ad Status Distribution
            </h3>
            <div className="h-56 flex justify-center">
              <Pie data={adStatusData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Top Location Highlight */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-2xl p-6 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <MapPin size={22} className="text-yellow-300" />
            <h4 className="text-lg font-medium">
              Most Active Location:
              <span className="font-bold text-yellow-300 ml-2">
                {stats.topLocation}
              </span>
            </h4>
          </div>
          <span className="text-sm">
            Growth Rate: <b>{stats.userGrowthRate}</b>
          </span>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-12">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">Zitheke Admin</span> — White & Blue
          Premium Dashboard
        </p>
      </motion.div>
    </section>
  );
};

export default DashboardSections;
