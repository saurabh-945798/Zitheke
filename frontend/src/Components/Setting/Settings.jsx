import React, { useEffect, useState } from "react";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const BASE_URL = "/api";

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const loadSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/settings/me`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load settings");
      setData(json.user);
    } catch (err) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const sendEmailVerification = async () => {
    setMessage("");
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/settings/email/send`, {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to send email");
      setMessage(json?.message || "Verification email sent");
    } catch (err) {
      setError(err.message || "Failed to send email");
    }
  };

  const sendPhoneOtp = async () => {
    setMessage("");
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/settings/phone/send`, {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to send OTP");
      setMessage(json?.message || "OTP sent");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    }
  };

  const verifyPhoneOtp = async () => {
    setMessage("");
    setError("");
    if (!otp.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/settings/phone/verify`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ otp: otp.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "OTP verification failed");
      setMessage(json?.message || "Phone verified");
      setOtp("");
      loadSettings();
    } catch (err) {
      setError(err.message || "OTP verification failed");
    }
  };

  const requestSetPassword = async () => {
    setMessage("");
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/settings/password/set/request`, {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to send email");
      setMessage(json?.message || "Email sent");
    } catch (err) {
      setError(err.message || "Failed to send email");
    }
  };

  const changePassword = async () => {
    setMessage("");
    setError("");
    if (!currentPassword || !newPassword) return;
    try {
      const res = await fetch(`${BASE_URL}/settings/password/change`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to change password");
      setMessage(json?.message || "Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message || "Failed to change password");
    }
  };

  const requestResetPassword = async () => {
    setMessage("");
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/settings/password/reset/request`, {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to send reset email");
      setMessage(json?.message || "Reset email sent");
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    }
  };

  const requestDeleteAccount = async () => {
    setMessage("");
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/settings/delete/request`, {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to request deletion");
      setMessage(json?.message || "Deletion email sent");
    } catch (err) {
      setError(err.message || "Failed to request deletion");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading settings...</div>;
  }

  if (!data) {
    return (
      <div className="text-center text-red-600 py-10">
        {error || "Failed to load settings"}
      </div>
    );
  }

  const providers = Array.isArray(data.authProviders) ? data.authProviders : [];
  const hasPassword = providers.includes("password");
  const hasGoogle = providers.includes("google");

  return (
    <div className="min-h-screen bg-[#F4F6FF] font-[Poppins]">
      <div className="max-w-5xl mx-auto space-y-6 px-4 py-8 lg:ml-64">
      <div>
        <h1 className="text-2xl font-bold text-[#2E3192]">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your account security and recovery.
        </p>
      </div>

      {(error || message) && (
        <div
          className={`p-3 rounded-lg text-sm ${
            error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <section className="bg-white rounded-xl border p-5">
        <h2 className="text-lg font-semibold mb-3">Email Verification</h2>
        <p className="text-sm text-gray-600">
          Status: {data.emailVerified ? "Verified" : "Not Verified"}
        </p>
        {!data.emailVerified && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={sendEmailVerification}
              className="px-4 py-2 rounded-lg bg-[#2E3192] text-white text-sm"
            >
              Verify Email
            </button>
            <button
              onClick={sendEmailVerification}
              className="px-4 py-2 rounded-lg border text-sm"
            >
              Resend Verification Email
            </button>
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl border p-5">
        <h2 className="text-lg font-semibold mb-3">
          Phone Number Verification
        </h2>
        <p className="text-sm text-gray-600">
          Status: {data.phoneVerified ? "Verified" : "Not Verified"}
        </p>
        {!data.phoneVerified && (
          <div className="mt-3 space-y-2">
            <button
              onClick={sendPhoneOtp}
              className="px-4 py-2 rounded-lg bg-[#2E3192] text-white text-sm"
            >
              Send OTP
            </button>
            <div className="flex gap-2">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="border rounded-lg px-3 py-2 text-sm flex-1"
              />
              <button
                onClick={verifyPhoneOtp}
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Verify
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl border p-5">
        <h2 className="text-lg font-semibold mb-3">Password & Security</h2>
        {!hasPassword ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              You do not have a password yet.
            </p>
            <button
              onClick={requestSetPassword}
              className="px-4 py-2 rounded-lg bg-[#2E3192] text-white text-sm"
            >
              Set Password
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={changePassword}
                className="px-4 py-2 rounded-lg bg-[#2E3192] text-white text-sm"
              >
                Change Password
              </button>
              <button
                onClick={requestResetPassword}
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Reset via Email
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl border p-5">
        <h2 className="text-lg font-semibold mb-3">Login Methods</h2>
        <p className="text-sm text-gray-600">Login methods:</p>
        <ul className="text-sm mt-2 space-y-1">
          <li>{hasGoogle ? "✅ Google Sign-In" : "❌ Google Sign-In"}</li>
          <li>{hasPassword ? "✅ Email + Password" : "❌ Email + Password"}</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl border p-5">
        <h2 className="text-lg font-semibold mb-3">Account Recovery</h2>
        <p className="text-sm text-gray-600">
          Email recovery: {data.emailVerified ? "Verified" : "Not verified"}
        </p>
        <p className="text-sm text-gray-600">
          Phone recovery: {data.phoneVerified ? "Verified" : "Not verified"}
        </p>
        {!data.emailVerified && !data.phoneVerified && (
          <p className="text-sm text-red-600 mt-2">
            Please verify at least one recovery method to secure your account.
          </p>
        )}
      </section>

      <section className="bg-white rounded-xl border border-red-200 p-5">
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          Delete Account (Danger Zone)
        </h2>
        <p className="text-sm text-gray-600">
          Email verification is required before deletion.
        </p>
        <button
          onClick={requestDeleteAccount}
          className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white text-sm"
        >
          Request Account Deletion
        </button>
      </section>
      </div>
    </div>
  );
};

export default Settings;
