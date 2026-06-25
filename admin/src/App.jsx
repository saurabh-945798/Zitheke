import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* 🔐 Guard */
import AdminRoutes from "./AdminRoutes/AdminRoutes";

/* 🔓 Login */
import AdminLogin from "./Components/pages/AdminLogin";

/* 🧱 Layout */
import Sidebar from "./Components/Sidebar/Sidebar";

/* 📊 Pages */
import Dashboard from "./Components/Dashboard/Dashboard";
import Users from "./Components/Dashboard/Users";
import AllAds from "./Components/Dashboard/AllAds";
import Messages from "./Components/Dashboard/Messages";
import AdminReports from "./Components/Dashboard/AdminReports";
import AdminReportDetail from "./Components/Dashboard/AdminReportDetail";
import AdminOverview from "./Components/Dashboard/AdminOverview";
import CategoryInsight from "./Components/Dashboard/CategoryInsight";
import UserGrowth from "./Components/Dashboard/UserGrowth";
import AdminSettings from "./Components/Dashboard/AdminSettings";
import AdminContactInbox from "./Components/Dashboard/AdminContactInbox";
import RevenueSubscriptions from "./Components/Dashboard/RevenueSubscriptions";
import Categories from "./Components/Dashboard/Categories";


/* 🔹 ADMIN LAYOUT */
const AdminLayout = () => {
  return (
    <div className="flex min-h-screen font-[Poppins] bg-[#F8FAFC] text-gray-800">
      <Sidebar />

      <div className="flex-1 ml-[80px] lg:ml-[260px] p-6">
        <Routes>
          {/* 👇 THIS IS THE KEY */}
          <Route index element={<Dashboard />} />

          <Route path="users" element={<Users />} />
          <Route path="ads" element={<AllAds />} />
          <Route path="categories" element={<Categories />} />
          <Route path="messages" element={<Messages />} />
                    <Route path="contact-inbox" element={<AdminContactInbox />} />

          <Route path="reports" element={<AdminReports />} />
          <Route path="reports/:id" element={<AdminReportDetail />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="revenue-subscriptions" element={<RevenueSubscriptions />} />
          <Route path="category-insight" element={<CategoryInsight />} />
          <Route path="user-growth" element={<UserGrowth />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* ROOT */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      {/* LOGIN */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* PROTECTED */}
      <Route path="/admin/*" element={<AdminRoutes />}>
        {/* 👇 THIS FIXES BLANK PAGE */}
        <Route path="*" element={<AdminLayout />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;
