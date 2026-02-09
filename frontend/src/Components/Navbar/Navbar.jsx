// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext.jsx";
// import { signOut } from "firebase/auth";
// import { auth } from "../../firebase.js";
// import {
//   Menu,
//   X,
//   Bell,
//   Bookmark,
//   MessageSquare,
//   LayoutDashboard,
// } from "lucide-react";
// import { FaSearch } from "react-icons/fa";
// import { motion, AnimatePresence } from "framer-motion";

// const Navbar = () => {
//   const { user, setUser } = useAuth();
//   const navigate = useNavigate();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [showPopup, setShowPopup] = useState(false);
//   const [selectedDistrict, setSelectedDistrict] = useState("All Malawi");
//   const [searchQuery, setSearchQuery] = useState("");

//   const districts = [
//     "Balaka","Blantyre","Chikwawa","Chiradzulu","Chitipa","Dedza","Dowa","Karonga",
//     "Kasungu","Likoma","Lilongwe","Machinga","Mangochi","Mchinji","Mulanje","Mwanza",
//     "Mzimba","Neno","Nkhata Bay","Nkhotakota","Nsanje","Ntcheu","Ntchisi","Phalombe",
//     "Rumphi","Salima","Thyolo","Zomba", "Mathura" , "Delhi"
//   ];

//   const handleDistrictClick = (district) => {
//     setSelectedDistrict(district);
//     setShowPopup(false);
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (!searchQuery.trim()) return;
//     navigate(`/search-results?query=${searchQuery}&location=${selectedDistrict}`);
//   };

//   const handleLogout = async () => {
//     await signOut(auth);
//     setUser(null);
//     navigate("/");
//   };

//   const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

//   const getAvatar = () => {
//     if (user?.photoURL) {
//       return (
       
// <img
//   src={
//     user?.photoURL ||
//     `https://ui-avatars.com/api/?name=${encodeURIComponent(
//       user?.displayName || "User"
//     )}&background=2E3192&color=fff&bold=true`
//   }
//   alt="User"
//   className="w-9 h-9 rounded-full object-cover border border-white/40"
// />
//       );
//     }
//     if (user?.displayName || user?.email) {
//       const letter = (user.displayName || user.email)?.charAt(0).toUpperCase();
//       return (
//         <div className="w-9 h-9 rounded-full bg-white text-[#2E3192] flex items-center justify-center font-semibold border border-white/40">
//           {letter}
//         </div>
//       );
//     }
//     return (
//       <img
//         src="https://i.postimg.cc/8cPjsnM4/user.png"
//         alt="Default user"
//         className="w-9 h-9 rounded-full object-cover border border-white/40"
//       />
//     );
//   };

//   return (
//     <>
//       {/* âœ… NAVBAR */}
//       <nav className="bg-[#2E3192] sticky top-0 z-50 shadow font-[Poppins]">
//         <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-3 flex items-center justify-between text-white gap-6 flex-wrap">

//         <div
//   onClick={() => navigate("/")}
//   className="flex items-center cursor-pointer select-none"
// >
//   {/* ðŸŸ¨ Yellow Tag Icon â€” flipped + slightly raised */}
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     fill="#F4B400"
//     viewBox="0 0 24 24"
//     className="w-8 h-8 flex-shrink-0 -mt-[4px] -mr-[1px] transform scale-x-[-1]"
//   >
//     <path d="M21 11l-9-9H3v9l9 9 9-9zM7 7a2 2 0 110-4 2 2 0 010 4z" />
//   </svg>

//   {/* ðŸ”¤ Text Section */}
//   <div className="flex flex-col leading-tight">
//     <h1 className="text-2xl font-extrabold text-white tracking-tight">
//       Zitheke
//     </h1>
//     <p className="text-sm font-semibold text-[#F4B400] ml-[6px] mt-[-2px]">
//       Buy. Sell. Connect.
//     </p>
//   </div>
// </div>


//           {/* ðŸ” Search Bar Center */}
//           <form
//             onSubmit={handleSearch}
//             className="hidden md:flex flex-1 justify-center items-center bg-white rounded-full shadow-md px-2 py-2 max-w-xl"
//           >
//             {/* Location Button */}
//             <button
//               type="button"
//               onClick={() => setShowPopup(true)}
//               className="bg-[#F9B233] text-[#2E3192] px-4 py-2 rounded-full font-medium hover:bg-[#e5a91e] transition-all"
//             >
//               {selectedDistrict}
//             </button>

//             {/* Divider */}
//             <span className="mx-3 text-gray-300">|</span>

//             {/* Input */}
//             <input
//               type="text"
//               placeholder="I'm looking for..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="flex-1 px-2 text-gray-700 focus:outline-none"
//             />

//             {/* Search Button */}
//             <button type="submit" className="bg-[#2E3192] text-white p-2 rounded-full hover:bg-[#1e236d] transition">
//               <FaSearch />
//             </button>
//           </form>

