import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FolderOpen,
  Search,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ---------------------------------------------
   Helpers
--------------------------------------------- */
const daysAgo = (date) => {
  const diff = Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff <= 0 ? "Today" : `${diff} day${diff > 1 ? "s" : ""} ago`;
};

const statusStyles = {
  Approved:
    "bg-green-50 text-green-700 ring-green-300 shadow-[0_0_0_2px_rgba(34,197,94,0.15)]",
  Pending:
    "bg-amber-50 text-amber-700 ring-amber-300 shadow-[0_0_0_2px_rgba(251,191,36,0.18)]",
  Rejected:
    "bg-red-50 text-red-700 ring-red-300 shadow-[0_0_0_2px_rgba(239,68,68,0.18)]",
};

/* ---------------------------------------------
   Skeleton Card
--------------------------------------------- */
const SkeletonCard = () => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 animate-pulse">
    <div className="flex justify-between gap-4">
      <div className="space-y-3 w-2/3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="space-y-3 w-1/3 text-right">
        <div className="h-6 bg-gray-200 rounded-full w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3 ml-auto" />
      </div>
    </div>
    <div className="h-3 bg-gray-200 rounded w-full mt-5" />
  </div>
);

/* ---------------------------------------------
   Component
--------------------------------------------- */
const MyReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const BASE_URL = "/api";

  /* ---------------------------------------------
     Fetch Reports
  --------------------------------------------- */
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setLoading(false);

        const res = await axios.get(
          `${BASE_URL}/reports/user/${user.uid}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const payload = res.data?.reports ?? res.data ?? [];
        setReports(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error("? Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user?.uid]);

  /* ---------------------------------------------
     Counts
  --------------------------------------------- */
  const counts = useMemo(() => {
    return {
      Total: reports.length,
      Pending: reports.filter((r) => r.status === "Pending").length,
      Approved: reports.filter((r) => r.status === "Approved").length,
      Rejected: reports.filter((r) => r.status === "Rejected").length,
    };
  }, [reports]);

  /* ---------------------------------------------
     Filter + Search
  --------------------------------------------- */
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchStatus = filter === "All" || r.status === filter;
      const matchSearch =
        r.adTitle?.toLowerCase().includes(search.toLowerCase()) ||
        r.reason?.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [reports, filter, search]);

  /* ---------------------------------------------
     Loading Skeleton
  --------------------------------------------- */
  if (loading) {
    return (
      <section className="min-h-screen px-4 sm:px-6 py-14 bg-gradient-to-b from-[#F4F6FF] to-white lg:pl-[280px]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen px-4 sm:px-6 py-14 font-[Poppins] text-gray-800 overflow-hidden lg:pl-[280px]">
      {/* Subtle Patterned Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,49,146,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(46,49,146,0.06),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-6xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
          <h1 className="text-3xl font-semibold text-[#2E3192] flex items-center gap-2">
            <FileText className="w-7 h-7" /> My Reports
          </h1>
          <p className="text-sm text-gray-500">
            Track status of your reported ads
          </p>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {Object.entries(counts).map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl px-4 py-3 bg-gradient-to-br from-white to-[#E9EDFF] border border-gray-100 text-center"
            >
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-semibold text-[#2E3192]">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div className="flex flex-wrap gap-2">
            {["All", "Pending", "Approved", "Rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  filter === s
                    ? "bg-[#2E3192] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or reason�"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/30"
            />
          </div>
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-[#E9EDFF] flex items-center justify-center mb-4">
              <FolderOpen className="w-10 h-10 text-[#2E3192]" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              No reports found
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Try adjusting filters or browse ads instead.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="px-5 py-2 rounded-xl bg-[#2E3192] text-white font-medium flex items-center gap-2"
              >
                <Home size={16} /> Go to Home
              </button>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report._id || index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-[#F4F6FF] p-5 hover:shadow-xl transition"
                >
                  <div className="flex justify-between gap-4">
                    {/* Left */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-[#2E3192]">
                        {report.adTitle}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reason:</span>{" "}
                        {report.reason}
                      </p>
                      <p className="text-xs text-gray-500">
                        Submitted {daysAgo(report.createdAt)}
                      </p>
                    </div>

                    {/* Right */}
                    <div className="text-right space-y-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ring-1 ${statusStyles[report.status]}`}
                      >
                        {report.status === "Approved" && (
                          <CheckCircle size={14} />
                        )}
                        {report.status === "Pending" && (
                          <Clock size={14} />
                        )}
                        {report.status === "Rejected" && (
                          <XCircle size={14} />
                        )}
                        {report.status}
                      </span>
                      <p className="text-xs text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mt-4 line-clamp-3">
                    {report.message}
                  </p>

                  {report.fileUrl && (
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-[#2E3192]"
                    >
                      <Eye size={15} /> View Proof
                    </a>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default MyReports;
