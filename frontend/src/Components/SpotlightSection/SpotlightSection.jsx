import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// ⭐ Featured Spotlight Items (same as yours)
const spotlightData = [
  {
    category: "Mobiles",
    title: "Great Deal – Quality Item Available",
    offer: "25% OFF",
    image:
      "https://pictures-nigeria.jijistatic.net/191312169_MTIwMC0xNjAwLTY0YWQyY2Q5ZTk.webp",
  },
  {
    category: "Vehicles",
    title: "Best Offers on Quality Products & Services",
    offer: "Hot Deal",
    image:
      "https://img.freepik.com/free-photo/handsome-african-american-man-driving-car_53876-97152.jpg?semt=ais_rp_progressive&w=740&q=80",
  },
  {
    category: "Electronics",
    title: "Well-maintained electronic item, perfect for everyday use.",
    offer: "Save 18%",
    image:
      "https://api.zitheke.com/uploads/images/medium/cvvcaupahphjqdhgtecw.webp",
  },
  {
    category: "Furniture",
    title: "Premium Wooden Sofa Set",
    offer: "Best Price",
    image:
      "https://gms.gumtree.co.za/v2/images/za_ads_100163233_260221_6999b3739d1790000a3f8fca?size=l",
  },
  {
    category: "Real Estate",
    title: "Explore Top Listings at Great Prices",
    offer: "New Listing",
    image:
      "https://scontent.fdel32-1.fna.fbcdn.net/v/t39.30808-6/496936088_122248262630073185_6162265846963520374_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=7b2446&_nc_ohc=1C1kRo9WsHsQ7kNvwFC4ex1&_nc_oc=Adk2fiK8ijE-4jo6Va2QUD57Q2Z7qg_44werV7jEUCs89dE5kh40uaXSrkYsRRc1I4k&_nc_zt=23&_nc_ht=scontent.fdel32-1.fna&_nc_gid=Cqq18oG6JEicW1B_DYopwA&_nc_ss=8&oh=00_AfxLETAuTBB1R-M-JC-WfXOGGlaRAo_brLa4_3JBJ-TtSQ&oe=69BAB26F",
  },
  {
    category: "Jobs",
    title: "Hiring: Office Assistant – Full Time",
    offer: "Apply Now",
    image:
      "https://african.land/oc-content/plugins/blog/img/blog/677.jpg",
  },
  {
    category: "Fashion",
    title: "Find the Best Deals Near You",
    offer: "30% OFF",
    image:
      "https://api.zitheke.com/uploads/images/medium/1003180400-1772188575657-0f1435fd72b6.webp",
  },
  
  {
    category: "Services",
    title: "Buy, Sell & Discover Great Deals",
    offer: "Book Now",
    image:
      "https://api.zitheke.com/uploads/images/medium/img_20250722_150453-1772028855021-d3856f115c4f.webp",
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


