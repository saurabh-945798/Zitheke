import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import Swal from "sweetalert2";
import adminApi from "../../api/adminApi.js"; // path adjust karo

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const BASE_URL = "http://localhost:5000";
  const fallbackImage =
    "https://res.cloudinary.com/dxah12xl4/image/upload/v1731010204/default_user.png";

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminApi.get("/users");

        if (res.data?.users) {
          setUsers(res.data.users);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Ban / Unban User
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
          await adminApi.put(
            `/users/${id}/${status === "Suspended" ? "ban" : "unban"}`
          );

          setUsers((prev) =>
            prev.map((u) => (u._id === id ? { ...u, status } : u))
          );

          Swal.fire(
            "Updated!",
            `User ${
              status === "Suspended" ? "banned" : "unbanned"
            } successfully.`,
            "success"
          );
        } catch (err) {
          Swal.fire("Error", err.message, "error");
        }
      }
    });
  };

  // View User Details
  const handleView = async (id) => {
    try {
      const res = await adminApi.get(`/users/${id}`);
      setSelectedUser(res.data?.user || res.data);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Dashboard Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const suspendedUsers = users.filter((u) => u.status === "Suspended").length;
  const verifiedUsers = users.filter((u) => u.verified).length;

  return (
    <section className="p-6 md:p-10 bg-gradient-to-br from-[#E9EDFF] via-white to-[#F4F6FF] min-h-screen font-[Poppins]">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-extrabold text-[#1A1D64] mb-2 flex items-center gap-2">
          <UsersIcon className="text-[#2E3192]" /> Users Dashboard
        </h1>
        <p className="text-gray-600">
          Manage accounts, verify users & monitor activity.
        </p>
      </motion.div>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {
            label: "Total Users",
            value: totalUsers,
            icon: <UsersIcon />,
            bg: "from-[#2E3192] to-[#1A1D64]",
          },
          {
            label: "Active Users",
            value: activeUsers,
            icon: <UserCheck />,
            bg: "from-[#2E3192] to-[#1A1D64]",
          },
          {
            label: "Suspended Users",
            value: suspendedUsers,
            icon: <UserX />,
            bg: "from-[#2E3192] to-[#1A1D64]",
          },
          {
            label: "Verified Users",
            value: verifiedUsers,
            icon: <ShieldCheck />,
            bg: "from-[#2E3192] to-[#1A1D64]",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className={`bg-gradient-to-br ${card.bg} text-white p-6 rounded-2xl shadow-xl flex items-center justify-between`}
          >
            <div>
              <h2 className="text-4xl font-bold">{card.value}</h2>
              <p className="text-sm opacity-90">{card.label}</p>
            </div>
            <div className="text-4xl opacity-80">{card.icon}</div>
          </motion.div>
        ))}
      </div>

      {/* SEARCH BAR */}
      <div className="flex justify-start mb-6">
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl px-4 py-3 rounded-xl shadow-lg border border-[#2E3192]/20 w-full md:w-80">
          <Search className="text-[#1A1D64]" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-gray-700 flex-1 bg-transparent"
          />
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="overflow-x-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-[#2E3192]/10">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gradient-to-r from-[#2E3192] to-[#1A1D64] text-white">
              <th className="p-4 text-sm font-semibold">User</th>
              <th className="p-4 text-sm font-semibold">Email</th>
              <th className="p-4 text-sm font-semibold">Location</th>
              <th className="p-4 text-sm font-semibold">Joined</th>
              <th className="p-4 text-sm font-semibold">Status</th>
              <th className="p-4 text-sm font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-6 text-center text-gray-500 font-medium"
                >
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="border-b hover:bg-[#E9EDFF]/40 transition"
                >
                  <td className="p-4 font-medium text-gray-800">
                    <div className="flex items-center gap-3">
                      {user.photoURL?.includes("res.cloudinary.com") ? (
                        <img
                          src={user.photoURL}
                          alt={user.name}
                          className="w-11 h-11 rounded-full border-2 border-[#2E3192]"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#2E3192]/20 text-[#1A1D64] flex items-center justify-center font-bold">
                          {(user.name || "U")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                      {user.name}
                    </div>
                  </td>

                  <td className="p-4 text-gray-700">{user.email}</td>
                  <td className="p-4 text-gray-600">
                    {user.location || "—"}
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "â€”"}
                  </td>

                  <td className="p-4">
                    {user.status === "Suspended" ? (
                      <span className="text-red-600 font-semibold flex items-center gap-1">
                        <XCircle size={16} /> Suspended
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <CheckCircle size={16} /> Active
                      </span>
                    )}
                  </td>

                  <td className="p-4 flex gap-2">
                    <button
                      className="px-3 py-1 bg-[#EEF0FF] text-[#1F2370] rounded-lg hover:bg-[#C7CDFB] flex items-center gap-1 text-sm"
                      onClick={() => handleView(user._id)}
                    >
                      <Eye size={16} /> View
                    </button>

                    <button
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-1 text-sm"
                      onClick={() =>
                        handleStatusChange(user._id, user.name, "Suspended")
                      }
                    >
                      <Ban size={16} /> Ban
                    </button>

                    <button
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-1 text-sm"
                      onClick={() =>
                        handleStatusChange(user._id, user.name, "Active")
                      }
                    >
                      <ShieldCheck size={16} /> Unban
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="p-6 text-center text-gray-500 italic"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* USER VIEW MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white/90 backdrop-blur-xl w-[90%] max-w-md rounded-2xl shadow-2xl p-6 relative border border-[#2E3192]/20"
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
              >
                âœ•
              </button>

              <div className="flex flex-col items-center text-center space-y-3">
                <img
                  src={
                    selectedUser.photoURL?.includes("res.cloudinary.com")
                      ? selectedUser.photoURL
                      : fallbackImage
                  }
                  alt={selectedUser.name}
                  className="w-24 h-24 rounded-full border-4 border-[#2E3192]"
                />

                <h2 className="text-xl font-semibold text-[#1A1D64]">
                  {selectedUser.name}
                </h2>

                <p className="text-gray-500">{selectedUser.email}</p>

                <div className="w-full text-left space-y-2 mt-4">
                  <p className="flex items-center gap-2 text-[#1A1D64]">
                    <MapPin size={16} />{" "}
                    {selectedUser.location || "Not provided"}
                  </p>
                  <p className="flex items-center gap-2 text-[#1A1D64]">
                    <Phone size={16} /> {selectedUser.phone || "N/A"}
                  </p>
                  <p className="flex items-center gap-2 text-[#1A1D64]">
                    <Calendar size={16} /> Joined:{" "}
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                  <p className="flex items-center gap-2 text-[#1A1D64]">
                    <UserIcon size={16} /> Status:{" "}
                    {selectedUser.status === "Suspended"
                      ? "Suspended"
                      : "Active"}
                  </p>
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
