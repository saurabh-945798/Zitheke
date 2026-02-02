import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  MessageCircle,
  Settings,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ðŸ”¥ FIREBASE LOGOUT
import { signOut } from "firebase/auth";
import { auth } from "../../firebase"; // ðŸ” path check kar lena

const AdminSidebar = () => {
  const [open, setOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  /* -----------------------------
     SCREEN SIZE DETECT
  ------------------------------ */
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  /* -----------------------------
     ðŸ” REAL LOGOUT HANDLER
  ------------------------------ */
  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: "Logout?",
      text: "Youâ€™ll be logged out from Zitheke Admin Panel!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3192",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Logout",
      background: "#F8FAFC",
      color: "#1A1D64",
    });

    if (!confirm.isConfirmed) return;

    try {
      // ðŸ”¥ REAL LOGOUT
      await signOut(auth);

      // ðŸ”¥ CLEANUP (SAFE)
      localStorage.clear();
      sessionStorage.clear();

      Swal.fire({
        title: "Logged Out!",
        text: "Admin logged out successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#F8FAFC",
        color: "#1A1D64",
      });

      navigate("/admin-login");
    } catch (error) {
      Swal.fire({
        title: "Logout Failed",
        text: error.message || "Something went wrong",
        icon: "error",
      });
    }
  };

  /* -----------------------------
     MENU CONFIG
  ------------------------------ */
  const menus = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin" },
    {   name: "Inbox",
      icon: <MessageCircle size={20} />,
      path: "/admin/contact-inbox",
    },
    { name: "Users", icon: <Users size={20} />, path: "/admin/users" },
    { name: "Ads", icon: <FolderOpen size={20} />, path: "/admin/ads" },
    { name: "Reports", icon: <AlertTriangle size={20} />, path: "/admin/reports" },
    { name: "Messages", icon: <MessageCircle size={20} />, path: "/admin/messages" },
    {
      name: "Analytics",
      icon: <BarChart3 size={20} />,
      dropdown: true,
      sub: [
        { name: "Overview", path: "/admin/overview" },
        { name: "Category Insights", path: "/admin/category-insight" },
        { name: "User Growth", path: "/admin/user-growth" },
      ],
    },
    { name: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
  ];

  return (
    <>
      {/* MOBILE TOGGLE */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#2E3192] text-white p-2 rounded-lg shadow-md"
      >
        <Menu size={22} />
      </button>

      {/* OVERLAY */}
      <AnimatePresence>
        {open && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{
          x: open ? 0 : isMobile ? -300 : 0,
          width: open ? 260 : isMobile ? 0 : 85,
        }}
        transition={{ duration: 0.35 }}
        className="h-screen fixed left-0 top-0 z-50 
          bg-gradient-to-br from-white via-[#E9EDFF] to-[#C7CDFB]
          shadow-xl text-[#1A1D64] flex flex-col 
          border-r border-gray-200 font-[Poppins]"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200/70">
          <div
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="#F4B400"
              className="w-7 h-7"
            >
              <path d="M21 11l-9-9H3v9l9 9 9-9z" />
            </svg>
            {open && (
              <div className="flex flex-col leading-tight">
                <h1 className="text-xl font-extrabold text-[#2E3192] tracking-tight">
                  Zitheke
                </h1>
                <p className="text-xs font-semibold text-[#F4B400] ml-[4px] mt-[-2px]">
                  Buy. Sell. Connect.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="text-[#1A1D64]/70 hover:text-[#1A1D64]"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto px-3 mt-4 space-y-1">
          {menus.map((menu) =>
            menu.dropdown ? (
              <div key={menu.name}>
                <button
                  onClick={() => setAnalyticsOpen(!analyticsOpen)}
                  className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-[#2E3192]/10"
                >
                  <div className="flex items-center gap-3">
                    {menu.icon}
                    {open && <span>{menu.name}</span>}
                  </div>
                  {open &&
                    (analyticsOpen ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    ))}
                </button>

                {analyticsOpen && open && (
                  <div className="ml-9 mt-2 space-y-2">
                    {menu.sub.map((sub) => (
                      <NavLink
                        key={sub.name}
                        to={sub.path}
                        className={({ isActive }) =>
                          `block text-sm p-2 rounded-lg ${
                            isActive
                              ? "bg-[#2E3192]/20"
                              : "hover:bg-[#2E3192]/10"
                          }`
                        }
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={menu.name}
                to={menu.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 rounded-lg ${
                    isActive
                      ? "bg-[#2E3192]/20"
                      : "hover:bg-[#2E3192]/10"
                  }`
                }
              >
                {menu.icon}
                {open && <span>{menu.name}</span>}
              </NavLink>
            )
          )}
        </nav>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 mb-3 mx-3 p-2 rounded-lg hover:bg-[#2E3192]/10"
        >
          <LogOut size={20} />
          {open && <span>Logout</span>}
        </button>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
