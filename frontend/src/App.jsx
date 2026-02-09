// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

// ✅ Layouts
import MainLayout from "./layouts/MainLayout.jsx";

// ✅ Main Pages
import Home from "./Components/Home/Home.jsx";
import Login from "./Components/Pages/Login.jsx";
import Signup from "./Components/Pages/Signup.jsx";
import CheckEmail from "./Components/Pages/CheckEmail.jsx";

// ✅ Static Pages (Footer Links)
import About from "./Components/Footercontent/About.jsx";
import PrivacyPolicy from "./Components/Footercontent/PrivacyPolicy.jsx";
import Terms from "./Components/Footercontent/Terms.jsx";
import Contact from "./Components/Footercontent/Contact.jsx";

// ✅ Dashboard Pages
import Dashboard from "./Components/Dashboard/Dashboard.jsx";
import MyAds from "./Components/Dashboard/MyAds.jsx";
import Favorites from "./Components/Dashboard/Favorites.jsx";
import Profile from "./Components/Dashboard/Profile.jsx";
import CreateAd from "./Components/Dashboard/CreateAd.jsx";
import ReportAd from "./Components/Dashboard/ReportAd.jsx";
import Chats from "./Components/Dashboard/Chats.jsx";
import DashboardLayout from "./Components/Dashboard/DashboardLayout";
import MyReports from "./Components/Dashboard/MyReports";
import Settings from "./Components/Setting/Settings.jsx";
import SetPassword from "./Components/Setting/SetPassword.jsx";
import VerifyEmail from "./Components/Setting/VerifyEmail.jsx";

// ✅ Marketplace Pages
import ProductDetails from "./Components/ProductDetails/ProductDetails.jsx";
import CategoryPage from "./Components/CategoryPage/CategoryPage.jsx";
import SearchResults from "./Components/SearchResults/SearchResults.jsx";
import Listings from "./Components/Listings/Listings.jsx";
import SellerProfile from "./Components/SellerProfile/SellerProfile";
import PricingPage from "./Components/BoostAdSection/PricingPage.jsx";
import CheckoutPage from "./Components/BoostAdSection/CheckoutPage.jsx";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-[#2E3192] font-semibold">
        Loading...
      </div>
    );
  }

  return (
      <Routes>
        {/* 🏠 Home */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        {/* 📄 Static Pages (Footer Links) */}
        <Route
          path="/about"
          element={
            <MainLayout>
              <About />
            </MainLayout>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <MainLayout>
              <PrivacyPolicy />
            </MainLayout>
          }
        />
        <Route
          path="/terms"
          element={
            <MainLayout>
              <Terms />
            </MainLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <MainLayout>
              <Contact />
            </MainLayout>
          }
        />

        {/* 💬 Chats */}
        <Route
          path="/chats"
          element={user ? <Chats /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/chats/:receiverId"
          element={user ? <Chats /> : <Navigate to="/login" replace />}
        />

        {/* 🔍 Search */}
        <Route
          path="/search"
          element={
            <MainLayout>
              <SearchResults />
            </MainLayout>
          }
        />

        {/* 📦 Product */}
        <Route
          path="/ad/:id"
          element={
            <MainLayout>
              <ProductDetails key={window.location.pathname} />
            </MainLayout>
          }
        />

        {/* 👤 Seller Profile */}
        <Route
          path="/profile/:sellerId"
          element={
            <MainLayout>
              <SellerProfile key={window.location.pathname} />
            </MainLayout>
          }
        />

        {/* 🏷️ Category */}
        <Route
          path="/category/:category"
          element={
            <MainLayout>
              <CategoryPage />
            </MainLayout>
          }
        />

        {/* 🌍 All Ads */}
        <Route
          path="/all-ads"
          element={
            <MainLayout>
              <Listings />
            </MainLayout>
          }
        />
        <Route
          path="/pricing"
          element={
            <MainLayout>
              <PricingPage />
            </MainLayout>
          }
        />
        <Route
          path="/checkout"
          element={
            <MainLayout>
              <CheckoutPage />
            </MainLayout>
          }
        />

        {/* 📊 Dashboard (Protected) */}
        <Route
          path="/dashboard/*"
          element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="my-ads" element={<MyAds />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="createAd" element={<CreateAd />} />
          <Route path="ReportAd" element={<ReportAd />} />
          <Route path="ReportAd/:id" element={<ReportAd />} />
          <Route path="myreports" element={<MyReports />} />
        </Route>

        {/* 🔐 Auth */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!user ? <Signup /> : <Navigate to="/" replace />}
        />
        <Route
          path="/check-email"
          element={!user ? <CheckEmail /> : <Navigate to="/" replace />}
        />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* 🚫 404 */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen text-gray-500">
              Page not found
            </div>
          }
        />
      </Routes>
  );
}

export default App;
