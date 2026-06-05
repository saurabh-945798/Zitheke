import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeftRight,
  Banknote,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Filter,
  Layers3,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  getSubscriptionAnalyticsPayments,
  getSubscriptionAnalyticsPlans,
  getSubscriptionAnalyticsSubscriptions,
  getSubscriptionAnalyticsSummary,
} from "../../api/adminSubscriptionAnalyticsApi";

const DEFAULT_FILTERS = {
  search: "",
  status: "",
  paymentStatus: "",
  planId: "",
  startDate: "",
  endDate: "",
};

const SUMMARY_CARDS = [
  { key: "totalUsers", label: "Total Users", icon: Users },
  { key: "totalSubscriptions", label: "Total Subscriptions", icon: Layers3 },
  { key: "totalSubscribedUsers", label: "Subscribed Users", icon: ArrowLeftRight },
  { key: "activeSubscriptions", label: "Active Subscriptions", icon: CheckCircle2 },
  { key: "pendingSubscriptions", label: "Pending Subscriptions", icon: Clock3 },
  { key: "expiredSubscriptions", label: "Expired Subscriptions", icon: CalendarRange },
  { key: "totalRevenueCollected", label: "Total Revenue Collected", icon: Wallet, currency: true },
  { key: "thisMonthRevenue", label: "This Month Revenue", icon: Banknote, currency: true },
  { key: "successfulPayments", label: "Successful Payments", icon: CreditCard },
  { key: "pendingPayments", label: "Pending Payments", icon: LoaderCircle },
  { key: "failedPayments", label: "Failed Payments", icon: XCircle },
  { key: "pendingVerificationPayments", label: "Pending Verification", icon: ShieldAlert },
];

