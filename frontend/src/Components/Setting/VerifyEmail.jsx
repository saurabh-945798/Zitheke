import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      const token = params.get("token") || "";
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const res = await fetch("/api/settings/email/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Email verification failed.");
        }

        setStatus("success");
        setMessage(data?.message || "Email verified successfully.");
      } catch (err) {
        setStatus("error");
        setMessage(err?.message || "Email verification failed.");
      }
    };

    verify();
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border p-6 text-center">
        <h1 className="text-xl font-bold text-[#2E3192]">Email Verification</h1>

        <p
          className={`mt-4 text-sm p-3 rounded ${
            status === "success"
              ? "bg-green-50 text-green-700"
              : status === "error"
              ? "bg-red-50 text-red-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          {message}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg border text-sm font-semibold text-gray-700"
          >
            Back to Site
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-[#2E3192] text-white text-sm font-semibold"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

