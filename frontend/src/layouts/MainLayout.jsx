import React from "react";
import Navbar from "../components/Navbar/Navbar.jsx";
import Footer from "../components/Footer/Footer.jsx";

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="pt-18 min-h-screen">{children}</main>
      <Footer />
    </>
  );
};

export default MainLayout;