const currencyFormatter = (value, currency = "MWK") => {
  const amount = Number(value || 0);
  return `${currency} ${amount.toLocaleString("en-MW")}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadgeClass = (status, fallbackLabel = "") => {
  const normalized = String(status || fallbackLabel || "").toLowerCase();

  if (normalized === "active" || normalized === "paid" || normalized === "verified") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }
  if (
    normalized === "pending" ||
    normalized === "payment pending" ||
    normalized === "initiated"
  ) {
    return "bg-amber-50 text-amber-700 border border-amber-200";
  }
  if (normalized === "pending_verification") {
    return "bg-blue-50 text-blue-700 border border-blue-200";
  }
  if (normalized === "expired") {
    return "bg-slate-100 text-slate-700 border border-slate-200";
  }
  if (normalized === "cancelled" || normalized === "failed") {
    return "bg-rose-50 text-rose-700 border border-rose-200";
  }

  return "bg-slate-50 text-slate-700 border border-slate-200";
};

const getSubscriptionStatusLabel = (subscriptionStatus) => {
  if (String(subscriptionStatus || "").toLowerCase() === "pending") {
    return "Payment Pending";
  }
  return subscriptionStatus || "-";
};

const buildErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const RevenueSubscriptions = () => {
  const [summary, setSummary] = useState(null);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [paymentsMeta, setPaymentsMeta] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [plansError, setPlansError] = useState("");
  const [tableError, setTableError] = useState("");

  const subscriptionStatuses = useMemo(
    () => ["active", "pending", "expired", "cancelled"],
    []
  );
  const paymentStatuses = useMemo(
    () => ["paid", "pending", "pending_verification", "failed", "expired"],
    []
  );

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      setSummaryLoading(true);
      setSummaryError("");
      try {
        const data = await getSubscriptionAnalyticsSummary();
        if (!isMounted) return;
        setSummary(data);
      } catch (error) {
        if (!isMounted) return;
        setSummaryError(
          buildErrorMessage(
            error,
            "Unable to load subscription analytics summary."
          )
        );
      } finally {
        if (isMounted) setSummaryLoading(false);
      }
    };

    const loadPlans = async () => {
      setPlansLoading(true);
      setPlansError("");
      try {
        const planRows = await getSubscriptionAnalyticsPlans();
        if (!isMounted) return;
        setPlans(planRows);
      } catch (error) {
        if (!isMounted) return;
        setPlansError(
          buildErrorMessage(error, "Unable to load plan analytics.")
        );
      } finally {
        if (isMounted) setPlansLoading(false);
      }
    };

    const loadPaymentsMeta = async () => {
      try {
        const paymentsResponse = await getSubscriptionAnalyticsPayments({
          page: 1,
          limit: 1,
        });
        if (!isMounted) return;
        setPaymentsMeta(paymentsResponse?.pagination || null);
      } catch {
        if (!isMounted) return;
        setPaymentsMeta(null);
      }
    };

    loadSummary();
    loadPlans();
    loadPaymentsMeta();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSubscriptions = async () => {
      setTableLoading(true);
      setTableError("");
      try {
        const query = {
          page: pagination.page,
          limit: pagination.limit,
        };

        Object.entries(filters).forEach(([key, value]) => {
          if (value) query[key] = value;
        });

        const response = await getSubscriptionAnalyticsSubscriptions(query);
        if (!isMounted) return;
        setSubscriptions(response.items);
        setPagination((current) => ({
          ...current,
          ...(response.pagination || {}),
        }));
      } catch (error) {
        if (!isMounted) return;
        setTableError(
          buildErrorMessage(error, "Unable to load subscription records.")
        );
      } finally {
        if (isMounted) setTableLoading(false);
      }
    };

    loadSubscriptions();

    return () => {
      isMounted = false;
    };
  }, [filters, pagination.page, pagination.limit]);

  const updateFilter = (key, value) => {
    setPagination((current) => ({ ...current, page: 1 }));
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const pageLabel = `${pagination.page} / ${pagination.totalPages || 1}`;

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#E9EDFF] via-white to-[#F4F6FF] py-10 px-6 font-[Poppins]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-[#E9EDFF] text-[#1F2370] border border-white/60">
              <Wallet className="w-4 h-4" />
              Admin Analytics
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-[#1A1D64] tracking-tight">
              Revenue &amp; Subscriptions
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Track subscription users, payment status, and collected revenue.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full bg-white/80 border border-gray-200 text-sm text-[#1A1D64] shadow-sm">
              Payments tracked: {paymentsMeta?.total || 0}
            </span>
            <span className="px-4 py-2 rounded-full bg-[#FFF7E0] border border-[#F4B400]/30 text-sm text-[#8A6414] shadow-sm">
              Active plans: {plans.filter((plan) => plan?.isActive).length}
            </span>
          </div>
        </div>

        {summaryError ? (
          <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-lg text-rose-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold">Summary unavailable</p>
              <p className="text-sm">{summaryError}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {SUMMARY_CARDS.map(({ key, label, icon: Icon, currency }) => (
              <div
                key={key}
                className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl p-5 shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-2 text-2xl font-extrabold text-[#1A1D64]">
                      {summaryLoading
                        ? "..."
                        : currency
                        ? currencyFormatter(summary?.[key])
                        : Number(summary?.[key] || 0).toLocaleString("en-MW")}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-[#2E3192]/10 border border-[#2E3192]/20 flex items-center justify-center text-[#1F2370]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-3xl bg-white/80 backdrop-blur-xl shadow-xl border border-gray-200/70 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200/70">
            <h2 className="text-xl font-bold text-[#1A1D64]">
              Plan-wise Subscription Stats
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Backend-backed plan performance and revenue by premium tier.
            </p>
          </div>

          {plansError ? (
            <div className="p-6 text-rose-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-semibold">Plan analytics unavailable</p>
                <p className="text-sm">{plansError}</p>
              </div>
            </div>
          ) : plansLoading ? (
            <div className="p-6 text-sm text-gray-500">Loading plan statistics...</div>
          ) : plans.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No plan analytics found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F8FAFF] text-left text-[#1A1D64]">
                  <tr>
                    {[
                      "Plan Name",
                      "Price",
                      "Currency",
                      "Duration Days",
                      "Total Subscriptions",
                      "Active Users",
                      "Pending Users",
                      "Expired Users",
                      "Cancelled Users",
                      "Successful Payments",
                      "Revenue Collected",
                    ].map((heading) => (
                      <th key={heading} className="px-4 py-3 font-semibold whitespace-nowrap">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.planId} className="border-t border-gray-200/70">
                      <td className="px-4 py-3 font-semibold text-[#1A1D64] whitespace-nowrap">
                        {plan.planName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {Number(plan.price || 0).toLocaleString("en-MW")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{plan.currency || "MWK"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{plan.durationDays ?? "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{plan.totalSubscriptions ?? 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{plan.activeUsers ?? 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{plan.pendingUsers ?? 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{plan.expiredUsers ?? 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{plan.cancelledUsers ?? 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{plan.successfulPayments ?? 0}</td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">
                        {currencyFormatter(plan.revenueCollected, plan.currency || "MWK")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white/80 backdrop-blur-xl shadow-xl border border-gray-200/70 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200/70">
            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#1A1D64]">
                  User Subscription Records
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Pending subscriptions remain labeled as payment pending until real activation.
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Showing {subscriptions.length} of {pagination.total || 0} records
              </div>
            </div>
          </div>

          <div className="px-6 py-5 border-b border-gray-200/70">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
              <label className="relative xl:col-span-2">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={filters.search}
                  onChange={(event) => updateFilter("search", event.target.value)}
                  placeholder="Search name, email, phone"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
                />
              </label>

              <select
                value={filters.status}
                onChange={(event) => updateFilter("status", event.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
              >
                <option value="">All subscription statuses</option>
                {subscriptionStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={filters.paymentStatus}
                onChange={(event) => updateFilter("paymentStatus", event.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
              >
                <option value="">All payment statuses</option>
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={filters.planId}
                onChange={(event) => updateFilter("planId", event.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
              >
                <option value="">All plans</option>
                {plans.map((plan) => (
                  <option key={plan.planId} value={plan.planId}>
                    {plan.planName}
                  </option>
                ))}
              </select>

              <div className="flex flex-col sm:flex-row gap-3 xl:col-span-6">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(event) => updateFilter("startDate", event.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => updateFilter("endDate", event.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
                />
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-[#2E3192]/20 text-[#2E3192] hover:bg-[#E9EDFF] transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 pt-5">
            {tableError ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <div>
                  <p className="font-medium">Subscription table unavailable</p>
                  <p>{tableError}</p>
                </div>
              </div>
            ) : tableLoading ? (
              <div className="py-8 text-sm text-gray-500">Loading subscription records...</div>
            ) : subscriptions.length === 0 ? (
              <div className="py-8 text-sm text-gray-500">No subscription records match the selected filters.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#F8FAFF] text-left text-[#1A1D64]">
                      <tr>
                        {[
                          "User Name",
                          "Email",
                          "Phone",
                          "Plan",
                          "Subscription Status",
                          "Payment Status",
                          "Verification Status",
                          "Amount Paid",
                          "Currency",
                          "Start Date",
                          "End Date",
                          "Activated At",
                          "Transaction ID",
                          "Created At",
                        ].map((heading) => (
                          <th key={heading} className="px-4 py-3 font-semibold whitespace-nowrap">
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((item) => {
                        const subscriptionLabel = getSubscriptionStatusLabel(
                          item.subscriptionStatus
                        );
                        return (
                          <tr
                            key={item.subscriptionId}
                            className="border-t border-gray-200/70 align-top"
                          >
                            <td className="px-4 py-3 min-w-[180px] font-semibold text-[#1A1D64]">
                              {item.name || "-"}
                            </td>
                            <td className="px-4 py-3 min-w-[220px]">{item.email || "-"}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{item.phone || "-"}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{item.planName || "-"}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(item.subscriptionStatus, subscriptionLabel)}`}>
                                {subscriptionLabel}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(item.paymentStatus)}`}>
                                {item.paymentStatus || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(item.paymentVerificationStatus)}`}>
                                {item.paymentVerificationStatus || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {Number(item.amountPaid || 0).toLocaleString("en-MW")}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{item.currency || "MWK"}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.startDate)}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.endDate)}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.activatedAt)}</td>
                            <td className="px-4 py-3 min-w-[180px] break-all">
                              {item.gatewayTransactionId || item.merchantTransactionId || "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-gray-500 inline-flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Page {pageLabel}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                      disabled={pagination.page <= 1}
                      onClick={() =>
                        setPagination((current) => ({
                          ...current,
                          page: Math.max(1, current.page - 1),
                        }))
                      }
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                      disabled={pagination.page >= (pagination.totalPages || 1)}
                      onClick={() =>
                        setPagination((current) => ({
                          ...current,
                          page: Math.min(
                            current.totalPages || 1,
                            current.page + 1
                          ),
                        }))
                      }
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default RevenueSubscriptions;
