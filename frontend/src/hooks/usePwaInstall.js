import { useEffect, useMemo, useState } from "react";

let deferredPromptEvent = null;
let appInstalled = false;
let listenersBound = false;
const subscribers = new Set();

const detectPlatform = () => {
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
    /safari/i.test(ua) && !/crios|fxios|edgios|chrome|android/i.test(ua);
  const isChromium =
    /chrome|crios|edg|edgios/i.test(ua) && !/opr|opera/i.test(ua);

  return { isIOS, isSafari, isAndroid, isChromium };
};

const isStandaloneMode = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
};

const getSnapshot = () => ({
  deferredPrompt: deferredPromptEvent,
  isStandalone: isStandaloneMode() || appInstalled,
});

const notifySubscribers = () => {
  const snapshot = getSnapshot();
  subscribers.forEach((subscriber) => subscriber(snapshot));
};

const bindGlobalInstallListeners = () => {
  if (listenersBound || typeof window === "undefined") return;
  listenersBound = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPromptEvent = event;
    notifySubscribers();
  });

  window.addEventListener("appinstalled", () => {
    deferredPromptEvent = null;
    appInstalled = true;
    notifySubscribers();
  });
};

export const usePwaInstall = () => {
  const [snapshot, setSnapshot] = useState(getSnapshot);
  const platform = useMemo(() => detectPlatform(), []);

  useEffect(() => {
    bindGlobalInstallListeners();
    subscribers.add(setSnapshot);
    setSnapshot(getSnapshot());

    return () => {
      subscribers.delete(setSnapshot);
    };
  }, []);

  const shouldShowIosGuide =
    platform.isIOS && platform.isSafari && !snapshot.isStandalone;

  const promptInstall = async () => {
    if (!deferredPromptEvent) {
      return { status: "unavailable" };
    }

    deferredPromptEvent.prompt();
    const choice = await deferredPromptEvent.userChoice;
    deferredPromptEvent = null;
    notifySubscribers();
    return {
      status: choice?.outcome === "accepted" ? "accepted" : "dismissed",
    };
  };

  return {
    deferredPrompt: snapshot.deferredPrompt,
    isStandalone: snapshot.isStandalone,
    canPromptInstall: Boolean(snapshot.deferredPrompt),
    shouldShowIosGuide,
    platform,
    promptInstall,
  };
};
