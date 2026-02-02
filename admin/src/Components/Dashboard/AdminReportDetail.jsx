// src/pages/AdminReports/AdminReportDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminApi from "../../api/adminApi";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Phone,
  Mail,
  ArrowLeft,
  ShieldAlert,
  Tag,
  MapPin,
  Banknote,
  User,
  Image as ImageIcon,
  FileText,
  Clock,
  CheckCheck,
  AlertTriangle,
} from "lucide-react";
import Swal from "sweetalert2";

/* =====================================================
   🧩 Small UI Helpers
===================================================== */
const cx = (...classes) => classes.filter(Boolean).join(" ");

const formatINR = (n) => {
  if (n === null || n === undefined || n === "") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("en-MW");
};

const formatDateTime = (dateLike) => {
  if (!dateLike) return "—";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

const getStatusMeta = (status) => {
  const s = (status || "Pending").toLowerCase();
  if (s === "approved") {
    return {
      label: "Approved",
      icon: <CheckCheck size={16} />,
      chip: "bg-green-50 text-green-700 border-green-200",
      border: "border-l-green-500",
      glow: "shadow-[0_0_0_1px_rgba(34,197,94,0.15),0_10px_30px_rgba(34,197,94,0.10)]",
    };
  }
  if (s === "rejected") {
    return {
      label: "Rejected",
      icon: <XCircle size={16} />,
      chip: "bg-rose-50 text-rose-700 border-rose-200",
      border: "border-l-rose-500",
      glow: "shadow-[0_0_0_1px_rgba(244,63,94,0.15),0_10px_30px_rgba(244,63,94,0.10)]",
    };
  }
  return {
    label: "Pending",
    icon: <Clock size={16} />,
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    border: "border-l-amber-500",
    glow: "shadow-[0_0_0_1px_rgba(245,158,11,0.15),0_10px_30px_rgba(245,158,11,0.10)]",
  };
};

const getReasonTone = (reason) => {
  const r = (reason || "").toLowerCase();
  if (r.includes("fraud") || r.includes("scam")) return "bg-rose-50 text-rose-700 border-rose-200";
  if (r.includes("offensive") || r.includes("abuse")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (r.includes("duplicate")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (r.includes("sold")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
};

const Chip = ({ icon, label, value, className = "" }) => (
  <div
    className={cx(
      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:text-sm bg-white/70 backdrop-blur",
      className
    )}
  >
    <span className="opacity-80">{icon}</span>
    <span className="text-gray-600 font-medium">{label}:</span>
    <span className="text-gray-900 font-semibold">{value}</span>
  </div>
);

const PillTag = ({ icon, text, className = "" }) => (
  <span
    className={cx(
      "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border bg-white/70 backdrop-blur",
      className
    )}
  >
    {icon}
    {text}
  </span>
);

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-2xl bg-white/70 backdrop-blur border border-[#2E3192]/10 flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-extrabold text-[#1A1D64] leading-tight">{title}</h3>
        {subtitle ? <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p> : null}
      </div>
    </div>

    {/* Thin gradient divider line */}
    <div className="hidden sm:block flex-1 mt-5 h-[2px] rounded-full bg-gradient-to-r from-[#2E3192]/0 via-[#2E3192]/30 to-[#2E3192]/0" />
  </div>
);

const Skeleton = ({ className = "" }) => (
  <div className={cx("animate-pulse rounded-xl bg-gray-200/70", className)} />
);

const ProofModal = ({ open, onClose, fileUrl }) => {
  const isPdf = useMemo(() => {
    if (!fileUrl) return false;
    const lower = String(fileUrl).toLowerCase();

    try {
      const url = new URL(fileUrl);
      const path = url.pathname.toLowerCase();
      const ext = path.split(".").pop();
      if (ext === "pdf") return true;
      if (path.includes("/raw/") && path.includes(".pdf")) return true;
      const format = url.searchParams.get("format");
      if (format && format.toLowerCase() === "pdf") return true;
    } catch {
      // ignore URL parsing errors, fall back to string checks
    }

    return lower.includes(".pdf") || lower.includes("format=pdf");
  }, [fileUrl]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-white/30"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2E3192]/10">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#2E3192]" />
                <p className="font-bold text-[#1A1D64]">Proof Preview</p>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="p-4 sm:p-6 bg-gradient-to-br from-white via-white to-[#E9EDFF]/40">
              {!fileUrl ? (
                <div className="h-56 grid place-items-center text-gray-500">No proof found</div>
              ) : isPdf ? (
                <div className="rounded-2xl overflow-hidden border border-[#2E3192]/10 bg-white">
                  <object
                    data={fileUrl}
                    type="application/pdf"
                    className="w-full h-[70vh]"
                  >
                    <div className="h-[70vh] grid place-items-center text-gray-600 px-6 text-center">
                      <div>
                        <p className="font-semibold text-[#1A1D64]">
                          PDF preview is not available here.
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Use the button below to open it in a new tab.
                        </p>
                      </div>
                    </div>
                  </object>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden border border-[#2E3192]/10 bg-white">
                  <img
                    src={fileUrl}
                    alt="Proof"
                    className="w-full max-h-[70vh] object-contain"
                  />
                </div>
              )}

              {fileUrl ? (
                <div className="mt-4 flex justify-end">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#2E3192] text-white font-semibold hover:bg-[#1F2370] shadow"
                  >
                    Open in new tab
                  </a>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

const AdminReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Proof UI
  const [proofOpen, setProofOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  /* =====================================================
     FETCH REPORT (ADMIN AUTH REQUIRED)
  ===================================================== */
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await adminApi.get(`/reports/${id}`);
        setReport(res.data?.data);
      } catch (err) {
        console.error("Fetch Report Error:", err);
        Swal.fire("Error", "Could not load report details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  useEffect(() => {
    if (report && typeof report.adminNote === "string") {
      setAdminNote(report.adminNote);
    }
  }, [report]);

  const ad = useMemo(() => {
    const r = report || {};
    return typeof r.adId === "object" && r.adId !== null ? r.adId : {};
  }, [report]);

  const adIdValue = useMemo(() => {
    if (!report) return "—";
    return typeof report.adId === "string" ? report.adId : ad._id || "—";
  }, [report, ad]);

  const statusMeta = useMemo(() => getStatusMeta(report?.status), [report?.status]);

  /* =====================================================
     UPDATE REPORT STATUS
  ===================================================== */
  const updateStatus = async (status) => {
    try {
      const confirm = await Swal.fire({
        title: `Mark as ${status}?`,
        text: "This will update report status for moderation tracking.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#2E3192",
        cancelButtonColor: "#e11d48",
      });

      if (!confirm.isConfirmed) return;

      await adminApi.put(`/reports/${id}/status`, { status, adminNote });
      setReport((prev) => ({ ...prev, status }));

      Swal.fire("Success", `Report ${status}`, "success");
    } catch (error) {
      console.error("Update Status Error:", error);
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  /* =====================================================
     DELETE REPORTED AD (RESOLVE REPORT)
  ===================================================== */
  const handleDeleteAd = async () => {
    const previous = report;
    try {
      const confirm = await Swal.fire({
        title: "Delete the reported ad?",
        text: "This will remove the ad from the marketplace and resolve this report.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2E3192",
        cancelButtonColor: "#e11d48",
      });

      if (!confirm.isConfirmed) return;

      setReport((prev) => ({
        ...prev,
        status: "Approved",
        _timeline: {
          ...(prev?._timeline || {}),
          adDeletedAt: new Date().toISOString(),
        },
      }));

      const res = await adminApi.delete(`/reports/${id}/delete-ad`, {
        data: { adminNote },
      });

      const message = res?.data?.message || "Ad deleted & report resolved";
      Swal.fire("Success", message, "success");
    } catch (error) {
      setReport(previous);
      console.error("Delete Ad Error:", error);
      Swal.fire("Error", "Failed to delete ad", "error");
    }
  };

  /* =====================================================
     DELETE REPORT (OPTIONAL)
  ===================================================== */
  const handleDeleteReport = async () => {
    try {
      const confirm = await Swal.fire({
        title: "Delete this report?",
        text: "Not recommended in real-world moderation (audit trail), but you can remove it.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2E3192",
        cancelButtonColor: "#e11d48",
      });

      if (!confirm.isConfirmed) return;

      await adminApi.delete(`/reports/${id}`);

      Swal.fire("Deleted", "Report removed", "success");
      navigate("/admin/reports");
    } catch (error) {
      console.error("Delete Report Error:", error);
      Swal.fire("Error", "Failed to delete report", "error");
    }
  };

  /* =====================================================
     Skeleton Loading (subtle)
  ===================================================== */
  if (loading) {
    return (
      <section
        className="min-h-screen bg-gradient-to-br from-[#E9EDFF] via-white to-[#F4F6FF] py-10 px-6"
        style={{
          fontFamily: 'Bahnschrift, "Segoe UI", Tahoma, Arial, sans-serif',
          fontSize: "18px",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-[#1A1D64]">
            <ArrowLeft size={18} />
            <span className="font-semibold">Back</span>
          </div>

          <div className="bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl p-6 sm:p-8 border border-[#2E3192]/10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-60 h-60 bg-[#2E3192]/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#1A1D64]/20 blur-[130px] rounded-full"></div>

            {/* Sticky Action Bar Skeleton */}
            <div className="sticky top-0 z-20 -mx-6 sm:-mx-8 px-6 sm:px-8 py-4 bg-white/85 backdrop-blur border-b border-[#2E3192]/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Skeleton className="h-7 w-72" />
                  <Skeleton className="h-4 w-56 mt-2" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Skeleton className="h-10 w-28 rounded-xl" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
                  <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-6">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="md:col-span-2 space-y-3">
                  <Skeleton className="h-6 w-72" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-28 w-full rounded-xl mt-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!report) {
    return (
      <div
        className="h-screen flex items-center justify-center text-gray-500"
        style={{
          fontFamily: 'Bahnschrift, "Segoe UI", Tahoma, Arial, sans-serif',
          fontSize: "18px",
        }}
      >
        Report Not Found
      </div>
    );
  }

  // CSS variables (consistent theming)
  const cssVars = {
    "--primary": "#2E3192",
    "--primaryDark": "#1F2370",
    "--danger": "#e11d48",
    "--success": "#16a34a",
    "--warning": "#f59e0b",
    "--neutral": "#64748b",
  };

  // Timeline data (best-effort)
  const createdAt = report?.createdAt;
  const updatedAt = report?.updatedAt;
  const adDeletedAt = report?._timeline?.adDeletedAt || ad?.deletedAt || null;

  const timelineSteps = [
    {
      key: "created",
      title: "Report created",
      time: formatDateTime(createdAt),
      icon: <Clock size={16} className="text-[#2E3192]" />,
      done: !!createdAt,
    },
    {
      key: "updated",
      title: "Status updated",
      time: formatDateTime(updatedAt),
      icon: <CheckCircle size={16} className="text-[#2E3192]" />,
      done: !!updatedAt && updatedAt !== createdAt,
    },
    {
      key: "deleted",
      title: "Ad deleted (if applicable)",
      time: adDeletedAt ? formatDateTime(adDeletedAt) : "Not deleted",
      icon: <Trash2 size={16} className="text-[#2E3192]" />,
      done: !!adDeletedAt,
    },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 14 },
    show: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, delay: 0.06 * i },
    }),
  };

  return (
    <section
      className="min-h-screen bg-gradient-to-br from-[#E9EDFF] via-white to-[#F4F6FF] py-10 px-6"
      style={{
        ...cssVars,
        fontFamily: 'Poppins, "Segoe UI", Tahoma, Arial, sans-serif',
        fontSize: "18px",
      }}
    >
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-[#1A1D64] hover:text-[#2E3192]"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cx(
          "max-w-4xl mx-auto bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl p-0 border border-[#2E3192]/10 relative overflow-hidden",
          "border-l-4",
          statusMeta.border,
          statusMeta.glow
        )}
      >
        {/* Floating Glow */}
        <div className="absolute top-0 left-0 w-60 h-60 bg-[#2E3192]/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#1A1D64]/20 blur-[130px] rounded-full"></div>

        {/* =====================================================
           STICKY ACTION BAR (Approve/Reject + Delete)
        ===================================================== */}
        <div className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-[#2E3192]/10 px-6 sm:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D64] leading-snug">
                Report — {report.adTitle || ad.title || "Untitled Ad"}
              </h2>

              <p className="text-gray-600 text-sm mt-1">
                Reported by{" "}
                <span className="font-semibold text-[#1F2370]">
                  {report.reporterName}
                </span>{" "}
                ({report.reporterId})
              </p>

              <p className="text-xs text-gray-400 mt-1">Report ID: {report._id}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateStatus("Approved")}
                className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-center gap-2 hover:bg-green-100"
              >
                <CheckCircle size={18} /> Approve
              </button>

              <button
                onClick={() => updateStatus("Rejected")}
                className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-2 hover:bg-rose-100"
              >
                <XCircle size={18} /> Reject
              </button>

              <button
                onClick={handleDeleteAd}
                className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl flex items-center gap-2 hover:bg-gray-100"
              >
                <Trash2 size={18} /> Delete Ad
              </button>

              <button
                onClick={handleDeleteReport}
                className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl flex items-center gap-2 hover:bg-gray-100"
                title="Not recommended (audit trail)."
              >
                <Trash2 size={18} /> Delete Report
              </button>
            </div>
          </div>

          {/* Quick status chip row */}
          <div className="mt-4 flex flex-wrap gap-2">
            <PillTag
              icon={statusMeta.icon}
              text={statusMeta.label}
              className={cx("border", statusMeta.chip)}
            />
            <PillTag
              icon={<ShieldAlert size={16} className="opacity-80" />}
              text={report.reason || "—"}
              className={cx("border", getReasonTone(report.reason))}
            />
            {ad?.category ? (
              <PillTag
                icon={<Tag size={16} className="opacity-80" />}
                text={ad.category}
                className="border bg-slate-50 text-slate-700 border-slate-200"
              />
            ) : null}
          </div>
        </div>

        {/* Content Padding */}
        <div className="relative z-10 px-6 sm:px-8 py-8">
          {/* =====================================================
             DATA CHIPS (Scannable)
          ===================================================== */}
          <motion.div
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              <Chip
                icon={<ShieldAlert size={16} className="text-[#2E3192]" />}
                label="Reason"
                value={report.reason || "—"}
                className={cx("border", getReasonTone(report.reason))}
              />
              <Chip
                icon={<CheckCheck size={16} className="text-[#2E3192]" />}
                label="Status"
                value={statusMeta.label}
                className={cx("border", statusMeta.chip)}
              />
              <Chip
                icon={<MapPin size={16} className="text-[#2E3192]" />}
                label="Location"
                value={typeof ad.location === "string" ? ad.location : "—"}
                className="border border-[#2E3192]/10"
              />
              <Chip
                icon={<Banknote size={16} className="text-[#2E3192]" />}
                label="Price"
                value={`MK ${formatINR(ad.price)}`}
                className="border border-[#2E3192]/10"
              />
              <Chip
                icon={<User size={16} className="text-[#2E3192]" />}
                label="Seller"
                value={ad.ownerName || "N/A"}
                className="border border-[#2E3192]/10"
              />
            </div>
          </motion.div>

          {/* =====================================================
             REPORT CARD (Accent border already on container)
          ===================================================== */}
          <motion.div
            custom={1}
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="mb-6 bg-white/60 backdrop-blur-xl border border-[#2E3192]/10 p-5 rounded-2xl shadow-sm"
          >
            <SectionHeader
              icon={<AlertTriangle size={18} className="text-[#2E3192]" />}
              title="Report Details"
              subtitle="Moderator context and user provided message"
            />

            <div className="mt-5">
              <h4 className="text-sm font-semibold text-[#1A1D64]">Message</h4>
              <p className="text-gray-800 mt-1 leading-relaxed">{report.message}</p>

              <div className="mt-4">
                <label className="text-sm font-semibold text-[#1A1D64] block mb-2">
                  Admin Note
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add an internal note for this report..."
                  rows={3}
                  className="w-full rounded-xl border border-[#2E3192]/10 bg-white/80 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/30"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <PillTag
                  icon={<ShieldAlert size={16} className="opacity-80" />}
                  text={report.reason || "—"}
                  className={cx("border", getReasonTone(report.reason))}
                />
                {ad?.category ? (
                  <PillTag
                    icon={<Tag size={16} className="opacity-80" />}
                    text={ad.category}
                    className="border bg-slate-50 text-slate-700 border-slate-200"
                  />
                ) : null}
              </div>
            </div>
          </motion.div>

          {/* =====================================================
             PROOF PREVIEW CARD (thumbnail + modal)
          ===================================================== */}
          <motion.div
            custom={2}
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="mb-6 bg-white/60 backdrop-blur-xl border border-[#2E3192]/10 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-5">
              <SectionHeader
                icon={<FileText size={18} className="text-[#2E3192]" />}
                title="Proof Attachment"
                subtitle="Preview uploaded evidence (image/pdf)"
              />

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-600">
                    {report.fileUrl ? (
                      <>
                        Attached file is available. Click preview to open in modal.
                        <div className="mt-2 text-xs text-gray-400 break-all">
                          {report.fileUrl}
                        </div>
                      </>
                    ) : (
                      "No proof attached for this report."
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {report.fileUrl ? (
                      <>
                        <button
                          onClick={() => setProofOpen(true)}
                          className="px-4 py-2 rounded-xl bg-[#2E3192] text-white font-semibold hover:bg-[#1F2370] shadow inline-flex items-center gap-2"
                        >
                          <Eye size={18} /> Preview Proof
                        </button>
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
                        >
                          <FileText size={18} /> Open Link
                        </a>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Thumbnail card */}
                <motion.div
                  whileHover={{ y: -2 }}
                  className="rounded-2xl border border-[#2E3192]/10 bg-white/70 backdrop-blur overflow-hidden shadow-sm"
                >
                  <div className="p-3 flex items-center gap-2 border-b border-[#2E3192]/10">
                    <ImageIcon size={16} className="text-[#2E3192]" />
                    <p className="text-sm font-bold text-[#1A1D64]">Preview</p>
                  </div>

                  <div className="p-3">
                    {!report.fileUrl ? (
                      <div className="h-36 rounded-xl bg-gray-100 grid place-items-center text-gray-400">
                        No proof
                      </div>
                    ) : report.fileUrl.toLowerCase().includes(".pdf") ? (
                      <div className="h-36 rounded-xl bg-gray-100 grid place-items-center text-gray-500">
                        PDF attached
                      </div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-xl overflow-hidden border border-[#2E3192]/10"
                      >
                        <img
                          src={report.fileUrl}
                          alt="Proof thumbnail"
                          className="w-full h-36 object-cover"
                        />
                      </motion.div>
                    )}

                    {report.fileUrl ? (
                      <button
                        onClick={() => setProofOpen(true)}
                        className="mt-3 w-full px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
                      >
                        Open Modal
                      </button>
                    ) : null}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* =====================================================
             TIMELINE BLOCK
          ===================================================== */}
          <motion.div
            custom={3}
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="mb-6 bg-white/60 backdrop-blur-xl border border-[#2E3192]/10 p-5 rounded-2xl shadow-sm"
          >
            <SectionHeader
              icon={<Clock size={18} className="text-[#2E3192]" />}
              title="Timeline"
              subtitle="Moderation journey for this report"
            />

            <div className="mt-5 space-y-3">
              {timelineSteps.map((step, idx) => (
                <div key={step.key} className="flex items-start gap-3">
                  <div
                    className={cx(
                      "w-9 h-9 rounded-2xl border flex items-center justify-center bg-white/70 backdrop-blur shadow-sm",
                      step.done ? "border-[#2E3192]/10" : "border-gray-200"
                    )}
                  >
                    {step.icon}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#1A1D64]">
                      {idx + 1}. {step.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">{step.time}</p>
                  </div>

                  <div
                    className={cx(
                      "px-3 py-1 rounded-full text-xs font-bold border",
                      step.done
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    )}
                  >
                    {step.done ? "Done" : "Pending"}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* =====================================================
             AD DETAILS (Card sections, micro animations, hover lift, image zoom)
          ===================================================== */}
          <motion.div
            custom={4}
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            className="border-t border-[#2E3192]/10 pt-6 mt-6"
          >
            <SectionHeader
              icon={<ImageIcon size={18} className="text-[#2E3192]" />}
              title="Reported Ad Information"
              subtitle="Preview listing context before action"
            />

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* IMAGE */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
                className="rounded-2xl overflow-hidden shadow-md border border-[#2E3192]/10 bg-white/70 backdrop-blur"
              >
                {Array.isArray(ad.images) && ad.images.length > 0 ? (
                  <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.25 }}>
                    <img
                      src={ad.images[0]}
                      alt={ad.title || "Ad image"}
                      className="w-full h-48 object-cover"
                    />
                  </motion.div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 grid place-items-center text-gray-400">
                    No Image
                  </div>
                )}
              </motion.div>

              {/* DETAILS */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
                className="md:col-span-2 bg-white/60 backdrop-blur-xl border border-[#2E3192]/10 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <p className="text-xl font-semibold text-[#1F2370]">
                    {ad.title || report.adTitle}
                  </p>

                  {/* mini status chip */}
                  <span className={cx("px-3 py-1 rounded-full text-xs font-bold border", statusMeta.chip)}>
                    {statusMeta.label}
                  </span>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {ad.description || "No description available."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <PillTag
                    icon={<Banknote size={16} className="opacity-80" />}
                    text={`MK ${formatINR(ad.price)}`}
                    className="border border-[#2E3192]/10 bg-white/70"
                  />
                  <PillTag
                    icon={<MapPin size={16} className="opacity-80" />}
                    text={`Location: ${typeof ad.location === "string" ? ad.location : "—"}`}
                    className="border border-[#2E3192]/10 bg-white/70 text-gray-700"
                  />
                  <PillTag
                    icon={<Tag size={16} className="opacity-80" />}
                    text={`Ad ID: ${adIdValue}`}
                    className="border border-[#2E3192]/10 bg-white/70 text-gray-700"
                  />
                </div>

                {/* SELLER INFO */}
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 240, damping: 20 }}
                  className="mt-5 p-4 bg-white/70 backdrop-blur-xl border border-[#2E3192]/10 rounded-2xl shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold text-[#1A1D64] mb-2 flex items-center gap-2">
                      <User size={16} className="text-[#2E3192]" />
                      Seller Information
                    </h4>
                    <div className="h-[2px] flex-1 rounded-full bg-gradient-to-r from-[#2E3192]/0 via-[#2E3192]/25 to-[#2E3192]/0 mt-2" />
                  </div>

                  <p className="text-gray-700">👤 {ad.ownerName || "N/A"}</p>
                  <p className="flex items-center gap-2 text-gray-700 mt-1">
                    <Mail size={14} /> {ad.ownerEmail || "N/A"}
                  </p>
                  <p className="flex items-center gap-2 text-gray-700 mt-1">
                    <Phone size={14} /> {ad.ownerPhone || "N/A"}
                  </p>
                </motion.div>

                {/* LINKS */}
                {report.fileUrl ? (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => setProofOpen(true)}
                      className="px-4 py-2 border border-gray-200 rounded-xl flex items-center gap-2 hover:bg-gray-50 text-gray-700 font-semibold"
                    >
                      <FileText size={18} /> View Proof
                    </button>
                  </div>
                ) : null}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Proof Modal */}
      <ProofModal
        open={proofOpen}
        onClose={() => setProofOpen(false)}
        fileUrl={report.fileUrl}
      />
    </section>
  );
};

export default AdminReportDetail;
