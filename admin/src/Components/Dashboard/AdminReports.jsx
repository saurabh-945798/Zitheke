import React, { useEffect, useMemo, useState } from "react";
import adminApi from "../../api/adminApi";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Search,
  ShieldAlert,
} from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

/* =====================================================
   STATUS META
===================================================== */
const STATUS_META = {
  Pending: {
    chip: "bg-yellow-100 text-yellow-700",
    glow: "shadow-[0_0_0_2px_rgba(245,158,11,0.25)]",
    icon: <Clock size={14} />,
  },
  Approved: {
    chip: "bg-green-100 text-green-700",
    glow: "shadow-[0_0_0_2px_rgba(34,197,94,0.25)]",
    icon: <CheckCircle size={14} />,
  },
  Rejected: {
    chip: "bg-red-100 text-red-700",
    glow: "shadow-[0_0_0_2px_rgba(239,68,68,0.25)]",
    icon: <XCircle size={14} />,
  },
};

/* =====================================================
   SKELETON CARD
===================================================== */
const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl bg-white shadow-md p-4 space-y-3">
    <div className="h-5 bg-gray-200 rounded w-3/4" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
    <div className="h-4 bg-gray-200 rounded w-2/3" />
    <div className="h-9 bg-gray-200 rounded-xl" />
  </div>
);

/* =====================================================
   COMPONENT
===================================================== */
const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [proofUrl, setProofUrl] = useState(null);

  const navigate = useNavigate();

  /* =====================================================
     FETCH REPORTS
  ===================================================== */
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit,
          status: filter === "All" ? undefined : filter,
          search: search.trim() || undefined,
        };
        const res = await adminApi.get("/reports", { params });
        setReports(res.data?.reports || []);
        setTotal(res.data?.total || 0);
        setPages(res.data?.pages || 1);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [filter, search, page, limit]);

  /* =====================================================
     FILTERING
  ===================================================== */
  const stats = useMemo(
    () => ({
      total,
      pending: reports.filter((r) => r.status === "Pending").length,
      approved: reports.filter((r) => r.status === "Approved").length,
      rejected: reports.filter((r) => r.status === "Rejected").length,
    }),
    [reports, total]
  );

  /* =====================================================
     ACTION HANDLER
  ===================================================== */
  const handleAction = async (id, action) => {
    let confirmText = "";
    let statusUpdate = {};

    if (action === "approve") {
      confirmText = "Approve this report?";
      statusUpdate = { status: "Approved" };
    } else if (action === "reject") {
      confirmText = "Reject this report?";
      statusUpdate = { status: "Rejected" };
    } else {
      confirmText = "Delete the reported ad?";
    }

    const confirm = await Swal.fire({
      title: confirmText,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2E3192",
      cancelButtonColor: "#e11d48",
    });

    if (!confirm.isConfirmed) return;

    const previous = reports;
    try {
      if (action === "delete") {
        setReports((prev) =>
          prev.map((r) =>
            r._id === id ? { ...r, status: "Approved" } : r
          )
        );
        const res = await adminApi.delete(`/reports/${id}/delete-ad`);
        const message = res?.data?.message || "Ad deleted & report resolved";
        Swal.fire("Success", message, "success");
      } else {
        await adminApi.put(`/reports/${id}/status`, statusUpdate);
        setReports((prev) =>
          prev.map((r) =>
            r._id === id ? { ...r, status: statusUpdate.status } : r
          )
        );
        Swal.fire("Success", "Action completed", "success");
      }
    } catch {
      setReports(previous);
      Swal.fire("Error", "Failed to process request", "error");
    }
  };

  /* =====================================================
     UI
  ===================================================== */
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#E9EDFF] via-white to-[#F4F6FF] py-8 px-6 font-[Poppins]">
      {/* STICKY TOOLBAR */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border border-[#2E3192]/20 mb-6 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1D64] flex items-center gap-2">
            <FileText size={22} className="text-[#2E3192]" />
            Reports
          </h1>

          {/* FILTERS */}
          <div className="flex flex-wrap gap-2">
            {["All", "Pending", "Approved", "Rejected"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                  filter === s
                    ? "bg-[#2E3192] text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* SEARCH */}
          <div className="flex items-center gap-2">
            <Search size={18} className="text-gray-500" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search reports…"
              className="border rounded-xl px-3 py-2 text-sm outline-none"
            />
          </div>

          {/* STATS */}
          <div className="flex gap-3 text-sm font-semibold text-gray-600">
            <span>Total: {stats.total}</span>
            <span>Pending: {stats.pending}</span>
            <span>Approved: {stats.approved}</span>
            <span>Rejected: {stats.rejected}</span>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {reports.map((r, i) => {
            const meta = STATUS_META[r.status];

            return (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className={`bg-white rounded-2xl shadow-lg border border-[#2E3192]/20 p-4 space-y-3 ${meta.glow}`}
              >
                {/* TITLE */}
                <p className="font-bold text-[#1A1D64] leading-snug">
                  {r.adTitle}
                </p>

                {/* META */}
                {/* <p className="text-sm text-gray-600">
                  ₹ {r.adId?.price?.toLocaleString() || "—"} •{" "}
                  {r.adId?.location || "—"}
                </p> */}

                <p className="text-xs text-gray-500">
                  Reporter: {r.reporterName}
                </p>

                {/* STATUS + PROOF */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${meta.chip}`}
                  >
                    {meta.icon}
                    {r.status}
                  </span>

                  {r.fileUrl && (
                    <button
                      onClick={() => setProofUrl(r.fileUrl)}
                      className="text-[#2E3192] text-xs flex items-center gap-1"
                    >
                      <ShieldAlert size={14} /> Proof
                    </button>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() =>
                      navigate(`/admin/reports/${r._id}`)
                    }
                    className="flex-1 bg-[#2E3192] text-white rounded-xl py-2 text-sm font-semibold"
                  >
                    View Report
                  </button>

                  <button
                    onClick={() => handleAction(r._id, "approve")}
                    className="text-green-600"
                  >
                    <CheckCircle />
                  </button>

                  <button
                    onClick={() => handleAction(r._id, "reject")}
                    className="text-red-600"
                  >
                    <XCircle />
                  </button>

                  <button
                    onClick={() => handleAction(r._id, "delete")}
                    className="text-gray-600"
                  >
                    <Trash2 />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {!loading && pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3 text-sm font-semibold">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-xl border border-gray-200 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-gray-600">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pages))}
            disabled={page === pages}
            className="px-3 py-2 rounded-xl border border-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* PROOF MODAL (NO IMAGE PREVIEW) */}
      <AnimatePresence>
        {proofUrl && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setProofUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-[#1A1D64] mb-3">
                Proof Attachment
              </h3>
              <p className="text-sm text-gray-600 break-all">
                {proofUrl}
              </p>

              <a
                href={proofUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block bg-[#2E3192] text-white px-4 py-2 rounded-xl text-sm font-semibold"
              >
                Open Proof
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AdminReports;
