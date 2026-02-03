import React, { useState } from "react";
import { motion } from "framer-motion";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const Signup = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = "/api";

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setError("All fields are required");
      return;
    }

    if (!/^[0-9]{7,10}$/.test(phone.trim())) {
      setError("Enter Malawi phone digits only");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Signup failed");
      }

      navigate("/login");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      const user = userCred.user;
      const idToken = await user.getIdToken();

      const res = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          uid: user.uid,
          name: user.displayName || "User",
          email: user.email,
          photoURL: user.photoURL || "",
          phone: user.phoneNumber || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Google signup failed");
      }

      if (data?.user) {
        const mergedUser = {
          uid: data.user.uid,
          email: data.user.email || null,
          name: data.user.name,
          photoURL: data.user.photoURL || "",
          role: data.user.role || "user",
          phone: data.user.phone || "",
        };
        localStorage.setItem("authUser", JSON.stringify(mergedUser));
        setUser(mergedUser);
      }

      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.refreshToken)
        localStorage.setItem("refreshToken", data.refreshToken);

      navigate("/");
    } catch (err) {
      setError(err.message || "Google signup failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#EEF2FF] via-[#F8FAFF] to-[#FFF3DB] flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
        {/* LEFT BRAND CARD */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="hidden md:block relative"
        >
          <div className="bg-white rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.08)] px-12 py-10 max-w-xl">
            {/* LOGO */}
            <div className="flex items-start gap-3 mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#F4B400"
                viewBox="0 0 24 24"
                className="w-9 h-9 transform scale-x-[-1]"
              >
                <path d="M21 11l-9-9H3v9l9 9 9-9zM7 7a2 2 0 110-4 2 2 0 010 4z" />
              </svg>

              <div className="leading-tight">
                <h1 className="text-[28px] font-extrabold text-[#2E3192] tracking-tight">
                  Zitheke
                </h1>
                <p className="text-sm font-semibold text-[#F4B400] ml-[6px]">
                  Buy. Sell. Connect.
                </p>
              </div>
            </div>

            {/* FEATURES */}
            <ul className="space-y-5 text-[15px] text-gray-700">
              <li className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-[#E9ECFF] flex items-center justify-center text-[#1F2370]">
                  ✓
                </span>
                Trusted local marketplace across Malawi
              </li>

              <li className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-[#E9ECFF] flex items-center justify-center text-[#1F2370]">
                  ✓
                </span>
                Post ads, chat instantly & close deals faster
              </li>

              <li className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-[#E9ECFF] flex items-center justify-center text-[#1F2370]">
                  ✓
                </span>
                Secure accounts powered by Firebase
              </li>
            </ul>

            {/* QUOTE */}
            <div className="mt-10 bg-[#F8FAFF] rounded-xl px-6 py-5 text-sm text-gray-600">
              <p className="italic">
                “Zitheke makes buying & selling simple and safe.”
              </p>
              <p className="mt-3 font-medium not-italic">
                — Local Seller, Lilongwe
              </p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIGNUP CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-auto"
        >
          <h1 className="text-2xl font-bold text-gray-800">
            Create your Zitheke account
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Join the trusted local marketplace
          </p>

          {error && (
            <p className="text-red-600 text-xs text-center bg-red-50 py-2 rounded-lg mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>

            <div className="flex">
              <div className="px-3 flex items-center bg-gray-100 border rounded-l-xl text-sm text-gray-600">
                +265
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="Phone number"
                className="w-full py-3 px-4 border rounded-r-xl focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>

            {/* PASSWORD STRENGTH INDICATOR */}
            <div className="h-[3px] w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-[40%] bg-[#F4B400] rounded-full"></div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2E3192] text-white font-semibold rounded-xl"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="my-5 flex items-center">
            <div className="flex-grow border-t" />
            <span className="mx-2 text-sm text-gray-400">OR</span>
            <div className="flex-grow border-t" />
          </div>

          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 py-3 border rounded-xl"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              className="w-5 h-5"
              alt="Google"
            />
            Continue with Google
          </button>

          <p className="text-center text-sm mt-6 text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-[#2E3192] font-semibold cursor-pointer"
            >
              Log in
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
