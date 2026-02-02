import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import adminApi from "../../api/adminApi.js"; // path adjust karo
import {
  Users,
  TrendingUp,
  UserCheck,
  MapPin,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

import { Line, Bar, Doughnut } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

const UserGrowth = () => {
  const BASE_URL = "http://localhost:5000";
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch API Data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await adminApi.get("/overview");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching user analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="h-screen flex items-center justify-center text-[#1F2370] font-semibold text-xl">
        Loading User Growth Insights...
      </div>
    );
  }

  const {
    months,
    monthlyUsers,
    userGrowthRate,
    totalUsers,
    userCities = [],
    topActiveSellers = [],
  } = stats;

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#E9EDFF] via-white to-[#F4F6FF] py-10 px-6 font-[Poppins]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white rounded-xl shadow hover:shadow-md transition border border-gray-100"
            >
              <ArrowLeft size={22} className="text-[#1A1D64]" />
            </button>

            <div>
              <h1 className="text-4xl font-extrabold text-[#1A1D64] tracking-tight">
                User Growth Analytics
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Insights about user activity, locations & growth
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Updated:{" "}
            <span className="font-semibold">
              {new Date(stats.lastUpdated).toLocaleString()}
            </span>
          </p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 mb-14">
          {[
            {
              title: "Total Users",
              value: totalUsers,
              icon: <Users className="text-[#1F2370]" size={24} />,
              color: "from-[#C7CDFB] to-[#E9EDFF]",
            },
            {
              title: "Growth Rate",
              value: userGrowthRate + "",
              icon: <TrendingUp className="text-[#1F2370]" size={24} />,
              color: "from-[#C7CDFB] to-[#E9EDFF]",
            },
            {
              title: "Active Users",
              value: Math.round(totalUsers * 0.75),
              icon: <UserCheck className="text-[#1F2370]" size={24} />,
              color: "from-[#C7CDFB] to-[#E9EDFF]",
            },
            {
              title: "Top Location",
              value: userCities[0]?._id || "—",
              icon: <MapPin className="text-[#1F2370]" size={24} />,
              color: "from-[#C7CDFB] to-[#E9EDFF]",
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.04, y: -6 }}
              transition={{ type: "spring", stiffness: 180 }}
              className={`rounded-3xl bg-gradient-to-br ${card.color} p-6 shadow-xl border border-white/40 backdrop-blur-xl`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-gray-800 font-semibold text-sm">
                  {card.title}
                </h3>
                <div className="bg-white/80 p-2 rounded-xl shadow">
                  {card.icon}
                </div>
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900 mt-3">
                {card.value?.toLocaleString()}
              </h2>
            </motion.div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          <motion.div className="bg-white/80 rounded-3xl p-6 shadow-xl border">
            <h3 className="font-semibold text-[#1A1D64] mb-4">
              Monthly User Growth
            </h3>
            <div className="h-72">
              <Line
                data={{
                  labels: months,
                  datasets: [
                    {
                      label: "New Users",
                      data: monthlyUsers,
                      borderColor: "#1F2370",
                      backgroundColor: "rgba(31,35,112,0.15)",
                      fill: true,
                      tension: 0.35,
                    },
                  ],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </motion.div>

          <motion.div className="bg-white/80 rounded-3xl p-6 shadow-xl border">
            <h3 className="font-semibold text-[#1F2370] mb-4">
              Top User Locations
            </h3>
            <div className="h-72">
              <Bar
                data={{
                  labels: userCities.map((c) => c._id),
                  datasets: [
                    {
                      data: userCities.map((c) => c.count),
                      backgroundColor: "rgba(46,49,146,0.45)",
                      borderRadius: 10,
                    },
                  ],
                }}
                options={{ indexAxis: "y", maintainAspectRatio: false }}
              />
            </div>
          </motion.div>
        </div>

        {/* ðŸ†• TOP ACTIVE SELLERS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 rounded-3xl p-8 shadow-xl border mb-20"
        >
          <h2 className="text-2xl font-bold text-[#1A1D64] mb-6 flex items-center gap-2">
            <ShieldCheck className="text-[#2E3192]" />
            Top Active Sellers
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-3">Seller</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Member Since</th>
                  <th>Ads Posted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {topActiveSellers.map((u, i) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-[#F4F6FF] transition"
                  >
                    <td className="py-3 font-medium text-gray-800">
                      {u.name || "—"}
                    </td>
                    <td className="text-gray-600">{u.email}</td>
                    <td className="text-gray-600">{u.phone || "-"}</td>
                    <td className="text-gray-600">
                      {new Date(u.memberSince).toLocaleDateString()}
                    </td>
                    <td className="font-semibold text-[#1F2370]">
                      {u.totalAdsPosted}
                    </td>
                    <td>
                      {u.isActiveSeller ? (
                        <span className="px-3 py-1 text-xs rounded-full bg-[#E9EDFF] text-[#1A1D64] font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FOOTER */}
        <div className="text-center text-gray-600 text-sm">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-[#1F2370]">Zitheke Admin</span>
        </div>
      </motion.div>
    </section>
  );
};

export default UserGrowth;
