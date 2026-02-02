// ðŸ“ src/pages/CategoryInsight.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import adminApi from "../../api/adminApi"; // âœ… FIXED
import {
  BarChart3,
  ArrowLeft,
  TrendingUp,
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
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const CategoryInsight = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ðŸ“Š Fetch Category Insights
  useEffect(() => {
    const fetchCategoryInsights = async () => {
      try {
        // âœ… adminApi USE (token interceptor applies here)
        const res = await adminApi.get("/overview");
        setData(res.data);
      } catch (err) {
        console.error("Error loading category insights:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryInsights();
  }, []);

  if (loading || !data) {
    return (
      <div className="h-screen flex justify-center items-center text-[#1F2370] font-semibold text-lg">
        Loading insights...
      </div>
    );
  }

  const insights = data.categoryInsights || [];

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#E9EDFF] via-white to-[#F4F6FF] py-10 px-6 font-[Poppins]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl shadow bg-white border hover:shadow-md transition"
            >
              <ArrowLeft className="text-[#1A1D64]" size={20} />
            </button>

            <div>
              <h1 className="text-4xl font-extrabold text-[#1A1D64] tracking-tight">
                Category Insights
              </h1>
              <p className="text-gray-600 text-sm">
                Deep breakdown of performance across all categories
              </p>
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            Updated:{" "}
            <span className="font-semibold">
              {new Date(data.lastUpdated).toLocaleString()}
            </span>
          </p>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          {/* TOP CATEGORIES */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-[#2E3192]/10"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-[#2E3192]/10 rounded-xl border border-[#2E3192]/20">
                <BarChart3 className="text-[#1F2370]" size={22} />
              </div>
              <h3 className="text-lg font-semibold text-[#1A1D64]">
                Top Performing Categories
              </h3>
            </div>

            <div className="h-72">
              <Bar
                data={{
                  labels: insights.map((c) => c.category),
                  datasets: [
                    {
                      label: "Total Ads",
                      data: insights.map((c) => c.totalAds),
                      backgroundColor: "rgba(46,49,146,0.4)",
                      borderRadius: 10,
                    },
                    {
                      label: "Avg Price (MK )",
                      data: insights.map((c) => c.avgPrice),
                      type: "line",
                      borderColor: "#1A1D64",
                      backgroundColor: "rgba(46,49,146,0.12)",
                      yAxisID: "y1",
                      tension: 0.4,
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom" },
                  },
                  scales: {
                    y: { beginAtZero: true },
                    y1: { position: "right", grid: { display: false } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </motion.div>

          {/* REPORTS & ENGAGEMENT */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-[#2E3192]/10"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-[#F5D39B]/20 rounded-xl border border-[#F2C86B]/30">
                <TrendingUp className="text-[#A66B07]" size={22} />
              </div>
              <h3 className="text-lg font-semibold text-[#A66B07]">
                Reports & Engagement Comparison
              </h3>
            </div>

            <div className="h-72">
              <Bar
                data={{
                  labels: insights.map((c) => c.category),
                  datasets: [
                    {
                      label: "Reports",
                      data: insights.map((c) => c.totalReports),
                      backgroundColor: "rgba(239,68,68,0.85)",
                      borderRadius: 10,
                    },
                    {
                      label: "Engagement Rate",
                      data: insights.map((c) => Number(c.engagementRate)),
                      backgroundColor: "rgba(46,49,146,0.85)",
                      borderRadius: 10,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                  scales: {
                    y: { beginAtZero: true },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* TABLE */}
        <motion.div className="overflow-x-auto bg-white shadow-xl rounded-3xl border border-gray-200">
          <table className="min-w-full text-left">
            <thead className="bg-[#2E3192] text-white">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Total Ads</th>
                <th className="px-4 py-3">Avg Price</th>
                <th className="px-4 py-3">Reports</th>
                <th className="px-4 py-3">Messages</th>
                <th className="px-4 py-3">Engagement</th>
              </tr>
            </thead>

            <tbody>
              {insights.map((cat, i) => (
                <motion.tr
                  key={i}
                  whileHover={{ backgroundColor: "rgba(46,49,146,0.05)" }}
                  className="border-b text-gray-700"
                >
                  <td className="px-4 py-3 font-semibold text-[#1A1D64]">
                    {cat.category}
                  </td>
                  <td className="px-4 py-3">{cat.totalAds}</td>
                  <td className="px-4 py-3 text-[#2E3192]">
                    MK  {cat.avgPrice?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-red-600">
                    {cat.totalReports}
                  </td>
                  <td className="px-4 py-3 text-[#2E3192]">
                    {cat.totalMessages}
                  </td>
                  <td className="px-4 py-3 text-[#2E3192]">
                    {cat.engagementRate}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* FOOTER */}
        <div className="text-center text-gray-500 text-sm mt-10">
          © {new Date().getFullYear()}{" "}
          <b className="text-[#1F2370]">Zitheke Admin</b> — Premium Category
          Analytics
        </div>
      </motion.div>
    </section>
  );
};

export default CategoryInsight;
