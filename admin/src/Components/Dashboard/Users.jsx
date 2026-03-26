import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShieldCheck,
  Ban,
  Eye,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Calendar,
  User as UserIcon,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Mail,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import Swal from "sweetalert2";
import adminApi from "../../api/adminApi.js";

const fallbackImage =
  "https://res.cloudinary.com/dxah12xl4/image/upload/v1731010204/default_user.png";

const statCards = [
  {
    key: "total",
    label: "Total Users",
    description: "All registered marketplace accounts",
    icon: UsersIcon,
    tone: "bg-[#EEF1FF] text-[#2E3192]",
  },
  {
    key: "active",
    label: "Active Users",
    description: "Accounts currently allowed to use the platform",
    icon: UserCheck,
    tone: "bg-green-100 text-green-700",
  },
  {
    key: "suspended",
    label: "Suspended Users",
    description: "Accounts restricted by admin review",
    icon: UserX,
    tone: "bg-red-100 text-red-700",
  },
  {
    key: "verified",
    label: "Verified Users",
    description: "Users with verified account status",
    icon: ShieldCheck,
    tone: "bg-slate-900 text-white",
  },
];

const getInitials = (name = "User") =>
  String(name)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const statusPill = (status) =>
  status === "Suspended"
    ? "bg-red-100 text-red-700"
    : "bg-green-100 text-green-700";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminApi.get("/users");
        setUsers(res.data?.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(normalized) ||
        user.email?.toLowerCase().includes(normalized) ||
        user.location?.toLowerCase().includes(normalized)
    );
  }, [search, users]);

  const handleStatusChange = async (id, name, status) => {
    Swal.fire({
      title: `${status === "Suspended" ? "Ban" : "Unban"} ${name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      confirmButtonColor: status === "Suspended" ? "#d32f2f" : "#2E3192",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminApi.put(`/users/${id}/${status === "Suspended" ? "ban" : "unban"}`);
          setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, status } : u)));
          setSelectedUser((prev) => (prev?._id === id ? { ...prev, status } : prev));
          Swal.fire(
            "Updated!",
            `User ${status === "Suspended" ? "banned" : "unbanned"} successfully.`,
            "success"
          );
        } catch (err) {
          Swal.fire("Error", err.message, "error");
        }
      }
    });
  };

  const handleView = async (id) => {
    try {
      const res = await adminApi.get(`/users/${id}`);
      setSelectedUser(res.data?.user || res.data);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const suspendedUsers = users.filter((u) => u.status === "Suspended").length;
  const verifiedUsers = users.filter((u) => u.verified).length;

  const statValues = {
    total: totalUsers,
    active: activeUsers,
    suspended: suspendedUsers,
    verified: verifiedUsers,
  };

  return (
    <section className="min-h-screen w-full max-w-full overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(46,49,146,0.14),_transparent_32%),linear-gradient(180deg,#f8faff_0%,#edf2ff_100%)] p-5 font-[Poppins] md:p-7">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 overflow-hidden rounded-[32px] border border-white/70 bg-gradient-to-r from-[#1A1D64] via-[#232780] to-[#2E3192] p-8 text-white shadow-[0_30px_80px_rgba(46,49,146,0.24)]"
      >
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">
              User Administration
            </p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">
              Manage marketplace accounts from one clean, modern control panel.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/78 md:text-base">
              Review user accounts, inspect profile details, and take moderation actions with a simpler and more readable admin experience.
            </p>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur md:min-w-[320px]">
            <div className="flex items-center justify-between text-sm text-white/75">
              <span>Account Health</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                {activeUsers} active
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-white/65">Verified Users</p>
                <p className="mt-2 text-2xl font-bold">{verifiedUsers}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-white/65">Suspended</p>
                <p className="mt-2 text-2xl font-bold">{suspendedUsers}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              whileHover={{ y: -4 }}
              className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-500">{card.label}</h2>
                  <p className="mt-2 text-3xl font-bold text-[#1A1D64]">{statValues[card.key]}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{card.description}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.tone}`}>
                  <Icon size={22} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mb-6 rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF1FF] text-[#2E3192] shadow-sm">
              <LayoutDashboard size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold leading-none text-[#1A1D64]">User Directory</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Search accounts and review moderation state quickly.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              <span className="font-semibold text-[#1A1D64]">{filteredUsers.length}</span>
              <span>users shown</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span>{users.length} total</span>
            </div>
          </div>

          <div className="relative w-full xl:justify-self-end">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search name, email, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3.5 text-sm text-slate-700 outline-none transition focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10"
            />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-hidden rounded-[30px] border border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="max-w-full overflow-hidden">
          <table className="w-full table-fixed text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-500">
                <th className="w-[28%] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]">User</th>
                <th className="w-[28%] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Email</th>
                <th className="w-[16%] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Location</th>
                <th className="w-[12%] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Joined</th>
                <th className="w-[10%] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Status</th>
                <th className="w-[12%] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-14 text-center text-sm font-medium text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, idx) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-slate-100 align-middle last:border-b-0 hover:bg-[#EEF1FF]/35"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {user.photoURL?.includes("res.cloudinary.com") ? (
                          <img
                            src={user.photoURL}
                            alt={user.name}
                            className="h-12 w-12 rounded-2xl border border-[#2E3192]/20 object-cover"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = fallbackImage;
                            }}
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF1FF] font-bold text-[#1A1D64]">
                            {getInitials(user.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#1A1D64]">{user.name || "Unknown User"}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {user.verified ? "Verified account" : "Standard account"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      <span className="block max-w-[280px] truncate">{user.email || "—"}</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      <span className="block max-w-[180px] truncate">{user.location || "—"}</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </td>

                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusPill(user.status)}`}>
                        {user.status === "Suspended" ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        {user.status === "Suspended" ? "Suspended" : "Active"}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-start">
                        <button
                          className="inline-flex min-w-[84px] items-center justify-center gap-2 rounded-xl bg-[#EEF1FF] px-3 py-2 text-sm font-semibold text-[#1F2370] transition hover:bg-[#dbe2ff]"
                          onClick={() => handleView(user._id)}
                        >
                          <Eye size={16} /> View
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-14 text-center">
                    <p className="text-lg font-semibold text-[#1A1D64]">No users found.</p>
                    <p className="mt-2 text-sm text-slate-500">Try a broader search term to see more accounts.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    User Profile
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-[#1A1D64]">{selectedUser.name || "Unknown User"}</h2>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-white"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-[260px_1fr] md:p-8">
                <div className="rounded-[28px] bg-[linear-gradient(180deg,#f7f8ff_0%,#eef2ff_100%)] p-6 text-center">
                  <img
                    src={selectedUser.photoURL?.includes("res.cloudinary.com") ? selectedUser.photoURL : fallbackImage}
                    alt={selectedUser.name}
                    className="mx-auto h-28 w-28 rounded-3xl border border-[#2E3192]/15 object-cover shadow-md"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = fallbackImage;
                    }}
                  />
                  <h3 className="mt-4 text-xl font-semibold text-[#1A1D64]">{selectedUser.name || "Unknown User"}</h3>
                  <p className="mt-1 text-sm text-slate-500">{selectedUser.email || "No email"}</p>
                  <div className="mt-4 flex justify-center">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusPill(selectedUser.status)}`}>
                      {selectedUser.status === "Suspended" ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      {selectedUser.status === "Suspended" ? "Suspended" : "Active"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: Mail,
                      label: "Email Address",
                      value: selectedUser.email || "Not provided",
                    },
                    {
                      icon: MapPin,
                      label: "Location",
                      value: selectedUser.location || "Not provided",
                    },
                    {
                      icon: Phone,
                      label: "Phone Number",
                      value: selectedUser.phone || "N/A",
                    },
                    {
                      icon: Calendar,
                      label: "Joined On",
                      value: selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleDateString()
                        : "N/A",
                    },
                    {
                      icon: UserIcon,
                      label: "Account Type",
                      value: selectedUser.verified ? "Verified User" : "Standard User",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF1FF] text-[#2E3192]">
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                              {item.label}
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#1A1D64]">{item.value}</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Users;
