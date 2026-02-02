import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// ⭐ Featured Spotlight Items (same as yours)
const spotlightData = [
  {
    category: "Mobiles",
    title: "iPhone 12 Pro",
    offer: "25% OFF",
    image:
      "https://www.perchtechnologies.com/wp-content/uploads/2021/06/iphone-12-Pro-Max-Gold.jpg",
  },
  {
    category: "Vehicles",
    title: "Toyota Corolla 2014",
    offer: "Hot Deal",
    image:
      "https://images.unsplash.com/photo-1746056700923-a75df113b894?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    category: "Electronics",
    title: "Sony 55” 4K Smart TV – Like New",
    offer: "Save 18%",
    image:
      "https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    category: "Furniture",
    title: "Premium Wooden Sofa Set",
    offer: "Best Price",
    image:
      "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=1109&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    category: "Real Estate",
    title: "2 BHK Furnished Apartment",
    offer: "New Listing",
    image:
      "https://plus.unsplash.com/premium_photo-1689609950112-d66095626efb?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    category: "Jobs",
    title: "Hiring: Office Assistant – Full Time",
    offer: "Apply Now",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    category: "Fashion",
    title: "Men’s Summer Wear Combo – Trending",
    offer: "30% OFF",
    image:
      "https://plus.unsplash.com/premium_photo-1695575576052-7c271876b075?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  
  {
    category: "Services",
    title: "Home Cleaning & Repair Services",
    offer: "Book Now",
    image:
      "https://images.unsplash.com/photo-1581578949510-fa7315c4c350?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const SpotlightSection = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full py-12 font-[Poppins] bg-white">

      <h2 className="text-2xl md:text-4xl font-bold text-[#2E3192] px-6 mb-6">
        Featured Deals 
      </h2>

      <div className="flex gap-5 overflow-x-auto px-6 hide-scrollbar scroll-smooth snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible">

        {spotlightData.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}

            // ⭐ FIXED NAVIGATION — category ko direct pass kar rahe hain!
            onClick={() => navigate(`/category/${item.category}`)}

            className="
              relative cursor-pointer rounded-2xl overflow-hidden
              snap-start flex-shrink-0
              w-[220px] sm:w-[240px] md:w-[260px] lg:w-full
              aspect-[4/5]
              shadow-md bg-gray-100 group
            "
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            <div className="absolute bottom-4 left-4 text-white space-y-1 z-10">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium">
                {item.category}
              </span>

              <h3 className="text-xl md:text-2xl font-bold">{item.title}</h3>

              <p className="text-sm font-semibold text-[#2E3192]">{item.offer}</p>
            </div>

          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SpotlightSection;