//           {/* ðŸ‘¤ Right Section */}
//           <div className="flex items-center gap-3">
//             {!user ? (
//               <>
//                 <span
//                   onClick={() => navigate("/login")}
//                   className="cursor-pointer hover:underline transition"
//                 >
//                   Sign In
//                 </span>
//                 <span>|</span>
//                 <span
//                   onClick={() => navigate("/signup")}
//                   className="cursor-pointer hover:underline transition"
//                 >
//                   Registration
//                 </span>

//                 <button
//                   onClick={() => navigate("/dashboard/createAd")}
//                   className="ml-2 bg-[#F4B400] hover:bg-[#e2a500] text-[#1A237E] px-5 py-2 rounded-xl font-semibold transition"
//                 >
//                   SELL
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button onClick={() => navigate("/dashboard/favorites")} className="bg-white text-[#2E3192] p-2 rounded-full hover:scale-110 transition">
//                   <Bookmark size={18} />
//                 </button>
//                 <button onClick={() => navigate("/chats")} className="bg-white text-[#2E3192] p-2 rounded-full hover:scale-110 transition">
//                   <MessageSquare size={18} />
//                 </button>
//                 <button onClick={() => navigate("/dashboard/notifications")} className="bg-white text-[#2E3192] p-2 rounded-full hover:scale-110 transition">
//                   <Bell size={18} />
//                 </button>
//                 <button onClick={() => navigate("/dashboard")} className="bg-white text-[#2E3192] p-2 rounded-full hover:scale-110 transition">
//                   <LayoutDashboard size={18} />
//                 </button>

//                 {/* Avatar Dropdown */}
//                 <div className="relative">
//                   <button onClick={toggleDropdown}>{getAvatar()}</button>
//                   {dropdownOpen && (
//                     <div className="absolute right-0 top-12 bg-white text-gray-700 shadow-lg rounded-lg w-44 border border-gray-100">
//                       <ul className="text-sm">
//                         <li
//                           onClick={() => {
//                             navigate("/dashboard/my-ads");
//                             setDropdownOpen(false);
//                           }}
//                           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                         >
//                           My Ads
//                         </li>
//                         <li
//                           onClick={() => {
//                             navigate("/dashboard/profile");
//                             setDropdownOpen(false);
//                           }}
//                           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                         >
//                           Profile
//                         </li>
//                         <li
//                           onClick={handleLogout}
//                           className="px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"
//                         >
//                           Logout
//                         </li>
//                       </ul>
//                     </div>
//                   )}
//                 </div>

//                 <button
//                   onClick={() => navigate("/dashboard/createAd")}
//                   className="ml-2 bg-[#F4B400] hover:bg-[#e2a500] text-[#1A237E] px-5 py-2 rounded-xl font-semibold transition"
//                 >
//                   SELL
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </nav>

