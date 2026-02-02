import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";

const CheckEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location?.state?.email || "your email inbox";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#F8FAFC] to-[#F2F4FF] px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-[#2E3192]/10 flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-[#2E3192]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Check your email</h1>
        <p className="text-sm text-gray-600 mt-2">
          We sent a verification link to{" "}
          <span className="font-semibold text-gray-800">{email}</span>.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Open the link to verify your account, then return to log in.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-6 w-full py-3 bg-gradient-to-r from-[#2E3192] to-[#1E40AF] text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
        >
          Go to Login <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CheckEmail;
