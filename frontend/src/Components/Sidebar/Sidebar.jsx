import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
 
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Menu,
  X,
  LayoutDashboard,
  MessageCircle,
  Heart,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  FolderOpen,
  Home,
  Flag,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const SIDEBAR_WIDTH = 260;
const COLLAPSED_WIDTH = 80;

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adsOpen, setAdsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userName = user?.displayName || user?.email?.split("@")[0] || "User";
  const localPhoto = localStorage.getItem("profilePhoto") || "";
  const userImage = localPhoto || user?.photoURL || "/images/user.png";

  /* ======================
     SCREEN SIZE DETECT
  ====================== */
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setOpen(false);
        setMobileOpen(false);
      } else {
        setOpen(true);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleNavClick = () => {
    if (isMobile) setMobileOpen(false);
  };

  /* ======================
     LOGOUT
  ====================== */
  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: "Logout?",
      text: "You'll be logged out from Zitheke!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3192",
      cancelButtonColor: "#ef4444",
    });

    if (confirm.isConfirmed) {
      await logout();
      navigate("/", { replace: true });
    }
  };


  const menus = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "My Ads", icon: FolderOpen, dropdown: true },
    { name: "Chats", icon: MessageCircle, path: "/chats" },
    { name: "Favorites", icon: Heart, path: "/dashboard/favorites" },
    { name: "My Reports", icon: Flag, path: "/dashboard/myReports" },
    { name: "Profile", icon: User, path: "/dashboard/profile" },
    { name: "Settings", icon: Settings, path: "/dashboard/settings" },
  ];

  return (
    <>
      {/* MOBILE HAMBURGER */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-[var(--brand)] text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <Menu size={22} />
        </button>
      )}

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {mobileOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black z-40"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside
        animate={{
          x: isMobile ? (mobileOpen ? 0 : -SIDEBAR_WIDTH) : 0,
          width: isMobile
            ? SIDEBAR_WIDTH
            : open
            ? SIDEBAR_WIDTH
            : COLLAPSED_WIDTH,
        }}
        transition={{
          duration: reduceMotion ? 0 : 0.25,
          ease: "easeOut",
        }}
        style={{
          "--brand": "#2E3192",
          "--surface": "#ffffff",
          "--border": "rgba(15,23,42,0.12)",
          "--shadow": "0 10px 28px rgba(0,0,0,0.12)",
          "--radius": "14px",
          "--space": "12px",
        }}
        className="fixed left-0 top-0 z-50 h-screen
        bg-gradient-to-br from-white via-[#EEF0FF] to-[#D9DCFF]
        border-r border-[var(--border)]
        shadow-[var(--shadow)]
        flex flex-col text-[#1A1D64] font-[Poppins]"
      >
        {/* BRAND ZONE */}
        <div className="px-4 pt-6 pb-4 border-b border-[var(--border)]">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="#F4B400" className="w-7 h-7">
              <path d="M21 11l-9-9H3v9l9 9 9-9z" />
            </svg>
            {(open || isMobile) && (
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
            onClick={() =>
              isMobile ? setMobileOpen(false) : setOpen(!open)
            }
            className="absolute top-5 right-4 text-[#1A1D64]/70 focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* USER PILL */}
        {(open || isMobile) && (
          <div className="mx-3 my-3 px-3 py-2 rounded-full bg-white border border-[var(--border)] flex items-center gap-3">
            <div className="relative">
              <img
                src={userImage}
                alt={userName}
                className="w-9 h-9 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${userName}`;
                }}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || "user@alinafe.com"}
              </p>
            </div>
          </div>
        )}

        {/* NAV ZONE */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {menus.map((menu) =>
            menu.dropdown ? (
              <div key={menu.name}>
                <button
                  onClick={() =>
                    menu.name === "My Ads"
                      ? setAdsOpen(!adsOpen)
                      : null
                  }
                  className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-[#2E3192]/10"
                >
                  <div className="flex items-center gap-3">
                    <menu.icon size={18} />
                    {(open || isMobile) && (
                      <span className="text-sm">{menu.name}</span>
                    )}
                  </div>
                  {(open || isMobile) &&
                    ((menu.name === "My Ads" && adsOpen) ||
                    adsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>

                <AnimatePresence>
                  {menu.name === "My Ads" && adsOpen && (open || isMobile) && (
                    <motion.div className="ml-8 mt-2 space-y-1">
                      <NavLink
                        to="/dashboard/my-ads"
                        onClick={handleNavClick}
                        className="block text-sm px-2 py-1 rounded hover:bg-[#2E3192]/10"
                      >
                        My Ads
                      </NavLink>
                      <NavLink
                        to="/dashboard/createAd"
                        onClick={handleNavClick}
                        className="block text-sm px-2 py-1 rounded hover:bg-[#2E3192]/10"
                      >
                        Create Ad
                      </NavLink>
                    </motion.div>
                  )}
                </AnimatePresence>

                
              </div>
            ) : (
              <NavLink
                key={menu.name}
                to={menu.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-2 py-2 rounded-lg transition
                  ${
                    isActive
                      ? "bg-[#2E3192]/10 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-[#2E3192] before:to-[#5B66D6]"
                      : "hover:bg-[#2E3192]/10"
                  }`
                }
              >
                <menu.icon size={18} />
                {(open || isMobile) && (
                  <span className="text-sm">{menu.name}</span>
                )}
              </NavLink>
            )
          )}
        </nav>

        {/* UTILITY ZONE */}
        {(open || isMobile) && (
          <div className="px-3 pb-4 border-t border-[var(--border)]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#2E3192]/10"
            >
              <LogOut size={18} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;
