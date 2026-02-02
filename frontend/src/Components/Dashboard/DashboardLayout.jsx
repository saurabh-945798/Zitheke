// src/Components/Dashboard/DashboardLayout.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar.jsx";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[Poppins]">
      {/* Sidebar (fixed) */}
      <Sidebar />

      {/* Main content (aware of sidebar width) */}
      <main
        className="p-4 sm:p-6 md:p-8 overflow-y-auto transition-all duration-300"
        style={{
          marginLeft: isMobile ? "0px" : "var(--sidebar-width, 0px)",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
