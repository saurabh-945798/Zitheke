import React from "react";

// Core Sections
import HeroSection from "../HeroSection/HeroSection.jsx";
import CategoryBar from "../CategoryBar/CategoryBar.jsx";
import SpotlightSection from "../SpotlightSection/SpotlightSection.jsx";
import FreshRecommendations from "../FreshRecommendations/FreshRecommendations.jsx";

// High-Value Category Sliders
import RealEstate from "../CategorySlider/RealEstate.jsx";
import Vehicles from "../CategorySlider/Vehicles.jsx";
import Electronics from "../CategorySlider/Electronics.jsx";

// Daily Use Categories
import FashionBeauty from "../CategorySlider/FashionBeauty.jsx";
import Furniture from "../CategorySlider/Furniture.jsx";
import Utensils from "../CategorySlider/Utensils.jsx";
import Sports from "../CategorySlider/Sports.jsx";

// Category Overview
// import CategoriesSection from "../CategoriesSection/CategoriesSection.jsx";

// Practical / Utility Categories
import JobsServices from "../CategorySlider/Jobs.jsx";
import Agriculture from "../CategorySlider/Agriculture.jsx";
import KidsEducation from "../CategorySlider/Education.jsx";
import DigitalProducts from "../CategorySlider/DigitalProducts.jsx";

// Other Sections
import FeaturedListings from "../FeaturedListings/FeaturedListings.jsx";
import SafetyTips from "../SafetyTips/SafetyTips.jsx";
import Footer from "../Footer/Footer.jsx";
import KitchenwarePromo from "../KitchenwarePromo/KitchenwarePromo.jsx";
import BoostAdSection from "../BoostAdSection/BoostAdSection.jsx";
import Livestock from "../CategorySlider/Livestock.jsx";

const Home = () => {
  return (
    <div className="bg-[#F8FAFC] min-h-screen font-[Poppins] flex flex-col">

      {/* 🦸 HERO (Discovery starts here) */}
      <HeroSection />

      {/* 🧭 QUICK CATEGORY ACCESS */}
      <CategoryBar />
                      <Utensils />


      {/* 🔥 TRENDING / PROMOTED */}
      <SpotlightSection />

      {/* 🆕 FRESH & NEW ADS */}
            <KitchenwarePromo/>

      <FreshRecommendations />


      {/* 🏷️ HIGH-VALUE CATEGORIES */}
      <section className="space-y-0">
        <FeaturedListings/>

        <RealEstate />
        <Vehicles />
        <Electronics />
        <BoostAdSection/>
      </section>

      {/* 🛒 DAILY-USE CATEGORIES */}
      <section className="space-y-0">
        <FashionBeauty />
        <Furniture />
        <Sports />
        <Livestock/>
    </section>

      {/* 🌐 EXPLORE ALL CATEGORIES */}
      {/* <section>
        <CategoriesSection />
      </section> */}

      {/* 💼 PRACTICAL / SERVICE CATEGORIES */}
      <section className="space-y-0">
        <JobsServices />
        <Agriculture />
       </section>

 

      {/* 🛡️ TRUST & SAFETY */}
      <section>
        <SafetyTips />
      </section>

     
    </div>
  );
};

export default Home;



