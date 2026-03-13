import React, { useEffect, useMemo, useState } from "react";
import { Download, Share2, Smartphone, X } from "lucide-react";

const DISMISS_KEY = "zitheke_install_prompt_dismissed_v1";

const isStandaloneMode = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
};

const getPlatform = () => {
  if (typeof navigator === "undefined") return { isIOS: false, isSafari: false };
  const ua = navigator.userAgent || "";
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isSafari =
    /safari/i.test(ua) &&
    !/crios|fxios|edgios|chrome|android/i.test(ua);
  return { isIOS, isSafari };
};

const InstallAppModal = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(true);

  const { isIOS, isSafari } = useMemo(() => getPlatform(), []);
  const shouldShowIosGuide = isIOS && isSafari && !isStandaloneMode();
  const canInstall = Boolean(deferredPrompt);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(DISMISS_KEY) === "true";
    setHasDismissed(dismissed);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      localStorage.setItem(DISMISS_KEY, "true");
      setDeferredPrompt(null);
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (hasDismissed || isStandaloneMode()) return;
    if (!canInstall && !shouldShowIosGuide) return;

    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [canInstall, hasDismissed, shouldShowIosGuide]);

  const closeModal = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setHasDismissed(true);
    setIsVisible(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem(DISMISS_KEY, "true");
        setHasDismissed(true);
        setIsVisible(false);
      }
    } finally {
      setDeferredPrompt(null);
      setIsInstalling(false);
    }
  };

  if (!isVisible || (!canInstall && !shouldShowIosGuide)) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0B102D]/70 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/15 bg-[linear-gradient(145deg,#101a58_0%,#1b2a84_58%,#f4900c_180%)] text-white shadow-[0_32px_80px_rgba(8,15,52,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(244,144,12,0.24),transparent_28%)]" />

        <button
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Close install app modal"
        >
          <X size={18} />
        </button>

        <div className="relative px-6 pb-6 pt-7 sm:px-8 sm:pb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15">
            <Smartphone size={28} className="text-[#FFD27A]" />
          </div>

          <div className="mt-5 max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FFD27A]">
              Install Zitheke
            </p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight">
              Get the Zitheke app experience on your phone
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/78">
              Faster access, home screen shortcut, and a cleaner marketplace
              experience every time you open Zitheke.
            </p>
          </div>

          {canInstall ? (
            <div className="mt-6 rounded-3xl border border-white/12 bg-white/8 p-4">
              <p className="text-sm text-white/88">
                Install the app now and launch Zitheke directly from your home
                screen.
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-white/12 bg-white/8 p-4">
              <p className="text-sm font-medium text-white">
                Add Zitheke to your iPhone home screen:
              </p>
              <div className="mt-3 space-y-2 text-sm text-white/82">
                <p className="flex items-center gap-2">
                  <Share2 size={16} className="text-[#FFD27A]" />
                  Tap the Share button in Safari
                </p>
                <p>Choose “Add to Home Screen”</p>
                <p>Open Zitheke anytime like a native app</p>
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {canInstall ? (
              <button
                type="button"
                onClick={handleInstall}
                disabled={isInstalling}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#F4900C] px-5 py-3.5 font-semibold text-[#101a58] transition hover:bg-[#ffb84f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Download size={18} />
                {isInstalling ? "Preparing..." : "Download Zitheke App"}
              </button>
            ) : (
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#F4900C] px-5 py-3.5 font-semibold text-[#101a58] transition hover:bg-[#ffb84f]"
              >
                Got it
              </button>
            )}

            <button
              type="button"
              onClick={closeModal}
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-5 py-3.5 font-medium text-white transition hover:bg-white/14"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallAppModal;