//       {/* ðŸŸ¢ Popup Modal for Location */}
//       <AnimatePresence>
//         {showPopup && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
//           >
//             <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] md:w-[600px] max-h-[80vh] overflow-y-auto">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-lg font-semibold text-gray-800">
//                   Select District
//                 </h2>
//                 <button onClick={() => setShowPopup(false)}>âœ•</button>
//               </div>
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                 {districts.map((d, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => handleDistrictClick(d)}
//                     className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-[#F9B233] hover:text-white rounded-lg transition"
//                   >
//                     {d}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default Navbar;
//  design navbar  - 1 


import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Bookmark,
  MessageSquare,
  Menu,
  X,
  Search,
  PlusCircle,
  LogOut,
  User,
  Home,
  Layers,
  Info,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import SearchBar from "../SearchBar/SearchBar.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* =========================
     SCROLL EFFECT
  ========================= */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  /* =========================
     AVATAR
  ========================= */
  const getAvatar = () => {
    if (user?.photoURL)
      return (
        <img
          src={user.photoURL}
          alt="User"
          className="w-10 h-10 rounded-full object-cover border border-[#2E3192]/30 shadow-sm"
        />
      );
    const letter = (user?.displayName || user?.email || "U").charAt(0);
    return (
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#2E3192] text-white font-semibold shadow-sm">
        {letter}
      </div>
    );
  };

  return (
    <>
      {/* ================= TOP NAVBAR ================= */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 w-full z-50 border-b border-white/10 ${
          scrolled
            ? "bg-[#2E3192]/95 backdrop-blur-xl shadow-md"
            : "bg-[#2E3192]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#F4B400"
              viewBox="0 0 24 24"
              className="w-8 h-8 flex-shrink-0 -mt-[4px] -mr-[1px] transform scale-x-[-1]"
            >
              <path d="M21 11l-9-9H3v9l9 9 9-9zM7 7a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
            <div className="flex flex-col leading-tight">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Zitheke
            </h1>
            <p className="text-sm font-semibold text-[#F4B400] ml-[6px] mt-[-2px]">
              Buy. Sell. Connect.
            </p>
            </div>
          </div>
          {/* DESKTOP SEARCH */}
          <div className="hidden md:flex flex-1 justify-center px-6">
            <SearchBar />
          </div>

          {/* DESKTOP RIGHT */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-white font-semibold"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-[#2E3192] text-white px-4 py-2 rounded-full shadow hover:bg-[#1F2370]"
                >
                  Join Now
                </button>
              </>
            ) : (
              <>
                {[
                  { Icon: Bookmark, onClick: () => navigate("/dashboard/favorites") },
                  { Icon: MessageSquare, onClick: () => navigate("/chats") },
                  { Icon: Bell, onClick: () => navigate("/dashboard") },
                ].map(({ Icon, onClick }, i) => (
                  <button
                    key={i}
                    onClick={onClick}
                    className="p-2 rounded-full bg-white/15 text-white hover:bg-white/25 transition"
                  >
                    <Icon size={18} />
                  </button>
                ))}

                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                    {getAvatar()}
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-12 bg-white rounded-xl shadow-xl w-48 overflow-hidden"
                      >
                        <ul className="text-sm">
                          <li
                            onClick={() => navigate("/dashboard")}
                            className="px-4 py-3 hover:bg-[#2E3192]/10 cursor-pointer flex gap-2"
                          >
                            <User size={16} /> Dashboard
                          </li>
                          <li
                            onClick={() => navigate("/dashboard/my-ads")}
                            className="px-4 py-3 hover:bg-[#2E3192]/10 cursor-pointer flex gap-2"
                          >
                            <Bookmark size={16} /> My Ads
                          </li>
                          <li
                            onClick={handleLogout}
                            className="px-4 py-3 text-red-500 hover:bg-red-50 cursor-pointer flex gap-2"
                          >
                            <LogOut size={16} /> Logout
                          </li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => navigate("/dashboard/createAd")}
                  className="flex items-center gap-2 bg-[#F4B400] text-[#1A237E] px-5 py-2.5 rounded-full shadow-md hover:bg-[#e2a500] transition"
                >
                  <PlusCircle size={20} />
                  Sell
                </button>
              </>
            )}
          </div>

          {/* MOBILE ICONS */}
          <div className="md:hidden flex items-center gap-4">
            <Search
              size={22}
              className="text-white"
              onClick={() => setMobileSearchOpen(true)}
            />
            <Menu
              size={26}
              className="text-white"
              onClick={() => setSidebarOpen(true)}
            />
          </div>
        </div>
      </motion.nav>

      {/* ================= MOBILE SEARCH OVERLAY ================= */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMobileSearchOpen(false)}
            />

            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 w-full z-50 bg-white shadow-xl px-4 pt-4 pb-6"
            >
              <div className="flex justify-between items-center mb-4">
                <p className="font-semibold text-[#2E3192]">
                  Search on Zitheke
                </p>
                <X onClick={() => setMobileSearchOpen(false)} />
              </div>

              <SearchBar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= SIDE DRAWER ================= */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setSidebarOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  {getAvatar()}
                  <div>
                    <p className="font-semibold text-[#2E3192]">
                      {user?.displayName || "Guest User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user ? user.email : "Not logged in"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 text-gray-700">
                  <button onClick={() => navigate("/")} className="flex gap-2">
                    <Home size={18} /> Home
                  </button>
                  <button onClick={() => navigate("/all-ads")} className="flex gap-2">
                    <Layers size={18} /> Categories
                  </button>
                  <button onClick={() => navigate("/about")} className="flex gap-2">
                    <Info size={18} /> About
                  </button>
                  <button onClick={() => navigate("/contact")} className="flex gap-2">
                    <Phone size={18} /> Contact
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                {user ? (
                  <>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="w-full bg-[#2E3192]/10 text-[#2E3192] py-2 rounded-full"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => navigate("/dashboard/createAd")}
                      className="w-full bg-[#2E3192] text-white py-2 rounded-full mt-2"
                    >
                      + Sell Item
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-red-500 mt-2 py-2 rounded-full hover:bg-red-50 flex gap-2 justify-center"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-[#2E3192] text-white py-2 rounded-full"
                  >
                    Login / Signup
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= BOTTOM MOBILE NAV ================= */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-lg z-50 px-4 py-2">
        <div className="flex justify-between">
          <button onClick={() => navigate("/")} className="flex flex-col items-center text-[#2E3192]">
            <Home size={22} />
            <span className="text-xs">Home</span>
          </button>
          <button onClick={() => navigate("/all-ads")} className="flex flex-col items-center">
            <Layers size={22} />
            <span className="text-xs">Categories</span>
          </button>
          <button
            onClick={() => navigate("/dashboard/createAd")}
            className="flex flex-col items-center bg-[#2E3192] text-white px-4 py-2 rounded-full -mt-6 shadow-lg"
          >
            <PlusCircle size={24} />
          </button>
          <button onClick={() => navigate("/chats")} className="flex flex-col items-center">
            <MessageSquare size={22} />
            <span className="text-xs">Chat</span>
          </button>
          <button onClick={() => navigate(user ? "/dashboard" : "/login")} className="flex flex-col items-center">
            <User size={22} />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
