import React, { useEffect, useMemo, useState } from "react";
import { Download, Share2, Smartphone, X } from "lucide-react";

const isStandaloneMode = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
};

const getPlatform = () => {
  if (typeof navigator === "undefined") {
    return {
      isIOS: false,
      isSafari: false,
      isAndroid: false,
      isChromium: false,
    };
  }

  const ua = navigator.userAgent || "";
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isSafari =
    /safari/i.test(ua) &&
    !/crios|fxios|edgios|chrome|android/i.test(ua);
  const isChromium =
    /chrome|crios|edg|edgios/i.test(ua) && !/opr|opera/i.test(ua);

  return { isIOS, isSafari, isAndroid, isChromium };
};

const InstallAppModal = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [showManualHelp, setShowManualHelp] = useState(false);

  const { isIOS, isSafari, isAndroid, isChromium } = useMemo(
    () => getPlatform(),
    []
  );
  const shouldShowIosGuide = isIOS && isSafari && !isStandaloneMode();

  useEffect(() => {
    if (isStandaloneMode()) return undefined;

    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 1400);

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setVisible(false);
      setShowIosHelp(false);
      setShowManualHelp(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (shouldShowIosGuide) {
      setShowManualHelp(false);
      setShowIosHelp((prev) => !prev);
      return;
    }

    if (!deferredPrompt) {
      setShowIosHelp(false);
      setShowManualHelp((prev) => !prev);
      return;
    }

    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setVisible(false);
      }
    } finally {
      setDeferredPrompt(null);
      setInstalling(false);
    }
  };

  if (!visible || isStandaloneMode()) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[120] px-3 sm:px-4">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/15 bg-[linear-gradient(135deg,#16225e_0%,#24328c_60%,#f4900c_180%)] text-white shadow-[0_24px_60px_rgba(8,15,52,0.34)] backdrop-blur">
        <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
          <div className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <Smartphone size={22} className="text-[#FFD27A]" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFD27A]">
              Download Zitheke App
            </p>
            <p className="mt-1 text-sm font-medium leading-5 text-white sm:text-[15px]">
              Install Zitheke for faster access and open it like a real app.
            </p>

            {showIosHelp && (
              <div className="mt-3 rounded-2xl border border-white/12 bg-white/8 px-3 py-3 text-sm text-white/86">
                <p className="font-medium text-white">
                  On iPhone Safari:
                </p>
                <p className="mt-2 flex items-center gap-2">
                  <Share2 size={15} className="text-[#FFD27A]" />
                  Tap Share, then choose Add to Home Screen.
                </p>
              </div>
            )}

            {showManualHelp && (
              <div className="mt-3 rounded-2xl border border-white/12 bg-white/8 px-3 py-3 text-sm text-white/86">
                <p className="font-medium text-white">
                  Install from your browser
                </p>
                {isChromium ? (
                  <p className="mt-2">
                    Use the install icon in the address bar, or open the browser
                    menu and choose{" "}
                    <span className="font-semibold text-white">
                      Install app
                    </span>
                    .
                  </p>
                ) : isAndroid ? (
                  <p className="mt-2">
                    Open the browser menu and choose{" "}
                    <span className="font-semibold text-white">
                      Add to Home screen
                    </span>
                    .
                  </p>
                ) : (
                  <p className="mt-2">
                    Your browser has not exposed the install prompt yet. If an
                    install option is available, use your browser menu or address
                    bar install icon.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="inline-flex items-center gap-2 rounded-full bg-[#F4900C] px-4 py-2.5 text-sm font-semibold text-[#111B58] transition hover:bg-[#ffb84f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Download size={16} />
              {installing ? "Preparing..." : "Download"}
            </button>

            <button
              type="button"
              onClick={() => setVisible(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white transition hover:bg-white/18"
              aria-label="Close install banner"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallAppModal;
