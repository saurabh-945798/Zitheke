// ðŸ“ src/pages/AdminOverview.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import adminApi from "../../api/adminApi"; // âœ… FIXED
import {
  LayoutDashboard,
  RefreshCw,
  Users,
  FolderOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);

      // âœ… adminApi USE (token interceptor applies here)
      const res = await adminApi.get("/overview");

      setStats(res.data);
    } catch (err) {
      console.error("Admin Overview Error:", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // â³ LOADING
  if (loading || !stats) {
    return (
      <div className="h-screen flex items-center justify-center text-[#1F2370] font-semibold text-xl">
        Fetching Analytics...
      </div>
    );
  }

  // ðŸ“Š DATA
  const {
    months,
    monthlyAds,
    monthlyUsers,
    adStatusCount,
    topCategory,
    topLocation,
    mostReportedCategory,
    totalUsers,
    totalAds,
    approvedAds,
    pendingAds,
    rejectedAds,
    totalMessages,
  } = stats;

  // PIE DATA
  const adStatusData = {
    labels: Object.keys(adStatusCount || {}),
    datasets: [
      {
        data: Object.values(adStatusCount || {}),
        backgroundColor: ["#2E3192", "#5B66D6", "#A3A8E8", "#1A1D64"],
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 8,
      },
    ],
  };

  // LINE DATA
  const monthlyAdsData = {
    labels: months || [],
    datasets: [
      {
        label: "Ads Posted",
        data: monthlyAds || [],
        borderColor: "#2E3192",
        backgroundColor: "rgba(46,49,146,0.15)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  // BAR DATA
  const monthlyUsersData = {
    labels: months || [],
    datasets: [
      {
        label: "User Signups",
        data: monthlyUsers || [],
        backgroundColor: "rgba(46,49,146,0.5)",
        borderRadius: 10,
      },
    ],
  };

  // STAT CARDS
  const statCards = [
    { title: "Total Users", value: totalUsers, icon: <Users /> },
    { title: "Total Ads", value: totalAds, icon: <FolderOpen /> },
    { title: "Approved Ads", value: approvedAds, icon: <CheckCircle /> },
    { title: "Pending Ads", value: pendingAds, icon: <Clock /> },
    { title: "Rejected Ads", value: rejectedAds, icon: <AlertTriangle /> },
    { title: "Messages", value: totalMessages, icon: <MessageCircle /> },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#E9EDFF] via-white to-[#F4F6FF] py-12 px-6 font-[Poppins]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#2E3192] text-white">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-[#1A1D64]">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 text-sm">
                Real-time insights powered by Zitheke Admin
              </p>
            </div>
          </div>

          <button
            onClick={fetchStats}
            className="flex items-center gap-2 bg-gradient-to-r from-[#2E3192] to-[#1A1D64] text-white px-6 py-3 rounded-xl"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white shadow-lg border"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm text-gray-600 font-semibold">
                  {card.title}
                </h3>
                <div className="text-[#1A1D64] bg-gray-100 p-2 rounded-xl">
                  {card.icon}
                </div>
              </div>
              <h2 className="text-4xl font-extrabold text-[#1A1D64] mt-3">
                {card.value?.toLocaleString()}
              </h2>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="font-semibold text-[#1A1D64] mb-5">
              Monthly Ads Posted
            </h3>
            <Line data={monthlyAdsData} />
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="font-semibold text-[#1A1D64] mb-5 text-center">
              Ad Status Breakdown
            </h3>
            <Pie data={adStatusData} />
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="font-semibold text-[#1A1D64] mb-5">
              User Signup Trend
            </h3>
            <Bar data={monthlyUsersData} />
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Top Category", value: topCategory },
            { label: "Most Reported Category", value: mostReportedCategory },
            { label: "Top Location", value: topLocation },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow">
              <h4 className="font-semibold text-[#1A1D64]">{item.label}</h4>
              <p className="text-gray-700 mt-1">{item.value || "â€”"}</p>
            </div>
          ))}
        </div>

        <div className="text-center text-gray-500 text-sm mt-12">
          Â© {new Date().getFullYear()} Zitheke Admin Dashboard
        </div>
      </motion.div>
    </section>
  );
};

export default AdminOverview;
