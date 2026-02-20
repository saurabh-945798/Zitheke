import React, { useEffect, useState } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { motion } from "framer-motion";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Phone,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import TurnstileWidget from "../ui/TurnstileWidget.jsx";

const Login = () => {
  const { setUser } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequired, setOtpRequired] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotInfo, setForgotInfo] = useState("");
  const [forgotResendSeconds, setForgotResendSeconds] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaNonce, setCaptchaNonce] = useState(0);

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();
  const BASE_URL = "/api";
  const isProd = import.meta.env.PROD === true;
  const TURNSTILE_SITE_KEY = isProd
    ? import.meta.env.VITE_TURNSTILE_SITE_KEY || ""
    : "";

  const isEmail = identifier.includes("@");
  const digitsCandidate = identifier.trim().replace(/\D/g, "");
  const looksPhone =
    !isEmail &&
    digitsCandidate.length > 0 &&
    /^[0-9+\s()-]+$/.test(identifier.trim());
  const showCaptcha = isProd && TURNSTILE_SITE_KEY && !isEmail;

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (forgotResendSeconds <= 0) return;
    const timer = setInterval(() => {
      setForgotResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotResendSeconds]);

  const storeAuth = (data) => {
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    if (data?.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
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
  };

  const handleLogin = async () => {
    setError("");
    if (!identifier.trim() || !password) {
      setError("Email/Phone and password are required");
      return;
    }

    const trimmedIdentifier = identifier.trim();
    let identifierForApi = trimmedIdentifier;

    if (!trimmedIdentifier.includes("@")) {
      const digitsOnly = trimmedIdentifier.replace(/\D/g, "");
      if (digitsOnly.startsWith("0") || digitsOnly.startsWith("265")) {
        setError("Do not use 0 or 265. Enter only local digits.");
        return;
      }
      if (digitsOnly.length !== 9) {
        setError("For phone login, enter exactly 9 local digits.");
        return;
      }
      identifierForApi = `+265${digitsOnly}`;
    }

    if (showCaptcha && !captchaToken) {
      setError("Please complete the captcha first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifierForApi,
          password,
          captchaToken,
        }),
      });
      const data = await res.json();

      if (data?.errorCode === "GOOGLE_ACCOUNT") {
        setShowGoogleModal(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Login failed");
      }

      if (data?.otpRequired) {
        setOtpRequired(true);
        setPendingPhone(data?.phone || identifierForApi);
        setResendSeconds(60);
        setCaptchaToken("");
        setCaptchaNonce((n) => n + 1);
        return;
      }

      if (data?.token && data?.user) {
        storeAuth(data);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!otp.trim() || !pendingPhone) return;
    setOtpLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: pendingPhone, otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "OTP verification failed");
      }

      if (data?.token && data?.user) {
        storeAuth(data);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
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
        throw new Error(data?.message || "Google login failed");
      }

      storeAuth(data);
      navigate("/");
    } catch (err) {
      setError(err.message || "Google login failed");
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
    }
  };

  const openForgotModal = () => {
    const inferredEmail = identifier.includes("@")
      ? identifier.trim().toLowerCase()
      : "";
    setShowForgotModal(true);
    setForgotStep("email");
    setForgotEmail(inferredEmail);
    setForgotOtp("");
    setForgotError("");
    setForgotInfo("");
    setForgotResendSeconds(0);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep("email");
    setForgotEmail("");
    setForgotOtp("");
    setForgotError("");
    setForgotInfo("");
    setForgotResendSeconds(0);
  };

  const handleSendForgotOtp = async () => {
    setForgotError("");
    setForgotInfo("");
    const email = forgotEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setForgotError("Please enter a valid registered email.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/password/forgot/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to send OTP");
      }
      setForgotStep("otp");
      setForgotInfo("OTP sent to your registered email address.");
      setForgotResendSeconds(60);
    } catch (err) {
      setForgotError(err.message || "Failed to send OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyForgotOtp = async () => {
    setForgotError("");
    setForgotInfo("");
    const email = forgotEmail.trim().toLowerCase();
    const otpCode = forgotOtp.trim();
    if (!email || !otpCode) {
      setForgotError("Email and OTP are required.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/password/forgot/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "OTP verification failed");
      }

      if (!data?.resetToken) {
        throw new Error("Reset session could not be created. Try again.");
      }

      sessionStorage.setItem("forgotResetToken", data.resetToken);
      sessionStorage.setItem("forgotResetEmail", email);
      closeForgotModal();
      navigate("/reset-password-otp");
    } catch (err) {
      setForgotError(err.message || "OTP verification failed");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-[#F8FAFC] to-[#F2F4FF]">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2E3192]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F9B233]/20 rounded-full blur-3xl"></div>
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_40%,rgba(46,49,146,0.04)_50%,transparent_60%)]"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-[#2E3192] to-[#1E1F6D] text-white relative">
            <div>
              <div className="flex items-center gap-2 mb-6">
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

              <ul className="space-y-3 text-sm text-white/90">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Verified local marketplace
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Secure chats & trusted sellers
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Built for Malawi communities
                </li>
              </ul>
            </div>

            <div className="text-xs text-white/70 border-t border-white/20 pt-4">
              Zitheke makes local buying simple and safe.
              <br />
              <span className="text-white/90 font-medium">
                Community Member
              </span>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Login to your account
              </h1>
              <p className="text-sm text-gray-500">
                Use your email or phone with your password
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Email or Phone
                </label>
                <div className="relative flex items-center">
                  {looksPhone ? (
                    <span className="absolute left-3 text-sm font-semibold text-[#2E3192]">
                      +265
                    </span>
                  ) : (
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  )}
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email or phone number"
                    className={`w-full pr-3 py-3 border border-gray-200 rounded-xl
                               focus:ring-2 focus:ring-[#2E3192] focus:outline-none
                               bg-white/90 shadow-sm ${looksPhone ? "pl-14" : "pl-10"}`}
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Phone login: enter local digits only (no 0, no 265), e.g. 987456321
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl
                               focus:ring-2 focus:ring-[#2E3192] focus:outline-none
                               bg-white/90 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2E3192]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={openForgotModal}
                    className="text-xs font-medium text-[#2E3192] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-xs font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">
                  {error}
                </p>
              )}

              {!otpRequired ? (
                <>
                  {showCaptcha && (
                    <div className="flex justify-center">
                      <TurnstileWidget
                        key={`login-captcha-${captchaNonce}`}
                        siteKey={TURNSTILE_SITE_KEY}
                        onVerify={setCaptchaToken}
                      />
                    </div>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    disabled={
                      loading ||
                      (showCaptcha && !captchaToken)
                    }
                    onClick={handleLogin}
                    className="w-full py-3 bg-gradient-to-r from-[#2E3192] to-[#F9B233]
                               text-white font-semibold rounded-xl shadow-md
                               hover:opacity-90 transition"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Logging in...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <LogIn className="w-5 h-5" />
                        Login
                      </span>
                    )}
                  </motion.button>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                      OTP code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                                 focus:ring-2 focus:ring-[#2E3192] focus:outline-none
                                 bg-white/90 shadow-sm"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    disabled={otpLoading}
                    onClick={handleVerifyOtp}
                    className="w-full py-3 bg-gradient-to-r from-[#2E3192] to-[#F9B233]
                               text-white font-semibold rounded-xl shadow-md
                               hover:opacity-90 transition"
                  >
                    {otpLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Phone className="w-5 h-5" />
                        Verify OTP
                      </span>
                    )}
                  </motion.button>

                  <div className="text-center text-xs text-gray-500">
                    {resendSeconds > 0
                      ? `Resend available in ${resendSeconds}s`
                      : "Didn't get the code?"}
                  </div>

                  {showCaptcha && (
                    <div className="flex justify-center">
                      <TurnstileWidget
                        key={`login-captcha-resend-${captchaNonce}`}
                        siteKey={TURNSTILE_SITE_KEY}
                        onVerify={setCaptchaToken}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={resendSeconds > 0 || loading}
                    className={`w-full py-2 rounded-xl border text-sm font-semibold transition ${
                      resendSeconds > 0 || loading
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-[#2E3192] border-[#2E3192]/40 hover:bg-[#2E3192]/5"
                    }`}
                  >
                    Resend OTP
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                Secure by Zitheke
              </div>

              <div className="flex items-center my-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-2 text-sm text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3
                           border border-[#2E3192]/30 rounded-xl bg-white
                           hover:bg-[#2E3192]/5 transition text-gray-700 font-medium"
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                  className="w-5 h-5"
                  alt="Google"
                />
                Continue with Google
              </motion.button>
            </div>

            <p className="text-center text-sm mt-6 text-gray-600">
              {/* Don't have an account?{" "} */}
              <span
                onClick={() => navigate("/signup")}
                className="text-[#2E3192] font-semibold cursor-pointer hover:underline"
              >
                Sign up
              </span>
            </p>
          </div>
        </motion.div>
      </div>

      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Google Account Detected
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              You created this account using Google. Please continue with Google Sign-In.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowGoogleModal(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowGoogleModal(false);
                  handleGoogleLogin();
                }}
                className="px-5 py-2 bg-[#2E3192] text-white rounded-lg hover:bg-[#1F2370]"
              >
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      )}

      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">
              Forgot Password
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {forgotStep === "email"
                ? "You will receive an OTP on your registered email."
                : "Enter the OTP sent to your registered email."}
            </p>

            {forgotError && (
              <p className="text-red-600 text-xs font-medium bg-red-50 py-2 px-3 rounded-lg border border-red-100 mb-3">
                {forgotError}
              </p>
            )}
            {forgotInfo && (
              <p className="text-green-700 text-xs font-medium bg-green-50 py-2 px-3 rounded-lg border border-green-100 mb-3">
                {forgotInfo}
              </p>
            )}

            <div className="space-y-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Registered email"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                disabled={forgotStep === "otp"}
              />

              {forgotStep === "otp" && (
                <>
                  <input
                    type="text"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {forgotResendSeconds > 0
                      ? `Resend OTP in ${forgotResendSeconds}s`
                      : "Need a new OTP?"}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={closeForgotModal}
                className="px-4 py-2 rounded-lg border"
                type="button"
              >
                Cancel
              </button>

              {forgotStep === "email" ? (
                <button
                  onClick={handleSendForgotOtp}
                  disabled={forgotLoading}
                  className="px-5 py-2 bg-[#2E3192] text-white rounded-lg hover:bg-[#1F2370] disabled:opacity-70"
                  type="button"
                >
                  {forgotLoading ? "Sending..." : "Send OTP"}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSendForgotOtp}
                    disabled={forgotResendSeconds > 0 || forgotLoading}
                    className="px-4 py-2 rounded-lg border border-[#2E3192]/30 text-[#2E3192] disabled:opacity-60"
                    type="button"
                  >
                    Resend OTP
                  </button>
                  <button
                    onClick={handleVerifyForgotOtp}
                    disabled={forgotLoading}
                    className="px-5 py-2 bg-[#2E3192] text-white rounded-lg hover:bg-[#1F2370] disabled:opacity-70"
                    type="button"
                  >
                    {forgotLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
